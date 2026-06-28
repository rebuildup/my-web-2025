"use client";

import JSZip from "jszip";
import p5 from "p5";
import { useCallback, useEffect, useRef, useState } from "react";
import { RawDOMContainer } from "../../components/RawDOMContainer";
import { EditorManager } from "../lib/001_Editors/001_EditorManager";
import { setupAnimationRenderer } from "../lib/001_Editors/002_AnimationRenderer";
import { ANIMATION_CONFIG, CANVAS_CONFIG } from "../lib/config";

declare global {
	interface Window {
		p5: any;
		animationFunctions: any;
		JSZip: any;
	}
}

export default function CodeTypeP5App() {
	const [isDrawerOpen, setIsDrawerOpen] = useState(false);
	const [code, setCode] = useState("");
	const [config, setConfig] = useState({
		width: CANVAS_CONFIG.WIDTH,
		height: CANVAS_CONFIG.HEIGHT,
		fontSize: 14,
		lineHeight: 18,
		fps: ANIMATION_CONFIG.FPS,
		duration: ANIMATION_CONFIG.FRAME_COUNT / ANIMATION_CONFIG.FPS,
		language: "rust",
		backgroundColor: { r: 0, g: 0, b: 0 },
		backgroundTransparent: CANVAS_CONFIG.BACKGROUND_COLOR[3] === 0,
	});
	const [isPlaying, setIsPlaying] = useState(false);
	const [isLoaded, setIsLoaded] = useState(false);
	const editorManagerRef = useRef<EditorManager | null>(null);
	const containerRef = useRef<HTMLDivElement>(null);
	const p5InstanceRef = useRef<any>(null);
	const isInitializingRef = useRef<boolean>(false);

	const loadInitialData = useCallback((editorManager: EditorManager) => {
		const animations = window.animationFunctions?.getAnimations();
		if (animations && animations.length > 0) {
			const codescroll = animations[0];
			if (typeof codescroll.getCode === "function") {
				setCode(codescroll.getCode());
			}
			if (typeof codescroll.getConfig === "function") {
				const animConfig = codescroll.getConfig();
				setConfig((prev) => ({
					...prev,
					fontSize: animConfig.fontSize || prev.fontSize,
					lineHeight: animConfig.lineHeight || prev.lineHeight,
					height: animConfig.canvasHeight || prev.height,
					language: animConfig.language || prev.language,
				}));
			}
		}

		const fps = editorManager.getFPS();
		const frameCount = editorManager.getFrameCount();
		setConfig((prev) => ({
			...prev,
			fps: fps || prev.fps,
			duration:
				frameCount && fps
					? parseFloat((frameCount / fps).toFixed(1))
					: prev.duration,
		}));

		const canvas = document.querySelector("canvas");
		if (canvas && canvas.width && canvas.height) {
			setConfig((prev) => ({
				...prev,
				width: canvas.width,
				height: canvas.height,
			}));
		}

		const bgColor = CANVAS_CONFIG.BACKGROUND_COLOR;
		setConfig((prev) => ({
			...prev,
			backgroundColor: { r: bgColor[0], g: bgColor[1], b: bgColor[2] },
			backgroundTransparent: bgColor[3] === 0,
		}));

		editorManager.setEvents({
			onPlaybackChange: (playing: boolean) => setIsPlaying(playing),
		});
	}, []);

	useEffect(() => {
		if ((window as any).__p5Initializing) return;
		(window as any).__p5Initializing = true;
		isInitializingRef.current = true;

		const initP5 = () => {
			if (!containerRef.current) {
				setTimeout(initP5, 50);
				return;
			}

			if (p5InstanceRef.current) {
				try {
					p5InstanceRef.current.remove();
				} catch (e) {
					console.warn(e);
				}
				p5InstanceRef.current = null;
			}

			const existingCanvases = document.querySelectorAll("canvas");
			existingCanvases.forEach((canvas) => canvas.remove());

			if (
				(window as any).p5Instances &&
				Array.isArray((window as any).p5Instances)
			) {
				(window as any).p5Instances.forEach((instance: any) => {
					try {
						instance.remove();
					} catch (e) {
						console.warn(e);
					}
				});
				(window as any).p5Instances = [];
			}

			let canvasContainer = document.getElementById("canvas-container");
			if (!canvasContainer) {
				canvasContainer = document.createElement("div");
				canvasContainer.id = "canvas-container";
				containerRef.current.appendChild(canvasContainer);
			}

			const editorManager = new EditorManager();
			editorManagerRef.current = editorManager;

			if (typeof window !== "undefined") {
				(window as any).p5 = p5;
				(window as any).JSZip = JSZip;
			}

			let p5Instance: any;
			try {
				p5Instance = setupAnimationRenderer(editorManager, canvasContainer);
			} catch (error) {
				console.error("Error setting up animation renderer:", error);
				setIsLoaded(true);
				return;
			}

			if (p5Instance) {
				p5InstanceRef.current = p5Instance;
			}

			setTimeout(() => {
				loadInitialData(editorManager);
				setIsLoaded(true);
			}, 1000);
		};

		initP5();

		return () => {
			const timeoutId = setTimeout(() => {
				(window as any).__p5Initializing = false;
				isInitializingRef.current = false;
			}, 100);

			if (p5InstanceRef.current) {
				try {
					p5InstanceRef.current.remove();
				} catch (e) {
					console.warn(e);
				}
				p5InstanceRef.current = null;
			}
			if ((window as any).animationFunctions) {
				delete (window as any).animationFunctions;
			}
			const canvases = document.querySelectorAll("#canvas-container canvas");
			canvases.forEach((canvas) => canvas.remove());
			if ((window as any).p5Instances) {
				(window as any).p5Instances.forEach((instance: any) => {
					try {
						instance.remove();
					} catch (e) {
						console.warn(e);
					}
				});
				delete (window as any).p5Instances;
			}

			clearTimeout(timeoutId);
		};
	}, [loadInitialData]);

	const handleApply = () => {
		if (!editorManagerRef.current) return;
		const editorManager = editorManagerRef.current;

		if (window.animationFunctions?.resizeCanvas) {
			window.animationFunctions.resizeCanvas(config.width, config.height);
		}

		editorManager.setFPS(config.fps);
		editorManager.setFrameCount(Math.floor(config.fps * config.duration));

		const canvases = document.querySelectorAll("canvas");
		if (canvases.length > 1) {
			for (let i = 1; i < canvases.length; i++) canvases[i].remove();
		}

		if (window.animationFunctions?.setBackgroundColor) {
			const alpha = config.backgroundTransparent ? 0 : 255;
			window.animationFunctions.setBackgroundColor(
				config.backgroundColor.r,
				config.backgroundColor.g,
				config.backgroundColor.b,
				alpha,
			);
		}

		const animations = window.animationFunctions?.getAnimations();
		if (animations && animations.length > 0) {
			animations.forEach((anim: any) => {
				if (anim && typeof anim.updateCode === "function")
					anim.updateCode(code);
				if (anim && typeof anim.updateConfig === "function") {
					anim.updateConfig({
						fontSize: config.fontSize,
						lineHeight: config.lineHeight,
						canvasHeight: config.height,
						language: config.language,
					});
				}
			});
		}

		editorManager.setCurrentFrame(0);
	};

	const handleExportZip = () => {
		if (!editorManagerRef.current) return;
		if (editorManagerRef.current.isEncodingActive()) return;
		editorManagerRef.current.setCurrentFrame(0);
		editorManagerRef.current.stopPlayback();
		editorManagerRef.current.startEncoding();
	};

	const togglePlayback = () => {
		if (!editorManagerRef.current) return;
		editorManagerRef.current.togglePlayback();
	};

	return (
		<RawDOMContainer
			title="Code Type p5"
			breadcrumbs={[
				{ label: "Home", href: "/" },
				{ label: "Tools", href: "/tools" },
				{ label: "Code Type p5" },
			]}
		>
			<div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
				{/* Controls */}
				<fieldset style={{ border: "1px solid #ccc", padding: "10px" }}>
					<legend>操作</legend>
					<div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
						<button
							type="button"
							onClick={togglePlayback}
							style={{ all: "revert", padding: "4px 12px", fontSize: "13px" }}
						>
							{isPlaying ? "Pause" : "Play"}
						</button>
						<button
							type="button"
							onClick={() => setIsDrawerOpen(!isDrawerOpen)}
							style={{ all: "revert", padding: "4px 12px", fontSize: "13px" }}
						>
							{isDrawerOpen ? "設定を閉じる" : "Edit Code"}
						</button>
					</div>
				</fieldset>

				{/* Canvas */}
				<div
					ref={containerRef}
					style={{
						border: "1px solid #ccc",
						minHeight: `${config.height}px`,
						position: "relative",
						overflow: "hidden",
					}}
				>
					{!isLoaded && (
						<div
							style={{
								position: "absolute",
								inset: 0,
								display: "flex",
								alignItems: "center",
								justifyContent: "center",
								background: "#fff",
								zIndex: 10,
							}}
						>
							<div style={{ textAlign: "center" }}>
								<div style={{ fontSize: "18px", marginBottom: "10px" }}>
									読み込み中...
								</div>
								<div style={{ fontSize: "12px", color: "#666" }}>
									p5.jsとライブラリを読み込んでいます...
								</div>
							</div>
						</div>
					)}
				</div>

				{/* Config Panel */}
				{isDrawerOpen && (
					<fieldset style={{ border: "1px solid #ccc", padding: "15px" }}>
						<legend>Configuration</legend>

						<div
							style={{ display: "flex", flexDirection: "column", gap: "15px" }}
						>
							{/* Language */}
							<div>
								<label
									style={{
										display: "block",
										fontSize: "12px",
										marginBottom: "3px",
									}}
								>
									Language
								</label>
								<select
									value={config.language}
									onChange={(e) =>
										setConfig({ ...config, language: e.target.value })
									}
									style={{
										all: "revert",
										width: "100%",
										padding: "4px 8px",
										fontSize: "13px",
										boxSizing: "border-box",
									}}
								>
									<option value="rust">Rust</option>
									<option value="typescript">TypeScript</option>
									<option value="python">Python</option>
									<option value="cpp">C++</option>
									<option value="html">HTML</option>
									<option value="css">CSS</option>
									<option value="java">Java</option>
									<option value="go">Go</option>
								</select>
							</div>

							{/* Dimensions */}
							<div
								style={{
									display: "grid",
									gridTemplateColumns: "1fr 1fr",
									gap: "10px",
								}}
							>
								<div>
									<label
										style={{
											display: "block",
											fontSize: "12px",
											marginBottom: "3px",
										}}
									>
										Width
									</label>
									<input
										type="number"
										value={config.width}
										onChange={(e) =>
											setConfig({ ...config, width: Number(e.target.value) })
										}
										style={{
											all: "revert",
											width: "100%",
											padding: "4px 8px",
											fontSize: "13px",
											boxSizing: "border-box",
										}}
									/>
								</div>
								<div>
									<label
										style={{
											display: "block",
											fontSize: "12px",
											marginBottom: "3px",
										}}
									>
										Height
									</label>
									<input
										type="number"
										value={config.height}
										onChange={(e) =>
											setConfig({ ...config, height: Number(e.target.value) })
										}
										style={{
											all: "revert",
											width: "100%",
											padding: "4px 8px",
											fontSize: "13px",
											boxSizing: "border-box",
										}}
									/>
								</div>
							</div>

							{/* Font & Timing */}
							<div
								style={{
									display: "grid",
									gridTemplateColumns: "1fr 1fr 1fr 1fr",
									gap: "10px",
								}}
							>
								<div>
									<label
										style={{
											display: "block",
											fontSize: "12px",
											marginBottom: "3px",
										}}
									>
										Font Size
									</label>
									<input
										type="number"
										value={config.fontSize}
										onChange={(e) =>
											setConfig({ ...config, fontSize: Number(e.target.value) })
										}
										style={{
											all: "revert",
											width: "100%",
											padding: "4px 8px",
											fontSize: "13px",
											boxSizing: "border-box",
										}}
									/>
								</div>
								<div>
									<label
										style={{
											display: "block",
											fontSize: "12px",
											marginBottom: "3px",
										}}
									>
										Line Height
									</label>
									<input
										type="number"
										value={config.lineHeight}
										onChange={(e) =>
											setConfig({
												...config,
												lineHeight: Number(e.target.value),
											})
										}
										style={{
											all: "revert",
											width: "100%",
											padding: "4px 8px",
											fontSize: "13px",
											boxSizing: "border-box",
										}}
									/>
								</div>
								<div>
									<label
										style={{
											display: "block",
											fontSize: "12px",
											marginBottom: "3px",
										}}
									>
										FPS
									</label>
									<input
										type="number"
										value={config.fps}
										onChange={(e) =>
											setConfig({ ...config, fps: Number(e.target.value) })
										}
										style={{
											all: "revert",
											width: "100%",
											padding: "4px 8px",
											fontSize: "13px",
											boxSizing: "border-box",
										}}
									/>
								</div>
								<div>
									<label
										style={{
											display: "block",
											fontSize: "12px",
											marginBottom: "3px",
										}}
									>
										Duration (s)
									</label>
									<input
										type="number"
										value={config.duration}
										onChange={(e) =>
											setConfig({ ...config, duration: Number(e.target.value) })
										}
										style={{
											all: "revert",
											width: "100%",
											padding: "4px 8px",
											fontSize: "13px",
											boxSizing: "border-box",
										}}
									/>
								</div>
							</div>

							{/* Background */}
							<div>
								<h4
									style={{
										fontSize: "13px",
										fontWeight: "bold",
										margin: "0 0 5px 0",
									}}
								>
									Background
								</h4>
								<label
									style={{
										display: "flex",
										alignItems: "center",
										gap: "5px",
										fontSize: "13px",
										cursor: "pointer",
										marginBottom: "8px",
									}}
								>
									<input
										type="checkbox"
										checked={config.backgroundTransparent}
										onChange={(e) =>
											setConfig({
												...config,
												backgroundTransparent: e.target.checked,
											})
										}
										style={{ all: "revert" }}
									/>
									Transparent Background
								</label>
								{!config.backgroundTransparent && (
									<div
										style={{
											display: "flex",
											gap: "8px",
											alignItems: "center",
										}}
									>
										<input
											type="number"
											min={0}
											max={255}
											value={config.backgroundColor.r}
											onChange={(e) =>
												setConfig({
													...config,
													backgroundColor: {
														...config.backgroundColor,
														r: Number(e.target.value),
													},
												})
											}
											style={{
												all: "revert",
												width: "60px",
												padding: "4px 8px",
												fontSize: "13px",
											}}
											placeholder="R"
										/>
										<input
											type="number"
											min={0}
											max={255}
											value={config.backgroundColor.g}
											onChange={(e) =>
												setConfig({
													...config,
													backgroundColor: {
														...config.backgroundColor,
														g: Number(e.target.value),
													},
												})
											}
											style={{
												all: "revert",
												width: "60px",
												padding: "4px 8px",
												fontSize: "13px",
											}}
											placeholder="G"
										/>
										<input
											type="number"
											min={0}
											max={255}
											value={config.backgroundColor.b}
											onChange={(e) =>
												setConfig({
													...config,
													backgroundColor: {
														...config.backgroundColor,
														b: Number(e.target.value),
													},
												})
											}
											style={{
												all: "revert",
												width: "60px",
												padding: "4px 8px",
												fontSize: "13px",
											}}
											placeholder="B"
										/>
										<input
											type="color"
											value={`#${config.backgroundColor.r.toString(16).padStart(2, "0")}${config.backgroundColor.g.toString(16).padStart(2, "0")}${config.backgroundColor.b.toString(16).padStart(2, "0")}`}
											onChange={(e) => {
												const hex = e.target.value.replace("#", "");
												setConfig({
													...config,
													backgroundColor: {
														r: parseInt(hex.substring(0, 2), 16),
														g: parseInt(hex.substring(2, 4), 16),
														b: parseInt(hex.substring(4, 6), 16),
													},
												});
											}}
											style={{
												all: "revert",
												width: "40px",
												height: "30px",
												padding: 0,
												cursor: "pointer",
											}}
										/>
									</div>
								)}
							</div>

							{/* Code */}
							<div>
								<h4
									style={{
										fontSize: "13px",
										fontWeight: "bold",
										margin: "0 0 5px 0",
									}}
								>
									Code
								</h4>
								<textarea
									value={code}
									onChange={(e) => setCode(e.target.value)}
									rows={15}
									spellCheck={false}
									style={{
										all: "revert",
										width: "100%",
										fontFamily: "monospace",
										fontSize: "12px",
										padding: "8px",
										boxSizing: "border-box",
										resize: "vertical",
									}}
								/>
							</div>

							{/* Actions */}
							<div
								style={{ display: "flex", flexDirection: "column", gap: "8px" }}
							>
								<button
									type="button"
									onClick={handleApply}
									style={{
										all: "revert",
										padding: "8px 16px",
										fontSize: "14px",
										width: "100%",
									}}
								>
									Apply Changes
								</button>
								<button
									type="button"
									onClick={handleExportZip}
									style={{
										all: "revert",
										padding: "8px 16px",
										fontSize: "14px",
										width: "100%",
									}}
								>
									Export PNG Sequence (ZIP)
								</button>
							</div>
						</div>
					</fieldset>
				)}
			</div>
		</RawDOMContainer>
	);
}
