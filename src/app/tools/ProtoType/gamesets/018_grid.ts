import * as PIXI from "pixi.js";
import { settings } from "../SiteInterface";
import { replaceHash } from "./001_game_master";

export function BG_grid(app: PIXI.Application) {
  const gridSize = 30 * 2;
  const graphics = new PIXI.Graphics();

  const Width = app.screen.width;
  const Height = app.screen.height;

  // Draw all lines first
  for (let x = -Width; x <= Width; x += gridSize) {
    graphics.moveTo(x, -Height);
    graphics.lineTo(x, Height);
  }
  for (let y = -Height; y <= Height; y += gridSize) {
    graphics.moveTo(-Width, y);
    graphics.lineTo(Width, y);
  }

  // Apply stroke in PIXI v8 style
  graphics.stroke({
    width: 1.2,
    color: replaceHash(settings.colorTheme.colors.MainColor),
    alpha: 0.1,
  });

  graphics.x = Width;
  graphics.y = Height;
  const bounds = graphics.getLocalBounds();
  // pivot をバウンディングボックスの中心に設定
  graphics.pivot.x = bounds.x + bounds.width / 2;
  graphics.pivot.y = bounds.y + bounds.height / 2;

  // Graphics 自体をキャンバスの中心に配置
  graphics.x = app.screen.width / 2;
  graphics.y = app.screen.height / 2;

  app.stage.addChild(graphics);
  return graphics;
}
