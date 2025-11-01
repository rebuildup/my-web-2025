import gsap from "gsap";
import { CustomEase } from "gsap/all";
import { PixiPlugin } from "gsap/PixiPlugin";
import * as PIXI from "pixi.js";
import { settings } from "../SiteInterface";
import { replaceHash } from "./001_game_master";
import { gameData } from "./002_gameConfig";
import { getLatestKey } from "./009_keyinput";
import { playCollect, playMiss } from "./012_soundplay";
import {
	closeScene,
	flashObj,
	openScene,
	reaction,
	reaction_jump,
	wig_Type,
} from "./014_mogura";
import { BG_grid } from "./018_grid";

gsap.registerPlugin(PixiPlugin, CustomEase);

import { triggerFrameEffect } from "./024_FrameEffect";

const BUTTON_SPACING = 120;
const CIRCULAR_BUTTON_CENTER_OFFSET = 200;

function createButton(text: string): PIXI.Text {
	const btn = new PIXI.Text({
		text,
		style: {
			fontFamily: gameData.FontFamily,
			fontSize: 42,
			fill: replaceHash(settings.colorTheme.colors.MainColor),
			align: "center",
		},
	});
	btn.interactive = true;
	return btn;
}

function getCircularPosition(
	centerX: number,
	centerY: number,
	radius: number,
	angle: number,
) {
	return {
		x: centerX + radius * Math.cos(angle),
		y: centerY + radius * Math.sin(angle),
	};
}

function animateSelectionDot(
	dot: PIXI.Graphics,
	targetY: number,
	delay: number,
	isDown: boolean,
) {
	gsap.fromTo(
		dot,
		{ y: isDown ? targetY - 10 : targetY + 10, alpha: 0 },
		{ y: targetY, alpha: 1, duration: 0.5, ease: "power4.out", delay },
	);
}

export async function game_select(app: PIXI.Application): Promise<void> {
	return new Promise<void>(async (resolve) => {
		app.stage.removeChildren();

		BG_grid(app);
		const winCenter = { x: app.screen.width / 2, y: app.screen.height / 2 };

		let selectedIndex = 1;

		const gameSelectBtn = createButton("ゲーム選択");
		gameSelectBtn.position.set(
			winCenter.x - gameSelectBtn.width / 2,
			winCenter.y - gameSelectBtn.height / 2,
		);
		app.stage.addChild(gameSelectBtn);
		gameSelectBtn.alpha = 1;

		const settingSelectBtn = createButton("ゲーム設定");
		settingSelectBtn.position.set(
			winCenter.x - settingSelectBtn.width / 2,
			winCenter.y - settingSelectBtn.height / 2 + BUTTON_SPACING,
		);
		app.stage.addChild(settingSelectBtn);
		settingSelectBtn.alpha = 0.6;

		const recordBtn = createButton("プレイ記録");
		recordBtn.position.set(
			winCenter.x - recordBtn.width / 2,
			winCenter.y - recordBtn.height / 2 - BUTTON_SPACING,
		);
		app.stage.addChild(recordBtn);
		recordBtn.alpha = 0.6;

		const selectDotAcc = new PIXI.Graphics();
		selectDotAcc.circle(0, 0, 8);
		selectDotAcc.position.set(
			winCenter.x + (gameSelectBtn.width / 2 + 20),
			winCenter.y,
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

		const selectDotMain = new PIXI.Graphics();
		selectDotMain.circle(0, 0, 8);
		selectDotMain.position.set(
			winCenter.x - (gameSelectBtn.width / 2 + 15),
			winCenter.y,
		);
		selectDotMain.fill(replaceHash(settings.colorTheme.colors.MainColor));
		selectDotMain.stroke({
			width: 4,
			color: replaceHash(settings.colorTheme.colors.MainColor),
		});
		app.stage.addChild(selectDotMain);
		gsap.from(selectDotMain.scale, {
			x: 0,
			y: 0,
			duration: 2,
			ease: "power4.out",
		});

		let currentKeyController: AbortController | null = null;

		function hideSceneElements() {
			currentKeyController?.abort();
		}

		async function transitionToRecord() {
			hideSceneElements();

			gameData.CurrentSceneName = "record_scene";
			await closeScene(app, 3);
			resolve();
		}
		async function transitionToSetting() {
			hideSceneElements();
			gameData.CurrentSceneName = "setting_scene";
			await closeScene(app, 2);
			resolve();
		}
		async function transitionToGameModeSelect() {
			hideSceneElements();
			gameData.CurrentSceneName = "game_mode_select_scene";
			await closeScene(app, 0);
			await game_mode_select(app);
			resolve();
		}

		recordBtn.on("pointerdown", () => {
			triggerFrameEffect();
			selectedIndex = 0;
			updateSelectDots(selectedIndex);
			currentKeyController?.abort();
			playCollect();
			reaction_jump(
				recordBtn,
				winCenter.y - recordBtn.height / 2 - BUTTON_SPACING,
			);
			transitionToRecord();
		});
		settingSelectBtn.on("pointerdown", () => {
			triggerFrameEffect();
			selectedIndex = 2;
			updateSelectDots(selectedIndex);
			currentKeyController?.abort();
			playCollect();
			reaction_jump(
				settingSelectBtn,
				winCenter.y - settingSelectBtn.height / 2 + BUTTON_SPACING,
			);
			transitionToSetting();
		});
		gameSelectBtn.on("pointerdown", () => {
			triggerFrameEffect();
			selectedIndex = 1;
			updateSelectDots(selectedIndex);
			currentKeyController?.abort();
			playCollect();
			reaction_jump(gameSelectBtn, winCenter.y - gameSelectBtn.height / 2);
			transitionToGameModeSelect();
		});

		const updateSelectDots = (index: number, isDown: boolean = true) => {
			const targetY = winCenter.y + (index - 1) * BUTTON_SPACING;
			animateSelectionDot(selectDotAcc, targetY, isDown ? 0 : 0.03, isDown);
			animateSelectionDot(selectDotMain, targetY, isDown ? 0.03 : 0, isDown);
			recordBtn.alpha = 0.6;
			gameSelectBtn.alpha = 0.6;
			settingSelectBtn.alpha = 0.6;
			switch (index) {
				case 0:
					recordBtn.alpha = 1;
					reaction_jump(
						recordBtn,
						winCenter.y - recordBtn.height / 2 - BUTTON_SPACING,
					);

					break;
				case 1:
					gameSelectBtn.alpha = 1;
					reaction_jump(gameSelectBtn, winCenter.y - gameSelectBtn.height / 2);
					break;
				case 2:
					settingSelectBtn.alpha = 1;
					reaction_jump(
						settingSelectBtn,
						winCenter.y - settingSelectBtn.height / 2 + BUTTON_SPACING,
					);
					break;
			}
		};
		wig_Type(app);
		flashObj(app, recordBtn);
		flashObj(app, gameSelectBtn);
		flashObj(app, settingSelectBtn);
		openScene(app, gameData.gameselect_open);
		const hint = new PIXI.Text({
			text: "ヒント:左右shift・上下左右キー・Space・Enter・Escキーで操作可能",
			style: {
				fontFamily: gameData.FontFamily,
				fontSize: 20,
				fill: replaceHash(settings.colorTheme.colors.MainColor),
				align: "center",
			},
		});
		hint.x = app.screen.width / 2 - hint.width / 2;
		hint.y = 60;
		hint.alpha = 0;
		app.stage.addChild(hint);
		gsap.fromTo(
			hint,
			{ alpha: 0, y: 80 },
			{ alpha: 0.3, y: 60, duration: 5, delay: 5 },
		);
		const hint_two = new PIXI.Text({
			text: "ヒント:左右shift・上下左右キー・Space・Enter・Escキーで操作可能",
			style: {
				fontFamily: gameData.FontFamily,
				fontSize: 20,
				fill: replaceHash(settings.colorTheme.colors.MainColor),
				align: "center",
			},
		});
		hint_two.x = app.screen.width / 2 - hint_two.width / 2;
		hint_two.y = app.screen.height - 60;
		hint_two.alpha = 0;
		app.stage.addChild(hint_two);
		gsap.fromTo(
			hint_two,
			{ alpha: 0, y: app.screen.height - 60 },
			{ alpha: 0.3, y: app.screen.height - 80, duration: 5, delay: 6 },
		);

		while (gameData.CurrentSceneName === "game_select") {
			currentKeyController = new AbortController();
			try {
				const keyCode = await getLatestKey(currentKeyController.signal);

				if (["ArrowDown", "ArrowRight", "ShiftRight"].includes(keyCode.code)) {
					playMiss(0.3);
					triggerFrameEffect();
					selectedIndex = (selectedIndex + 1) % 3;
					updateSelectDots(selectedIndex, true);
				} else if (
					["ArrowUp", "ArrowLeft", "ShiftLeft"].includes(keyCode.code)
				) {
					playMiss(0.3);
					triggerFrameEffect();
					selectedIndex = (selectedIndex + 2) % 3;
					updateSelectDots(selectedIndex, false);
				} else if (["Enter", "Space"].includes(keyCode.code)) {
					triggerFrameEffect();
					playCollect();
					switch (selectedIndex) {
						case 0:
							reaction_jump(
								recordBtn,
								winCenter.y - recordBtn.height / 2 - BUTTON_SPACING,
							);
							break;
						case 1:
							reaction_jump(
								gameSelectBtn,
								winCenter.y - gameSelectBtn.height / 2,
							);
							break;
						case 2:
							reaction_jump(
								settingSelectBtn,
								winCenter.y - settingSelectBtn.height / 2 + BUTTON_SPACING,
							);
							break;
					}
					currentKeyController.abort();
					if (selectedIndex === 0) {
						transitionToRecord();
					} else if (selectedIndex === 1) {
						transitionToGameModeSelect();
					} else if (selectedIndex === 2) {
						transitionToSetting();
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
function game_mode_select(app: PIXI.Application): Promise<void> {
	return new Promise<void>(async (resolve) => {
		app.stage.removeChildren();
		BG_grid(app);
		const winCenter = { x: app.screen.width / 2, y: app.screen.height / 2 };
		const circleRadius = 410;
		let currentKeyController: AbortController | null = null;

		let selectedModeIndex = 2;
		const mask = new PIXI.Graphics();
		mask.circle(0, 0, 155).stroke({
			width: 4,
			color: replaceHash(settings.colorTheme.colors.MainAccent),
			alpha: 1,
		});
		mask.position.set(winCenter.x, winCenter.y);
		mask.y = winCenter.y;
		mask.x = winCenter.x - CIRCULAR_BUTTON_CENTER_OFFSET - 20;
		app.stage.addChild(mask);
		gsap.fromTo(
			mask.scale,
			{ x: 1.2, y: 1.2 },
			{
				x: 1,
				y: 1,
				duration: 1.2,
				ease: CustomEase.create("custom", "M0,0 C0,0.2 0.3,1 1,1"),
			},
		);

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
		exit_btn.position.set(
			winCenter.x - CIRCULAR_BUTTON_CENTER_OFFSET - 20,
			winCenter.y,
		);
		exit_btn.rotation = Math.PI / 4 + Math.PI;
		exit_btn.interactive = true;
		app.stage.addChild(exit_btn);

		const selectDotAcc = new PIXI.Graphics();
		selectDotAcc.circle(circleRadius, 0, 8);
		selectDotAcc.position.set(
			winCenter.x - CIRCULAR_BUTTON_CENTER_OFFSET - 20,
			winCenter.y,
		);
		selectDotAcc.fill(replaceHash(settings.colorTheme.colors.MainAccent));
		selectDotAcc.stroke({
			width: 4,
			color: replaceHash(settings.colorTheme.colors.MainAccent),
		});
		app.stage.addChild(selectDotAcc);
		gsap.fromTo(
			selectDotAcc,
			{ alpha: 0 },
			{ alpha: 1, duration: 2, ease: "power3.out" },
		);

		const modeButtons: PIXI.Text[] = [];

		const modes = [
			{ label: "長文モード", mode: "long", angle: -Math.PI / 3 },
			{ label: "集中モード", mode: "focus", angle: -Math.PI / 6 },
			{ label: "スタンダード", mode: "nomal", angle: 0 },
			{ label: "正確性重視", mode: "exact", angle: Math.PI / 6 },
			{ label: "数値入力", mode: "number", angle: Math.PI / 3 },
			{ label: "スピード重視", mode: "speed", angle: -Math.PI / 2 },
			{ label: "エンドレス", mode: "endless", angle: Math.PI / 2 },
		];

		modes.forEach((item) => {
			const btn = createButton(item.label);
			const pos = getCircularPosition(
				winCenter.x - CIRCULAR_BUTTON_CENTER_OFFSET,
				winCenter.y - btn.height / 2,
				circleRadius,
				item.angle,
			);
			btn.position.set(pos.x, pos.y);
			flashObj(app, btn);
			btn.on("pointerdown", async () => {
				triggerFrameEffect();
				playCollect();
				switch (item.label) {
					case "長文モード":
						selectedModeIndex = 0;
						break;
					case "集中モード":
						selectedModeIndex = 1;
						break;
					case "スタンダード":
						selectedModeIndex = 2;
						break;
					case "正確性重視":
						selectedModeIndex = 3;
						break;
					case "数値入力":
						selectedModeIndex = 4;
						break;
				}
				moveDot(selectedModeIndex);
				currentKeyController?.abort();
				gameData.GameMode = item.mode;
				if (gameData.IsLoggedin) {
					gameData.CurrentSceneName = "game_scene";
				} else {
					gameData.CurrentSceneName = "register_scene";
				}
				await closeScene(app, 2);
				resolve();
			});
			app.stage.addChild(btn);

			// ボタンを配列に追加
			modeButtons.push(btn);
		});

		const moveDot = (selected: number) => {
			const rotations = [
				-Math.PI / 3,
				-Math.PI / 6,
				0,
				Math.PI / 6,
				Math.PI / 3,
				-Math.PI / 2,
				Math.PI / 2,
			];
			gsap.to(selectDotAcc, {
				rotation: rotations[selected] || 0,
				duration: 0.5,
				ease: "power3.out",
			});
			gsap.to(exit_btn, {
				rotation: rotations[selected] + Math.PI + Math.PI / 4 || 0,
				duration: 0.5,
				ease: "power3.out",
			});

			// マスクのリアクション
			reaction(mask);

			// 選択されたボタンにreactionを適用
			reaction(modeButtons[selected], 1.05);
			// 選択されたボタンの色を変更するなど視覚的な区別をつける
			modeButtons.forEach((btn, index) => {
				if (index === selected) {
					gsap.to(btn, {
						alpha: 1,
						duration: 0.3,
						ease: "power2.out",
					});
				} else {
					gsap.to(btn, {
						alpha: 0.7,
						duration: 0.3,
						ease: "power2.out",
					});
				}
			});
		};

		async function exit() {
			triggerFrameEffect();
			playCollect();
			reaction(mask);
			currentKeyController?.abort();
			gameData.CurrentSceneName = "game_select";
			gameData.gameselect_open = 1;
			gsap.to(exit_btn, {
				rotation: Math.PI / 4,
				duration: 0.5,
				ease: "power3.out",
			});
			await closeScene(app, 1);
			resolve();
		}

		exit_btn.on("pointerdown", async () => {
			exit();
		});
		wig_Type(app);
		openScene(app, 0);

		// 初期選択状態を設定
		moveDot(selectedModeIndex);

		while (gameData.CurrentSceneName === "game_mode_select_scene") {
			currentKeyController = new AbortController();
			try {
				const keyCode = await getLatestKey(currentKeyController.signal);
				if (["ArrowDown", "ArrowRight", "ShiftRight"].includes(keyCode.code)) {
					triggerFrameEffect();
					playMiss(0.3);
					selectedModeIndex = (selectedModeIndex + 1) % modes.length;
					moveDot(selectedModeIndex);
				} else if (
					["ArrowUp", "ArrowLeft", "ShiftLeft"].includes(keyCode.code)
				) {
					triggerFrameEffect();
					playMiss(0.3);
					selectedModeIndex =
						(selectedModeIndex + modes.length - 1) % modes.length;
					moveDot(selectedModeIndex);
				} else if (keyCode.code === "Escape") {
					exit();
				} else if (["Enter", "Space"].includes(keyCode.code)) {
					triggerFrameEffect();
					playCollect();
					moveDot(selectedModeIndex);
					currentKeyController.abort();
					gameData.GameMode = modes[selectedModeIndex].mode;
					if (gameData.IsLoggedin) {
						gameData.CurrentSceneName = "game_scene";
					} else {
						gameData.CurrentSceneName = "register_scene";
					}
					await closeScene(app, 2);
					resolve();
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
