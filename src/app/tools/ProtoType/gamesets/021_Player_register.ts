import * as PIXI from "pixi.js";
import gsap from "gsap";
import { PixiPlugin } from "gsap/PixiPlugin";
import { CustomEase } from "gsap/all";
gsap.registerPlugin(PixiPlugin, CustomEase);
import { gameData } from "./002_gameConfig";
import { replaceHash } from "./001_game_master";
import { settings } from "../SiteInterface";

/*
import gsap from "gsap";
import { PixiPlugin } from "gsap/PixiPlugin";
PixiPlugin.registerPIXI(PIXI);
*/
import { getLatestKey, isNomalKey, keyCodeToText } from "./009_keyinput";
import { closeScene, flashObj, openScene, reaction, reaction_jump, wig_Type } from "./014_mogura";
import { playCollect, playMiss } from "./012_soundplay";
import { triggerFrameEffect } from "./024_FrameEffect";
import { BG_grid } from "./018_grid";

export function Player_register(app: PIXI.Application): Promise<void> {
  return new Promise<void>(async (resolve) => {
    app.stage.removeChildren();
    BG_grid(app);
    wig_Type(app);
    const screenCenter = { x: app.screen.width / 2, y: app.screen.height / 2 };
    let player_name = "";
    const enter_text = new PIXI.Text({
      text: "Enter",
      style: {
        fontFamily: gameData.FontFamily,
        fontSize: 30,
        fill: replaceHash(settings.colorTheme.colors.MainColor),
        align: "center",
      },
    });
    enter_text.x = screenCenter.x - enter_text.width / 2;
    enter_text.y = screenCenter.y - enter_text.height / 2 + 100;
    enter_text.interactive = true;

    let currentKeyController: AbortController | null = null;

    enter_text.on("pointerdown", async () => {
      reaction_jump(enter_text, screenCenter.y - enter_text.height / 2 + 100);
      gameData.CurrentSceneName = "game_scene";
      flashObj(app, enter_text);
      get_out();
    });
    app.stage.addChild(enter_text);
    const waku = new PIXI.Graphics();
    waku.circle(0, 0, 480).stroke({
      width: 4,
      color: replaceHash(settings.colorTheme.colors.MainAccent),
    });
    waku.x = app.screen.width / 2;
    waku.y = app.screen.height / 2;
    app.stage.addChild(waku);
    gsap.fromTo(
      waku.scale,
      { x: 1.2, y: 1.2 },
      {
        x: 1,
        y: 1,
        duration: 1,
        ease: CustomEase.create("custom", "M0,0 C0,0.2 0.3,1 1,1"),
      },
    );

    const title_text = new PIXI.Text({
      text: "プレイヤー記録名",
      style: {
        fontFamily: gameData.FontFamily,
        fontSize: 30,
        fill: replaceHash(settings.colorTheme.colors.MainColor),
        align: "center",
      },
    });
    title_text.x = screenCenter.x - title_text.width / 2;
    title_text.y = screenCenter.y - title_text.height / 2 - 100;

    app.stage.addChild(title_text);

    const input_waku = new PIXI.Graphics();
    input_waku.roundRect(-240, -40, 480, 80, 50).stroke({
      width: 4,
      color: replaceHash(settings.colorTheme.colors.MainAccent),
    });
    input_waku.x = screenCenter.x;
    input_waku.y = screenCenter.y;
    app.stage.addChild(input_waku);

    const player_name_text = new PIXI.Text({
      text: gameData.current_Player_name,
      style: {
        fontFamily: gameData.FontFamily,
        fontSize: 30,
        fill: replaceHash(settings.colorTheme.colors.MainColor),
        align: "center",
      },
    });

    player_name_text.x = screenCenter.x - player_name_text.width / 2;
    player_name_text.y = screenCenter.y - player_name_text.height / 2;
    app.stage.addChild(player_name_text);

    async function get_out() {
      playCollect();
      triggerFrameEffect();
      currentKeyController?.abort();
      await closeScene(app, 1);
      resolve();
    }
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
    exit_btn.position.set(80, app.screen.height / 2);
    exit_btn.rotation = -Math.PI / 4 + Math.PI / 2;
    exit_btn.interactive = true;
    app.stage.addChild(exit_btn);
    exit_btn.on("pointerdown", async () => {
      reaction(exit_btn);
      gameData.CurrentSceneName = "game_select";
      get_out();
    });
    flashObj(app, title_text);
    flashObj(app, enter_text);
    openScene(app, 1);
    while (gameData.CurrentSceneName === "register_scene") {
      currentKeyController = new AbortController();
      try {
        const keyCode = await getLatestKey(currentKeyController.signal);
        reaction(waku, 1.03);
        reaction(input_waku, 1.01);
        if (keyCode.code === "Escape") {
          reaction(exit_btn);
          gameData.CurrentSceneName = "game_select";
          get_out();
        } else if (keyCode.code === "Backspace") {
          if (player_name.length > 0) {
            playMiss(0.3);
            player_name = player_name.slice(0, -1);
          }
          if (player_name.length == 0) {
            player_name_text.text = gameData.current_Player_name;
          } else {
            player_name_text.text = player_name;
          }

          player_name_text.x = screenCenter.x - player_name_text.width / 2;
        } else if (isNomalKey(keyCode.code)) {
          triggerFrameEffect();

          if (player_name.length < 10) {
            playCollect();
            player_name += keyCodeToText(keyCode.code, keyCode.shift);
            player_name_text.text = player_name;
            player_name_text.x = screenCenter.x - player_name_text.width / 2;
          } else {
            playMiss(0.3);
          }
        } else if (keyCode.code === "Enter") {
          reaction_jump(enter_text, screenCenter.y - enter_text.height / 2 + 100);
          gameData.CurrentSceneName = "game_scene";
          if (player_name.length != 0) {
            gameData.current_Player_name = player_name;
          }
          flashObj(app, enter_text);
          get_out();
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
