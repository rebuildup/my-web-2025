import * as PIXI from "pixi.js";
import { gameData } from "./002_gameConfig";
import { replaceHash } from "./001_game_master";
import { settings } from "../SiteInterface";

import gsap from "gsap";
import { PixiPlugin } from "gsap/PixiPlugin";
PixiPlugin.registerPIXI(PIXI);

import { getLatestKey } from "./009_keyinput";
import { playCollect, playMiss } from "./012_soundplay";

import { score_graph } from "./013_graphs";
import { getAchievements } from "./027_achievements";

import { closeScene, flashObj, openScene, reaction, reaction_jump, wig_Type } from "./014_mogura";
import { BG_grid } from "./018_grid";
import { triggerFrameEffect } from "./024_FrameEffect";

const Select_dot_x = 1170;
const opened_record = { play: 0, achieve: 1, ranking: 2, graph: 3 };

// ranking helper (同等ロジックをここにも配置)
function Rank_get(score: number) {
  const ranking = gameData.IsLoggedin ? gameData.onlineRanking : gameData.localRanking;
  for (let i = 0; i < ranking.length; i++) {
    if (score > ranking[i].player_score) {
      return i + 1;
    }
  }
  return -1;
}

function padNumber(num: number) {
  return num < 10 ? "0" + num : num.toString();
}

export function record_scene(app: PIXI.Application): Promise<void> {
  return new Promise<void>(async (resolve) => {
    app.stage.removeChildren();
    BG_grid(app);
    wig_Type(app);
    let isOpened_record = opened_record.play;
    const screenCenter = { x: app.screen.width / 2, y: app.screen.height / 2 };
    const exit_btn = new PIXI.Graphics();
    exit_btn.circle(0, 0, 60).fill({
      color: replaceHash(settings.colorTheme.colors.MainColor),
      alpha: 0,
    });
    exit_btn
      .lineTo(16, -16)
      .lineTo(-16, 16)
      .lineTo(-16, -16)
      .lineTo(-16, 16)
      .lineTo(16, 16)
      .stroke({
        width: 4,
        color: replaceHash(settings.colorTheme.colors.MainColor),
      });

    exit_btn.rotation = Math.PI / 4 - Math.PI / 2;
    exit_btn.x = screenCenter.x;
    exit_btn.y = app.screen.height - 100;
    exit_btn.interactive = true;

    let currentKeyController: AbortController | null = null;

    exit_btn.on("pointerdown", async () => {
      triggerFrameEffect();
      reaction(exit_btn, 1.1);
      playCollect();
      gameData.CurrentSceneName = "game_select";
      get_out();
    });
    app.stage.addChild(exit_btn);

    const play_record_text = new PIXI.Text({
      text: "プレイ記録",
      style: {
        fontFamily: gameData.FontFamily,
        fontSize: 26,
        fill: replaceHash(settings.colorTheme.colors.MainColor),
        align: "center",
      },
    });
    play_record_text.x = Select_dot_x + 20;
    play_record_text.y = screenCenter.y - play_record_text.height / 2 - 120;
    play_record_text.interactive = true;
    play_record_text.on("pointerdown", async () => {
      triggerFrameEffect();
      playMiss(0.3);
      isOpened_record = opened_record.play;
      dot_pos_update(isOpened_record);
      update_open(isOpened_record);
    });
    app.stage.addChild(play_record_text);

    const achieve_text = new PIXI.Text({
      text: "実績一覧",
      style: {
        fontFamily: gameData.FontFamily,
        fontSize: 26,
        fill: replaceHash(settings.colorTheme.colors.MainColor),
        align: "center",
      },
    });
    achieve_text.x = Select_dot_x + 20;
    achieve_text.y = screenCenter.y - achieve_text.height / 2 - 40;
    achieve_text.interactive = true;
    achieve_text.alpha = 0.5;
    achieve_text.on("pointerdown", async () => {
      triggerFrameEffect();
      playMiss(0.3);
      isOpened_record = opened_record.achieve;
      dot_pos_update(isOpened_record);
      update_open(isOpened_record);
    });
    app.stage.addChild(achieve_text);

    const ranking_text = new PIXI.Text({
      text: "ローカルランキング",
      style: {
        fontFamily: gameData.FontFamily,
        fontSize: 26,
        fill: replaceHash(settings.colorTheme.colors.MainColor),
        align: "center",
      },
    });
    ranking_text.x = Select_dot_x + 20;
    ranking_text.y = screenCenter.y - ranking_text.height / 2 + 40;
    ranking_text.interactive = true;
    ranking_text.alpha = 0.5;
    ranking_text.on("pointerdown", async () => {
      triggerFrameEffect();
      playMiss(0.3);
      isOpened_record = opened_record.ranking;
      dot_pos_update(isOpened_record);
      update_open(isOpened_record);
    });
    app.stage.addChild(ranking_text);

    const graph_text = new PIXI.Text({
      text: "スコアグラフ",
      style: {
        fontFamily: gameData.FontFamily,
        fontSize: 26,
        fill: replaceHash(settings.colorTheme.colors.MainColor),
        align: "center",
      },
    });
    graph_text.x = Select_dot_x + 20;
    graph_text.y = screenCenter.y - graph_text.height / 2 + 120;
    graph_text.interactive = true;
    graph_text.alpha = 0.5;
    graph_text.on("pointerdown", async () => {
      triggerFrameEffect();
      playMiss(0.3);
      isOpened_record = opened_record.graph;
      dot_pos_update(isOpened_record);
      update_open(isOpened_record);
    });
    app.stage.addChild(graph_text);

    const selectDotAcc = new PIXI.Graphics();
    selectDotAcc.circle(0, 0, 8);
    selectDotAcc.position.set(Select_dot_x, play_record_text.y + play_record_text.height / 2);
    selectDotAcc.fill(replaceHash(settings.colorTheme.colors.MainAccent));
    selectDotAcc.stroke({
      width: 4,
      color: replaceHash(settings.colorTheme.colors.MainAccent),
    });
    app.stage.addChild(selectDotAcc);
    gsap.from(selectDotAcc.scale, {
      x: 0,
      y: 0,
      duration: 2,
      ease: "power4.out",
    });
    function dot_to(x: number, y: number) {
      gsap.to(selectDotAcc, {
        x: x,
        y: y,
        duration: 0.5,
        ease: "power4.out",
      });
    }

    async function get_out() {
      currentKeyController?.abort();

      gameData.gameselect_open = 2;
      await closeScene(app, 2);
      app.stage.removeChild(achieve_text);
      app.stage.removeChild(play_record_text);
      resolve();
    }
    function dot_pos_update(select: number) {
      play_record_text.alpha = 0.5;
      achieve_text.alpha = 0.5;
      ranking_text.alpha = 0.5;
      graph_text.alpha = 0.5;
      switch (select) {
        case opened_record.play:
          dot_to(Select_dot_x, play_record_text.y + play_record_text.height / 2);
          play_record_text.alpha = 1;
          reaction_jump(play_record_text, screenCenter.y - play_record_text.height / 2 - 120);
          break;
        case opened_record.achieve:
          dot_to(Select_dot_x, achieve_text.y + achieve_text.height / 2);
          achieve_text.alpha = 1;
          reaction_jump(achieve_text, screenCenter.y - achieve_text.height / 2 - 40);
          break;
        case opened_record.ranking:
          dot_to(Select_dot_x, ranking_text.y + ranking_text.height / 2);
          ranking_text.alpha = 1;
          reaction_jump(ranking_text, screenCenter.y - ranking_text.height / 2 + 40);
          break;
        case opened_record.graph:
          dot_to(Select_dot_x, graph_text.y + graph_text.height / 2);
          graph_text.alpha = 1;
          reaction_jump(graph_text, screenCenter.y - graph_text.height / 2 + 120);
          break;
      }
    }
    function update_open(opened: number) {
      const lastcontainer = app.stage.children.find((child) => child.label === "record_container");
      if (lastcontainer) {
        app.stage.removeChild(lastcontainer);
      }
      const last_record_title = app.stage.children.find((child) => child.label === "record_title");
      if (last_record_title) {
        app.stage.removeChild(last_record_title);
      }
      const record_container = new PIXI.Container();
      record_container.label = "record_container";
      app.stage.addChild(record_container);
      // helper: play record column creation
      const createPlayRecordColumn = (titleX: number, valueX: number, padY: number) => {
        const group = new PIXI.Container();

        const padLabels = [
          { label: "Rank", value: padNumber(gameData.MaxScore > 0 ? Rank_get(gameData.Score) : 0) },
          { label: "Score", value: gameData.Score.toFixed(0) },
          { label: "Max KPM", value: gameData.MaxKPM.toFixed(2) },
          {
            label: "Avg KPM",
            value:
              gameData.total_hit_cnt > 0 && gameData.EndTime > gameData.StartTime
                ? (
                    (gameData.total_hit_cnt / ((gameData.EndTime - gameData.StartTime) / 1000)) *
                    60
                  ).toFixed(2)
                : "—",
          },
          { label: "Miss", value: gameData.Miss },
          { label: "Total Hit", value: gameData.total_hit_cnt },
        ];

        padLabels.forEach((row, idx) => {
          const k = new PIXI.Text({
            text: row.label,
            style: {
              fontFamily: gameData.FontFamily,
              fontSize: 26,
              fill: replaceHash(settings.colorTheme.colors.MainColor),
              align: "right",
            },
          });
          k.x = titleX;
          k.y = 300 + padY * idx - k.height / 2;
          const v = new PIXI.Text({
            text: String(row.value),
            style: {
              fontFamily: gameData.FontFamily,
              fontSize: 26,
              fill: replaceHash(settings.colorTheme.colors.MainColor),
              align: "right",
            },
          });
          v.x = valueX;
          v.y = k.y;
          v.anchor = { x: 1, y: 0 };
          group.addChild(k, v);
        });
        return group;
      };

      const scroll_mask = new PIXI.Graphics();
      const maskLeft = screenCenter.x - (app.screen.width - 600) / 2;
      scroll_mask
        .rect(maskLeft, 200, app.screen.width - 600, app.screen.height - 400)
        .fill(replaceHash(settings.colorTheme.colors.SecondAccent));
      scroll_mask.x = 0;
      scroll_mask.y = 0;
      record_container.mask = scroll_mask;

      const container_BG = new PIXI.Graphics();
      container_BG
        .rect(0, 0, app.screen.width, app.screen.height * 20)
        .fill(replaceHash(settings.colorTheme.colors.MainBG));
      container_BG.x = screenCenter.x - container_BG.width / 2;
      container_BG.y = screenCenter.y - container_BG.height / 2;
      container_BG.alpha = 0;
      record_container.addChild(container_BG);

      const title_text = new PIXI.Text({
        text: "",
        style: {
          fontFamily: gameData.FontFamily,
          fontSize: 30,
          fill: replaceHash(settings.colorTheme.colors.MainColor),
          align: "center",
        },
      });
      title_text.label = "record_title";
      title_text.y = 220;
      app.stage.addChild(title_text);
      let max_scroll_y = 0;
      switch (opened) {
        case opened_record.play:
          const play_rec_pad = 76;
          const play_rec_title_x = screenCenter.x - 200;
          const play_rec_x = screenCenter.x + 220;
          max_scroll_y = 0;
          title_text.text = play_record_text.text;
          title_text.x = screenCenter.x - title_text.width / 2;
          // プレイ記録のみ表示
          record_container.addChild(
            createPlayRecordColumn(play_rec_title_x, play_rec_x, play_rec_pad),
          );
          break;
        case opened_record.achieve:
          max_scroll_y = 10;
          title_text.text = achieve_text.text;
          title_text.x = screenCenter.x - title_text.width / 2;
          const list = getAchievements();
          const ach_pad_y = 70;
          const visible = app.screen.height - 400;
          const contentHeight = 280 + list.length * ach_pad_y + 80;
          max_scroll_y = Math.max(0, contentHeight - visible);
          list.forEach((ach, idx) => {
            const status = ach.unlocked ? "✓" : "✕";
            const line = new PIXI.Text({
              text: `${status}  ${ach.title}`,
              style: {
                fontFamily: gameData.FontFamily,
                fontSize: 30,
                fill: replaceHash(
                  ach.unlocked
                    ? settings.colorTheme.colors.MainColor
                    : settings.colorTheme.colors.SecondAccent,
                ),
                align: "left",
              },
            });
            line.x = screenCenter.x - 280;
            line.y = 280 + idx * ach_pad_y - line.height / 2;
            line.alpha = ach.unlocked ? 1 : 0.45;
            record_container.addChild(line);

            const desc = new PIXI.Text({
              text: ach.description,
              style: {
                fontFamily: gameData.FontFamily,
                fontSize: 22,
                fill: replaceHash(settings.colorTheme.colors.MainColor),
                align: "left",
              },
            });
            desc.x = line.x + 40;
            desc.y = line.y + 32;
            desc.alpha = ach.unlocked ? 1 : 0.45;
            record_container.addChild(desc);
          });
          break;

        case opened_record.ranking:
          max_scroll_y = 4600;
          title_text.text = ranking_text.text;
          title_text.x = screenCenter.x - title_text.width / 2;
          const rankingSource = gameData.IsLoggedin
            ? gameData.onlineRanking
            : (gameData.localRankingByMode[gameData.GameMode] ?? gameData.localRanking);
          for (let i = 0; i < Math.min(100, rankingSource.length); i++) {
            const rank_index = new PIXI.Text({
              text: padNumber(i + 1),
              style: {
                fontFamily: gameData.FontFamily,
                fontSize: 30,
                fill: replaceHash(settings.colorTheme.colors.MainColor),
                align: "center",
              },
            });
            rank_index.x = screenCenter.x - 200;
            rank_index.y = 300 + 50 * i - rank_index.height / 2;
            record_container.addChild(rank_index);
            const rank_player = new PIXI.Text({
              text: rankingSource[i].player_name,
              style: {
                fontFamily: gameData.FontFamily,
                fontSize: 30,
                fill: replaceHash(settings.colorTheme.colors.MainColor),
                align: "center",
              },
            });
            rank_player.x = screenCenter.x - 140;
            rank_player.y = 300 + 50 * i - rank_player.height / 2;
            record_container.addChild(rank_player);

            const rank_score = new PIXI.Text({
              text: rankingSource[i].player_score.toFixed(0),
              style: {
                fontFamily: gameData.FontFamily,
                fontSize: 30,
                fill: replaceHash(settings.colorTheme.colors.MainColor),
                align: "center",
              },
            });
            rank_score.x = screenCenter.x + 220 - rank_score.width;
            rank_score.y = 300 + 50 * i - rank_score.height / 2;
            record_container.addChild(rank_score);
          }
          break;
        case opened_record.graph:
          max_scroll_y = 0;
          title_text.text = graph_text.text;
          title_text.x = screenCenter.x - title_text.width / 2;
          score_graph(app, record_container);

          break;
      }

      let isDragging = false;
      let lastPosition = { y: 0 };
      let velocity = 0;

      const maxScroll = Math.max(0, max_scroll_y);
      let currentScroll = 0;

      record_container.eventMode = "static";
      record_container.cursor = "grab";

      record_container
        .on("pointerdown", (e: PIXI.FederatedPointerEvent) => {
          isDragging = true;
          lastPosition.y = e.global.y;
          velocity = 0;
          record_container.cursor = "grabbing";
        })
        .on("pointermove", (e: PIXI.FederatedPointerEvent) => {
          if (!isDragging) return;
          const deltaY = e.global.y - lastPosition.y;
          lastPosition.y = e.global.y;
          currentScroll = Math.min(Math.max(currentScroll + deltaY, -maxScroll), 0);
          updateScrollPosition();
          velocity = deltaY;
        })
        .on("pointerup", () => endDrag())
        .on("pointerupoutside", () => endDrag());

      record_container.on("wheel", (e: PIXI.FederatedWheelEvent) => {
        e.stopPropagation();
        e.preventDefault();
        const wheelDelta = -e.deltaY;
        currentScroll = Math.min(Math.max(currentScroll + wheelDelta, -maxScroll), 0);
        updateScrollPosition();
      });

      const updateScrollPosition = () => {
        record_container.y = currentScroll;
      };
      const endDrag = () => {
        if (!isDragging) return;
        isDragging = false;
        record_container.cursor = "grab";
        applyMomentum();
      };
      const applyMomentum = () => {
        if (Math.abs(velocity) < 0.5) return;
        velocity *= 0.95;
        currentScroll = Math.min(Math.max(currentScroll + velocity, -maxScroll), 0);
        updateScrollPosition();
        if (Math.abs(velocity) > 0.5) {
          //animationFrame = requestAnimationFrame(applyMomentum);
        }
      };

      app.ticker.add(() => {
        if (!isDragging && Math.abs(velocity) > 0.5) {
          velocity *= 0.95;
          currentScroll = Math.min(Math.max(currentScroll + velocity, -maxScroll), 0);
          updateScrollPosition();
        }
      });
      flashObj(app, title_text);
    }
    update_open(isOpened_record);
    flashObj(app, play_record_text);
    flashObj(app, achieve_text);
    flashObj(app, ranking_text);
    flashObj(app, graph_text);
    openScene(app, 3);
    while (gameData.CurrentSceneName === "record_scene") {
      currentKeyController = new AbortController();
      try {
        const keyCode = await getLatestKey(currentKeyController.signal);

        if (keyCode.code === "Escape") {
          triggerFrameEffect();
          reaction(exit_btn, 1.1);
          playCollect();
          gameData.CurrentSceneName = "game_select";
          get_out();
        } else if (["ArrowDown", "ArrowRight", "ShiftRight"].includes(keyCode.code)) {
          triggerFrameEffect();
          playMiss(0.3);
          if (isOpened_record >= 3) {
            isOpened_record = 0;
          } else {
            isOpened_record++;
          }
          dot_pos_update(isOpened_record);
          update_open(isOpened_record);
        } else if (["ArrowUp", "ArrowLeft", "ShiftLeft"].includes(keyCode.code)) {
          triggerFrameEffect();
          playMiss(0.3);
          if (isOpened_record <= 0) {
            isOpened_record = 3;
          } else {
            isOpened_record--;
          }
          dot_pos_update(isOpened_record);
          update_open(isOpened_record);
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
