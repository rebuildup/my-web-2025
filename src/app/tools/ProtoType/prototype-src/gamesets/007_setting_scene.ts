import * as PIXI from "pixi.js";
import { gameData } from "./002_gameConfig";
import { replaceHash } from "./001_game_master";
import { settings } from "../SiteInterface";

import gsap from "gsap";
import { PixiPlugin } from "gsap/PixiPlugin";
PixiPlugin.registerPIXI(PIXI);

import { getLatestKey } from "./009_keyinput";

import { keyLayouts } from "../components/012_KeyLayout";
import { playMiss, playCollect } from "./012_soundplay";

import { saveToCache, deleteCache } from "./020_cacheControl";
import {
  closeScene,
  flashObj,
  openScene,
  reaction,
  wig_Type,
} from "./014_mogura";
import { BG_grid } from "./018_grid";
import { triggerFrameEffect } from "./024_FrameEffect";
const Select_dot_x = 680;
const option_select_values = { keylayoutset: 0, instantkey_n: 1, flashType: 2 };
const opened_options = { menu: -1, keylayout: 0, instantkey: 1, flashType: 2 };

export function setting_scene(app: PIXI.Application): Promise<void> {
  return new Promise<void>(async (resolve) => {
    app.stage.removeChildren();

    wig_Type(app);

    const setting_title_x = app.screen.width / 2 - 300;
    const setting_value_x = app.screen.width / 2 + 300;
    const screenCenter = { x: app.screen.width / 2, y: app.screen.height / 2 };
    BG_grid(app);
    let option_select = option_select_values.keylayoutset;
    let current_select = 0;

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
    exit_btn.x = screenCenter.x;
    exit_btn.y = 100;
    exit_btn.rotation = Math.PI / 4 + Math.PI / 2;
    exit_btn.interactive = true;

    const delete_cache = new PIXI.Text({
      text: "設定をリセット(タイトルに戻ります)",
      style: {
        fontFamily: gameData.FontFamily,
        fontSize: 20,
        fill: replaceHash(settings.colorTheme.colors.MainColor),
        align: "center",
      },
    });
    delete_cache.x = app.screen.width - delete_cache.width - 100;
    delete_cache.y = app.screen.height - 100;
    delete_cache.interactive = true;
    delete_cache.on("pointerdown", async () => {
      triggerFrameEffect();
      playCollect();
      gameData.CurrentSceneName = "opening";
      deleteCache("keylayout_GM");
      deleteCache("instant_key_GM");
      get_out();
    });
    app.stage.addChild(delete_cache);

    let currentKeyController: AbortController | null = null;

    exit_btn.on("pointerdown", async () => {
      triggerFrameEffect();
      reaction(exit_btn, 1.1);
      playCollect();
      if (isOpened_option == opened_options.menu) {
        gameData.CurrentSceneName = "game_select";
        get_out();
      } else {
        isOpened_option = opened_options.menu;
        update_open(isOpened_option);
      }
    });
    app.stage.addChild(exit_btn);

    const keylayout_text = new PIXI.Text({
      text: "キー配列",
      style: {
        fontFamily: gameData.FontFamily,
        fontSize: 40,
        fill: replaceHash(settings.colorTheme.colors.MainColor),
        align: "center",
      },
    });
    keylayout_text.x = setting_title_x;
    keylayout_text.y = screenCenter.y - keylayout_text.height / 2 - 120;
    keylayout_text.interactive = true;
    app.stage.addChild(keylayout_text);

    const keylayout_value = new PIXI.Text({
      text: gameData.KeyLayout,
      style: {
        fontFamily: gameData.FontFamily,
        fontSize: 40,
        fill: replaceHash(settings.colorTheme.colors.MainColor),
        align: "center",
      },
    });
    keylayout_value.x = setting_value_x - keylayout_value.width;
    keylayout_value.y = screenCenter.y - keylayout_value.height / 2 - 120;
    keylayout_value.interactive = true;
    app.stage.addChild(keylayout_value);

    const instantkey_n_text = new PIXI.Text({
      text: "瞬間キー数",
      style: {
        fontFamily: gameData.FontFamily,
        fontSize: 40,
        fill: replaceHash(settings.colorTheme.colors.MainColor),
        align: "center",
      },
    });
    instantkey_n_text.x = setting_title_x;
    instantkey_n_text.y = screenCenter.y - instantkey_n_text.height / 2;
    instantkey_n_text.interactive = true;
    app.stage.addChild(instantkey_n_text);

    const instantkey_n_value = new PIXI.Text({
      text: gameData.instant_key_n,
      style: {
        fontFamily: gameData.FontFamily,
        fontSize: 40,
        fill: replaceHash(settings.colorTheme.colors.MainColor),
        align: "center",
      },
    });
    instantkey_n_value.x = setting_value_x - instantkey_n_value.width;
    instantkey_n_value.y = screenCenter.y - instantkey_n_value.height / 2;
    instantkey_n_value.interactive = true;
    app.stage.addChild(instantkey_n_value);

    const flashType_text = new PIXI.Text({
      text: "フラッシュ",
      style: {
        fontFamily: gameData.FontFamily,
        fontSize: 40,
        fill: replaceHash(settings.colorTheme.colors.MainColor),
        align: "center",
      },
    });
    flashType_text.x = setting_title_x;
    flashType_text.y = screenCenter.y - flashType_text.height / 2 + 120;
    flashType_text.interactive = true;
    app.stage.addChild(flashType_text);
    const flashType_value = new PIXI.Text({
      text: gameData.flashType == 0 ? "反転" : "減彩",
      style: {
        fontFamily: gameData.FontFamily,
        fontSize: 40,
        fill: replaceHash(settings.colorTheme.colors.MainColor),
        align: "center",
      },
    });
    flashType_value.x = setting_value_x - flashType_value.width;
    flashType_value.y = screenCenter.y - flashType_value.height / 2 + 120;
    flashType_value.interactive = true;
    app.stage.addChild(flashType_value);

    const selectDotAcc = new PIXI.Graphics();
    selectDotAcc.circle(0, 0, 8);
    selectDotAcc.position.set(
      Select_dot_x,
      keylayout_text.y + keylayout_text.height / 2
    );
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
      gameData.gameselect_open = 3;
      await closeScene(app, 3);
      app.stage.removeChild(keylayout_text);
      app.stage.removeChild(instantkey_n_text);
      resolve();
    }

    let isOpened_option = opened_options.menu;
    function dot_pos_update(select: number) {
      switch (select) {
        case option_select_values.keylayoutset:
          dot_to(Select_dot_x, keylayout_text.y + keylayout_text.height / 2);
          break;
        case option_select_values.instantkey_n:
          dot_to(
            Select_dot_x,
            instantkey_n_text.y + instantkey_n_text.height / 2
          );
          break;
        case option_select_values.flashType:
          dot_to(Select_dot_x, flashType_text.y + flashType_text.height / 2);
          break;
      }
    }
    function update_open(opened: number, select: number = 0) {
      const lastcontainer = app.stage.children.find(
        (child) => child.label === "setting_container"
      );
      if (lastcontainer) {
        app.stage.removeChild(lastcontainer);
      }
      const setting_container = new PIXI.Container();
      setting_container.label = "setting_container";
      app.stage.addChild(setting_container);

      switch (opened) {
        case opened_options.menu:
          break;
        case opened_options.keylayout:
          const layout_container = new PIXI.Container();
          layout_container.position = screenCenter;

          const layout_BG = new PIXI.Graphics();
          layout_BG
            .rect(0, 0, app.screen.width + 100, 600)
            .fill(replaceHash(settings.colorTheme.colors.MainBG))
            .stroke({
              width: 4,
              color: replaceHash(settings.colorTheme.colors.MainAccent),
            });
          layout_BG.alpha = 0.9;
          layout_BG.x = -layout_BG.width / 2;
          layout_BG.y = -layout_BG.height / 2;
          layout_container.addChild(layout_BG);
          for (let i = 0; i < keyLayouts.length; i++) {
            const layout_selection = new PIXI.Text({
              text: keyLayouts[i].name,
              style: {
                fontFamily: gameData.FontFamily,
                fontSize: 40,
                fill: replaceHash(settings.colorTheme.colors.MainColor),
                align: "center",
              },
            });
            layout_selection.alpha = i == select ? 1 : 0.5;
            layout_selection.x = -layout_selection.width / 2;
            layout_selection.y = (i - keyLayouts.length / 2) * 80;
            layout_selection.interactive = true;
            layout_selection.on("pointerdown", async () => {
              triggerFrameEffect();
              playCollect();
              gameData.KeyLayout = keyLayouts[i].name;
              keylayout_value.text = gameData.KeyLayout;
              keylayout_value.x = setting_value_x - keylayout_value.width;
              isOpened_option = opened_options.menu;
              update_open(isOpened_option);
            });
            layout_container.addChild(layout_selection);
          }
          setting_container.addChild(layout_container);
          break;
        case opened_options.instantkey:
          const instant_container = new PIXI.Container();
          instant_container.position = screenCenter;

          const instant_BG = new PIXI.Graphics();
          instant_BG
            .rect(0, 0, app.screen.width + 100, 600)
            .fill(replaceHash(settings.colorTheme.colors.MainBG))
            .stroke({
              width: 4,
              color: replaceHash(settings.colorTheme.colors.MainAccent),
            });
          instant_BG.alpha = 0.9;
          instant_BG.x = -instant_BG.width / 2;
          instant_BG.y = -instant_BG.height / 2;
          instant_container.addChild(instant_BG);

          const instant_selection = new PIXI.Text({
            text: select,
            style: {
              fontFamily: gameData.FontFamily,
              fontSize: 40,
              fill: replaceHash(settings.colorTheme.colors.MainColor),
              align: "center",
            },
          });
          instant_selection.x = -instant_selection.width / 2;
          instant_selection.y = -instant_selection.height / 2;
          instant_selection.interactive = true;
          instant_selection.on("pointerdown", async () => {
            triggerFrameEffect();
            playCollect();
            gameData.instant_key_n = current_select;
            instantkey_n_value.text = gameData.instant_key_n;
            instantkey_n_value.x = setting_value_x - instantkey_n_value.width;
            isOpened_option = opened_options.menu;
            update_open(isOpened_option);
          });
          instant_container.addChild(instant_selection);

          const ins_up_btn = new PIXI.Text({
            text: "▲",
            style: {
              fontFamily: gameData.FontFamily,
              fontSize: 30,
              fill: replaceHash(settings.colorTheme.colors.MainColor),
              align: "center",
            },
          });
          ins_up_btn.x = -ins_up_btn.width / 2;
          ins_up_btn.y = -ins_up_btn.height / 2 - 80;
          ins_up_btn.interactive = true;
          ins_up_btn.on("pointerdown", async () => {
            triggerFrameEffect();
            playMiss(0.3);
            if (current_select >= 100) {
              current_select = 10;
            } else {
              current_select++;
            }
            update_open(isOpened_option, current_select);
          });
          instant_container.addChild(ins_up_btn);
          const ins_dwn_btn = new PIXI.Text({
            text: "▼",
            style: {
              fontFamily: gameData.FontFamily,
              fontSize: 30,
              fill: replaceHash(settings.colorTheme.colors.MainColor),
              align: "center",
            },
          });
          ins_dwn_btn.x = -ins_dwn_btn.width / 2;
          ins_dwn_btn.y = -ins_dwn_btn.height / 2 + 80;
          ins_dwn_btn.interactive = true;
          ins_dwn_btn.on("pointerdown", async () => {
            triggerFrameEffect();
            playMiss(0.3);
            if (current_select <= 10) {
              current_select = 100;
            } else {
              current_select--;
            }
            update_open(isOpened_option, current_select);
          });
          instant_container.addChild(ins_dwn_btn);

          setting_container.addChild(instant_container);
          break;
        case opened_options.flashType:
          const flash_container = new PIXI.Container();
          flash_container.position = screenCenter;

          const flash_BG = new PIXI.Graphics();
          flash_BG
            .rect(0, 0, app.screen.width + 100, 300)
            .fill(replaceHash(settings.colorTheme.colors.MainBG))
            .stroke({
              width: 4,
              color: replaceHash(settings.colorTheme.colors.MainAccent),
            });
          flash_BG.alpha = 0.9;
          flash_BG.x = -flash_BG.width / 2;
          flash_BG.y = -flash_BG.height / 2;
          flash_container.addChild(flash_BG);

          const flash_options = ["反転", "減彩"];
          for (let i = 0; i < flash_options.length; i++) {
            const flash_selection = new PIXI.Text({
              text: flash_options[i],
              style: {
                fontFamily: gameData.FontFamily,
                fontSize: 40,
                fill: replaceHash(settings.colorTheme.colors.MainColor),
                align: "center",
              },
            });
            flash_selection.alpha = i == select ? 1 : 0.5;
            flash_selection.x = -flash_selection.width / 2;
            flash_selection.y = (i - flash_options.length / 2) * 80 + 20;
            flash_selection.interactive = true;
            flash_selection.on("pointerdown", async () => {
              triggerFrameEffect();
              playCollect();
              gameData.flashType = i;
              flashType_value.text = i == 0 ? "反転" : "減彩";
              flashType_value.x = setting_value_x - flashType_value.width;
              saveToCache("flashType_GM", gameData.flashType);
              isOpened_option = opened_options.menu;
              update_open(isOpened_option);
            });
            flash_container.addChild(flash_selection);
          }
          setting_container.addChild(flash_container);
          break;
      }
    }

    keylayout_text.on("pointerdown", async () => {
      triggerFrameEffect();
      playMiss(0.3);
      isOpened_option = opened_options.keylayout;
      current_select = keyLayouts.findIndex(
        (layout) => layout.name === gameData.KeyLayout
      );
      dot_pos_update(0);
      update_open(isOpened_option, current_select);
    });
    keylayout_value.on("pointerdown", async () => {
      triggerFrameEffect();
      playMiss(0.3);
      isOpened_option = opened_options.keylayout;
      current_select = keyLayouts.findIndex(
        (layout) => layout.name === gameData.KeyLayout
      );
      dot_pos_update(0);
      update_open(isOpened_option, current_select);
    });
    instantkey_n_text.on("pointerdown", async () => {
      triggerFrameEffect();
      playMiss(0.3);
      isOpened_option = opened_options.instantkey;
      current_select = gameData.instant_key_n;
      dot_pos_update(1);
      update_open(isOpened_option, current_select);
    });
    instantkey_n_value.on("pointerdown", async () => {
      triggerFrameEffect();
      playMiss(0.3);
      isOpened_option = opened_options.instantkey;
      current_select = gameData.instant_key_n;
      dot_pos_update(1);
      update_open(isOpened_option, current_select);
    });
    flashType_text.on("pointerdown", async () => {
      triggerFrameEffect();
      playMiss(0.3);
      isOpened_option = opened_options.flashType;
      current_select = gameData.flashType;
      dot_pos_update(2);
      update_open(isOpened_option, current_select);
    });
    flashType_value.on("pointerdown", async () => {
      triggerFrameEffect();
      playMiss(0.3);
      isOpened_option = opened_options.flashType;
      current_select = gameData.flashType;
      dot_pos_update(2);
      update_open(isOpened_option, current_select);
    });
    flashObj(app, keylayout_text);
    flashObj(app, keylayout_value);
    flashObj(app, instantkey_n_text);
    flashObj(app, instantkey_n_value);
    flashObj(app, flashType_text);
    flashObj(app, flashType_value);
    openScene(app, 2);

    const hint = new PIXI.Text({
      text: "ヒント:左右shift・上下左右キーで移動/Space・Enterで決定/Escキーで戻る",
      style: {
        fontFamily: gameData.FontFamily,
        fontSize: 20,
        fill: replaceHash(settings.colorTheme.colors.MainColor),
        align: "center",
      },
    });
    hint.x = app.screen.width / 2 - hint.width / 2;
    hint.y = app.screen.height - 280;
    hint.alpha = 0;
    app.stage.addChild(hint);
    gsap.fromTo(
      hint,
      { alpha: 0, y: app.screen.height - 260 },
      { alpha: 0.5, y: app.screen.height - 280, duration: 3, delay: 2 }
    );
    while (gameData.CurrentSceneName === "setting_scene") {
      currentKeyController = new AbortController();
      try {
        const keyCode = await getLatestKey(currentKeyController.signal);
        if (keyCode.code === "Escape") {
          triggerFrameEffect();
          reaction(exit_btn, 1.1);
          playCollect();
          if (isOpened_option == opened_options.menu) {
            gameData.CurrentSceneName = "game_select";
            get_out();
          } else {
            isOpened_option = opened_options.menu;
            update_open(isOpened_option);
          }
        } else if (
          ["ArrowDown", "ArrowRight", "ShiftRight"].includes(keyCode.code)
        ) {
          triggerFrameEffect();
          playMiss(0.3);
          switch (isOpened_option) {
            case opened_options.menu:
              if (option_select >= 2) {
                option_select = 0;
              } else {
                option_select++;
              }
              dot_pos_update(option_select);
              break;
            case opened_options.keylayout:
              if (current_select >= keyLayouts.length - 1) {
                current_select = 0;
              } else {
                current_select++;
              }
              update_open(isOpened_option, current_select);
              break;
            case opened_options.instantkey:
              if (current_select <= 10) {
                current_select = 100;
              } else {
                current_select--;
              }
              update_open(isOpened_option, current_select);
              break;
            case opened_options.flashType:
              current_select = current_select == 0 ? 1 : 0;
              update_open(isOpened_option, current_select);
              break;
          }
        } else if (
          ["ArrowUp", "ArrowLeft", "ShiftLeft"].includes(keyCode.code)
        ) {
          triggerFrameEffect();
          playMiss(0.3);
          switch (isOpened_option) {
            case opened_options.menu:
              if (option_select <= 0) {
                option_select = 2;
              } else {
                option_select--;
              }
              dot_pos_update(option_select);
              break;
            case opened_options.keylayout:
              if (current_select <= 0) {
                current_select = keyLayouts.length - 1;
              } else {
                current_select--;
              }
              update_open(isOpened_option, current_select);
              break;
            case opened_options.instantkey:
              if (current_select >= 100) {
                current_select = 10;
              } else {
                current_select++;
              }
              update_open(isOpened_option, current_select);
              break;
            case opened_options.flashType:
              current_select = current_select == 0 ? 1 : 0;
              update_open(isOpened_option, current_select);
              break;
          }
        } else if (["Enter", "Space"].includes(keyCode.code)) {
          triggerFrameEffect();
          playCollect();
          if (isOpened_option == opened_options.menu) {
            switch (option_select) {
              case option_select_values.keylayoutset:
                isOpened_option = opened_options.keylayout;
                current_select = keyLayouts.findIndex(
                  (layout) => layout.name === gameData.KeyLayout
                );
                break;
              case option_select_values.instantkey_n:
                isOpened_option = opened_options.instantkey;
                current_select = gameData.instant_key_n;
                break;
              case option_select_values.flashType:
                isOpened_option = opened_options.flashType;
                current_select = gameData.flashType;
                break;
            }
            update_open(isOpened_option, current_select);
          } else if (isOpened_option == opened_options.keylayout) {
            gameData.KeyLayout = keyLayouts[current_select].name;
            keylayout_value.text = gameData.KeyLayout;
            keylayout_value.x = setting_value_x - keylayout_value.width;
            saveToCache("keylayout_GM", gameData.KeyLayout);
            isOpened_option = opened_options.menu;
            update_open(isOpened_option);
          } else if (isOpened_option == opened_options.instantkey) {
            gameData.instant_key_n = current_select;
            instantkey_n_value.text = String(gameData.instant_key_n);
            instantkey_n_value.x = setting_value_x - instantkey_n_value.width;
            saveToCache("instant_key_GM", gameData.instant_key_n);
            isOpened_option = opened_options.menu;
            update_open(isOpened_option);
          } else if (isOpened_option == opened_options.flashType) {
            gameData.flashType = current_select;
            flashType_value.text = current_select == 0 ? "反転" : "減彩";
            flashType_value.x = setting_value_x - flashType_value.width;
            saveToCache("flashType_GM", gameData.flashType);
            isOpened_option = opened_options.menu;
            update_open(isOpened_option);
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

