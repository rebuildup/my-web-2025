import * as PIXI from "pixi.js";
import gsap from "gsap";
// import { PixiPlugin } from "gsap/PixiPlugin";
// PixiPlugin.registerPIXI(PIXI);
import { gameData } from "./002_gameConfig";
import { replaceHash } from "./001_game_master";
import { settings } from "../SiteInterface";
import { BG_grid } from "./018_grid";
import {
  savecache_localranking,
  insertLocalRanking,
  RankingPlayer,
  insertOnlineRanking,
} from "./020_cacheControl";
import { getLatestKey } from "./009_keyinput";
import { playMiss } from "./012_soundplay";
import { saveToCache } from "./020_cacheControl";
import { postPlayData } from "./010_APIget";
import { closeScene, flashObj, openScene, reaction_jump, wig_Type } from "./014_mogura";

function createText(
  app: PIXI.Application,
  text_t: string = "",
  x: number = 0,
  y: number = 0,
  f_size: number = 38,
  option: number = 0,
) {
  const output = new PIXI.Text({
    text: text_t,
    style: {
      fontFamily: gameData.FontFamily,
      fontSize: f_size,
      fill: replaceHash(settings.colorTheme.colors.MainColor),
      align: "center",
    },
  });
  switch (option) {
    case 0: //center
      output.x = x - output.width / 2;
      output.y = y - output.height / 2;
      break;
    case 1: //left
      output.x = x;
      output.y = y - output.height / 2;
      break;
    case 2: //right
      output.x = x - output.width;
      output.y = y - output.height / 2;
      break;
  }

  app.stage.addChild(output);
  return output;
}
function padNumber(num: number) {
  return num < 10 ? "0" + num : num.toString();
}

export function result_scene(app: PIXI.Application): Promise<void> {
  return new Promise<void>(async (resolve) => {
    if (!app.stage) {
      app.stage = new PIXI.Container();
    }
    app.stage.removeChildren();
    BG_grid(app);
    wig_Type(app);
    gameData.total_keyhit += gameData.total_hit_cnt;
    saveToCache("total_keyhit_GM", gameData.total_keyhit);
    gameData.playCount += 1;
    saveToCache("playCount_GM", gameData.playCount);
    if (!gameData.IsLoggedin) {
      gameData.current_Player_id++;
    }
    const Ranking_pos = app.screen.width / 4;
    const ranking_pad_x = 240;
    const Play_pos = (app.screen.width / 4) * 3;
    const play_pad_x = 240;
    const table_top_y = 240;
    const table_pad_y = 72;
    const accuracy =
      gameData.total_hit_cnt > 0 ? (1 - gameData.Miss / gameData.total_hit_cnt) * 100 : 0;

    const avgKpm =
      gameData.EndTime > gameData.StartTime && gameData.total_hit_cnt > 0
        ? ((gameData.total_hit_cnt - gameData.Miss) /
            ((gameData.EndTime - gameData.StartTime) / 1000)) *
          60
        : 0;

    const score =
      avgKpm * Math.pow(1 - gameData.Miss / gameData.total_hit_cnt, 3) * 100 + gameData.score_extra;

    const newPlayer: RankingPlayer = {
      player_id: gameData.current_Player_id,
      player_name: gameData.current_Player_name || "Player",
      player_score: isNaN(score) ? 0 : score,
      player_accracy: isNaN(accuracy) ? 0 : accuracy,
      player_avg_kpm: isNaN(avgKpm) ? 0 : avgKpm,
      player_max_kpm: isNaN(gameData.MaxKPM) ? 0 : gameData.MaxKPM,
      player_play_date: gameData.EndTime || Date.now(),
    };
    let ur_rank_ind = insertLocalRanking(newPlayer);
    if (gameData.IsLoggedin) {
      ur_rank_ind = insertOnlineRanking(newPlayer);
    }
    savecache_localranking();
    if (gameData.IsLoggedin) {
      postPlayData(
        gameData.current_Player_id,
        gameData.current_Player_name,
        ((gameData.total_hit_cnt - gameData.Miss) /
          ((gameData.EndTime - gameData.StartTime) / 1000)) *
          60 *
          (1 - gameData.Miss / gameData.total_hit_cnt) *
          (1 - gameData.Miss / gameData.total_hit_cnt) *
          (1 - gameData.Miss / gameData.total_hit_cnt) *
          100 +
          gameData.score_extra,
        (1 - gameData.Miss / gameData.total_hit_cnt) * 100,
        ((gameData.total_hit_cnt - gameData.Miss) /
          ((gameData.EndTime - gameData.StartTime) / 1000)) *
          60,
        gameData.MaxKPM,
      );
    }

    const align_opt = { center: 0, left: 1, right: 2 };

    const ranking_title = createText(
      app,
      gameData.IsLoggedin ? "オンラインランキング" : "ローカルランキング",
      Ranking_pos,
      table_top_y - table_pad_y,
      38,
      align_opt.center,
    );
    for (let i = 0; i < 10; i++) {
      createText(
        app,
        gameData.IsLoggedin
          ? padNumber(i + 1) + "   " + gameData.onlineRanking[i].player_name
          : padNumber(i + 1) + "   " + gameData.localRanking[i].player_name,
        Ranking_pos - ranking_pad_x,
        table_pad_y * i + table_top_y,
        35,
        align_opt.left,
      );
      createText(
        app,
        gameData.IsLoggedin
          ? String(gameData.onlineRanking[i].player_score.toFixed(0))
          : String(gameData.localRanking[i].player_score.toFixed(0)),
        Ranking_pos + ranking_pad_x,
        table_pad_y * i + table_top_y,
        35,
        align_opt.right,
      );
    }
    const Ur_rank_line = new PIXI.Graphics();
    Ur_rank_line.lineTo(ranking_pad_x * 2, -ranking_title.height).stroke({
      width: 2,
      color: replaceHash(settings.colorTheme.colors.MainColor),
    });
    Ur_rank_line.x = Ranking_pos - ranking_pad_x;
    Ur_rank_line.y = table_pad_y * 10 + table_top_y + ranking_title.height / 2;
    app.stage.addChild(Ur_rank_line);
    createText(
      app,
      "Your Rank",
      Ranking_pos - ranking_pad_x,
      table_pad_y * 11 + table_top_y,
      38,
      align_opt.left,
    );
    createText(
      app,
      ur_rank_ind == -1 ? "ランク外" : padNumber(ur_rank_ind + 1),
      Ranking_pos + ranking_pad_x,
      table_pad_y * 11 + table_top_y,
      38,
      align_opt.right,
    );

    const play_res_title = createText(
      app,
      "プレイ結果",
      Play_pos,
      table_top_y - table_pad_y,
      38,
      align_opt.center,
    );

    const result_t_f_s = 32;
    const result_n_f_s = 30;
    createText(app, "スコア", Play_pos - play_pad_x, table_top_y, result_t_f_s, align_opt.left);
    createText(
      app,
      String(
        (
          ((gameData.total_hit_cnt - gameData.Miss) /
            ((gameData.EndTime - gameData.StartTime) / 1000)) *
            60 *
            (1 - gameData.Miss / gameData.total_hit_cnt) *
            (1 - gameData.Miss / gameData.total_hit_cnt) *
            (1 - gameData.Miss / gameData.total_hit_cnt) *
            100 +
          gameData.score_extra
        ).toFixed(0),
      ),
      Play_pos + play_pad_x,
      table_top_y,
      result_n_f_s,
      align_opt.right,
    );
    createText(
      app,
      "総タイプ",
      Play_pos - play_pad_x,
      table_top_y + table_pad_y,
      result_t_f_s,
      align_opt.left,
    );
    createText(
      app,
      String(gameData.total_hit_cnt.toFixed(0)),
      Play_pos + play_pad_x,
      table_top_y + table_pad_y,
      result_n_f_s,
      align_opt.right,
    );
    createText(
      app,
      "正確性(%)",
      Play_pos - play_pad_x,
      table_top_y + table_pad_y * 2,
      result_t_f_s,
      align_opt.left,
    );
    createText(
      app,
      String(((1 - gameData.Miss / gameData.total_hit_cnt) * 100).toFixed(1)) + "%",
      Play_pos + play_pad_x,
      table_top_y + table_pad_y * 2,
      result_n_f_s,
      align_opt.right,
    );
    createText(
      app,
      "ミス入力数",
      Play_pos - play_pad_x,
      table_top_y + table_pad_y * 3,
      result_t_f_s,
      align_opt.left,
    );
    createText(
      app,
      String(gameData.Miss),
      Play_pos + play_pad_x,
      table_top_y + table_pad_y * 3,
      result_n_f_s,
      align_opt.right,
    );
    createText(
      app,
      "最大コンボ",
      Play_pos - play_pad_x,
      table_top_y + table_pad_y * 4,
      result_t_f_s,
      align_opt.left,
    );
    createText(
      app,
      String(gameData.max_combo),
      Play_pos + play_pad_x,
      table_top_y + table_pad_y * 4,
      result_n_f_s,
      align_opt.right,
    );
    createText(
      app,
      "入力時間",
      Play_pos - play_pad_x,
      table_top_y + table_pad_y * 5,
      result_t_f_s,
      align_opt.left,
    );

    let time_text_t = "";
    if ((gameData.EndTime - gameData.StartTime) / 1000 > 60) {
      time_text_t +=
        String(((gameData.EndTime - gameData.StartTime) / 1000 / 60).toFixed(0)) + "分";
    }
    time_text_t +=
      String((((gameData.EndTime - gameData.StartTime) / 1000) % 60).toFixed(0)) + "秒";
    createText(
      app,
      time_text_t,
      Play_pos + play_pad_x,
      table_top_y + table_pad_y * 5,
      result_n_f_s,
      align_opt.right,
    );
    createText(
      app,
      "平均kpm",
      Play_pos - play_pad_x,
      table_top_y + table_pad_y * 6,
      result_t_f_s,
      align_opt.left,
    );
    createText(
      app,
      String(
        (
          ((gameData.total_hit_cnt - gameData.Miss) /
            ((gameData.EndTime - gameData.StartTime) / 1000)) *
          60
        ).toFixed(0),
      ),
      Play_pos + play_pad_x,
      table_top_y + table_pad_y * 6,
      result_n_f_s,
      align_opt.right,
    );
    createText(
      app,
      "最大kpm",
      Play_pos - play_pad_x,
      table_top_y + table_pad_y * 7,
      result_t_f_s,
      align_opt.left,
    );
    createText(
      app,
      String(gameData.MaxKPM.toFixed(0)),
      Play_pos + play_pad_x,
      table_top_y + table_pad_y * 7,
      result_n_f_s,
      align_opt.right,
    );
    createText(
      app,
      "ミスキー",
      Play_pos - play_pad_x,
      table_top_y + table_pad_y * 8,
      result_t_f_s,
      align_opt.left,
    );

    let misskey_text_out = "無し";
    if (gameData.missKeys.length > 0) {
      misskey_text_out = gameData.missKeys[0];
    }
    for (
      let misskey = 1;
      misskey < (gameData.missKeys.length >= 5 ? 5 : gameData.missKeys.length);
      misskey++
    ) {
      misskey_text_out += " , ";
      misskey_text_out += gameData.missKeys[misskey];
    }
    createText(
      app,
      misskey_text_out,
      Play_pos + play_pad_x,
      table_top_y + table_pad_y * 8,
      result_n_f_s,
      align_opt.right,
    );

    const select_replay = new PIXI.Text({
      text: "リトライ",
      style: {
        fontFamily: gameData.FontFamily,
        fontSize: 32,
        fill: replaceHash(settings.colorTheme.colors.MainColor),
        align: "center",
      },
    });
    select_replay.x = Play_pos + play_pad_x - select_replay.width;
    select_replay.y = table_top_y + table_pad_y * 10 - select_replay.height / 2;
    select_replay.interactive = true;
    select_replay.on("pointerdown", async () => {
      dot_anim(table_top_y + table_pad_y * 10);
      retry();
    });
    select_replay.alpha = 1;
    app.stage.addChild(select_replay);

    const select_select = new PIXI.Text({
      text: "ゲーム選択に戻る",
      style: {
        fontFamily: gameData.FontFamily,
        fontSize: 32,
        fill: replaceHash(settings.colorTheme.colors.MainColor),
        align: "center",
      },
    });
    select_select.x = Play_pos + play_pad_x - select_select.width;
    select_select.y = table_top_y + table_pad_y * 11 - select_select.height / 2;
    select_select.interactive = true;
    select_select.on("pointerdown", async () => {
      dot_anim(table_top_y + table_pad_y * 11);
      over();
    });
    select_select.alpha = 0.5;
    async function retry() {
      currentKeyController?.abort();
      if (gameData.IsLoggedin) {
        gameData.CurrentSceneName = "game_scene";
      } else {
        gameData.CurrentSceneName = "register_scene";
      }
      await closeScene(app, 3);
      resolve();
    }
    async function over() {
      currentKeyController?.abort();
      gameData.CurrentSceneName = "game_select";
      await closeScene(app, 3);
      resolve();
    }
    app.stage.addChild(select_select);
    const selectDotAcc = new PIXI.Graphics();
    selectDotAcc.circle(0, 0, 8);
    selectDotAcc.x = app.screen.width - 110;
    selectDotAcc.y = table_top_y + table_pad_y * 10;
    selectDotAcc.fill(replaceHash(settings.colorTheme.colors.MainAccent));
    selectDotAcc.stroke({
      width: 4,
      color: replaceHash(settings.colorTheme.colors.MainAccent),
    });
    app.stage.addChild(selectDotAcc);
    gsap.fromTo(selectDotAcc, { alpha: 0 }, { alpha: 1, duration: 2, ease: "power3.out" });
    function dot_anim(y: number) {
      gsap.to(selectDotAcc, {
        y: y,
        duration: 0.5,
        ease: "power4.out",
      });
    }
    let currentKeyController: AbortController | null = null;
    let select = 0;
    flashObj(app, ranking_title);
    flashObj(app, play_res_title);
    flashObj(app, select_replay);
    flashObj(app, select_select);
    openScene(app, 1);
    while (gameData.CurrentSceneName === "result_scene") {
      currentKeyController = new AbortController();
      try {
        const keyCode = await getLatestKey(currentKeyController.signal);
        if (
          ["ArrowDown", "ArrowRight", "ShiftRight", "ArrowUp", "ArrowLeft", "ShiftLeft"].includes(
            keyCode.code,
          )
        ) {
          playMiss(0.3);
          select = select == 0 ? 1 : 0;
          select_replay.alpha = 0.5;
          select_select.alpha = 0.5;
          switch (select) {
            case 0:
              dot_anim(table_top_y + table_pad_y * 10);
              reaction_jump(
                select_replay,
                table_top_y + table_pad_y * 10 - select_replay.height / 2,
              );
              select_replay.alpha = 1;
              break;
            case 1:
              dot_anim(table_top_y + table_pad_y * 11);
              select_select.alpha = 1;
              reaction_jump(
                select_select,
                table_top_y + table_pad_y * 11 - select_select.height / 2,
              );
              break;
          }
        } else if (["Escape"].includes(keyCode.code)) {
          retry();
        } else if (["Enter", "Space"].includes(keyCode.code)) {
          switch (select) {
            case 0:
              retry();
              break;
            case 1:
              over();
              break;
          }
        }
      } catch (error: any) {
        if (error.name === "AbortError") {
          break;
        } else {
          console.error(error);
        }
      }
    }
  });
}
