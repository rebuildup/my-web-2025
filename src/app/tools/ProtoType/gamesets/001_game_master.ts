// game_master.ts
import * as PIXI from "pixi.js";
import gsap from "gsap";
import { PixiPlugin } from "gsap/PixiPlugin";
// Register PIXI with GSAP
if (typeof window !== "undefined") {
	(window as any).PIXI = PIXI;
}
PixiPlugin.registerPIXI(PIXI);

import { game_scene } from "./003_game_scene";

import { playMiss } from "./012_soundplay";

import { gameData } from "./002_gameConfig";

import { opening_scene } from "./005_opening";
import { game_select } from "./004_game_select";
import { setting_scene } from "./007_setting_scene";
import { result_scene } from "./006_result_scene";
import { reload_game } from "./016_reload_game";
import { error_scene } from "./017_error_scene";
import { record_scene } from "./019_record_scene";

import { Player_register } from "./021_Player_register";

import { BG_grid } from "./018_grid";

import { settings } from "../SiteInterface";
import { getLocalTexts } from "./028_local_texts";
import { loadFromCache } from "../SiteInterface";
import { loadcache_localranking } from "./020_cacheControl";
import { ConversionTendencies } from "./008_generate_pattern";
import { debug_repeat } from "./023_debug_repeat";

export async function initializeGame(app: PIXI.Application) {
  app.stage.removeChildren();
  BG_grid(app);
  loadcache_localranking();
  const loading_text = new PIXI.Text({
    text: "Loading",
    style: {
      fontFamily: gameData.FontFamily,
      fontSize: 50,
      fill: replaceHash(settings.colorTheme.colors.MainColor),
      align: "center",
    },
  });

  loading_text.position = {
    x: app.screen.width / 2 - loading_text.width / 2,
    y: app.screen.height / 2 - loading_text.height / 2,
  };
  app.stage.addChild(loading_text);

  const lineWidth = 600;
  const lineHeight = 4;
  const spacing = lineHeight * 32;
  const startX = app.screen.width / 2 - lineWidth / 2;
  const startY = app.screen.height / 2 - spacing / 2 - lineHeight;

  const lines = [];
  const masks = [];

  for (let i = 0; i < 2; i++) {
    const line = new PIXI.Graphics();
    line.rect(0, 0, lineWidth, lineHeight).fill(replaceHash(settings.colorTheme.colors.MainColor));
    line.position = { x: startX, y: startY + i * (lineHeight + spacing) };
    app.stage.addChild(line);
    lines.push(line);
    const maskSprite = new PIXI.Sprite(PIXI.Texture.WHITE);
    maskSprite.width = 0;
    maskSprite.height = lineHeight;
    maskSprite.position = { x: startX, y: line.y };
    app.stage.addChild(maskSprite);
    line.mask = maskSprite;
    masks.push(maskSprite);
  }

  masks.forEach((mask, index) => {
    gsap
      .timeline({ repeat: -1, delay: index * 0.2 })
      .to(mask, {
        duration: 1,
        width: lineWidth,
        ease: "power2.out",
      })
      .to(mask, {
        duration: 1,
        width: 0,
        x: startX + lineWidth,
        ease: "power2.in",
        delay: 0.5,
      })
      .set(mask, { x: startX });
  });
  // ローカル定義をそのまま利用
  gameData.textsData = getLocalTexts();

  gameData.CurrentSceneName = "opening";
  //gameData.CurrentSceneName = "debug_repeat";
  gameData.GameMode = "nomal";
  gameData.FontFamily = settings.fontTheme.fontFamily;
  gameData.KeyLayout = loadFromCache<typeof gameData.KeyLayout>("keylayout_GM", settings.keyLayout);
  gameData.instant_key_n = loadFromCache<typeof gameData.instant_key_n>("instant_key_GM", 20);
  gameData.flashType = loadFromCache<typeof gameData.flashType>("flashType_GM", 0);
  gameData.total_keyhit = loadFromCache<typeof gameData.total_keyhit>("total_keyhit_GM", 0);
  gameData.playCount = loadFromCache<typeof gameData.playCount>("playCount_GM", 0);
  gameData.acc_keys = [];
  if (settings.user.isLoggedin) {
    gameData.IsLoggedin = true;
    gameData.current_Player_id = settings.user.id;
    gameData.current_Player_name = settings.user.name;
  } else {
    gameData.IsLoggedin = false;
    gameData.current_Player_id = 0;
    gameData.current_Player_name = "";
  }
  gameData.gameselect_open = 0;
  TendenciesInit();

  while (gameData.CurrentSceneName != "exit") {
    switch (gameData.CurrentSceneName) {
      case "opening":
        await opening_scene(app);
        break;
      case "game_scene":
        await game_scene(app);
        break;
      case "game_select":
        await game_select(app);
        break;
      case "setting_scene":
        await setting_scene(app);
        break;
      case "result_scene":
        await result_scene(app);
        break;
      case "reload_game":
        await reload_game(app);
        break;
      case "error_scene":
        await error_scene(app);
        break;
      case "record_scene":
        await record_scene(app);
        break;
      case "register_scene":
        await Player_register(app);
        break;
      case "debug_repeat":
        await debug_repeat(app);
        break;
      default:
        gameData.CurrentSceneName = "exit";
        break;
    }
  }
  console.log("何が起こった？");
  playMiss();
}
export function replaceHash(color: string): string {
  if (typeof color !== "string") return "";
  return color.startsWith("#") ? color.replace("#", "0x") : color;
}

function TendenciesInit() {
  const CONVERSION_TENDENCIES: ConversionTendencies = [
    {
      key: "あ",
      tendency: "a",
    },
    {
      key: "い",
      tendency: "i",
    },
    {
      key: "う",
      tendency: "u",
    },
    {
      key: "え",
      tendency: "e",
    },
    {
      key: "お",
      tendency: "o",
    },
    {
      key: "か",
      tendency: "ka",
    },
    {
      key: "き",
      tendency: "ki",
    },
    {
      key: "く",
      tendency: "ku",
    },
    {
      key: "け",
      tendency: "ke",
    },
    {
      key: "こ",
      tendency: "ko",
    },
    {
      key: "さ",
      tendency: "sa",
    },
    {
      key: "し",
      tendency: "si",
    },
    {
      key: "す",
      tendency: "su",
    },
    {
      key: "せ",
      tendency: "se",
    },
    {
      key: "そ",
      tendency: "so",
    },
    {
      key: "た",
      tendency: "ta",
    },
    {
      key: "ち",
      tendency: "ti",
    },
    {
      key: "つ",
      tendency: "tu",
    },
    {
      key: "て",
      tendency: "te",
    },
    {
      key: "と",
      tendency: "to",
    },
    {
      key: "な",
      tendency: "na",
    },
    {
      key: "に",
      tendency: "ni",
    },
    {
      key: "ぬ",
      tendency: "nu",
    },
    {
      key: "ね",
      tendency: "ne",
    },
    {
      key: "の",
      tendency: "no",
    },
    {
      key: "は",
      tendency: "ha",
    },
    {
      key: "ひ",
      tendency: "hi",
    },
    {
      key: "ふ",
      tendency: "fu",
    },
    {
      key: "へ",
      tendency: "he",
    },
    {
      key: "ほ",
      tendency: "ho",
    },
    {
      key: "ま",
      tendency: "ma",
    },
    {
      key: "み",
      tendency: "mi",
    },
    {
      key: "む",
      tendency: "mu",
    },
    {
      key: "め",
      tendency: "me",
    },
    {
      key: "も",
      tendency: "mo",
    },
    {
      key: "や",
      tendency: "ya",
    },
    {
      key: "ゆ",
      tendency: "yu",
    },
    {
      key: "よ",
      tendency: "yo",
    },
    {
      key: "ら",
      tendency: "ra",
    },
    {
      key: "り",
      tendency: "ri",
    },
    {
      key: "る",
      tendency: "ru",
    },
    {
      key: "れ",
      tendency: "re",
    },
    {
      key: "ろ",
      tendency: "ro",
    },
    {
      key: "わ",
      tendency: "wa",
    },
    {
      key: "を",
      tendency: "wo",
    },
    {
      key: "ん",
      tendency: "n",
    },
    {
      key: "が",
      tendency: "ga",
    },
    {
      key: "ぎ",
      tendency: "gi",
    },
    {
      key: "ぐ",
      tendency: "gu",
    },
    {
      key: "げ",
      tendency: "ge",
    },
    {
      key: "ご",
      tendency: "go",
    },
    {
      key: "ざ",
      tendency: "za",
    },
    {
      key: "じ",
      tendency: "zi",
    },
    {
      key: "ず",
      tendency: "zu",
    },
    {
      key: "ぜ",
      tendency: "ze",
    },
    {
      key: "ぞ",
      tendency: "zo",
    },
    {
      key: "だ",
      tendency: "da",
    },
    {
      key: "ぢ",
      tendency: "di",
    },
    {
      key: "づ",
      tendency: "du",
    },
    {
      key: "で",
      tendency: "de",
    },
    {
      key: "ど",
      tendency: "do",
    },
    {
      key: "ば",
      tendency: "ba",
    },
    {
      key: "び",
      tendency: "bi",
    },
    {
      key: "ぶ",
      tendency: "bu",
    },
    {
      key: "べ",
      tendency: "be",
    },
    {
      key: "ぼ",
      tendency: "bo",
    },
    {
      key: "ぱ",
      tendency: "pa",
    },
    {
      key: "ぴ",
      tendency: "pi",
    },
    {
      key: "ぷ",
      tendency: "pu",
    },
    {
      key: "ぺ",
      tendency: "pe",
    },
    {
      key: "ぽ",
      tendency: "po",
    },
    {
      key: "ぁ",
      tendency: "la",
    },
    {
      key: "ぃ",
      tendency: "li",
    },
    {
      key: "ぅ",
      tendency: "lu",
    },
    {
      key: "ぇ",
      tendency: "le",
    },
    {
      key: "ぉ",
      tendency: "lo",
    },
    {
      key: "ゃ",
      tendency: "lya",
    },
    {
      key: "ゅ",
      tendency: "lyu",
    },
    {
      key: "ょ",
      tendency: "lyo",
    },
    {
      key: "ヵ",
      tendency: "lka",
    },
    {
      key: "ヶ",
      tendency: "lke",
    },
    {
      key: "ゎ",
      tendency: "lwa",
    },
    {
      key: "っ",
      tendency: "ltu",
    },
    {
      key: "ゔ",
      tendency: "vu",
    },
    {
      key: "ー",
      tendency: "-",
    },
    {
      key: "？",
      tendency: "?",
    },
    {
      key: "！",
      tendency: "!",
    },
    {
      key: "、",
      tendency: ",",
    },
    {
      key: "。",
      tendency: ".",
    },
    {
      key: "うぁ",
      tendency: "wha",
    },
    {
      key: "うぃ",
      tendency: "wi",
    },
    {
      key: "うぇ",
      tendency: "we",
    },
    {
      key: "うぉ",
      tendency: "who",
    },
    {
      key: "いぇ",
      tendency: "ye",
    },
    {
      key: "きゃ",
      tendency: "kya",
    },
    {
      key: "きぃ",
      tendency: "kyi",
    },
    {
      key: "きゅ",
      tendency: "kyu",
    },
    {
      key: "きぇ",
      tendency: "kye",
    },
    {
      key: "きょ",
      tendency: "kyo",
    },
    {
      key: "くゃ",
      tendency: "qya",
    },
    {
      key: "くゅ",
      tendency: "qyu",
    },
    {
      key: "くょ",
      tendency: "qyo",
    },
    {
      key: "くぁ",
      tendency: "qwa",
    },
    {
      key: "くぃ",
      tendency: "qwi",
    },
    {
      key: "くぅ",
      tendency: "qwu",
    },
    {
      key: "くぇ",
      tendency: "qwe",
    },
    {
      key: "くぉ",
      tendency: "qwo",
    },
    {
      key: "ぐぁ",
      tendency: "gwa",
    },
    {
      key: "ぐぃ",
      tendency: "gwi",
    },
    {
      key: "ぐぅ",
      tendency: "gwu",
    },
    {
      key: "ぐぇ",
      tendency: "gwe",
    },
    {
      key: "ぐぉ",
      tendency: "gwo",
    },
    {
      key: "しゃ",
      tendency: "sya",
    },
    {
      key: "しぃ",
      tendency: "syi",
    },
    {
      key: "しゅ",
      tendency: "syu",
    },
    {
      key: "しぇ",
      tendency: "sye",
    },
    {
      key: "しょ",
      tendency: "syo",
    },
    {
      key: "すぁ",
      tendency: "swa",
    },
    {
      key: "すぃ",
      tendency: "swi",
    },
    {
      key: "すぅ",
      tendency: "swu",
    },
    {
      key: "すぇ",
      tendency: "swe",
    },
    {
      key: "すぉ",
      tendency: "swo",
    },
    {
      key: "ちゃ",
      tendency: "tya",
    },
    {
      key: "ちぃ",
      tendency: "tyi",
    },
    {
      key: "ちゅ",
      tendency: "tyu",
    },
    {
      key: "ちぇ",
      tendency: "tye",
    },
    {
      key: "ちょ",
      tendency: "tyo",
    },
    {
      key: "つぁ",
      tendency: "tsa",
    },
    {
      key: "つぃ",
      tendency: "tsi",
    },
    {
      key: "つぇ",
      tendency: "tse",
    },
    {
      key: "つぉ",
      tendency: "tso",
    },
    {
      key: "てぁ",
      tendency: "tha",
    },
    {
      key: "てぃ",
      tendency: "thi",
    },
    {
      key: "てゅ",
      tendency: "thu",
    },
    {
      key: "てぇ",
      tendency: "the",
    },
    {
      key: "てょ",
      tendency: "tho",
    },
    {
      key: "とぁ",
      tendency: "twa",
    },
    {
      key: "とぃ",
      tendency: "twi",
    },
    {
      key: "とぅ",
      tendency: "twu",
    },
    {
      key: "とぇ",
      tendency: "twe",
    },
    {
      key: "とぉ",
      tendency: "two",
    },
    {
      key: "にゃ",
      tendency: "nya",
    },
    {
      key: "にぃ",
      tendency: "nyi",
    },
    {
      key: "にゅ",
      tendency: "nyu",
    },
    {
      key: "にぇ",
      tendency: "nye",
    },
    {
      key: "にょ",
      tendency: "nyu",
    },
    {
      key: "ひゃ",
      tendency: "hya",
    },
    {
      key: "ひぃ",
      tendency: "hyi",
    },
    {
      key: "ひゅ",
      tendency: "hyu",
    },
    {
      key: "ひぇ",
      tendency: "hye",
    },
    {
      key: "ひょ",
      tendency: "hyo",
    },
    {
      key: "みゃ",
      tendency: "mya",
    },
    {
      key: "みぃ",
      tendency: "myi",
    },
    {
      key: "みゅ",
      tendency: "myu",
    },
    {
      key: "みぇ",
      tendency: "mye",
    },
    {
      key: "みょ",
      tendency: "myo",
    },
    {
      key: "りゃ",
      tendency: "rya",
    },
    {
      key: "りぃ",
      tendency: "ryi",
    },
    {
      key: "りゅ",
      tendency: "ryu",
    },
    {
      key: "りぇ",
      tendency: "rye",
    },
    {
      key: "りょ",
      tendency: "ryo",
    },
    {
      key: "ふぁ",
      tendency: "fa",
    },
    {
      key: "ふぃ",
      tendency: "fi",
    },
    {
      key: "ふぅ",
      tendency: "fwu",
    },
    {
      key: "ふぇ",
      tendency: "fe",
    },
    {
      key: "ふぉ",
      tendency: "fo",
    },
    {
      key: "ふゃ",
      tendency: "fya",
    },
    {
      key: "ふゅ",
      tendency: "fyu",
    },
    {
      key: "ふょ",
      tendency: "fyo",
    },
    {
      key: "ぎゃ",
      tendency: "gya",
    },
    {
      key: "ぎぃ",
      tendency: "gyi",
    },
    {
      key: "ぎゅ",
      tendency: "gyu",
    },
    {
      key: "ぎぇ",
      tendency: "gye",
    },
    {
      key: "ぎょ",
      tendency: "gyo",
    },
    {
      key: "じゃ",
      tendency: "zya",
    },
    {
      key: "じぃ",
      tendency: "zyi",
    },
    {
      key: "じゅ",
      tendency: "zyu",
    },
    {
      key: "じぇ",
      tendency: "zye",
    },
    {
      key: "じょ",
      tendency: "zyo",
    },
    {
      key: "ぢゃ",
      tendency: "dya",
    },
    {
      key: "ぢぃ",
      tendency: "dyi",
    },
    {
      key: "ぢゅ",
      tendency: "dyu",
    },
    {
      key: "ぢぇ",
      tendency: "dye",
    },
    {
      key: "ぢょ",
      tendency: "dyo",
    },
    {
      key: "びゃ",
      tendency: "bya",
    },
    {
      key: "びぃ",
      tendency: "byi",
    },
    {
      key: "びゅ",
      tendency: "byu",
    },
    {
      key: "びぇ",
      tendency: "bye",
    },
    {
      key: "びょ",
      tendency: "byo",
    },
    {
      key: "ぴゃ",
      tendency: "pya",
    },
    {
      key: "ぴぃ",
      tendency: "pyi",
    },
    {
      key: "ぴゅ",
      tendency: "pyu",
    },
    {
      key: "ぴぇ",
      tendency: "pye",
    },
    {
      key: "ぴょ",
      tendency: "pyo",
    },
    {
      key: "ゔぁ",
      tendency: "va",
    },
    {
      key: "ゔぃ",
      tendency: "vi",
    },
    {
      key: "ゔぇ",
      tendency: "ve",
    },
    {
      key: "ゔぉ",
      tendency: "vo",
    },
    {
      key: "ゔゃ",
      tendency: "vya",
    },
    {
      key: "ゔゅ",
      tendency: "vyu",
    },
    {
      key: "ゔょ",
      tendency: "vyo",
    },
    {
      key: "でゃ",
      tendency: "dha",
    },
    {
      key: "でぃ",
      tendency: "dhi",
    },
    {
      key: "でゅ",
      tendency: "dhu",
    },
    {
      key: "でぇ",
      tendency: "dhe",
    },
    {
      key: "でょ",
      tendency: "dho",
    },
    {
      key: "どぁ",
      tendency: "dwa",
    },
    {
      key: "どぃ",
      tendency: "dwi",
    },
    {
      key: "どぅ",
      tendency: "dwu",
    },
    {
      key: "どぇ",
      tendency: "dwe",
    },
    {
      key: "どぉ",
      tendency: "dwo",
    },
  ];
  gameData.Conversion = CONVERSION_TENDENCIES;
}
