import * as PIXI from "pixi.js";
import { settings } from "../SiteInterface";
import { replaceHash } from "./001_game_master";

export function BG_grid(app: PIXI.Application) {
  const gridSize = 30 * 2;
  const graphics = new PIXI.Graphics();

  graphics.setStrokeStyle({
    width: 1.2,
    color: replaceHash(settings.colorTheme.colors.MainColor),
    alpha: 0.1,
  });

  const Width = app.screen.width;
  const Height = app.screen.height;

  for (let x = -Width; x <= Width; x += gridSize) {
    graphics.moveTo(x, -Height);
    graphics.lineTo(x, Height);
  }
  for (let y = -Height; y <= Height; y += gridSize) {
    graphics.moveTo(-Width, y);
    graphics.lineTo(Width, y);
  }

  graphics.stroke();

  graphics.position.set(Width, Height);
  const bounds = graphics.getLocalBounds();
  // pivot をバウンディングボックスの中心に設定
  graphics.pivot.set(bounds.x + bounds.width / 2, bounds.y + bounds.height / 2);

  // Graphics 自体をキャンバスの中心に配置
  graphics.position.set(app.screen.width / 2, app.screen.height / 2);

  app.stage.addChild(graphics);
  return graphics;
}
