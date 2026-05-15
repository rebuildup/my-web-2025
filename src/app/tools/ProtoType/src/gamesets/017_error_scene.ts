import * as PIXI from "pixi.js";
import { gameData } from "./002_gameConfig";
import { replaceHash } from "./001_game_master";
import { settings } from "../SiteInterface";

export function error_scene(app: PIXI.Application): Promise<void> {
  return new Promise<void>((resolve) => {
    try {
      //app.stage.removeChildren();
    } finally {
      const sentetce_text = new PIXI.Text({
        text: "エラーが発生しました キャンバスを再起動します",
        style: {
          fontFamily: gameData.FontFamily,
          fontSize: 40,
          fill: replaceHash(settings.colorTheme.colors.MainColor),
          align: "center",
        },
      });

      sentetce_text.x = app.screen.width / 2 - sentetce_text.width / 2;
      sentetce_text.y = app.screen.height / 2 - sentetce_text.height / 2;
      app.stage.addChild(sentetce_text);
      setTimeout(() => {
        gameData.CurrentSceneName = "opening";
        resolve();
      }, 3000);
    }
  });
}
