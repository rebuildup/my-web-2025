"use client";

import {
	AlertCircle,
	BookOpen,
	CheckCircle,
	Copy,
	Download,
	Heart,
	Info,
	Pause,
	Play,
	RotateCcw,
	Save,
	Search,
	Settings,
	Star,
	Trash2,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import ToolWrapper from "../../components/ToolWrapper";

// Types for AE expressions
interface ExpressionParameter {
	name: string;
	type: "number" | "select" | "boolean" | "string";
	defaultValue: string | number | boolean;
	min?: number;
	max?: number;
	step?: number;
	options?: string[];
	description: string;
	unit?: string;
}

interface AEExpression {
	id: string;
	category: "animation" | "effect" | "transform" | "utility";
	name: string;
	description: string;
	template: string;
	parameters: ExpressionParameter[];
	example: string;
	difficulty: "beginner" | "intermediate" | "advanced";
	isFavorite?: boolean;
	usageCount?: number;
	documentation?: string;
	tags?: string[];
	version?: string;
	author?: string;
	lastUpdated?: string;
	relatedExpressions?: string[];
}

interface ValidationResult {
	isValid: boolean;
	errors: string[];
	warnings: string[];
}

interface SavedExpression {
	id: string;
	name: string;
	code: string;
	parameters: Record<string, string | number | boolean>;
	createdAt: string;
	lastModified: string;
}

// Comprehensive AE Expression Database
const AE_EXPRESSIONS: AEExpression[] = [
	// Animation expressions
	{
		id: "wiggle",
		category: "animation",
		name: "Wiggle",
		description: "ランダムな動きを生成します.自然な揺れやノイズ効果に最適.",
		template: "wiggle({frequency}, {amplitude})",
		parameters: [
			{
				name: "frequency",
				type: "number",
				defaultValue: 2,
				min: 0.1,
				max: 20,
				step: 0.1,
				description: "振動の頻度（回/秒）",
				unit: "Hz",
			},
			{
				name: "amplitude",
				type: "number",
				defaultValue: 50,
				min: 0,
				max: 500,
				step: 1,
				description: "振動の幅",
				unit: "px",
			},
		],
		example: "wiggle(2, 50)",
		difficulty: "beginner",
		usageCount: 0,
		documentation:
			"wiggle()関数は、指定された頻度と振幅でランダムな動きを生成します.第1引数は1秒間の振動回数、第2引数は振動の幅を指定します.自然な手ブレやノイズ効果を作成する際に最も使用される基本的なエクスプレッションです.",
		tags: ["animation", "random", "movement", "noise"],
		version: "1.0",
		author: "Adobe",
		lastUpdated: "2024-01-01",
		relatedExpressions: ["random", "noise"],
	},
	{
		id: "loopOut",
		category: "animation",
		name: "Loop Out",
		description: "アニメーションをループさせます.キーフレーム後の動作を制御.",
		template: 'loopOut("{type}", {numKeyframes})',
		parameters: [
			{
				name: "type",
				type: "select",
				defaultValue: "cycle",
				options: ["cycle", "pingpong", "offset", "continue"],
				description: "ループの種類",
			},
			{
				name: "numKeyframes",
				type: "number",
				defaultValue: 0,
				min: 0,
				max: 10,
				step: 1,
				description: "ループするキーフレーム数（0=全て）",
			},
		],
		example: 'loopOut("cycle")',
		difficulty: "beginner",
		usageCount: 0,
		documentation:
			"loopOut()関数は、キーフレームアニメーションの最後のキーフレーム以降の動作を制御します.cycle（繰り返し）、pingpong（往復）、offset（オフセット付き繰り返し）、continue（最後の値を継続）の4つのモードがあります.",
		tags: ["animation", "loop", "keyframe", "cycle"],
		version: "1.0",
		author: "Adobe",
		lastUpdated: "2024-01-01",
		relatedExpressions: ["loopIn", "loopInDuration"],
	},
	{
		id: "time-rotation",
		category: "animation",
		name: "Time-based Rotation",
		description: "時間に基づいた回転アニメーション.一定速度での回転に使用.",
		template: "time * {speed}",
		parameters: [
			{
				name: "speed",
				type: "number",
				defaultValue: 360,
				min: -1800,
				max: 1800,
				step: 10,
				description: "回転速度（度/秒）",
				unit: "deg/s",
			},
		],
		example: "time * 360",
		difficulty: "beginner",
	},
	{
		id: "bounce",
		category: "animation",
		name: "Bounce",
		description: "バウンス効果を作成.弾むような動きを表現.",
		template:
			"amp = {amplitude}; freq = {frequency}; decay = {decay}; n = 0; if (numKeys > 0) { n = nearestKey(time).index; if (key(n).time > time) { n--; } } if (n == 0) { t = 0; } else { t = time - key(n).time; } if (n > 0 && t < 1) { v = velocityAtTime(key(n).time - thisComp.frameDuration/10); value + v*amp*Math.sin(freq*t*2*Math.PI)/Math.exp(decay*t); } else { value; }",
		parameters: [
			{
				name: "amplitude",
				type: "number",
				defaultValue: 0.8,
				min: 0,
				max: 2,
				step: 0.1,
				description: "バウンスの強さ",
			},
			{
				name: "frequency",
				type: "number",
				defaultValue: 4,
				min: 1,
				max: 10,
				step: 0.5,
				description: "バウンスの頻度",
				unit: "Hz",
			},
			{
				name: "decay",
				type: "number",
				defaultValue: 8,
				min: 1,
				max: 20,
				step: 1,
				description: "減衰率",
			},
		],
		example: "bounce(0.8, 4, 8)",
		difficulty: "advanced",
	},

	// Effect expressions
	{
		id: "sine-wave",
		category: "effect",
		name: "Sine Wave",
		description: "サイン波を使った周期的な動き.波のような滑らかな動作.",
		template: "Math.sin(time * {frequency}) * {amplitude} + {offset}",
		parameters: [
			{
				name: "frequency",
				type: "number",
				defaultValue: 2,
				min: 0.1,
				max: 10,
				step: 0.1,
				description: "波の頻度",
				unit: "Hz",
			},
			{
				name: "amplitude",
				type: "number",
				defaultValue: 100,
				min: 0,
				max: 500,
				step: 10,
				description: "波の振幅",
				unit: "px",
			},
			{
				name: "offset",
				type: "number",
				defaultValue: 0,
				min: -500,
				max: 500,
				step: 10,
				description: "オフセット値",
				unit: "px",
			},
		],
		example: "Math.sin(time * 2) * 100",
		difficulty: "intermediate",
	},
	{
		id: "random-values",
		category: "effect",
		name: "Random Values",
		description: "ランダムな値を生成.シード値で再現可能なランダム性.",
		template: "seedRandom({seed}, true); random({min}, {max})",
		parameters: [
			{
				name: "seed",
				type: "number",
				defaultValue: 1,
				min: 1,
				max: 1000,
				step: 1,
				description: "シード値（再現性のため）",
			},
			{
				name: "min",
				type: "number",
				defaultValue: 0,
				min: -1000,
				max: 1000,
				step: 1,
				description: "最小値",
			},
			{
				name: "max",
				type: "number",
				defaultValue: 100,
				min: -1000,
				max: 1000,
				step: 1,
				description: "最大値",
			},
		],
		example: "seedRandom(1, true); random(0, 100)",
		difficulty: "intermediate",
	},

	// Transform expressions
	{
		id: "scale-pulse",
		category: "transform",
		name: "Scale Pulse",
		description: "脈動するスケールアニメーション.ハートビートのような効果.",
		template:
			"[{baseScale} + Math.sin(time * {frequency}) * {amplitude}, {baseScale} + Math.sin(time * {frequency}) * {amplitude}]",
		parameters: [
			{
				name: "baseScale",
				type: "number",
				defaultValue: 100,
				min: 10,
				max: 200,
				step: 5,
				description: "基本スケール",
				unit: "%",
			},
			{
				name: "frequency",
				type: "number",
				defaultValue: 4,
				min: 0.5,
				max: 20,
				step: 0.5,
				description: "脈動の頻度",
				unit: "Hz",
			},
			{
				name: "amplitude",
				type: "number",
				defaultValue: 20,
				min: 0,
				max: 100,
				step: 5,
				description: "脈動の強さ",
				unit: "%",
			},
		],
		example: "[100 + Math.sin(time * 4) * 20, 100 + Math.sin(time * 4) * 20]",
		difficulty: "intermediate",
	},
	{
		id: "opacity-flicker",
		category: "transform",
		name: "Opacity Flicker",
		description: "点滅効果.ランダムまたは規則的な明滅を作成.",
		template: "{baseOpacity} + Math.sin(time * {frequency}) * {amplitude}",
		parameters: [
			{
				name: "baseOpacity",
				type: "number",
				defaultValue: 80,
				min: 0,
				max: 100,
				step: 5,
				description: "基本透明度",
				unit: "%",
			},
			{
				name: "frequency",
				type: "number",
				defaultValue: 8,
				min: 1,
				max: 30,
				step: 1,
				description: "点滅の頻度",
				unit: "Hz",
			},
			{
				name: "amplitude",
				type: "number",
				defaultValue: 20,
				min: 0,
				max: 50,
				step: 5,
				description: "点滅の強さ",
				unit: "%",
			},
		],
		example: "80 + Math.sin(time * 8) * 20",
		difficulty: "beginner",
	},

	// Utility expressions
	{
		id: "clamp-values",
		category: "utility",
		name: "Clamp Values",
		description: "値を指定範囲内に制限.最小値と最大値の間に値を収める.",
		template: "clamp({value}, {min}, {max})",
		parameters: [
			{
				name: "value",
				type: "string",
				defaultValue: "value",
				description: "制限する値（プロパティ名）",
			},
			{
				name: "min",
				type: "number",
				defaultValue: 0,
				min: -1000,
				max: 1000,
				step: 1,
				description: "最小値",
			},
			{
				name: "max",
				type: "number",
				defaultValue: 100,
				min: -1000,
				max: 1000,
				step: 1,
				description: "最大値",
			},
		],
		example: "clamp(value, 0, 100)",
		difficulty: "beginner",
		usageCount: 0,
		documentation:
			"clamp()関数は値を指定された範囲内に制限します.値が最小値より小さい場合は最小値を、最大値より大きい場合は最大値を返します.アニメーションの値を安全な範囲内に保つために使用されます.",
		tags: ["utility", "math", "limit", "range"],
		version: "1.0",
		author: "Adobe",
		lastUpdated: "2024-01-01",
		relatedExpressions: ["linear", "ease"],
	},
	{
		id: "linear-interpolation",
		category: "utility",
		name: "Linear Interpolation",
		description: "線形補間.時間に基づいて値を滑らかに変化させる.",
		template: "linear(time, {startTime}, {endTime}, {startValue}, {endValue})",
		parameters: [
			{
				name: "startTime",
				type: "number",
				defaultValue: 0,
				min: 0,
				max: 10,
				step: 0.1,
				description: "開始時間",
				unit: "s",
			},
			{
				name: "endTime",
				type: "number",
				defaultValue: 2,
				min: 0,
				max: 10,
				step: 0.1,
				description: "終了時間",
				unit: "s",
			},
			{
				name: "startValue",
				type: "number",
				defaultValue: 0,
				min: -1000,
				max: 1000,
				step: 1,
				description: "開始値",
			},
			{
				name: "endValue",
				type: "number",
				defaultValue: 100,
				min: -1000,
				max: 1000,
				step: 1,
				description: "終了値",
			},
		],
		example: "linear(time, 0, 2, 0, 100)",
		difficulty: "intermediate",
		usageCount: 0,
		documentation:
			"linear()関数は線形補間を行います.指定された時間範囲内で値を滑らかに変化させることができます.アニメーションの開始値と終了値を時間に基づいて補間します.",
		tags: ["utility", "interpolation", "time", "animation"],
		version: "1.0",
		author: "Adobe",
		lastUpdated: "2024-01-01",
		relatedExpressions: ["ease", "easeIn", "easeOut"],
	},

	// Additional advanced expressions
	{
		id: "ease-in-out",
		category: "animation",
		name: "Ease In Out",
		description: "イーズイン・アウトアニメーション.滑らかな加速・減速効果.",
		template: "ease({t}, {tMin}, {tMax}, {value1}, {value2})",
		parameters: [
			{
				name: "t",
				type: "string",
				defaultValue: "time",
				description: "時間変数",
			},
			{
				name: "tMin",
				type: "number",
				defaultValue: 0,
				min: 0,
				max: 10,
				step: 0.1,
				description: "開始時間",
				unit: "s",
			},
			{
				name: "tMax",
				type: "number",
				defaultValue: 1,
				min: 0,
				max: 10,
				step: 0.1,
				description: "終了時間",
				unit: "s",
			},
			{
				name: "value1",
				type: "number",
				defaultValue: 0,
				min: -1000,
				max: 1000,
				step: 1,
				description: "開始値",
			},
			{
				name: "value2",
				type: "number",
				defaultValue: 100,
				min: -1000,
				max: 1000,
				step: 1,
				description: "終了値",
			},
		],
		example: "ease(time, 0, 1, 0, 100)",
		difficulty: "intermediate",
		usageCount: 0,
		documentation:
			"ease()関数は滑らかなイージング効果を提供します.開始時はゆっくり加速し、終了時はゆっくり減速する自然なアニメーションカーブを作成します.",
		tags: ["animation", "easing", "smooth", "curve"],
		version: "1.0",
		author: "Adobe",
		lastUpdated: "2024-01-01",
		relatedExpressions: ["easeIn", "easeOut", "linear"],
	},

	{
		id: "posterize-time",
		category: "effect",
		name: "Posterize Time",
		description:
			"時間をポスタライズ.フレームレートを下げてストップモーション効果.",
		template: "posterizeTime({framesPerSecond}); {expression}",
		parameters: [
			{
				name: "framesPerSecond",
				type: "number",
				defaultValue: 12,
				min: 1,
				max: 60,
				step: 1,
				description: "フレームレート",
				unit: "fps",
			},
			{
				name: "expression",
				type: "string",
				defaultValue: "value",
				description: "適用するエクスプレッション",
			},
		],
		example: "posterizeTime(12); wiggle(2, 50)",
		difficulty: "intermediate",
		usageCount: 0,
		documentation:
			"posterizeTime()関数は時間の解像度を下げ、指定されたフレームレートでエクスプレッションを評価します.ストップモーションのような効果や、意図的にカクカクした動きを作成する際に使用します.",
		tags: ["effect", "time", "framerate", "stopmotion"],
		version: "1.0",
		author: "Adobe",
		lastUpdated: "2024-01-01",
		relatedExpressions: ["time", "wiggle"],
	},

	{
		id: "value-at-time",
		category: "utility",
		name: "Value At Time",
		description: "指定時間での値を取得.過去や未来の値を参照.",
		template: "valueAtTime(time - {offset})",
		parameters: [
			{
				name: "offset",
				type: "number",
				defaultValue: 1,
				min: -10,
				max: 10,
				step: 0.1,
				description: "時間オフセット",
				unit: "s",
			},
		],
		example: "valueAtTime(time - 1)",
		difficulty: "advanced",
		usageCount: 0,
		documentation:
			"valueAtTime()関数は指定された時間でのプロパティ値を取得します.過去の値を参照してエコー効果を作ったり、未来の値を予測したりする際に使用します.",
		tags: ["utility", "time", "reference", "echo"],
		version: "1.0",
		author: "Adobe",
		lastUpdated: "2024-01-01",
		relatedExpressions: ["time", "delay"],
	},
];

const CATEGORY_NAMES = {
	animation: "アニメーション",
	effect: "エフェクト",
	transform: "変形",
	utility: "ユーティリティ",
};

const DIFFICULTY_COLORS = {
	beginner: "bg-green-100 text-green-800 border-green-300",
	intermediate: "bg-yellow-100 text-yellow-800 border-yellow-300",
	advanced: "bg-red-100 text-red-800 border-red-300",
};

const DIFFICULTY_NAMES = {
	beginner: "初級",
	intermediate: "中級",
	advanced: "上級",
};

export default function AEExpressionTool() {
	const [expressions, setExpressions] =
		useState<AEExpression[]>(AE_EXPRESSIONS);
	const [selectedExpression, setSelectedExpression] =
		useState<AEExpression | null>(null);
	const [parameterValues, setParameterValues] = useState<
		Record<string, string | number | boolean>
	>({});
	const [searchTerm, setSearchTerm] = useState("");
	const [selectedCategory, setSelectedCategory] = useState<string>("all");
	const [selectedDifficulty, setSelectedDifficulty] = useState<string>("all");
	const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
	const [generatedCode, setGeneratedCode] = useState("");
	const [isPreviewPlaying, setIsPreviewPlaying] = useState(false);
	const [previewTime, setPreviewTime] = useState(0);
	const [validationResult, setValidationResult] = useState<ValidationResult>({
		isValid: true,
		errors: [],
		warnings: [],
	});
	const [savedExpressions, setSavedExpressions] = useState<SavedExpression[]>(
		[],
	);
	const [showDocumentation, setShowDocumentation] = useState(false);
	const [showAdvancedSettings, setShowAdvancedSettings] = useState(false);
	const [copySuccess, setCopySuccess] = useState(false);
	const [exportFormat, setExportFormat] = useState<"jsx" | "txt" | "json">(
		"txt",
	);

	// Enhanced search and filtering
	const filteredExpressions = useMemo(() => {
		return expressions.filter((expr) => {
			const searchLower = searchTerm.toLowerCase();
			const matchesSearch =
				!searchTerm ||
				expr.name.toLowerCase().includes(searchLower) ||
				expr.description.toLowerCase().includes(searchLower) ||
				expr.tags?.some((tag) => tag.toLowerCase().includes(searchLower)) ||
				expr.template.toLowerCase().includes(searchLower);

			const matchesCategory =
				selectedCategory === "all" || expr.category === selectedCategory;
			const matchesDifficulty =
				selectedDifficulty === "all" || expr.difficulty === selectedDifficulty;
			const matchesFavorites = !showFavoritesOnly || expr.isFavorite;

			return (
				matchesSearch &&
				matchesCategory &&
				matchesDifficulty &&
				matchesFavorites
			);
		});
	}, [
		expressions,
		searchTerm,
		selectedCategory,
		selectedDifficulty,
		showFavoritesOnly,
	]);

	// Expression validation function
	const validateExpression = useCallback((code: string): ValidationResult => {
		const errors: string[] = [];
		const warnings: string[] = [];

		// Basic syntax validation
		if (!code.trim()) {
			errors.push("エクスプレッションが空です");
			return { isValid: false, errors, warnings };
		}

		// Check for common syntax errors
		const openParens = (code.match(/\(/g) || []).length;
		const closeParens = (code.match(/\)/g) || []).length;
		if (openParens !== closeParens) {
			errors.push("括弧の数が一致しません");
		}

		const openBrackets = (code.match(/\[/g) || []).length;
		const closeBrackets = (code.match(/\]/g) || []).length;
		if (openBrackets !== closeBrackets) {
			errors.push("角括弧の数が一致しません");
		}

		const openBraces = (code.match(/\{/g) || []).length;
		const closeBraces = (code.match(/\}/g) || []).length;
		if (openBraces !== closeBraces) {
			errors.push("波括弧の数が一致しません");
		}

		// Check for undefined variables (common mistakes)
		const undefinedVars = code.match(/\{[^}]+\}/g);
		if (undefinedVars) {
			warnings.push(
				"未定義の変数が含まれている可能性があります: " +
					undefinedVars.join(", "),
			);
		}

		// Check for deprecated functions
		const deprecatedFunctions = ["eval", "with"];
		deprecatedFunctions.forEach((func) => {
			if (code.includes(func)) {
				warnings.push(`非推奨の関数が使用されています: ${func}`);
			}
		});

		// Performance warnings
		if (code.includes("for") || code.includes("while")) {
			warnings.push("ループ処理はパフォーマンスに影響する可能性があります");
		}

		return {
			isValid: errors.length === 0,
			errors,
			warnings,
		};
	}, []);

	// Generate expression code
	const generateCode = useCallback(() => {
		if (!selectedExpression) return "";

		let code = selectedExpression.template;

		selectedExpression.parameters.forEach((param) => {
			const value = parameterValues[param.name] ?? param.defaultValue;
			const placeholder = `{${param.name}}`;

			if (param.type === "string") {
				code = code.replace(new RegExp(placeholder, "g"), String(value));
			} else if (param.type === "select") {
				code = code.replace(new RegExp(placeholder, "g"), String(value));
			} else {
				code = code.replace(new RegExp(placeholder, "g"), String(value));
			}
		});

		return code;
	}, [selectedExpression, parameterValues]);

	// Update generated code and validation when parameters change
	useEffect(() => {
		const code = generateCode();
		setGeneratedCode(code);
		const validation = validateExpression(code);
		setValidationResult(validation);
	}, [generateCode, validateExpression]);

	// Save expression to local storage
	const saveExpression = useCallback(() => {
		if (!selectedExpression || !generatedCode) return;

		const savedExpression: SavedExpression = {
			id: Date.now().toString(),
			name: `${selectedExpression.name} - ${new Date().toLocaleDateString()}`,
			code: generatedCode,
			parameters: parameterValues,
			createdAt: new Date().toISOString(),
			lastModified: new Date().toISOString(),
		};

		const updated = [...savedExpressions, savedExpression];
		setSavedExpressions(updated);
		localStorage.setItem("ae-expressions-saved", JSON.stringify(updated));
	}, [selectedExpression, generatedCode, parameterValues, savedExpressions]);

	// Load saved expressions from local storage
	useEffect(() => {
		const saved = localStorage.getItem("ae-expressions-saved");
		if (saved) {
			try {
				setSavedExpressions(JSON.parse(saved));
			} catch (error) {
				console.error("Failed to load saved expressions:", error);
			}
		}
	}, []);

	// Toggle favorite status
	const toggleFavorite = useCallback((expressionId: string) => {
		setExpressions((prev) =>
			prev.map((expr) =>
				expr.id === expressionId
					? { ...expr, isFavorite: !expr.isFavorite }
					: expr,
			),
		);
	}, []);

	// Export expression in different formats
	const exportExpression = useCallback(() => {
		if (!generatedCode) return;

		let content = "";
		let filename = "";
		let mimeType = "";

		switch (exportFormat) {
			case "jsx":
				content = `// After Effects Expression
// Generated by AE Expression Tool
// ${new Date().toISOString()}

${generatedCode}`;
				filename = "expression.jsx";
				mimeType = "text/javascript";
				break;
			case "json":
				content = JSON.stringify(
					{
						expression: generatedCode,
						parameters: parameterValues,
						metadata: {
							name: selectedExpression?.name,
							category: selectedExpression?.category,
							difficulty: selectedExpression?.difficulty,
							generatedAt: new Date().toISOString(),
						},
					},
					null,
					2,
				);
				filename = "expression.json";
				mimeType = "application/json";
				break;
			default:
				content = `After Effects Expression
Generated: ${new Date().toLocaleString()}
Expression: ${selectedExpression?.name}
Category: ${selectedExpression?.category}

${generatedCode}`;
				filename = "expression.txt";
				mimeType = "text/plain";
		}

		const blob = new Blob([content], { type: mimeType });
		const url = URL.createObjectURL(blob);
		const a = document.createElement("a");
		a.href = url;
		a.download = filename;
		document.body.appendChild(a);
		a.click();
		document.body.removeChild(a);
		URL.revokeObjectURL(url);
	}, [generatedCode, exportFormat, parameterValues, selectedExpression]);

	// Initialize parameter values when expression is selected
	useEffect(() => {
		if (selectedExpression) {
			const initialValues: Record<string, string | number | boolean> = {};
			selectedExpression.parameters.forEach((param) => {
				initialValues[param.name] = param.defaultValue;
			});
			setParameterValues(initialValues);
		}
	}, [selectedExpression]);

	// Handle parameter value change
	const updateParameter = useCallback(
		(paramName: string, value: string | number | boolean) => {
			setParameterValues((prev) => ({ ...prev, [paramName]: value }));
		},
		[],
	);

	// Enhanced copy to clipboard with feedback
	const copyToClipboard = useCallback(async () => {
		try {
			await navigator.clipboard.writeText(generatedCode);
			setCopySuccess(true);
			setTimeout(() => setCopySuccess(false), 2000);

			// Track usage
			if (selectedExpression) {
				setExpressions((prev) =>
					prev.map((expr) =>
						expr.id === selectedExpression.id
							? { ...expr, usageCount: (expr.usageCount || 0) + 1 }
							: expr,
					),
				);
			}
		} catch (error) {
			console.error("Failed to copy to clipboard:", error);
		}
	}, [generatedCode, selectedExpression]);

	// Handle keyboard shortcuts
	useEffect(() => {
		const handleToolShortcut = (event: CustomEvent) => {
			switch (event.detail.key.toLowerCase()) {
				case "c":
					if (generatedCode) {
						copyToClipboard();
					}
					break;
				case "p":
					setIsPreviewPlaying(!isPreviewPlaying);
					break;
				case "r":
					setPreviewTime(0);
					setIsPreviewPlaying(false);
					break;
				case "s":
					if (selectedExpression && generatedCode) {
						saveExpression();
					}
					break;
				case "d":
					setShowDocumentation(!showDocumentation);
					break;
				case "e":
					if (generatedCode) {
						exportExpression();
					}
					break;
				case "f":
					if (selectedExpression) {
						toggleFavorite(selectedExpression.id);
					}
					break;
			}
		};

		document.addEventListener(
			"toolShortcut",
			handleToolShortcut as EventListener,
		);
		return () =>
			document.removeEventListener(
				"toolShortcut",
				handleToolShortcut as EventListener,
			);
	}, [
		generatedCode,
		isPreviewPlaying,
		copyToClipboard,
		saveExpression,
		showDocumentation,
		exportExpression,
		selectedExpression,
		toggleFavorite,
	]);

	// Preview animation timer
	useEffect(() => {
		let interval: NodeJS.Timeout;
		if (isPreviewPlaying) {
			interval = setInterval(() => {
				setPreviewTime((prev) => prev + 0.1);
			}, 100);
		}
		return () => {
			if (interval) clearInterval(interval);
		};
	}, [isPreviewPlaying]);

	return (
		<ToolWrapper
			toolName="AE Expression Tool"
			description="AfterEffectsのエクスプレッションをScratch風ブロックUIで簡単に設定.アニメーション、エフェクト、変形などのエクスプレッションを一覧表示."
			category="Design"
			keyboardShortcuts={[
				{ key: "c", description: "コードをコピー" },
				{ key: "p", description: "プレビュー再生/停止" },
				{ key: "r", description: "プレビューリセット" },
				{ key: "s", description: "エクスプレッションを保存" },
				{ key: "d", description: "ドキュメント表示切替" },
				{ key: "e", description: "エクスプレッションをエクスポート" },
				{ key: "f", description: "お気に入り切替" },
			]}
		>
			<div className="space-y-8">
				{/* Controls */}
				<div className="space-y-4">
					{/* Main Controls */}
					<div className="flex flex-wrap gap-4 items-center">
						<div className="relative flex-1 min-w-64">
							<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-accent" />
							<input
								type="text"
								placeholder="エクスプレッション、タグ、テンプレートを検索..."
								value={searchTerm}
								onChange={(e) => setSearchTerm(e.target.value)}
								className="w-full pl-10 pr-4 py-2 rounded-lg bg-main/10 text-main focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-base"
							/>
						</div>

						<select
							value={selectedCategory}
							onChange={(e) => setSelectedCategory(e.target.value)}
							className="px-4 py-2 rounded-lg bg-main/10 text-main hover:bg-main/20 focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-base"
						>
							<option value="all">全カテゴリ</option>
							<option value="animation">アニメーション</option>
							<option value="effect">エフェクト</option>
							<option value="transform">変形</option>
							<option value="utility">ユーティリティ</option>
						</select>

						<select
							value={selectedDifficulty}
							onChange={(e) => setSelectedDifficulty(e.target.value)}
							className="px-4 py-2 rounded-lg bg-main/10 text-main hover:bg-main/20 focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-base"
						>
							<option value="all">全難易度</option>
							<option value="beginner">初級</option>
							<option value="intermediate">中級</option>
							<option value="advanced">上級</option>
						</select>

						<button
							type="button"
							onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
							className={`px-4 py-2 rounded-lg bg-main/10 hover:bg-main/20 flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-base noto-sans-jp-light ${
								showFavoritesOnly ? "bg-accent text-main" : "bg-base text-main"
							}`}
						>
							<Heart className="w-4 h-4" />
							お気に入りのみ
						</button>

						<button
							type="button"
							onClick={() => setShowAdvancedSettings(!showAdvancedSettings)}
							className="px-4 py-2 rounded-lg bg-main/10 text-main hover:bg-main/20 focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-base flex items-center gap-2 noto-sans-jp-light"
						>
							<Settings className="w-4 h-4" />
							詳細設定
						</button>
					</div>

					{/* Advanced Settings Panel */}
					{showAdvancedSettings && (
						<div className="rounded-xl bg-base/75 backdrop-blur-md shadow-[0_8px_24px_rgba(0,0,0,0.25)] p-4 space-y-4">
							<h3 className="text-lg noto-sans-jp-regular font-medium">
								詳細設定
							</h3>

							<div className="grid-system grid-1 md:grid-2 gap-4">
								<div className="space-y-2">
									<label
										htmlFor="export-format"
										className="text-sm noto-sans-jp-regular"
									>
										エクスポート形式
									</label>
									<select
										id="export-format"
										value={exportFormat}
										onChange={(e) =>
											setExportFormat(e.target.value as "jsx" | "txt" | "json")
										}
										className="w-full px-3 py-2 rounded-lg bg-main/10 text-main focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-base"
									>
										<option value="txt">テキスト (.txt)</option>
										<option value="jsx">JSX (.jsx)</option>
										<option value="json">JSON (.json)</option>
									</select>
								</div>

								<div className="space-y-2">
									<h4 className="text-sm noto-sans-jp-regular">
										表示オプション
									</h4>
									<div className="flex gap-2">
										<button
											type="button"
											onClick={() => setShowDocumentation(!showDocumentation)}
											className={`px-3 py-2 rounded-lg bg-main/10 hover:bg-main/20 flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-base noto-sans-jp-light ${
												showDocumentation
													? "bg-accent text-main"
													: "bg-base text-main"
											}`}
										>
											<BookOpen className="w-4 h-4" />
											ドキュメント
										</button>
									</div>
								</div>
							</div>

							{/* Saved Expressions */}
							{savedExpressions.length > 0 && (
								<div className="space-y-2">
									<h4 className="text-sm noto-sans-jp-regular">
										保存済みエクスプレッション
									</h4>
									<div className="max-h-32 overflow-y-auto rounded-lg bg-main/10 p-2 space-y-1">
										{savedExpressions.map((saved) => (
											<div
												key={saved.id}
												className="flex items-center justify-between p-2 rounded-lg bg-main/10"
											>
												<span className="text-sm noto-sans-jp-light truncate">
													{saved.name}
												</span>
												<button
													type="button"
													onClick={() => {
														setSavedExpressions((prev) =>
															prev.filter((s) => s.id !== saved.id),
														);
														localStorage.setItem(
															"ae-expressions-saved",
															JSON.stringify(
																savedExpressions.filter(
																	(s) => s.id !== saved.id,
																),
															),
														);
													}}
													className="text-accent hover:text-main"
												>
													<Trash2 className="w-4 h-4" />
												</button>
											</div>
										))}
									</div>
								</div>
							)}
						</div>
					)}
				</div>

				<div className="grid-system grid-1 lg:grid-3 gap-8">
					{/* Expression List */}
					<div className="space-y-4">
						<h2 className="neue-haas-grotesk-display text-xl text-main">
							エクスプレッション一覧
						</h2>

						<div className="space-y-3 max-h-96 overflow-y-auto rounded-xl bg-base/75 backdrop-blur-md shadow-[0_8px_24px_rgba(0,0,0,0.25)] p-4">
							{filteredExpressions.map((expr) => (
								<div
									key={expr.id}
									className={`p-3 rounded-lg bg-main/10 cursor-pointer hover:bg-main/20 transition-colors ${
										selectedExpression?.id === expr.id
											? "bg-accent text-main"
											: "bg-base text-main"
									}`}
								>
									<div className="flex items-start justify-between mb-2">
										<div
											className="flex-1"
											tabIndex={0}
											role="button"
											onClick={() => setSelectedExpression(expr)}
											onKeyDown={(e) => {
												if (e.key === "Enter" || e.key === " ") {
													e.preventDefault();
													setSelectedExpression(expr);
												}
											}}
										>
											<div className="flex items-center gap-2 mb-1">
												<span className="text-xs rounded-lg bg-main/10 px-2 py-1 noto-sans-jp-light">
													{CATEGORY_NAMES[expr.category]}
												</span>
												<span
													className={`text-xs px-2 py-1 border noto-sans-jp-light ${DIFFICULTY_COLORS[expr.difficulty]}`}
												>
													{DIFFICULTY_NAMES[expr.difficulty]}
												</span>
												{expr.usageCount && expr.usageCount > 0 && (
													<span className="text-xs bg-blue-100 text-blue-800 border border-blue-300 px-2 py-1 noto-sans-jp-light">
														使用回数: {expr.usageCount}
													</span>
												)}
											</div>
											<h3 className="text-sm noto-sans-jp-regular font-medium flex items-center gap-2">
												{expr.name}
												{expr.isFavorite && (
													<Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
												)}
											</h3>
											<p className="text-xs noto-sans-jp-light leading-relaxed mt-1">
												{expr.description}
											</p>
											{expr.tags && (
												<div className="flex flex-wrap gap-1 mt-2">
													{expr.tags.slice(0, 3).map((tag) => (
														<span
															key={tag}
															className="text-xs bg-gray-100 text-gray-700 px-1 py-0.5 rounded"
														>
															{tag}
														</span>
													))}
													{expr.tags.length > 3 && (
														<span className="text-xs text-accent">
															+{expr.tags.length - 3}
														</span>
													)}
												</div>
											)}
										</div>
										<button
											type="button"
											onClick={(e) => {
												e.stopPropagation();
												toggleFavorite(expr.id);
											}}
											className="ml-2 p-1 hover:bg-base hover:text-main rounded"
										>
											<Heart
												className={`w-4 h-4 ${expr.isFavorite ? "fill-red-500 text-red-500" : ""}`}
											/>
										</button>
									</div>
								</div>
							))}
							{filteredExpressions.length === 0 && (
								<div className="text-center py-8 text-accent noto-sans-jp-light">
									<Search className="w-8 h-8 mx-auto mb-2 opacity-50" />
									<p>条件に一致するエクスプレッションが見つかりません</p>
								</div>
							)}
						</div>
					</div>

					{/* Parameter Configuration */}
					<div className="space-y-4">
						<h2 className="neue-haas-grotesk-display text-xl text-main">
							パラメータ設定
						</h2>

						{selectedExpression ? (
							<div className="space-y-4 rounded-xl bg-base/75 backdrop-blur-md shadow-[0_8px_24px_rgba(0,0,0,0.25)] p-4">
								<div className="mb-4">
									<div className="flex items-center justify-between mb-2">
										<h3 className="text-lg noto-sans-jp-regular font-medium flex items-center gap-2">
											{selectedExpression.name}
											{selectedExpression.isFavorite && (
												<Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
											)}
										</h3>
										<div className="flex gap-2">
											<button
												type="button"
												onClick={() => toggleFavorite(selectedExpression.id)}
												className="p-2 rounded-lg bg-main/10 text-main hover:bg-main/20 focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-base"
											>
												<Heart
													className={`w-4 h-4 ${selectedExpression.isFavorite ? "fill-red-500 text-red-500" : ""}`}
												/>
											</button>
											<button
												type="button"
												onClick={() => setShowDocumentation(!showDocumentation)}
												className="p-2 rounded-lg bg-main/10 text-main hover:bg-main/20 focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-base"
											>
												<Info className="w-4 h-4" />
											</button>
										</div>
									</div>
									<p className="text-sm noto-sans-jp-light text-accent mb-2">
										{selectedExpression.description}
									</p>
									<div className="flex items-center gap-4 text-xs text-accent noto-sans-jp-light">
										<span>
											難易度: {DIFFICULTY_NAMES[selectedExpression.difficulty]}
										</span>
										<span>
											カテゴリ: {CATEGORY_NAMES[selectedExpression.category]}
										</span>
										{selectedExpression.usageCount && (
											<span>使用回数: {selectedExpression.usageCount}</span>
										)}
									</div>
								</div>

								{/* Documentation Panel */}
								{showDocumentation && selectedExpression.documentation && (
									<div className="rounded-xl bg-base/75 backdrop-blur-md shadow-[0_8px_24px_rgba(0,0,0,0.25)] p-4 mb-4">
										<h4 className="text-sm noto-sans-jp-regular font-medium mb-2 flex items-center gap-2">
											<BookOpen className="w-4 h-4" />
											詳細ドキュメント
										</h4>
										<p className="text-sm noto-sans-jp-light leading-relaxed text-main">
											{selectedExpression.documentation}
										</p>
										{selectedExpression.tags && (
											<div className="mt-3">
												<span className="text-xs noto-sans-jp-regular">
													タグ:{" "}
												</span>
												<div className="flex flex-wrap gap-1 mt-1">
													{selectedExpression.tags.map((tag) => (
														<span
															key={tag}
															className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded"
														>
															{tag}
														</span>
													))}
												</div>
											</div>
										)}
									</div>
								)}

								<div className="space-y-4">
									{selectedExpression.parameters.map((param) => (
										<div key={param.name} className="space-y-2">
											<label className="text-sm text-main noto-sans-jp-regular flex items-center gap-2">
												{param.name}
												{param.unit && (
													<span className="text-xs text-accent">
														({param.unit})
													</span>
												)}
											</label>
											<p className="text-xs text-accent noto-sans-jp-light">
												{param.description}
											</p>

											{param.type === "number" && (
												<div className="space-y-2">
													<input
														type="range"
														min={param.min}
														max={param.max}
														step={param.step}
														value={Number(
															parameterValues[param.name] ?? param.defaultValue,
														)}
														onChange={(e) =>
															updateParameter(
																param.name,
																parseFloat(e.target.value),
															)
														}
														className="w-full"
													/>
													<input
														type="number"
														min={param.min}
														max={param.max}
														step={param.step}
														value={Number(
															parameterValues[param.name] ?? param.defaultValue,
														)}
														onChange={(e) =>
															updateParameter(
																param.name,
																parseFloat(e.target.value),
															)
														}
														className="w-full px-3 py-2 rounded-lg bg-main/10 text-main focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-base"
													/>
												</div>
											)}

											{param.type === "select" && (
												<select
													value={String(
														parameterValues[param.name] ?? param.defaultValue,
													)}
													onChange={(e) =>
														updateParameter(param.name, e.target.value)
													}
													className="w-full px-3 py-2 rounded-lg bg-main/10 text-main focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-base"
												>
													{param.options?.map((option) => (
														<option key={option} value={option}>
															{option}
														</option>
													))}
												</select>
											)}

											{param.type === "boolean" && (
												<label className="flex items-center gap-2">
													<input
														type="checkbox"
														checked={Boolean(
															parameterValues[param.name] ?? param.defaultValue,
														)}
														onChange={(e) =>
															updateParameter(param.name, e.target.checked)
														}
														className="w-4 h-4"
													/>
													<span className="text-sm noto-sans-jp-light">
														有効
													</span>
												</label>
											)}

											{param.type === "string" && (
												<input
													type="text"
													value={String(
														parameterValues[param.name] ?? param.defaultValue,
													)}
													onChange={(e) =>
														updateParameter(param.name, e.target.value)
													}
													className="w-full px-3 py-2 rounded-lg bg-main/10 text-main focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-base"
												/>
											)}
										</div>
									))}
								</div>
							</div>
						) : (
							<div className="rounded-xl bg-base/75 backdrop-blur-md shadow-[0_8px_24px_rgba(0,0,0,0.25)] p-8 text-center">
								<p className="text-accent noto-sans-jp-light">
									左側からエクスプレッションを選択してください
								</p>
							</div>
						)}
					</div>

					{/* Code Preview and Output */}
					<div className="space-y-4">
						<div className="flex items-center justify-between">
							<h2 className="neue-haas-grotesk-display text-xl text-main">
								生成されたコード
							</h2>
							<div className="flex gap-2">
								<button
									type="button"
									onClick={() => setIsPreviewPlaying(!isPreviewPlaying)}
									className="px-3 py-2 rounded-lg bg-main/10 text-main hover:bg-main/20 focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-base flex items-center gap-2 noto-sans-jp-light"
								>
									{isPreviewPlaying ? (
										<Pause className="w-4 h-4" />
									) : (
										<Play className="w-4 h-4" />
									)}
									{isPreviewPlaying ? "停止" : "再生"}
								</button>
								<button
									type="button"
									onClick={() => {
										setPreviewTime(0);
										setIsPreviewPlaying(false);
									}}
									className="px-3 py-2 rounded-lg bg-main/10 text-main hover:bg-main/20 focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-base flex items-center gap-2 noto-sans-jp-light"
								>
									<RotateCcw className="w-4 h-4" />
									リセット
								</button>
								<button
									type="button"
									onClick={saveExpression}
									disabled={!selectedExpression || !generatedCode}
									className="px-3 py-2 rounded-lg bg-main/10 text-main hover:bg-main/20 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-base flex items-center gap-2 noto-sans-jp-light"
								>
									<Save className="w-4 h-4" />
									保存
								</button>
								<button
									type="button"
									onClick={exportExpression}
									disabled={!generatedCode}
									className="px-3 py-2 rounded-lg bg-main/10 text-main hover:bg-main/20 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-base flex items-center gap-2 noto-sans-jp-light"
								>
									<Download className="w-4 h-4" />
									エクスポート
								</button>
								<button
									type="button"
									onClick={copyToClipboard}
									disabled={!generatedCode}
									className={`px-4 py-2 rounded-lg bg-main/10 hover:bg-main/20 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-base flex items-center gap-2 noto-sans-jp-regular ${
										copySuccess
											? "bg-green-100 text-green-800 border-green-300"
											: "bg-base text-main"
									}`}
								>
									{copySuccess ? (
										<CheckCircle className="w-4 h-4" />
									) : (
										<Copy className="w-4 h-4" />
									)}
									{copySuccess ? "コピー完了" : "コピー"}
								</button>
							</div>
						</div>

						{/* Validation Results */}
						{generatedCode && (
							<div className="space-y-2">
								{validationResult.errors.length > 0 && (
									<div className="border border-red-300 bg-red-50 p-3">
										<div className="flex items-center gap-2 mb-2">
											<AlertCircle className="w-4 h-4 text-red-600" />
											<span className="text-sm noto-sans-jp-regular text-red-800">
												エラー
											</span>
										</div>
										<ul className="text-sm noto-sans-jp-light text-red-700 space-y-1">
											{validationResult.errors.map((error, index) => (
												<li key={index}>• {error}</li>
											))}
										</ul>
									</div>
								)}

								{validationResult.warnings.length > 0 && (
									<div className="border border-yellow-300 bg-yellow-50 p-3">
										<div className="flex items-center gap-2 mb-2">
											<AlertCircle className="w-4 h-4 text-yellow-600" />
											<span className="text-sm noto-sans-jp-regular text-yellow-800">
												警告
											</span>
										</div>
										<ul className="text-sm noto-sans-jp-light text-yellow-700 space-y-1">
											{validationResult.warnings.map((warning, index) => (
												<li key={index}>• {warning}</li>
											))}
										</ul>
									</div>
								)}

								{validationResult.isValid &&
									validationResult.warnings.length === 0 && (
										<div className="border border-green-300 bg-green-50 p-3">
											<div className="flex items-center gap-2">
												<CheckCircle className="w-4 h-4 text-green-600" />
												<span className="text-sm noto-sans-jp-regular text-green-800">
													エクスプレッションは正常です
												</span>
											</div>
										</div>
									)}
							</div>
						)}

						<div className="rounded-xl bg-base/75 backdrop-blur-md shadow-[0_8px_24px_rgba(0,0,0,0.25)] p-4 min-h-32">
							<pre className="whitespace-pre-wrap text-sm text-main noto-sans-jp-light leading-relaxed font-mono">
								{generatedCode || "エクスプレッションを選択してください..."}
							</pre>
						</div>

						{/* Preview Time Display */}
						{selectedExpression && (
							<div className="rounded-xl bg-base/75 backdrop-blur-md shadow-[0_8px_24px_rgba(0,0,0,0.25)] p-4">
								<div className="flex items-center justify-between mb-2">
									<span className="text-sm noto-sans-jp-regular">
										プレビュー時間
									</span>
									<span className="text-sm noto-sans-jp-light font-mono">
										{previewTime.toFixed(1)}s
									</span>
								</div>
								<div className="text-xs text-accent noto-sans-jp-light">
									実際のAfter
									Effectsでは、このエクスプレッションが時間に応じて値を変化させます.
								</div>
							</div>
						)}

						{/* Example Display */}
						{selectedExpression && (
							<div className="rounded-xl bg-base/75 backdrop-blur-md shadow-[0_8px_24px_rgba(0,0,0,0.25)] p-4">
								<h3 className="text-sm noto-sans-jp-regular mb-2">使用例</h3>
								<pre className="text-xs text-accent noto-sans-jp-light font-mono">
									{selectedExpression.example}
								</pre>
							</div>
						)}
					</div>
				</div>
			</div>
		</ToolWrapper>
	);
}
