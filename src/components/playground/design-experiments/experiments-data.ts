/**
 * Design Experiments Data
 * Metadata and configuration for all design experiments
 */

import type { DesignExperiment } from "@/types/playground";
import { CanvasParticleExperiment } from "./CanvasParticleExperiment";
import { ColorPaletteExperiment } from "./ColorPaletteExperiment";
import { CSSGridExperiment } from "./CSSGridExperiment";
import { InteractiveShapesExperiment } from "./InteractiveShapesExperiment";
import { SVGAnimationExperiment } from "./SVGAnimationExperiment";
import { TypographyAnimationExperiment } from "./TypographyAnimationExperiment";

export const designExperiments: DesignExperiment[] = [
	{
		id: "color-palette-generator",
		title: "Color Palette Generator",
		description: "インタラクティブなカラーパレット生成とHSL色空間の実験",
		technology: ["CSS", "JavaScript", "Color Theory"],
		interactive: true,
		component: ColorPaletteExperiment,
		category: "css",
		difficulty: "beginner",
		animationType: "click",
		colorScheme: ["hsl", "dynamic"],
		performanceLevel: "low",
		createdAt: "2025-01-08T00:00:00Z",
		updatedAt: "2025-01-08T00:00:00Z",
	},
	{
		id: "typography-animation",
		title: "Typography Animation",
		description: "テキストアニメーションとグラデーション効果の実験",
		technology: ["CSS", "Animation", "Typography"],
		interactive: true,
		component: TypographyAnimationExperiment,
		category: "animation",
		difficulty: "intermediate",
		animationType: "continuous",
		colorScheme: ["gradient", "dynamic"],
		performanceLevel: "medium",
		createdAt: "2025-01-08T00:00:00Z",
		updatedAt: "2025-01-08T00:00:00Z",
	},
	{
		id: "css-grid-layouts",
		title: "CSS Grid Layouts",
		description: "レスポンシブグリッドレイアウトとインタラクティブ要素",
		technology: ["CSS Grid", "Flexbox", "Responsive Design"],
		interactive: true,
		component: CSSGridExperiment,
		category: "css",
		difficulty: "intermediate",
		animationType: "hover",
		performanceLevel: "low",
		createdAt: "2025-01-08T00:00:00Z",
		updatedAt: "2025-01-08T00:00:00Z",
	},
	{
		id: "svg-animations",
		title: "SVG Animations",
		description: "ベクターグラフィックスを使った滑らかなアニメーション",
		technology: ["SVG", "CSS Animation", "Vector Graphics"],
		interactive: true,
		component: SVGAnimationExperiment,
		category: "svg",
		difficulty: "intermediate",
		animationType: "continuous",
		performanceLevel: "medium",
		createdAt: "2025-01-08T00:00:00Z",
		updatedAt: "2025-01-08T00:00:00Z",
	},
	{
		id: "canvas-particles",
		title: "Canvas Particle System",
		description: "HTML5 Canvasを使ったパーティクルシステムの実装",
		technology: ["Canvas", "JavaScript", "Animation"],
		interactive: true,
		component: CanvasParticleExperiment,
		category: "canvas",
		difficulty: "advanced",
		animationType: "continuous",
		performanceLevel: "high",
		createdAt: "2025-01-08T00:00:00Z",
		updatedAt: "2025-01-08T00:00:00Z",
	},
	{
		id: "interactive-shapes",
		title: "Interactive Shapes",
		description: "マウスとタッチ操作に反応するインタラクティブな図形",
		technology: ["CSS", "JavaScript", "Touch Events"],
		interactive: true,
		component: InteractiveShapesExperiment,
		category: "animation",
		difficulty: "intermediate",
		animationType: "hover",
		performanceLevel: "medium",
		createdAt: "2025-01-08T00:00:00Z",
		updatedAt: "2025-01-08T00:00:00Z",
	},
	{
		id: "css-animation-test",
		title: "CSS Animation Test",
		description: "CSS アニメーションのテスト実験",
		technology: ["CSS", "Animation"],
		interactive: true,
		component: TypographyAnimationExperiment, // 既存のコンポーネントを再利用
		category: "css",
		difficulty: "beginner",
		animationType: "continuous",
		performanceLevel: "low",
		createdAt: "2025-01-08T00:00:00Z",
		updatedAt: "2025-01-08T00:00:00Z",
	},
];

// Filter experiments by category
export const getExperimentsByCategory = (category: string) => {
	if (category === "all") return designExperiments;
	return designExperiments.filter((exp) => exp.category === category);
};

// Get experiment by ID
export const getExperimentById = (id: string) => {
	return designExperiments.find((exp) => exp.id === id);
};

// Get experiments by difficulty
export const getExperimentsByDifficulty = (difficulty: string) => {
	return designExperiments.filter((exp) => exp.difficulty === difficulty);
};

// Get experiments by performance level
export const getExperimentsByPerformance = (level: string) => {
	return designExperiments.filter((exp) => exp.performanceLevel === level);
};
