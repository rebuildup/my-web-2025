import * as PIXI from "pixi.js";
import { settings } from "../SiteInterface";
import { replaceHash } from "./001_game_master";
import { gameData } from "./002_gameConfig";
import { playCollect } from "./012_soundplay";
import { closeScene } from "./014_mogura";
import { BG_grid } from "./018_grid";

export function opening_scene(app: PIXI.Application): Promise<void> {
	return new Promise<void>(async (resolve) => {
		app.stage.removeChildren();
		playCollect();
		BG_grid(app);

		const sentence_text = new PIXI.Text({
			text: "Welcome !",
			style: {
				fontFamily: gameData.FontFamily,
				fontSize: 24,
				fill: replaceHash(settings.colorTheme.colors.MainColor),
				align: "center",
			},
		});

		sentence_text.x = app.screen.width / 2 - sentence_text.width / 2;
		sentence_text.y = app.screen.height / 2 - sentence_text.height / 2;
		app.stage.addChild(sentence_text);
		gameData.CurrentSceneName = "game_select";

		setTimeout(async () => {
			await closeScene(app, 0);
			resolve();
		}, 1000);
	});
}
