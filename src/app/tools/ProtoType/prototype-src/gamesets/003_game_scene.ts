import gsap from "gsap";
import { PixiPlugin } from "gsap/PixiPlugin";
import { CustomEase } from "gsap/all";
import * as PIXI from "pixi.js";
import { replaceHash } from "./001_game_master";
import { gameData } from "./002_gameConfig";
import { Keyboard, keybord_size, scale } from "./011_keybord";
gsap.registerPlugin(PixiPlugin, CustomEase);

import { triggerFrameEffect } from "./024_FrameEffect";
import { triggerSquareEffect } from "./025_SquareEffect";

import { settings } from "../SiteInterface";

import {
  acc_key_from_code,
  getLatestKey,
  keyCodeToText,
  light_key_from_code,
} from "./009_keyinput";
import { loadcache_localranking, RankingPlayer } from "./020_cacheControl";

import {
  getNextKeysOptimized,
  getRomanizedTextFromTendency,
} from "./008_generate_pattern";

import { BG_grid } from "./018_grid";

import { closeScene, flashObj, GM_start, openScene } from "./014_mogura";

import { getRanking_Data } from "./010_APIget";

const anim_max_width = 100;
export async function game_scene(app: PIXI.Application): Promise<void> {
  return new Promise(async (resolve) => {
    app.stage.removeChildren();
    let currentKeyController: AbortController | null = null;
    const BG_plane = new PIXI.Graphics();
    app.stage.addChild(BG_plane);
    BG_plane.rect(0, 0, app.screen.width, app.screen.height).fill(
      replaceHash(settings.colorTheme.colors.MainBG),
    );
    const grid = BG_grid(app);

    const win_pos = { x: app.screen.width / 2, y: app.screen.height / 2 };

    let keybord_flag = true;
    gameData.current_Issue = 0;
    switch (gameData.GameMode) {
      case "nomal":
        keybord_flag = true;
        win_pos.y = app.screen.height / 2 - 210;
        gameData.Issues_num = 15;
        break;
      case "focus":
        keybord_flag = false;
        gameData.Issues_num = 15;
        win_pos.y = app.screen.height / 2 - 100;
        break;
      case "exact":
        keybord_flag = true;
        win_pos.y = app.screen.height / 2 - 210;
        gameData.Issues_num = 15;
        break;
      case "long":
        keybord_flag = true;
        win_pos.y = app.screen.height / 2 - 210;
        gameData.Issues_num = 30;
        break;
      case "number":
        keybord_flag = true;
        win_pos.y = app.screen.height / 2 - 210;
        gameData.Issues_num = 15;
        break;
      case "speed":
        keybord_flag = true;
        win_pos.y = app.screen.height / 2 - 210;
        gameData.Issues_num = 20;
        break;
      case "endless":
        keybord_flag = true;
        win_pos.y = app.screen.height / 2 - 210;
        gameData.Issues_num = 999;
        break;
      default:
        console.log("gamemode nothing");
        resolve();
        break;
    }

    const sentence_text = new PIXI.Text({
      text: "スペースキーでスタート",
      style: {
        fontFamily: gameData.FontFamily,
        fontSize: 40,
        fill: replaceHash(settings.colorTheme.colors.MainColor),
        align: "center",
      },
    });

    sentence_text.x = win_pos.x - sentence_text.width / 2;
    sentence_text.y = win_pos.y - sentence_text.height / 2 - 2;
    app.stage.addChild(sentence_text);
    const alphabet_text = new PIXI.Text({
      text: "space to start",
      style: {
        fontFamily: gameData.FontFamily,
        fontSize: 25,
        fill: replaceHash(settings.colorTheme.colors.MainColor),
        align: "center",
      },
    });
    alphabet_text.x = win_pos.x - alphabet_text.width / 2;
    alphabet_text.y = win_pos.y - alphabet_text.height / 2 + 40;
    alphabet_text.alpha = 0.6;
    app.stage.addChild(alphabet_text);
    const alphabet_current_text = new PIXI.Text({
      text: "",
      style: {
        fontFamily: gameData.FontFamily,
        fontSize: 25,
        fill: replaceHash(settings.colorTheme.colors.MainColor),
        align: "center",
      },
    });
    alphabet_current_text.x = win_pos.x - alphabet_current_text.width / 2;
    alphabet_current_text.y = win_pos.y - alphabet_current_text.height / 2 + 40;
    app.stage.addChild(alphabet_current_text);

    const next_text = new PIXI.Text({
      text: "",
      style: {
        fontFamily: gameData.FontFamily,
        fontSize: 25,
        fill: replaceHash(settings.colorTheme.colors.MainColor),
        align: "center",
      },
    });

    next_text.x = win_pos.x - next_text.width / 2;
    next_text.y = win_pos.y - next_text.height / 2 + 150;
    app.stage.addChild(next_text);

    const rank_text = new PIXI.Text({
      text: "Rank",
      style: {
        fontFamily: gameData.FontFamily,
        fontSize: 22,
        fill: replaceHash(settings.colorTheme.colors.MainColor),
        align: "center",
      },
    });
    rank_text.x = win_pos.x - (keybord_size.width * scale) / 2;
    rank_text.y = win_pos.y - rank_text.height / 2 - 200;
    rank_text.alpha = 0;
    app.stage.addChild(rank_text);
    const rank_value_text = new PIXI.Text({
      text: "20",
      style: {
        fontFamily: gameData.FontFamily,
        fontSize: 25,
        fill: replaceHash(settings.colorTheme.colors.MainColor),
        align: "center",
      },
    });
    rank_value_text.x = rank_text.x + rank_text.width + 20;
    rank_value_text.y = win_pos.y - rank_value_text.height / 2 - 200;
    rank_value_text.alpha = 0;
    app.stage.addChild(rank_value_text);
    const score_text = new PIXI.Text({
      text: "",
      style: {
        fontFamily: gameData.FontFamily,
        fontSize: 25,
        fill: replaceHash(settings.colorTheme.colors.MainColor),
        align: "center",
      },
    });
    score_text.x = win_pos.x - score_text.width / 2;
    score_text.y = win_pos.y - score_text.height / 2 - 200;
    app.stage.addChild(score_text);

    const extra_text = new PIXI.Text({
      text: "+",
      style: {
        fontFamily: gameData.FontFamily,
        fontSize: 20,
        fill: replaceHash(settings.colorTheme.colors.MainColor),
        align: "center",
      },
    });
    extra_text.x = win_pos.x - score_text.width / 2 + 40;
    extra_text.y = win_pos.y - score_text.height / 2 - 198;
    extra_text.alpha = 0;
    app.stage.addChild(extra_text);

    const combo_text = new PIXI.Text({
      text: "",
      style: {
        fontFamily: gameData.FontFamily,
        fontSize: 40,
        fill: replaceHash(settings.colorTheme.colors.MainColor),
        align: "center",
      },
    });
    combo_text.x = win_pos.x - (keybord_size.width * scale) / 2;
    combo_text.y = win_pos.y - combo_text.height / 2;
    app.stage.addChild(combo_text);

    const kpm_text = new PIXI.Text({
      text: "",
      style: {
        fontFamily: gameData.FontFamily,
        fontSize: 40,
        fill: replaceHash(settings.colorTheme.colors.MainColor),
        align: "right",
      },
    });
    kpm_text.x = win_pos.x - kpm_text.width + (keybord_size.width * scale) / 2;
    kpm_text.y = win_pos.y - kpm_text.height / 2;
    app.stage.addChild(kpm_text);

    const accuracyLine = new PIXI.Graphics();
    accuracyLine.moveTo(
      win_pos.x - (keybord_size.width * scale) / 2,
      win_pos.y - 250,
    );
    accuracyLine.lineTo(
      win_pos.x + (keybord_size.width * scale) / 2,
      win_pos.y - 250,
    );
    accuracyLine.stroke({
      width: 4,
      color: replaceHash(settings.colorTheme.colors.MainColor),
      alpha: 1,
    });
    app.stage.addChild(accuracyLine);

    const accuracyLine_flash = new PIXI.Graphics();
    accuracyLine_flash.moveTo(
      win_pos.x - (keybord_size.width * scale) / 2,
      win_pos.y - 250,
    );
    accuracyLine_flash.lineTo(
      win_pos.x + (keybord_size.width * scale) / 2,
      win_pos.y - 250,
    );
    accuracyLine_flash.stroke({
      width: 4,
      color: replaceHash(settings.colorTheme.colors.MainAccent),
      alpha: 1,
    });
    accuracyLine_flash.alpha = 0;
    app.stage.addChild(accuracyLine_flash);
    const progressLine = new PIXI.Graphics();
    progressLine.moveTo(
      win_pos.x - (keybord_size.width * scale) / 2,
      win_pos.y + 250,
    );
    progressLine.lineTo(
      win_pos.x + (keybord_size.width * scale) / 2,
      win_pos.y + 250,
    );
    progressLine.stroke({
      width: 4,
      color: replaceHash(settings.colorTheme.colors.MainColor),
      alpha: 1,
    });
    app.stage.addChild(progressLine);

    const progressDot = new PIXI.Graphics();
    progressDot.circle(0, win_pos.y + 250, 8);
    progressDot.x = win_pos.x - (keybord_size.width * scale) / 2;
    progressDot.fill(replaceHash(settings.colorTheme.colors.MainBG));
    progressDot.stroke({
      width: 4,
      color: replaceHash(settings.colorTheme.colors.MainColor),
    });
    app.stage.addChild(progressDot);

    if (keybord_flag) {
      Keyboard(app);
    }
    await openScene(app, 2);
    const load_text = new PIXI.Text({
      text: "問題を取得中",
      style: {
        fontFamily: gameData.FontFamily,
        fontSize: 25,
        fill: replaceHash(settings.colorTheme.colors.MainColor),
        align: "center",
      },
    });

    const frame_left = new PIXI.Graphics();
    app.stage.addChild(frame_left);
    frame_left
      .rect(0, 0, anim_max_width, app.screen.height)
      .fill(replaceHash(settings.colorTheme.colors.MainAccent));
    frame_left.x = -anim_max_width;

    const frame_right = new PIXI.Graphics();
    app.stage.addChild(frame_right);
    frame_right
      .rect(0, 0, anim_max_width, app.screen.height)
      .fill(replaceHash(settings.colorTheme.colors.MainAccent));
    frame_right.x = app.screen.width;

    const frame_top = new PIXI.Graphics();
    app.stage.addChild(frame_top);
    frame_top
      .rect(0, 0, app.screen.width, anim_max_width)
      .fill(replaceHash(settings.colorTheme.colors.MainAccent));
    frame_top.y = -anim_max_width;

    const frame_bottom = new PIXI.Graphics();
    app.stage.addChild(frame_bottom);
    frame_bottom
      .rect(0, 0, app.screen.width, anim_max_width)
      .fill(replaceHash(settings.colorTheme.colors.MainAccent));
    frame_bottom.y = app.screen.height;

    function frame_anim(kpm: number) {
      let ratio = 0;
      if (kpm != -1) {
        ratio = kpm / 10;
      }
      let offset = anim_max_width * ratio;
      let rect_alphas = kpm < 10 ? 0.4 : 0.8;
      frame_left.alpha = rect_alphas;
      frame_right.alpha = rect_alphas;
      frame_top.alpha = rect_alphas;
      frame_bottom.alpha = rect_alphas;

      gsap.fromTo(
        frame_left,
        { x: offset - anim_max_width, y: offset },
        {
          x: -anim_max_width,
          y: 0,
          duration: 1,
          ease: CustomEase.create("custom", "M0,0 C0,0.25 0.2,0.96 1,1"),
        },
      );
      gsap.fromTo(
        frame_right,
        { x: app.screen.width - offset, y: -offset },
        {
          x: app.screen.width,
          y: 0,
          duration: 1,
          ease: CustomEase.create("custom", "M0,0 C0,0.25 0.2,0.96 1,1"),
        },
      );
      gsap.fromTo(
        frame_top,
        { x: -offset, y: offset - anim_max_width },
        {
          x: 0,
          y: -anim_max_width,
          duration: 1,
          ease: CustomEase.create("custom", "M0,0 C0,0.25 0.2,0.96 1,1"),
        },
      );
      gsap.fromTo(
        frame_bottom,
        { x: offset, y: app.screen.height - offset },
        {
          x: 0,
          y: app.screen.height,
          duration: 1,
          ease: CustomEase.create("custom", "M0,0 C0,0.25 0.2,0.96 1,1"),
        },
      );
    }

    let keyTimestamps: number[] = [];

    function recordKey(): void {
      const now: number = Date.now();
      keyTimestamps.push(now);
      if (keyTimestamps.length > gameData.instant_key_n) {
        keyTimestamps.shift();
      }
    }

    function getTypingSpeed(): number {
      if (keyTimestamps.length < gameData.instant_key_n) {
        return -1;
      }
      let totalDelta = 0;
      for (let i = 0; i < gameData.instant_key_n - 1; i++) {
        totalDelta += keyTimestamps[i + 1] - keyTimestamps[i];
      }
      const avgDelta: number = totalDelta / (gameData.instant_key_n - 1);

      if (avgDelta === 0) {
        return Infinity;
      }

      return 1000 / avgDelta;
    }
    function transitionToResultScene() {
      progressDot.x = win_pos.x + progressLine.width / 2;
      sentence_text.text = "ゲームセット！";
      sentence_text.x = win_pos.x - sentence_text.width / 2;
      alphabet_current_text.text = "";
      alphabet_text.text = "";
      next_text.text = "";
      if (currentKeyController) {
        currentKeyController.abort();
        currentKeyController = null;
      }

      gameData.EndTime = Date.now();

      if (gameData.total_hit_cnt > 0) {
        let tmp_kpm =
          ((gameData.total_hit_cnt - gameData.Miss) /
            ((gameData.EndTime - gameData.StartTime) / 1000)) *
          60;

        gameData.Score =
          tmp_kpm *
            Math.pow(1 - gameData.Miss / gameData.total_hit_cnt, 3) *
            100 +
          gameData.score_extra;

        if (gameData.Score > gameData.MaxScore) {
          gameData.MaxScore = gameData.Score;
        }

        if (tmp_kpm > gameData.MaxKPM) {
          gameData.MaxKPM = tmp_kpm;
        }
      }

      gameData.CurrentSceneName = "result_scene";
    }

    function extra_anim(n: number) {
      extra_text.text = "+" + String(n);
      flashObj(app, extra_text);
      gsap.fromTo(
        extra_text,
        { alpha: 0, y: win_pos.y - score_text.height / 2 - 194 },
        {
          alpha: 1,
          y: win_pos.y - score_text.height / 2 - 198,
          duration: 0.1,
          ease: CustomEase.create("custom", "M0,0 C0,1 1,0 1,1"),
        },
      );
      gsap.to(extra_text, {
        alpha: 0,
        duration: 0.2,
        delay: 0.5,
        ease: CustomEase.create("custom", "M0,0 C1,0 0,1 1,1"),
      });
    }

    gameData.IsStarted = false;
    load_text.x = win_pos.x - load_text.width / 2;
    load_text.y = win_pos.y - load_text.height / 2 - 300;
    gameData.combo_cnt = 0;
    gameData.total_hit_cnt = 0;
    gameData.Miss = 0;
    gameData.game_failure = false;
    app.stage.addChild(load_text);
    gameData.current_inputed = "";
    gameData.score_extra = 0;
    gameData.Score = 0;
    gameData.MaxScore = 0;
    gameData.MaxKPM = 0;
    gameData.missKeys = [];
    setTimeout(async () => {
      let issueIndexs = [14, 14];
      switch (gameData.GameMode) {
        case "nomal":
          issueIndexs = [14, 14];
          break;
        case "focus":
          issueIndexs = [14, 14];
          break;
        case "exact":
          issueIndexs = [14, 14];
          break;
        case "long":
          issueIndexs = [14, 14];
          break;
        case "number":
          issueIndexs = [16, 16];
          break;
        default:
          issueIndexs = [14, 14];
          resolve();
          break;
      }
      await makeIssues(issueIndexs[0], issueIndexs[1], gameData.Issues_num);
      if (gameData.IsLoggedin) {
        const onlineRanking = await getRanking_Data(0);
        gameData.onlineRanking = [];
        for (let i = 0; i < 100; i++) {
          const newPlayer: RankingPlayer = {
            player_id: onlineRanking[i][0],
            player_name: onlineRanking[i][1],
            player_score: onlineRanking[i][2],
            player_accracy: onlineRanking[i][3],
            player_avg_kpm: onlineRanking[i][4],
            player_max_kpm: onlineRanking[i][5],
            player_play_date: onlineRanking[i][6],
          };
          gameData.onlineRanking.push(newPlayer);
        }
      }
      loadcache_localranking();
      setTimeout(() => {
        app.stage.removeChild(load_text);
      }, 100);
      while (gameData.CurrentSceneName == "game_scene") {
        currentKeyController = new AbortController();
        try {
          if (gameData.IsStarted) {
            let collectkeys = getNextKeysOptimized(
              gameData.Issues[gameData.current_Issue].romaji,
              gameData.current_inputed,
            );
            if (gameData.GameMode != "focus") {
              for (let collec = 0; collec < collectkeys.length; collec++) {
                acc_key_from_code(app, collectkeys[collec].letter, true);
              }
            }

            const keyCode = await getLatestKey(currentKeyController.signal);

            if (keyCode.code === "Escape" && keyCode.shift == true) {
              playCollect();
              transitionToResultScene();
              flashObj(app, sentence_text);
              await closeScene(app, 3);

              resolve();
            }
            if (keyCode.code === "ControlLeft" && keyCode.shift == true) {
              playCollect();
              transitionToResultScene();
              flashObj(app, sentence_text);
              await closeScene(app, 3);
              resolve();
            } else if (keyCode.code === "Escape") {
              playCollect();
              gameData.CurrentSceneName = "reload_game";
              gameData.EndTime = Date.now();
              currentKeyController?.abort();
              await closeScene(app, 3);
              resolve();
            }

            if (keyCodeToText(keyCode.code, keyCode.shift) != "") {
              let Ismiss = true;
              for (let i = 0; i < collectkeys.length; i++) {
                if (
                  keyCodeToText(keyCode.code, keyCode.shift) ==
                  collectkeys[i].letter
                ) {
                  Ismiss = false;
                  gameData.current_inputed =
                    gameData.current_inputed +
                    keyCodeToText(keyCode.code, keyCode.shift);
                  const tendency = gameData.Conversion.find(
                    (t) => t.key === collectkeys[i].flag.configKey,
                  );
                  if (tendency) {
                    tendency.tendency = String(collectkeys[i].flag.origin);
                  }
                  break;
                }
              }
              if (Ismiss) {
                playMiss();
                if (gameData.GameMode != "focus") {
                  for (let collec = 0; collec < collectkeys.length; collec++) {
                    acc_key_from_code(app, collectkeys[collec].letter, false);
                  }
                }
                gameData.acc_keys = [];
                filterflash(app);

                gsap.fromTo(
                  accuracyLine_flash,
                  { alpha: 1 },
                  {
                    alpha: 0,
                    duration: 0.2,
                    ease: CustomEase.create("custom", "M0,0 C0,1 1,0 1,1"),
                    delay: 0.2,
                  },
                );

                if (gameData.GameMode != "focus") {
                  light_key_from_code(app, keyCode.code);
                }

                gameData.Miss++;
                gameData.combo_cnt = 0;
                gameData.total_hit_cnt++;
                let is_new_misskey = true;
                for (let missc = 0; missc < gameData.missKeys.length; missc++) {
                  if (
                    keyCodeToText(keyCode.code, keyCode.shift) ==
                    gameData.missKeys[missc]
                  )
                    is_new_misskey = false;
                }
                if (is_new_misskey) {
                  gameData.missKeys.push(
                    keyCodeToText(keyCode.code, keyCode.shift),
                  );
                }
                if (gameData.GameMode == "exact") gameData.current_inputed = "";
                alphabet_text.text = getRomanizedTextFromTendency(
                  gameData.Conversion,
                  gameData.Issues[gameData.current_Issue].romaji,
                  gameData.current_inputed,
                );
                alphabet_text.x = win_pos.x - alphabet_text.width / 2;
              } else {
                playCollect();
                triggerFrameEffect();
                if (gameData.GameMode != "focus") {
                  for (let collec = 0; collec < collectkeys.length; collec++) {
                    acc_key_from_code(app, collectkeys[collec].letter, false);
                  }
                }
                gameData.acc_keys = [];
                frame_anim(getTypingSpeed());
                gameData.combo_cnt++;
                if (gameData.combo_cnt > gameData.max_combo)
                  gameData.max_combo = gameData.combo_cnt;
                gameData.total_hit_cnt++;
                recordKey();
                if (
                  isFibonacci(gameData.combo_cnt) &&
                  gameData.combo_cnt > 20
                ) {
                  gameData.score_extra += gameData.combo_cnt * 10;
                  extra_anim(gameData.combo_cnt * 10);
                }
                let tmp_kpm =
                  ((gameData.total_hit_cnt - gameData.Miss) /
                    ((Date.now() - gameData.StartTime) / 1000)) *
                  60;
                gameData.Score =
                  tmp_kpm *
                    (1 - gameData.Miss / gameData.total_hit_cnt) *
                    (1 - gameData.Miss / gameData.total_hit_cnt) *
                    (1 - gameData.Miss / gameData.total_hit_cnt) *
                    100 +
                  gameData.score_extra;
                if (gameData.Score > gameData.MaxScore)
                  gameData.MaxScore = gameData.Score;
                if (tmp_kpm > gameData.MaxKPM) gameData.MaxKPM = tmp_kpm;
              }
            }

            if (
              getNextKeysOptimized(
                gameData.Issues[gameData.current_Issue].romaji,
                gameData.current_inputed,
              ).length == 0
            ) {
              triggerSquareEffect();
              gameData.current_Issue++;
              gameData.current_inputed = "";

              if (gameData.current_Issue >= gameData.Issues_num) {
                transitionToResultScene();
                flashObj(app, sentence_text);
                await closeScene(app, 3);
                resolve();
                return;
              }
            }

            if (
              gameData.current_Issue >= gameData.Issues.length ||
              gameData.current_Issue >= gameData.Issues.length
            ) {
              transitionToResultScene();
              flashObj(app, sentence_text);
              await closeScene(app, 3);
              resolve();
              return;
            }

            if (
              gameData.current_Issue + 1 >= gameData.Issues_num ||
              gameData.current_Issue + 1 >= gameData.Issues.length
            ) {
              next_text.text = "";
            } else {
              next_text.text = gameData.Issues[gameData.current_Issue + 1].text;
            }

            if (gameData.current_Issue < gameData.Issues.length) {
              sentence_text.text = gameData.Issues[gameData.current_Issue].text;
              sentence_text.x = win_pos.x - sentence_text.width / 2;
              if (gameData.current_inputed.length == 0) {
                flashObj(app, sentence_text);
                flashObj(app, alphabet_text);
              }
            }
            alphabet_text.text = getRomanizedTextFromTendency(
              gameData.Conversion,
              gameData.Issues[gameData.current_Issue].romaji,
              gameData.current_inputed,
            );
            alphabet_text.x = win_pos.x - alphabet_text.width / 2;
            if (gameData.current_inputed.length == 0) {
              flashObj(app, sentence_text);
              flashObj(app, alphabet_text);
            }
            alphabet_current_text.text = gameData.current_inputed;
            alphabet_current_text.x = win_pos.x - alphabet_text.width / 2;
            next_text.x = win_pos.x - next_text.width / 2;
            progressDot.x =
              win_pos.x +
              (progressLine.width / (gameData.Issues_num - 1)) *
                gameData.current_Issue +
              -(progressLine.width / 2);
            if (gameData.combo_cnt == 0) {
              combo_text.text = "";
            } else {
              combo_text.text = gameData.combo_cnt;
            }

            combo_text.x = win_pos.x - (keybord_size.width * scale) / 2;

            if (gameData.total_hit_cnt > gameData.instant_key_n) {
              accuracyLine.clear();
              accuracyLine.moveTo(
                win_pos.x -
                  ((keybord_size.width * scale) / 2) *
                    (1 - gameData.Miss / gameData.total_hit_cnt),
                win_pos.y - 250,
              );
              accuracyLine.lineTo(
                win_pos.x +
                  ((keybord_size.width * scale) / 2) *
                    (1 - gameData.Miss / gameData.total_hit_cnt),
                win_pos.y - 250,
              );
              accuracyLine.stroke({
                width: 4,
                color: replaceHash(settings.colorTheme.colors.MainColor),
                alpha: 1,
              });
              accuracyLine_flash.clear();
              accuracyLine_flash.moveTo(
                win_pos.x -
                  ((keybord_size.width * scale) / 2) *
                    (1 - gameData.Miss / gameData.total_hit_cnt),
                win_pos.y - 250,
              );
              accuracyLine_flash.lineTo(
                win_pos.x +
                  ((keybord_size.width * scale) / 2) *
                    (1 - gameData.Miss / gameData.total_hit_cnt),
                win_pos.y - 250,
              );
              accuracyLine_flash.stroke({
                width: 4,
                color: replaceHash(settings.colorTheme.colors.MainAccent),
                alpha: 1,
              });
            }
            score_text.text = gameData.Score.toFixed(0);
            score_text.x = win_pos.x - score_text.width / 2;
            if (getTypingSpeed() == -1) {
              kpm_text.text = "";
            } else {
              kpm_text.text = getTypingSpeed().toFixed(2);
            }

            kpm_text.x =
              win_pos.x - kpm_text.width + (keybord_size.width * scale) / 2;
            if (rank_text.alpha == 0) {
              gsap.fromTo(
                rank_text,
                { y: win_pos.y - rank_text.height / 2 - 200, alpha: 0 },
                {
                  y: win_pos.y - rank_text.height / 2 - 210,
                  alpha: 1,
                  duration: 1,
                  ease: CustomEase.create("custom", "M0,0 C0,1 0.1,1 1,1"),
                },
              );
              rank_value_text.text = String(Rank_get(gameData.Score));
              gsap.fromTo(
                rank_value_text,
                { y: win_pos.y - rank_text.height / 2 - 200, alpha: 0 },
                {
                  y: win_pos.y - rank_text.height / 2 - 210,
                  alpha: 1,
                  duration: 1,
                  ease: CustomEase.create("custom", "M0,0 C0,1 0.1,1 1,1"),
                },
              );
              flashObj(app, rank_text);
              flashObj(app, rank_value_text);
            } else if (
              String(Rank_get(gameData.Score)) !=
              (rank_value_text.text != "ランク外"
                ? String(rank_value_text.text)
                : "-1")
            ) {
              rank_value_text.text = String(
                Rank_get(gameData.Score) != -1
                  ? Rank_get(gameData.Score)
                  : "ランク外",
              );
              gsap.fromTo(
                rank_value_text,
                { alpha: 0, y: win_pos.y - rank_text.height / 2 - 200 },
                {
                  alpha: 1,
                  y: win_pos.y - rank_text.height / 2 - 210,
                  duration: 1,
                  ease: CustomEase.create("custom", "M0,0 C0,1 0.1,1 1,1"),
                },
              );
            }
          } else {
            const keyCode = await getLatestKey(currentKeyController.signal);
            if (keyCode.code === "Escape") {
              playCollect();
              gameData.CurrentSceneName = "game_select";
              gameData.EndTime = Date.now();
              currentKeyController?.abort();
              gameData.gameselect_open = 0;
              await closeScene(app, 3);
              resolve();
            }
            if (keyCode.code === "Space") {
              sentence_text.text = "";
              alphabet_text.text = "";
              await GM_start(app);
              gameData.IsStarted = true;
              gameData.StartTime = Date.now();
              if (gameData.current_Issue >= gameData.Issues_num) {
                gameData.CurrentSceneName = "result_scene";
                currentKeyController?.abort();
                resolve();
              }
              if (gameData.current_Issue + 1 >= gameData.Issues_num) {
                next_text.text = "";
              } else {
                next_text.text =
                  gameData.Issues[gameData.current_Issue + 1].text;
              }
              sentence_text.text = gameData.Issues[gameData.current_Issue].text;
              sentence_text.x = win_pos.x - sentence_text.width / 2;

              alphabet_text.text = getRomanizedTextFromTendency(
                gameData.Conversion,
                gameData.Issues[gameData.current_Issue].romaji,
                gameData.current_inputed,
              );
              alphabet_text.x = win_pos.x - alphabet_text.width / 2;
              alphabet_current_text.text = gameData.current_inputed;
              alphabet_current_text.x =
                win_pos.x - alphabet_current_text.width / 2;
              next_text.x = win_pos.x - next_text.width / 2;
              progressDot.x =
                (keybord_size.width / gameData.Issues_num) *
                  scale *
                  gameData.current_Issue +
                (app.screen.width - keybord_size.width * scale) / 2;
              combo_text.text = "";
              combo_text.x = win_pos.x - (keybord_size.width * scale) / 2;
              accuracyLine.clear();
              accuracyLine.moveTo(
                win_pos.x - (keybord_size.width * scale) / 2,
                win_pos.y - 250,
              );
              accuracyLine.lineTo(
                win_pos.x + (keybord_size.width * scale) / 2,
                win_pos.y - 250,
              );
              accuracyLine.stroke({
                width: 4,
                color: replaceHash(settings.colorTheme.colors.MainColor),
                alpha: 1,
              });
              kpm_text.text = "";
              kpm_text.x =
                win_pos.x - kpm_text.width + (keybord_size.width * scale) / 2;
              score_text.text = "";
              score_text.x = win_pos.x - score_text.width / 2;
              frame_anim(9);
              flashObj(app, sentence_text);
              flashObj(app, alphabet_text);
              grid_anim(grid);
            }
          }
        } catch (error) {
          console.log(error);
          gameData.CurrentSceneName = "error_scene";
          gameData.EndTime = Date.now();
          currentKeyController?.abort();
          resolve();
        }
      }
    }, 100);
  });
}

function grid_anim(grid: PIXI.Graphics) {
  gsap.fromTo(
    grid,
    { alpha: 2 },
    {
      alpha: 1,
      duration: 4,
      ease: "power1.out",
    },
  );
}

import { ColorMatrixFilter } from "pixi.js";
import { Issue } from "./002_gameConfig";
import { playCollect, playMiss } from "./012_soundplay";
async function makeIssues(
  FromLen: number,
  ToLen: number,
  N: number,
): Promise<void> {
  return new Promise<void>(async (resolve) => {
    let Issues: Issue[] = [];
    const maxIndex = gameData.textsData.length - 1;

    for (let i = 0; i < N; i++) {
      let groupIndex =
        FromLen - 1 + Math.floor(Math.random() * (ToLen - FromLen + 1));
      groupIndex = Math.max(0, Math.min(groupIndex, maxIndex));

      const groupArray = gameData.textsData[groupIndex];
      const issueIndex = Math.floor(Math.random() * groupArray.length);
      const new_Issue: Issue = groupArray[issueIndex];
      Issues.push(new_Issue);
    }
    gameData.Issues = Issues;
    resolve();
  });
}

function isPerfectSquare(x: number): boolean {
  const s = Math.floor(Math.sqrt(x));
  return s * s === x;
}

function isFibonacci(n: number): boolean {
  if (n < 0) return false;
  return isPerfectSquare(5 * n * n + 4) || isPerfectSquare(5 * n * n - 4);
}
function filterflash(app: PIXI.Application) {
  const colorMatrix = new ColorMatrixFilter();
  if (gameData.flashType == 0) {
    colorMatrix.negative(true);
  } else {
    colorMatrix.sepia(true);
  }

  app.stage.filters = [colorMatrix];
  setTimeout(() => {
    app.stage.filters = [];
  }, 200);
}

function Rank_get(score: number) {
  const ranking = gameData.IsLoggedin
    ? gameData.onlineRanking
    : gameData.localRanking;
  for (let i = 0; i < ranking.length; i++) {
    if (score > ranking[i].player_score) {
      return i + 1;
    }
  }
  return -1;
}
