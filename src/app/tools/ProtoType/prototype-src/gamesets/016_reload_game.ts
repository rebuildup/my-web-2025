import * as PIXI from "pixi.js";
import { gameData } from "./002_gameConfig";
export function reload_game(app: PIXI.Application): Promise<void> {
  return new Promise<void>((resolve) => {
    app.stage.removeChildren();
    gameData.CurrentSceneName = "game_scene";
    resolve();
  });
}
