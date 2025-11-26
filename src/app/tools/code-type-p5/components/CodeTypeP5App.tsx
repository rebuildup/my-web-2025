"use client";

import CloseIcon from "@mui/icons-material/Close";
import DownloadIcon from "@mui/icons-material/Download";
import EditIcon from "@mui/icons-material/Edit";
import PauseIcon from "@mui/icons-material/Pause";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import {
	Box,
	Button,
	Checkbox,
	CssBaseline,
	createTheme,
	Drawer,
	FormControl,
	FormControlLabel,
	Grid,
	IconButton,
	InputLabel,
	MenuItem,
	Select,
	TextField,
	ThemeProvider,
	Typography,
} from "@mui/material";
import JSZip from "jszip";
import p5 from "p5";
import { useEffect, useRef, useState } from "react";
import { EditorManager } from "../lib/001_Editors/001_EditorManager";
import { setupAnimationRenderer } from "../lib/001_Editors/002_AnimationRenderer";
import { ANIMATION_CONFIG, CANVAS_CONFIG } from "../lib/config";

// Define theme
const darkTheme = createTheme({
	palette: {
		mode: "dark",
		primary: {
			main: "#90caf9",
		},
		background: {
			default: "#121212",
			paper: "#1e1e1e",
		},
	},
	typography: {
		fontFamily: "Inter, system-ui, sans-serif",
	},
});

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

	// Initialize p5.js and setup
	// Use useEffect to initialize after component mounts
	useEffect(() => {
		// Prevent multiple initializations (React StrictMode対策)
		// Use a flag that persists across re-renders
		if ((window as any).__p5Initializing) {
			console.log("Already initializing, skipping...");
			return;
		}

		console.log("CodeTypeP5App useEffect started");
		(window as any).__p5Initializing = true;
		isInitializingRef.current = true;

		// Wait for next tick to ensure ref is set
		const initP5 = () => {
			if (!containerRef.current) {
				console.log("containerRef.current is null, retrying...");
				// Use setTimeout with a limit to prevent infinite loop
				setTimeout(initP5, 50);
				return;
			}

			console.log("containerRef.current exists:", containerRef.current);

			// Set up p5 and JSZip on window for global access
			// p5.js needs to be available as window.p5 for the setupAnimationRenderer
			if (typeof window !== "undefined") {
				(window as any).p5 = p5;
				(window as any).JSZip = JSZip;
				console.log("p5 and JSZip set on window:", {
					p5: typeof (window as any).p5,
					JSZip: typeof (window as any).JSZip,
					p5Value: (window as any).p5,
				});
			}

			// Check if p5 instance already exists and remove it
			if (p5InstanceRef.current) {
				console.log("Removing existing p5 instance...");
				try {
					p5InstanceRef.current.remove();
				} catch (e) {
					console.warn("Error removing p5 instance:", e);
				}
				p5InstanceRef.current = null;
			}

			// Remove ALL existing canvases and p5 instances
			const existingCanvases = document.querySelectorAll("canvas");
			console.log(`Found ${existingCanvases.length} existing canvas(es)`);
			existingCanvases.forEach((canvas, index) => {
				console.log(`Removing canvas ${index}`);
				canvas.remove();
			});

			// Remove all p5 instances from window
			if (
				(window as any).p5Instances &&
				Array.isArray((window as any).p5Instances)
			) {
				(window as any).p5Instances.forEach((instance: any, index: number) => {
					try {
						console.log(`Removing p5 instance ${index}`);
						instance.remove();
					} catch (e) {
						console.warn(`Error removing p5 instance ${index}:`, e);
					}
				});
				(window as any).p5Instances = [];
			}

			// Create canvas container if it doesn't exist
			let canvasContainer = document.getElementById("canvas-container");
			if (!canvasContainer) {
				canvasContainer = document.createElement("div");
				canvasContainer.id = "canvas-container";
				containerRef.current.appendChild(canvasContainer);
				console.log("Created canvas-container");
			}

			// Initialize editor manager
			const editorManager = new EditorManager();
			editorManagerRef.current = editorManager;

			// Setup animation renderer (this will create the p5 instance)
			try {
				console.log("Setting up animation renderer...");
				const p5Instance = setupAnimationRenderer(
					editorManager,
					canvasContainer,
				);
				if (p5Instance) {
					p5InstanceRef.current = p5Instance;
				}
				console.log("Animation renderer setup complete");

				// Wait a bit for p5 to initialize
				setTimeout(() => {
					console.log("Loading initial data...");
					loadInitialData(editorManager);
					setIsLoaded(true);
					console.log("Initialization complete");
				}, 1000);
			} catch (error) {
				console.error("Error setting up animation renderer:", error);
				setIsLoaded(true); // Still set loaded to show error state
			}
		};

		// Start initialization
		initP5();

		return () => {
			// Only cleanup if this is the actual unmount, not StrictMode cleanup
			// In StrictMode, cleanup runs but component doesn't actually unmount
			const timeoutId = setTimeout(() => {
				// Reset flag after a delay to allow StrictMode cleanup
				(window as any).__p5Initializing = false;
				isInitializingRef.current = false;
			}, 100);

			// Cleanup: remove p5 instance if needed
			if (p5InstanceRef.current) {
				console.log("Cleaning up p5 instance...");
				try {
					p5InstanceRef.current.remove();
				} catch (error) {
					console.warn("Error removing p5 instance:", error);
				}
				p5InstanceRef.current = null;
			}
			if ((window as any).animationFunctions) {
				// Cleanup animation functions
				delete (window as any).animationFunctions;
			}
			// Remove all canvases if they exist
			const canvases = document.querySelectorAll("#canvas-container canvas");
			canvases.forEach((canvas) => canvas.remove());
			// Also remove any p5 instances from window
			if ((window as any).p5Instances) {
				(window as any).p5Instances.forEach((instance: any) => {
					try {
						instance.remove();
					} catch (e) {
						console.warn("Error removing p5 instance:", e);
					}
				});
				delete (window as any).p5Instances;
			}

			clearTimeout(timeoutId);
		};
	}, []); // Empty dependency array - only run once on mount

	const loadInitialData = (editorManager: EditorManager) => {
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

		// Get global config
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

		// Get canvas size - use actual canvas size if available, otherwise use config
		const canvas = document.querySelector("canvas");
		if (canvas && canvas.width && canvas.height) {
			setConfig((prev) => ({
				...prev,
				width: canvas.width,
				height: canvas.height,
			}));
		}

		// Get background color from config
		const bgColor = CANVAS_CONFIG.BACKGROUND_COLOR;
		setConfig((prev) => ({
			...prev,
			backgroundColor: { r: bgColor[0], g: bgColor[1], b: bgColor[2] },
			backgroundTransparent: bgColor[3] === 0,
		}));

		// Subscribe to playback changes
		editorManager.setEvents({
			onPlaybackChange: (playing: boolean) => setIsPlaying(playing),
		});
	};

	const handleApply = () => {
		if (!editorManagerRef.current) return;

		const editorManager = editorManagerRef.current;

		// Update Canvas Size
		if (window.animationFunctions?.resizeCanvas) {
			window.animationFunctions.resizeCanvas(config.width, config.height);
		}

		// Update FPS and Frame Count
		editorManager.setFPS(config.fps);
		editorManager.setFrameCount(Math.floor(config.fps * config.duration));

		// Check for multiple canvases and log them
		const canvases = document.querySelectorAll("canvas");
		console.log("Canvas count:", canvases.length);
		if (canvases.length > 1) {
			console.warn(
				"Multiple canvases detected! This may cause duplicate animations.",
			);
			// Remove extra canvases (keep only the first one)
			for (let i = 1; i < canvases.length; i++) {
				console.log(`Removing duplicate canvas ${i}`);
				canvases[i].remove();
			}
		}

		// Update Background Color
		if (window.animationFunctions?.setBackgroundColor) {
			const alpha = config.backgroundTransparent ? 0 : 255;
			window.animationFunctions.setBackgroundColor(
				config.backgroundColor.r,
				config.backgroundColor.g,
				config.backgroundColor.b,
				alpha,
			);
		}

		// Update Animation Config
		const animations = window.animationFunctions?.getAnimations();
		console.log("Animations count:", animations?.length);

		if (animations && animations.length > 0) {
			// すべてのCodescrollアニメーションを更新
			animations.forEach((anim: any, index: number) => {
				if (anim && typeof anim.updateCode === "function") {
					console.log(
						`Updating animation ${index} with code length:`,
						code.length,
					);
					anim.updateCode(code);
				}
				if (anim && typeof anim.updateConfig === "function") {
					anim.updateConfig({
						fontSize: config.fontSize,
						lineHeight: config.lineHeight,
						canvasHeight: config.height,
						language: config.language,
					});
				}
			});
		} else {
			console.warn("No animations found to update");
		}

		// Reset animation
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
		<ThemeProvider theme={darkTheme}>
			<CssBaseline />
			<div className="container-system">
				<div className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8">
					<div
						ref={containerRef}
						className="relative w-full bg-base overflow-hidden"
						style={{ minHeight: `${config.height}px` }}
					>
						{!isLoaded && (
							<div className="absolute inset-0 flex items-center justify-center bg-base z-50">
								<div className="text-center">
									<div className="text-2xl mb-4 text-main">読み込み中...</div>
									<div className="text-sm opacity-70 text-main">
										p5.jsとライブラリを読み込んでいます...
									</div>
								</div>
							</div>
						)}
						<Box
							sx={{
								position: "fixed",
								top: 20,
								right: 20,
								zIndex: 1000,
								display: "flex",
								gap: 1,
							}}
						>
							<Button
								variant="contained"
								startIcon={isPlaying ? <PauseIcon /> : <PlayArrowIcon />}
								onClick={togglePlayback}
								color="secondary"
							>
								{isPlaying ? "Pause" : "Play"}
							</Button>
							<Button
								variant="contained"
								startIcon={<EditIcon />}
								onClick={() => setIsDrawerOpen(true)}
							>
								Edit Code
							</Button>
						</Box>

						<Drawer
							anchor="right"
							open={isDrawerOpen}
							onClose={() => setIsDrawerOpen(false)}
							PaperProps={{
								sx: {
									width: 400,
									p: 3,
									backgroundColor: "rgba(30, 30, 30, 0.95)",
								},
							}}
						>
							<Box
								sx={{
									display: "flex",
									justifyContent: "space-between",
									alignItems: "center",
									mb: 3,
								}}
							>
								<Typography variant="h5" fontWeight="bold">
									Configuration
								</Typography>
								<IconButton onClick={() => setIsDrawerOpen(false)}>
									<CloseIcon />
								</IconButton>
							</Box>

							<Grid container spacing={2} sx={{ mb: 3 }}>
								<Grid size={12}>
									<FormControl fullWidth size="small">
										<InputLabel>Language</InputLabel>
										<Select
											value={config.language}
											label="Language"
											onChange={(e) =>
												setConfig({ ...config, language: e.target.value })
											}
										>
											<MenuItem value="rust">Rust</MenuItem>
											<MenuItem value="typescript">TypeScript</MenuItem>
											<MenuItem value="python">Python</MenuItem>
											<MenuItem value="cpp">C++</MenuItem>
											<MenuItem value="html">HTML</MenuItem>
											<MenuItem value="css">CSS</MenuItem>
											<MenuItem value="java">Java</MenuItem>
											<MenuItem value="go">Go</MenuItem>
										</Select>
									</FormControl>
								</Grid>
								<Grid size={6}>
									<TextField
										label="Width"
										type="number"
										fullWidth
										size="small"
										value={config.width}
										onChange={(e) =>
											setConfig({ ...config, width: Number(e.target.value) })
										}
									/>
								</Grid>
								<Grid size={6}>
									<TextField
										label="Height"
										type="number"
										fullWidth
										size="small"
										value={config.height}
										onChange={(e) =>
											setConfig({ ...config, height: Number(e.target.value) })
										}
									/>
								</Grid>
								<Grid size={6}>
									<TextField
										label="Font Size"
										type="number"
										fullWidth
										size="small"
										value={config.fontSize}
										onChange={(e) =>
											setConfig({ ...config, fontSize: Number(e.target.value) })
										}
									/>
								</Grid>
								<Grid size={6}>
									<TextField
										label="Line Height"
										type="number"
										fullWidth
										size="small"
										value={config.lineHeight}
										onChange={(e) =>
											setConfig({
												...config,
												lineHeight: Number(e.target.value),
											})
										}
									/>
								</Grid>
								<Grid size={6}>
									<TextField
										label="FPS"
										type="number"
										fullWidth
										size="small"
										value={config.fps}
										onChange={(e) =>
											setConfig({ ...config, fps: Number(e.target.value) })
										}
									/>
								</Grid>
								<Grid size={6}>
									<TextField
										label="Duration (s)"
										type="number"
										fullWidth
										size="small"
										value={config.duration}
										onChange={(e) =>
											setConfig({ ...config, duration: Number(e.target.value) })
										}
									/>
								</Grid>
							</Grid>

							{/* Background Color Settings */}
							<Typography variant="h6" sx={{ mb: 1, mt: 2 }}>
								Background
							</Typography>
							<Grid container spacing={2} sx={{ mb: 3 }}>
								<Grid size={12}>
									<FormControlLabel
										control={
											<Checkbox
												checked={config.backgroundTransparent}
												onChange={(e) =>
													setConfig({
														...config,
														backgroundTransparent: e.target.checked,
													})
												}
											/>
										}
										label="Transparent Background"
									/>
								</Grid>
								{!config.backgroundTransparent && (
									<>
										<Grid size={4}>
											<TextField
												label="Red"
												type="number"
												fullWidth
												size="small"
												inputProps={{ min: 0, max: 255 }}
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
											/>
										</Grid>
										<Grid size={4}>
											<TextField
												label="Green"
												type="number"
												fullWidth
												size="small"
												inputProps={{ min: 0, max: 255 }}
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
											/>
										</Grid>
										<Grid size={4}>
											<TextField
												label="Blue"
												type="number"
												fullWidth
												size="small"
												inputProps={{ min: 0, max: 255 }}
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
											/>
										</Grid>
										<Grid size={12}>
											<Box
												sx={{
													display: "flex",
													alignItems: "center",
													gap: 2,
												}}
											>
												<TextField
													label="Color Picker"
													type="color"
													fullWidth
													size="small"
													value={`#${config.backgroundColor.r.toString(16).padStart(2, "0")}${config.backgroundColor.g.toString(16).padStart(2, "0")}${config.backgroundColor.b.toString(16).padStart(2, "0")}`}
													onChange={(e) => {
														const hex = e.target.value.replace("#", "");
														const r = parseInt(hex.substring(0, 2), 16);
														const g = parseInt(hex.substring(2, 4), 16);
														const b = parseInt(hex.substring(4, 6), 16);
														setConfig({
															...config,
															backgroundColor: { r, g, b },
														});
													}}
													sx={{
														"& input[type='color']": {
															width: "100%",
															height: "40px",
															cursor: "pointer",
														},
													}}
												/>
											</Box>
										</Grid>
									</>
								)}
							</Grid>

							<Typography variant="h6" sx={{ mb: 1 }}>
								Code
							</Typography>
							<TextField
								multiline
								rows={15}
								fullWidth
								value={code}
								onChange={(e) => setCode(e.target.value)}
								sx={{
									mb: 3,
									"& .MuiInputBase-input": {
										fontFamily: '"JetBrains Mono", monospace',
										fontSize: "12px",
									},
								}}
								spellCheck={false}
							/>

							<Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
								<Button
									variant="contained"
									color="primary"
									fullWidth
									onClick={handleApply}
									size="large"
								>
									Apply Changes
								</Button>

								<Button
									variant="contained"
									color="error"
									fullWidth
									startIcon={<DownloadIcon />}
									onClick={handleExportZip}
									size="large"
								>
									Export PNG Sequence (ZIP)
								</Button>
							</Box>
						</Drawer>
					</div>
				</div>
			</div>
		</ThemeProvider>
	);
}
