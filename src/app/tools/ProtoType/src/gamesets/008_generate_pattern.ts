export interface ConversionTendency {
  key: string;
  tendency: string;
}

export type ConversionTendencies = ConversionTendency[];

export type ConversionFlag = {
  type: "direct" | "keyConfig";
  configKey?: string;
  origin?: string;
  consumed?: number;
};

export type NextKeyInfo = {
  letter: string;
  flag: ConversionFlag;
};

export interface KeyConfig {
  key: string;
  origins: string[];
}

export type KeyConfigs = Array<KeyConfig>;

type RomajiOption = {
  out: string;
  advance: number;
  configKey: string;
  origin: string;
};

// ヘルパー関数
function isHiragana(char: string): boolean {
  const code = char.charCodeAt(0);
  return code >= 0x3041 && code <= 0x3096;
}

function isConsonant(char: string): boolean {
  return !"aiueoy".includes(char.toLowerCase());
}

// 入力予測エンジン
export function getNextKeysOptimized(readingText: string, currentInput: string): NextKeyInfo[] {
  type State = { pos: number; buffer: string; configKey?: string; origin?: string };

  const optionCache = new Map<number, RomajiOption[]>();
  const initialCache = new Map<number, string[]>();

  const findConfigsAt = (pos: number): KeyConfig[] => {
    let maxLen = 0;
    const matches: KeyConfig[] = [];
    for (const config of SORTED_KEY_CONFIGS) {
      if (readingText.startsWith(config.key, pos)) {
        if (config.key.length > maxLen) {
          maxLen = config.key.length;
          matches.length = 0;
          matches.push(config);
        } else if (config.key.length === maxLen) {
          matches.push(config);
        }
      }
    }
    return matches;
  };

  const getRomajiOptionsAt = (pos: number): RomajiOption[] => {
    if (optionCache.has(pos)) return optionCache.get(pos)!;
    const options: RomajiOption[] = [];
    const ch = readingText[pos];
    if (!ch) {
      optionCache.set(pos, options);
      return options;
    }

    // Small "っ" (sokuon)
    if (ch === "っ") {
      const fixed = KEY_CONFIG_MAP.get("っ");
      if (fixed) {
        for (const origin of fixed.origins) {
          options.push({ out: origin, advance: 1, configKey: "っ", origin });
        }
      }
      const initials = getInitialsOfNext(pos + 1);
      for (const init of initials) {
        if (isConsonant(init)) {
          options.push({ out: init, advance: 1, configKey: "っ", origin: init });
        }
      }
      optionCache.set(pos, options);
      return options;
    }

    // "ん" handling
    if (ch === "ん") {
      const nextInitials = getInitialsOfNext(pos + 1);
      const prohibitsSingleN = nextInitials.some((c) => "aiueoyn".includes(c));
      const baseOptions = ["nn", "n'", "xn"];
      if (!prohibitsSingleN || pos === readingText.length - 1) {
        baseOptions.push("n");
      }
      for (const origin of baseOptions) {
        options.push({ out: origin, advance: 1, configKey: "ん", origin });
      }
      optionCache.set(pos, options);
      return options;
    }

    const configs = findConfigsAt(pos);
    if (configs.length === 0) {
      const direct = ch;
      options.push({ out: direct, advance: 1, configKey: direct, origin: direct });
      optionCache.set(pos, options);
      return options;
    }

    for (const config of configs) {
      for (const origin of config.origins) {
        options.push({ out: origin, advance: config.key.length, configKey: config.key, origin });
      }
    }
    optionCache.set(pos, options);
    return options;
  };

  const getInitialsOfNext = (pos: number): string[] => {
    if (initialCache.has(pos)) return initialCache.get(pos)!;
    const initials = new Set<string>();
    for (const opt of getRomajiOptionsAt(pos)) {
      if (opt.out.length > 0) {
        initials.add(opt.out[0]);
      }
    }
    const arr = Array.from(initials);
    initialCache.set(pos, arr);
    return arr;
  };

  const dedupeStates = (states: State[]): State[] => {
    const map = new Map<string, State>();
    for (const st of states) {
      const key = `${st.pos}|${st.buffer}|${st.configKey ?? ""}|${st.origin ?? ""}`;
      if (!map.has(key)) map.set(key, st);
    }
    return Array.from(map.values());
  };

  let states: State[] = [{ pos: 0, buffer: "", configKey: undefined, origin: undefined }];

  for (const char of currentInput) {
    const nextStates: State[] = [];
    for (const state of states) {
      if (state.buffer.length > 0) {
        if (state.buffer[0] === char) {
          nextStates.push({
            pos: state.pos,
            buffer: state.buffer.slice(1),
            configKey: state.configKey,
            origin: state.origin,
          });
        }
        continue;
      }

      for (const opt of getRomajiOptionsAt(state.pos)) {
        if (opt.out.length === 0) continue;
        if (opt.out[0] === char) {
          nextStates.push({
            pos: state.pos + opt.advance,
            buffer: opt.out.slice(1),
            configKey: opt.configKey,
            origin: opt.origin,
          });
        }
      }
    }
    states = dedupeStates(nextStates);
    if (states.length === 0) break;
  }

  const isComplete = states.some((st) => st.buffer.length === 0 && st.pos >= readingText.length);
  if (isComplete) return [];

  const results: NextKeyInfo[] = [];
  const seen = new Set<string>();

  const pushResult = (letter: string, configKey?: string, origin?: string) => {
    const id = `${letter}|${configKey ?? ""}|${origin ?? ""}`;
    if (seen.has(id)) return;
    seen.add(id);
    const isKnownKey = configKey ? KEY_CONFIG_MAP.has(configKey) : false;
    results.push({
      letter,
      flag: isKnownKey ? { type: "keyConfig", configKey, origin } : { type: "direct", consumed: 0 },
    });
  };

  for (const state of states) {
    if (state.buffer.length > 0) {
      pushResult(state.buffer[0], state.configKey, state.origin);
      continue;
    }
    for (const opt of getRomajiOptionsAt(state.pos)) {
      if (opt.out.length === 0) continue;
      pushResult(opt.out[0], opt.configKey, opt.origin);
    }
  }

  return results;
}

export function getRomanizedTextFromTendency(
  tendencies: ConversionTendencies,
  readingText: string,
  currentInput: string,
): string {
  // Check if the candidate output is consistent with the current input
  function prefixMatches(out: string): boolean {
    if (out.length <= currentInput.length) {
      return currentInput.slice(0, out.length) === out;
    } else {
      return out.slice(0, currentInput.length) === currentInput;
    }
  }

  type Candidate = { out: string; nonPreferred: number };
  const results: Candidate[] = [];

  // Depth-first search to build candidate conversion string
  function dfs(i: number, dup: boolean, out: string, nonPreferred: number): void {
    if (!prefixMatches(out)) return;
    if (i >= readingText.length) {
      if (out.startsWith(currentInput)) results.push({ out, nonPreferred });
      return;
    }
    const ch = readingText[i];

    if (!isHiragana(ch)) {
      dfs(i + 1, false, out + ch, nonPreferred);
      return;
    }

    // Handle small "っ" (sokuon)
    if (ch === "っ") {
      const nextIndex = i + 1;
      // Get doubling candidates from next syllable using sorted KEY_CONFIGS
      const doublingCandidates = (() => {
        const letters = new Set<string>();
        for (const config of SORTED_KEY_CONFIGS) {
          if (readingText.startsWith(config.key, nextIndex)) {
            for (const origin of config.origins) {
              if (origin.length > 0 && isConsonant(origin.charAt(0))) {
                letters.add(origin.charAt(0));
              }
            }
          }
        }
        return Array.from(letters);
      })();
      const fixedAlternatives = ["ltu", "xtu", "ltsu", "xtsu"];
      const currentCharInput = currentInput.charAt(out.length) || "";
      if (currentCharInput) {
        if (doublingCandidates.includes(currentCharInput)) {
          dfs(nextIndex, true, out, nonPreferred);
        }
        for (const alt of fixedAlternatives) {
          if (currentInput.slice(out.length).startsWith(alt)) {
            dfs(nextIndex, false, out + alt, nonPreferred);
          }
        }
      } else {
        dfs(nextIndex, true, out, nonPreferred);
        for (const alt of fixedAlternatives) {
          dfs(nextIndex, false, out + alt, nonPreferred);
        }
      }
      return;
    }

    // Handle "ん" (n)
    if (ch === "ん") {
      const nextChar = i + 1 < readingText.length ? readingText[i + 1] : "";
      const nextIsVowelOrN = [
        "あ",
        "い",
        "う",
        "え",
        "お",
        "や",
        "ゆ",
        "よ",
        "ぁ",
        "ぃ",
        "ぅ",
        "ぇ",
        "ぉ",
        "ゃ",
        "ゅ",
        "ょ",
        "ん",
        "な",
        "に",
        "ぬ",
        "ね",
        "の",
      ].includes(nextChar);

      const candidates =
        nextChar === "" || !nextIsVowelOrN ? ["n", "nn", "n'", "xn"] : ["nn", "n'", "xn"];

      for (const cand of candidates) {
        dfs(i + 1, false, out + cand, nonPreferred);
      }
      return;
    }

    // Process other hiragana characters using sorted KEY_CONFIGS
    for (const config of SORTED_KEY_CONFIGS) {
      if (readingText.startsWith(config.key, i)) {
        const newIndex = i + config.key.length;
        const tendencyEntry = tendencies.find((t) => t.key === config.key);
        const candidateOrigins = tendencyEntry
          ? [
              tendencyEntry.tendency,
              ...config.origins.filter((origin) => origin !== tendencyEntry.tendency),
            ]
          : config.origins;
        for (const origin of candidateOrigins) {
          const additionalPenalty = tendencyEntry && origin === tendencyEntry.tendency ? 0 : 1;
          let conv = origin;
          if (dup && conv.length > 0) {
            conv = conv.charAt(0) + conv;
          }
          dfs(newIndex, false, out + conv, nonPreferred + additionalPenalty);
        }
      }
    }
  }

  dfs(0, false, "", 0);

  if (results.length > 0) {
    results.sort((a, b) => {
      const scoreA = a.nonPreferred * 10000 + (a.out.length - currentInput.length);
      const scoreB = b.nonPreferred * 10000 + (b.out.length - currentInput.length);
      return scoreA - scoreB;
    });
    return results[0].out;
  } else {
    return readingTextToBasicRomaji(readingText);
  }
}

function readingTextToBasicRomaji(readingText: string): string {
  let result = "";
  let i = 0;
  while (i < readingText.length) {
    // Special-case "ん" to prefer single 'n' as a safe fallback
    if (readingText[i] === "ん") {
      result += "n";
      i += 1;
      continue;
    }

    let found = false;
    for (let len = Math.min(3, readingText.length - i); len > 0; len--) {
      const key = readingText.substring(i, i + len);
      const config = KEY_CONFIG_MAP.get(key);
      if (config) {
        result += config.origins[0];
        i += len;
        found = true;
        break;
      }
    }
    if (!found) {
      result += readingText[i];
      i++;
    }
  }
  return result;
}

export const KEY_CONFIGS: KeyConfigs = [
  {
    key: "あ",
    origins: ["a"],
  },
  {
    key: "い",
    origins: ["i", "yi"],
  },
  {
    key: "う",
    origins: ["u", "wu", "whu"],
  },
  {
    key: "え",
    origins: ["e"],
  },
  {
    key: "お",
    origins: ["o"],
  },
  {
    key: "か",
    origins: ["ka", "ca"],
  },
  {
    key: "き",
    origins: ["ki"],
  },
  {
    key: "く",
    origins: ["ku", "cu", "qu"],
  },
  {
    key: "け",
    origins: ["ke"],
  },
  {
    key: "こ",
    origins: ["ko", "co"],
  },
  {
    key: "さ",
    origins: ["sa"],
  },
  {
    key: "し",
    origins: ["si", "ci", "shi"],
  },
  {
    key: "す",
    origins: ["su"],
  },
  {
    key: "せ",
    origins: ["se", "ce"],
  },
  {
    key: "そ",
    origins: ["so"],
  },
  {
    key: "た",
    origins: ["ta"],
  },
  {
    key: "ち",
    origins: ["ti", "chi"],
  },
  {
    key: "つ",
    origins: ["tu", "tsu"],
  },
  {
    key: "て",
    origins: ["te"],
  },
  {
    key: "と",
    origins: ["to"],
  },
  {
    key: "な",
    origins: ["na"],
  },
  {
    key: "に",
    origins: ["ni"],
  },
  {
    key: "ぬ",
    origins: ["nu"],
  },
  {
    key: "ね",
    origins: ["ne"],
  },
  {
    key: "の",
    origins: ["no"],
  },
  {
    key: "は",
    origins: ["ha"],
  },
  {
    key: "ひ",
    origins: ["hi"],
  },
  {
    key: "ふ",
    origins: ["fu", "hu"],
  },
  {
    key: "へ",
    origins: ["he"],
  },
  {
    key: "ほ",
    origins: ["ho"],
  },
  {
    key: "ま",
    origins: ["ma"],
  },
  {
    key: "み",
    origins: ["mi"],
  },
  {
    key: "む",
    origins: ["mu"],
  },
  {
    key: "め",
    origins: ["me"],
  },
  {
    key: "も",
    origins: ["mo"],
  },
  {
    key: "や",
    origins: ["ya"],
  },
  {
    key: "ゆ",
    origins: ["yu"],
  },
  {
    key: "よ",
    origins: ["yo"],
  },
  {
    key: "ら",
    origins: ["ra"],
  },
  {
    key: "り",
    origins: ["ri"],
  },
  {
    key: "る",
    origins: ["ru"],
  },
  {
    key: "れ",
    origins: ["re"],
  },
  {
    key: "ろ",
    origins: ["ro"],
  },
  {
    key: "わ",
    origins: ["wa"],
  },
  {
    key: "を",
    origins: ["wo"],
  },
  {
    key: "ん",
    origins: ["nn", "n'", "xn"],
  },
  {
    key: "が",
    origins: ["ga"],
  },
  {
    key: "ぎ",
    origins: ["gi"],
  },
  {
    key: "ぐ",
    origins: ["gu"],
  },
  {
    key: "げ",
    origins: ["ge"],
  },
  {
    key: "ご",
    origins: ["go"],
  },
  {
    key: "ざ",
    origins: ["za"],
  },
  {
    key: "じ",
    origins: ["zi", "ji"],
  },
  {
    key: "ず",
    origins: ["zu"],
  },
  {
    key: "ぜ",
    origins: ["ze"],
  },
  {
    key: "ぞ",
    origins: ["zo"],
  },
  {
    key: "だ",
    origins: ["da"],
  },
  {
    key: "ぢ",
    origins: ["di"],
  },
  {
    key: "づ",
    origins: ["du"],
  },
  {
    key: "で",
    origins: ["de"],
  },
  {
    key: "ど",
    origins: ["do"],
  },
  {
    key: "ば",
    origins: ["ba"],
  },
  {
    key: "び",
    origins: ["bi"],
  },
  {
    key: "ぶ",
    origins: ["bu"],
  },
  {
    key: "べ",
    origins: ["be"],
  },
  {
    key: "ぼ",
    origins: ["bo"],
  },
  {
    key: "ぱ",
    origins: ["pa"],
  },
  {
    key: "ぴ",
    origins: ["pi"],
  },
  {
    key: "ぷ",
    origins: ["pu"],
  },
  {
    key: "ぺ",
    origins: ["pe"],
  },
  {
    key: "ぽ",
    origins: ["po"],
  },
  {
    key: "ぁ",
    origins: ["la", "xa"],
  },
  {
    key: "ぃ",
    origins: ["li", "xi"],
  },
  {
    key: "ぅ",
    origins: ["lu", "xu"],
  },
  {
    key: "ぇ",
    origins: ["le", "xe"],
  },
  {
    key: "ぉ",
    origins: ["lo", "xo"],
  },
  {
    key: "ゃ",
    origins: ["lya", "xya"],
  },
  {
    key: "ゅ",
    origins: ["lyu", "xyu"],
  },
  {
    key: "ょ",
    origins: ["lyo", "xyo"],
  },
  {
    key: "ヵ",
    origins: ["lka", "xka"],
  },
  {
    key: "ヶ",
    origins: ["lke", "xke"],
  },
  {
    key: "ゎ",
    origins: ["lwa", "xwa"],
  },
  {
    key: "っ",
    origins: ["ltu", "xtu", "ltsu", "xtsu"],
  },
  {
    key: "ゔ",
    origins: ["vu"],
  },
  {
    key: "ゐ",
    origins: ["wyi", "wi"],
  },
  {
    key: "ゑ",
    origins: ["wye", "we"],
  },
  {
    key: "ー",
    origins: ["-"],
  },
  {
    key: "？",
    origins: ["?"],
  },
  {
    key: "！",
    origins: ["!"],
  },
  {
    key: "、",
    origins: [","],
  },
  {
    key: "。",
    origins: ["."],
  },
  {
    key: "うぁ",
    origins: ["wha"],
  },
  {
    key: "うぃ",
    origins: ["whi", "wi"],
  },
  {
    key: "うぇ",
    origins: ["whe", "we"],
  },
  {
    key: "うぉ",
    origins: ["who"],
  },
  {
    key: "いぇ",
    origins: ["ye"],
  },
  {
    key: "きゃ",
    origins: ["kya"],
  },
  {
    key: "きぃ",
    origins: ["kyi"],
  },
  {
    key: "きゅ",
    origins: ["kyu"],
  },
  {
    key: "きぇ",
    origins: ["kye"],
  },
  {
    key: "きょ",
    origins: ["kyo"],
  },
  {
    key: "くぁ",
    origins: ["qa", "kwa"],
  },
  {
    key: "くぃ",
    origins: ["qi", "kwi"],
  },
  {
    key: "くぇ",
    origins: ["qe"],
  },
  {
    key: "くぉ",
    origins: ["qo", "qwo"],
  },
  {
    key: "ぐぁ",
    origins: ["gwa"],
  },
  {
    key: "ぐぃ",
    origins: ["gwi"],
  },
  {
    key: "ぐぅ",
    origins: ["gwu"],
  },
  {
    key: "ぐぇ",
    origins: ["gwe"],
  },
  {
    key: "ぐぉ",
    origins: ["gwo"],
  },
  {
    key: "しゃ",
    origins: ["sya", "sha"],
  },
  {
    key: "しぃ",
    origins: ["syi"],
  },
  {
    key: "しゅ",
    origins: ["syu", "shu"],
  },
  {
    key: "しぇ",
    origins: ["sye", "she"],
  },
  {
    key: "しょ",
    origins: ["syo", "sho"],
  },
  {
    key: "すぁ",
    origins: ["swa"],
  },
  {
    key: "すぃ",
    origins: ["swi"],
  },
  {
    key: "すぅ",
    origins: ["swu"],
  },
  {
    key: "すぇ",
    origins: ["swe"],
  },
  {
    key: "すぉ",
    origins: ["swo"],
  },
  {
    key: "ちゃ",
    origins: ["tya", "cya", "cha"],
  },
  {
    key: "ちぃ",
    origins: ["tyi", "cyi"],
  },
  {
    key: "ちゅ",
    origins: ["tyu", "cyu", "chu"],
  },
  {
    key: "ちぇ",
    origins: ["tye", "cye", "che"],
  },
  {
    key: "ちょ",
    origins: ["tyo", "cyo", "cho"],
  },
  {
    key: "つぁ",
    origins: ["tsa"],
  },
  {
    key: "つぃ",
    origins: ["tsi"],
  },
  {
    key: "つぇ",
    origins: ["tse"],
  },
  {
    key: "つぉ",
    origins: ["tso"],
  },
  {
    key: "てゃ",
    origins: ["tha"],
  },
  {
    key: "てぃ",
    origins: ["thi"],
  },
  {
    key: "てゅ",
    origins: ["thu"],
  },
  {
    key: "てぇ",
    origins: ["the"],
  },
  {
    key: "てょ",
    origins: ["tho"],
  },
  {
    key: "とぁ",
    origins: ["twa"],
  },
  {
    key: "とぃ",
    origins: ["twi"],
  },
  {
    key: "とぅ",
    origins: ["twu"],
  },
  {
    key: "とぇ",
    origins: ["twe"],
  },
  {
    key: "とぉ",
    origins: ["two"],
  },
  {
    key: "にゃ",
    origins: ["nya"],
  },
  {
    key: "にぃ",
    origins: ["nyi"],
  },
  {
    key: "にゅ",
    origins: ["nyu"],
  },
  {
    key: "にぇ",
    origins: ["nye"],
  },
  {
    key: "にょ",
    origins: ["nyo"],
  },
  {
    key: "ひゃ",
    origins: ["hya"],
  },
  {
    key: "ひぃ",
    origins: ["hyi"],
  },
  {
    key: "ひゅ",
    origins: ["hyu"],
  },
  {
    key: "ひぇ",
    origins: ["hye"],
  },
  {
    key: "ひょ",
    origins: ["hyo"],
  },
  {
    key: "みゃ",
    origins: ["mya"],
  },
  {
    key: "みぃ",
    origins: ["myi"],
  },
  {
    key: "みゅ",
    origins: ["myu"],
  },
  {
    key: "みぇ",
    origins: ["mye"],
  },
  {
    key: "みょ",
    origins: ["myo"],
  },
  {
    key: "りゃ",
    origins: ["rya"],
  },
  {
    key: "りぃ",
    origins: ["ryi"],
  },
  {
    key: "りゅ",
    origins: ["ryu"],
  },
  {
    key: "りぇ",
    origins: ["rye"],
  },
  {
    key: "りょ",
    origins: ["ryo"],
  },
  {
    key: "ふぁ",
    origins: ["fa", "fwa", "hwa"],
  },
  {
    key: "ふぃ",
    origins: ["fi", "fwi", "fyi"],
  },
  {
    key: "ふぅ",
    origins: ["fwu"],
  },
  {
    key: "ふぇ",
    origins: ["fe", "fwe", "fye"],
  },
  {
    key: "ふぉ",
    origins: ["fo", "fwo"],
  },
  {
    key: "ふゃ",
    origins: ["fya"],
  },
  {
    key: "ふゅ",
    origins: ["fyu"],
  },
  {
    key: "ふょ",
    origins: ["fyo"],
  },
  {
    key: "ぎゃ",
    origins: ["gya"],
  },
  {
    key: "ぎぃ",
    origins: ["gyi"],
  },
  {
    key: "ぎゅ",
    origins: ["gyu"],
  },
  {
    key: "ぎぇ",
    origins: ["gye"],
  },
  {
    key: "ぎょ",
    origins: ["gyo"],
  },
  {
    key: "じゃ",
    origins: ["zya", "ja", "jya"],
  },
  {
    key: "じぃ",
    origins: ["zyi", "jyi"],
  },
  {
    key: "じゅ",
    origins: ["zyu", "ju", "jyu"],
  },
  {
    key: "じぇ",
    origins: ["zye", "je", "jye"],
  },
  {
    key: "じょ",
    origins: ["zyo", "jo", "jyo"],
  },
  {
    key: "ぢゃ",
    origins: ["dya"],
  },
  {
    key: "ぢぃ",
    origins: ["dyi"],
  },
  {
    key: "ぢゅ",
    origins: ["dyu"],
  },
  {
    key: "ぢぇ",
    origins: ["dye"],
  },
  {
    key: "ぢょ",
    origins: ["dyo"],
  },
  {
    key: "びゃ",
    origins: ["bya"],
  },
  {
    key: "びぃ",
    origins: ["byi"],
  },
  {
    key: "びゅ",
    origins: ["byu"],
  },
  {
    key: "びぇ",
    origins: ["bye"],
  },
  {
    key: "びょ",
    origins: ["byo"],
  },
  {
    key: "ぴゃ",
    origins: ["pya"],
  },
  {
    key: "ぴぃ",
    origins: ["pyi"],
  },
  {
    key: "ぴゅ",
    origins: ["pyu"],
  },
  {
    key: "ぴぇ",
    origins: ["pye"],
  },
  {
    key: "ぴょ",
    origins: ["pyo"],
  },
  {
    key: "ゔぁ",
    origins: ["va"],
  },
  {
    key: "ゔぃ",
    origins: ["vi", "vyi"],
  },
  {
    key: "ゔぇ",
    origins: ["ve", "vye"],
  },
  {
    key: "ゔぉ",
    origins: ["vo"],
  },
  {
    key: "ゔゃ",
    origins: ["vya"],
  },
  {
    key: "ゔゅ",
    origins: ["vyu"],
  },
  {
    key: "ゔょ",
    origins: ["vyo"],
  },
  {
    key: "でゃ",
    origins: ["dha"],
  },
  {
    key: "でぃ",
    origins: ["dhi"],
  },
  {
    key: "でゅ",
    origins: ["dhu"],
  },
  {
    key: "でぇ",
    origins: ["dhe"],
  },
  {
    key: "でょ",
    origins: ["dho"],
  },
  {
    key: "どぁ",
    origins: ["dwa"],
  },
  {
    key: "どぃ",
    origins: ["dwi"],
  },
  {
    key: "どぅ",
    origins: ["dwu"],
  },
  {
    key: "どぇ",
    origins: ["dwe"],
  },
  {
    key: "どぉ",
    origins: ["dwo"],
  },
];
// キー設定をキー長の降順で一度だけソートした配列
const SORTED_KEY_CONFIGS: KeyConfigs = KEY_CONFIGS.slice().sort(
  (a, b) => b.key.length - a.key.length,
);

// キーから設定を即座に引けるマップ
const KEY_CONFIG_MAP = new Map<string, KeyConfig>();
for (const config of KEY_CONFIGS) {
  KEY_CONFIG_MAP.set(config.key, config);
}
