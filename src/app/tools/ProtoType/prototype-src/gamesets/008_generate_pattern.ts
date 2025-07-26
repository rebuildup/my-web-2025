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

// ヘルパー関数
function isHiragana(char: string): boolean {
  const code = char.charCodeAt(0);
  return code >= 0x3041 && code <= 0x3096;
}

function isConsonant(char: string): boolean {
  return !"aiueoy".includes(char.toLowerCase());
}

// 入力予測エンジン
export function getNextKeysOptimized(
  readingText: string,
  currentInput: string
): NextKeyInfo[] {
  if (currentInput === readingTextToFullRomaji(readingText)) {
    return [];
  }

  const cache = new Map<string, NextKeyInfo[]>();
  const sortedKeyConfigs = KEY_CONFIGS.slice().sort(
    (a, b) => b.key.length - a.key.length
  );

  // Helper: Get possible doubling candidates for small "っ"
  function getDoublingCandidates(syllableIndex: number): string[] {
    const letters = new Set<string>();
    for (const config of sortedKeyConfigs) {
      if (readingText.startsWith(config.key, syllableIndex)) {
        for (const origin of config.origins) {
          if (origin.length > 0 && isConsonant(origin.charAt(0))) {
            letters.add(origin.charAt(0));
          }
        }
      }
    }
    return Array.from(letters);
  }

  function nextLetters(index: number, matched: number): NextKeyInfo[] {
    const cacheKey = `${index}_${matched}_${currentInput}`;
    if (cache.has(cacheKey)) return cache.get(cacheKey)!;
    let results: NextKeyInfo[] = [];

    // Base-case: if we've processed the entire readingText, return empty result.
    if (index >= readingText.length) {
      cache.set(cacheKey, results);
      return results;
    }

    const currentChar = readingText[index];

    // For non-hiragana characters, try direct matching
    if (!isHiragana(currentChar)) {
      const remainingInput = currentInput.substring(matched);
      if (remainingInput.startsWith(currentChar)) {
        results.push(
          ...nextLetters(
            index + currentChar.length,
            matched + currentChar.length
          )
        );
      } else {
        results.push({
          letter: currentChar,
          flag: {
            type: "direct",
            consumed: currentChar.length,
          },
        });
      }
      cache.set(cacheKey, results);
      return results;
    }

    // Handle small "っ" (sokuon) for doubling consonants
    if (currentChar === "っ") {
      const tsuConfig = sortedKeyConfigs.find((config) => config.key === "っ");
      if (!tsuConfig) {
        cache.set(cacheKey, results);
        return results;
      }
      const currentInputRemaining = currentInput.substring(matched);
      const fixedAlternatives = ["ltu", "xtu", "ltsu", "xtsu"];
      let possibleResults: NextKeyInfo[] = [];
      const doublingCandidates = getDoublingCandidates(index + 1);

      if (currentInputRemaining) {
        const firstChar = currentInputRemaining.charAt(0);
        // If the input starts with one of the doubling candidates, try consuming one letter
        if (doublingCandidates.includes(firstChar)) {
          possibleResults.push(...nextLetters(index + 1, matched + 1));
        }
        // Also check if input matches any fixed alternative
        for (const alt of fixedAlternatives) {
          if (currentInputRemaining.startsWith(alt)) {
            possibleResults.push(
              ...nextLetters(index + 1, matched + alt.length)
            );
          }
        }
      } else {
        // No input remaining: try both possibilities
        possibleResults.push(...nextLetters(index + 1, matched));
        for (const alt of fixedAlternatives) {
          possibleResults.push(...nextLetters(index + 1, matched + alt.length));
        }
      }
      // If no branch produced a result, instead of returning candidate hints, propagate completion
      if (possibleResults.length === 0) {
        cache.set(cacheKey, []);
        return [];
      } else {
        results.push(...possibleResults);
        cache.set(cacheKey, results);
        return results;
      }
    }

    if (currentChar === "ん") {
      const remainingInput = currentInput.substring(matched);
      if (index === readingText.length - 1) {
        if (remainingInput.startsWith("nn")) {
          cache.set(cacheKey, []);
          return [];
        } else {
          const consumed = remainingInput.startsWith("n") ? 1 : 0;
          results.push({
            letter: "n",
            flag: { type: "direct", consumed },
          });
          cache.set(cacheKey, results);
          return results;
        }
      } else {
        if (remainingInput.startsWith("nn")) {
          const rec = nextLetters(index + 1, matched + 2);
          cache.set(cacheKey, rec);
          return rec;
        } else {
          const branch = nextLetters(index + 1, matched + 1);
          if (branch.length > 0) {
            results.push({
              letter: "n",
              flag: { type: "direct", consumed: 1 },
            });
            results.push(...branch);
          }
          cache.set(cacheKey, results);
          return results;
        }
      }
    }

    // Process other hiragana characters using sorted KEY_CONFIGS in order
    for (const config of sortedKeyConfigs) {
      if (readingText.startsWith(config.key, index)) {
        const newIndex = index + config.key.length;
        for (const origin of config.origins) {
          const remaining = currentInput.substring(matched);
          if (remaining.length > origin.length) {
            if (remaining.startsWith(origin)) {
              results.push(...nextLetters(newIndex, matched + origin.length));
            }
          } else {
            if (origin.startsWith(remaining)) {
              if (origin.length > remaining.length) {
                results.push({
                  letter: origin.charAt(remaining.length),
                  flag: {
                    type: "keyConfig",
                    configKey: config.key,
                    origin: origin,
                    consumed: remaining.length + 1,
                  },
                });
              } else {
                results.push(...nextLetters(newIndex, matched + origin.length));
              }
            }
          }
        }
      }
    }
    cache.set(cacheKey, results);
    return results;
  }

  return nextLetters(0, 0);
}

export function getRomanizedTextFromTendency(
  tendencies: ConversionTendencies,
  readingText: string,
  currentInput: string
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
  function dfs(
    i: number,
    dup: boolean,
    out: string,
    nonPreferred: number
  ): void {
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
        const sortedKeyConfigs = KEY_CONFIGS.slice().sort(
          (a, b) => b.key.length - a.key.length
        );
        for (const config of sortedKeyConfigs) {
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
      const candidates =
        i === readingText.length - 1 ||
        ["な", "に", "ぬ", "ね", "の"].includes(readingText[i + 1])
          ? ["nn"]
          : ["n", "nn"];
      for (const cand of candidates) {
        dfs(i + 1, false, out + cand, nonPreferred);
      }
      return;
    }

    // Process other hiragana characters using sorted KEY_CONFIGS
    const sortedKeyConfigs = KEY_CONFIGS.slice().sort(
      (a, b) => b.key.length - a.key.length
    );
    for (const config of sortedKeyConfigs) {
      if (readingText.startsWith(config.key, i)) {
        const newIndex = i + config.key.length;
        const tendencyEntry = tendencies.find((t) => t.key === config.key);
        const candidateOrigins = tendencyEntry
          ? [
              tendencyEntry.tendency,
              ...config.origins.filter(
                (origin) => origin !== tendencyEntry.tendency
              ),
            ]
          : config.origins;
        for (const origin of candidateOrigins) {
          const additionalPenalty =
            tendencyEntry && origin === tendencyEntry.tendency ? 0 : 1;
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
      const scoreA =
        a.nonPreferred * 10000 + (a.out.length - currentInput.length);
      const scoreB =
        b.nonPreferred * 10000 + (b.out.length - currentInput.length);
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
  // Use sorted KEY_CONFIGS by key length descending for proper matching
  const sortedKeyConfigs = KEY_CONFIGS.slice().sort(
    (a, b) => b.key.length - a.key.length
  );

  while (i < readingText.length) {
    let found = false;
    // Try matching up to 3 characters (adjust as needed)
    for (let len = Math.min(3, readingText.length - i); len > 0; len--) {
      const key = readingText.substring(i, i + len);
      const config = sortedKeyConfigs.find((c) => c.key === key);
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
// Helper: Convert readingText to full romaji (with proper doubling for "っ")
function readingTextToFullRomaji(readingText: string): string {
  let result = "";
  let i = 0;
  // Sort key configs descending by key length
  const sortedKeyConfigs = KEY_CONFIGS.slice().sort(
    (a, b) => b.key.length - a.key.length
  );

  while (i < readingText.length) {
    // Handle small "っ" (sokuon) separately:
    if (readingText[i] === "っ") {
      if (i + 1 < readingText.length) {
        const nextKey = sortedKeyConfigs.find((config) =>
          readingText.startsWith(config.key, i + 1)
        );
        if (nextKey) {
          const origin = nextKey.origins[0];
          result += origin.charAt(0);
        }
      }
      i++;
      continue;
    }
    let found = false;
    for (let len = Math.min(3, readingText.length - i); len > 0; len--) {
      const key = readingText.substring(i, i + len);
      const config = sortedKeyConfigs.find((c) => c.key === key);
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

