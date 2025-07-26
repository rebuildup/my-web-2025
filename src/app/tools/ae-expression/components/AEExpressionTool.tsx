"use client";

import { useState, useCallback, useEffect } from "react";
import ToolWrapper from "../../components/ToolWrapper";
import { Copy, Search, Heart, Play, Pause, RotateCcw } from "lucide-react";

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
}

// Comprehensive AE Expression Database
const AE_EXPRESSIONS: AEExpression[] = [
  // Animation expressions
  {
    id: "wiggle",
    category: "animation",
    name: "Wiggle",
    description: "ランダムな動きを生成します。自然な揺れやノイズ効果に最適。",
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
  },
  {
    id: "loopOut",
    category: "animation",
    name: "Loop Out",
    description: "アニメーションをループさせます。キーフレーム後の動作を制御。",
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
  },
  {
    id: "time-rotation",
    category: "animation",
    name: "Time-based Rotation",
    description: "時間に基づいた回転アニメーション。一定速度での回転に使用。",
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
    description: "バウンス効果を作成。弾むような動きを表現。",
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
    description: "サイン波を使った周期的な動き。波のような滑らかな動作。",
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
    description: "ランダムな値を生成。シード値で再現可能なランダム性。",
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
    description: "脈動するスケールアニメーション。ハートビートのような効果。",
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
    description: "点滅効果。ランダムまたは規則的な明滅を作成。",
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
    description: "値を指定範囲内に制限。最小値と最大値の間に値を収める。",
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
  },
  {
    id: "linear-interpolation",
    category: "utility",
    name: "Linear Interpolation",
    description: "線形補間。時間に基づいて値を滑らかに変化させる。",
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
  const [expressions] = useState<AEExpression[]>(AE_EXPRESSIONS);
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

  // Filter expressions
  const filteredExpressions = expressions.filter((expr) => {
    const matchesSearch =
      expr.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      expr.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      selectedCategory === "all" || expr.category === selectedCategory;
    const matchesDifficulty =
      selectedDifficulty === "all" || expr.difficulty === selectedDifficulty;
    const matchesFavorites = !showFavoritesOnly || expr.isFavorite;

    return (
      matchesSearch && matchesCategory && matchesDifficulty && matchesFavorites
    );
  });

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

  // Update generated code when parameters change
  useEffect(() => {
    const code = generateCode();
    setGeneratedCode(code);
  }, [generateCode]);

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
    []
  );

  // Copy to clipboard
  const copyToClipboard = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(generatedCode);
      // Show success feedback
    } catch (error) {
      console.error("Failed to copy to clipboard:", error);
    }
  }, [generatedCode]);

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
      }
    };

    document.addEventListener(
      "toolShortcut",
      handleToolShortcut as EventListener
    );
    return () =>
      document.removeEventListener(
        "toolShortcut",
        handleToolShortcut as EventListener
      );
  }, [generatedCode, isPreviewPlaying, copyToClipboard]);

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
      description="AfterEffectsのエクスプレッションをScratch風ブロックUIで簡単に設定。アニメーション、エフェクト、変形などのエクスプレッションを一覧表示。"
      category="Design"
      keyboardShortcuts={[
        { key: "c", description: "コードをコピー" },
        { key: "p", description: "プレビュー再生/停止" },
        { key: "r", description: "プレビューリセット" },
      ]}
    >
      <div className="space-y-8">
        {/* Controls */}
        <div className="space-y-4">
          <div className="flex flex-wrap gap-4 items-center">
            <div className="relative flex-1 min-w-64">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-accent" />
              <input
                type="text"
                placeholder="エクスプレッションを検索..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-foreground bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
              />
            </div>

            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-2 border border-foreground bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
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
              className="px-4 py-2 border border-foreground bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
            >
              <option value="all">全難易度</option>
              <option value="beginner">初級</option>
              <option value="intermediate">中級</option>
              <option value="advanced">上級</option>
            </select>

            <button
              onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
              className={`px-4 py-2 border border-foreground flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-accent noto-sans-jp-light ${
                showFavoritesOnly
                  ? "bg-accent text-background"
                  : "bg-background text-foreground"
              }`}
            >
              <Heart className="w-4 h-4" />
              お気に入りのみ
            </button>
          </div>
        </div>

        <div className="grid-system grid-1 lg:grid-3 gap-8">
          {/* Expression List */}
          <div className="space-y-4">
            <h2 className="neue-haas-grotesk-display text-xl text-primary">
              エクスプレッション一覧
            </h2>

            <div className="space-y-3 max-h-96 overflow-y-auto border border-foreground p-4">
              {filteredExpressions.map((expr) => (
                <div
                  key={expr.id}
                  onClick={() => setSelectedExpression(expr)}
                  className={`p-3 border border-foreground cursor-pointer hover:bg-accent hover:text-background transition-colors ${
                    selectedExpression?.id === expr.id
                      ? "bg-accent text-background"
                      : "bg-base text-foreground"
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs bg-background border border-foreground px-2 py-1 noto-sans-jp-light">
                          {CATEGORY_NAMES[expr.category]}
                        </span>
                        <span
                          className={`text-xs px-2 py-1 border noto-sans-jp-light ${DIFFICULTY_COLORS[expr.difficulty]}`}
                        >
                          {DIFFICULTY_NAMES[expr.difficulty]}
                        </span>
                      </div>
                      <h3 className="text-sm noto-sans-jp-regular font-medium">
                        {expr.name}
                      </h3>
                      <p className="text-xs noto-sans-jp-light leading-relaxed mt-1">
                        {expr.description}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Parameter Configuration */}
          <div className="space-y-4">
            <h2 className="neue-haas-grotesk-display text-xl text-primary">
              パラメータ設定
            </h2>

            {selectedExpression ? (
              <div className="space-y-4 border border-foreground p-4">
                <div className="mb-4">
                  <h3 className="text-lg noto-sans-jp-regular font-medium mb-2">
                    {selectedExpression.name}
                  </h3>
                  <p className="text-sm noto-sans-jp-light text-accent">
                    {selectedExpression.description}
                  </p>
                </div>

                <div className="space-y-4">
                  {selectedExpression.parameters.map((param) => (
                    <div key={param.name} className="space-y-2">
                      <label className="text-sm text-foreground noto-sans-jp-regular flex items-center gap-2">
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
                              parameterValues[param.name] ?? param.defaultValue
                            )}
                            onChange={(e) =>
                              updateParameter(
                                param.name,
                                parseFloat(e.target.value)
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
                              parameterValues[param.name] ?? param.defaultValue
                            )}
                            onChange={(e) =>
                              updateParameter(
                                param.name,
                                parseFloat(e.target.value)
                              )
                            }
                            className="w-full px-3 py-2 border border-foreground bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
                          />
                        </div>
                      )}

                      {param.type === "select" && (
                        <select
                          value={String(
                            parameterValues[param.name] ?? param.defaultValue
                          )}
                          onChange={(e) =>
                            updateParameter(param.name, e.target.value)
                          }
                          className="w-full px-3 py-2 border border-foreground bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
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
                              parameterValues[param.name] ?? param.defaultValue
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
                            parameterValues[param.name] ?? param.defaultValue
                          )}
                          onChange={(e) =>
                            updateParameter(param.name, e.target.value)
                          }
                          className="w-full px-3 py-2 border border-foreground bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
                        />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="border border-foreground p-8 text-center">
                <p className="text-accent noto-sans-jp-light">
                  左側からエクスプレッションを選択してください
                </p>
              </div>
            )}
          </div>

          {/* Code Preview and Output */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="neue-haas-grotesk-display text-xl text-primary">
                生成されたコード
              </h2>
              <div className="flex gap-2">
                <button
                  onClick={() => setIsPreviewPlaying(!isPreviewPlaying)}
                  className="px-3 py-2 border border-foreground bg-background text-foreground hover:bg-accent hover:text-background focus:outline-none focus:ring-2 focus:ring-accent flex items-center gap-2 noto-sans-jp-light"
                >
                  {isPreviewPlaying ? (
                    <Pause className="w-4 h-4" />
                  ) : (
                    <Play className="w-4 h-4" />
                  )}
                  {isPreviewPlaying ? "停止" : "再生"}
                </button>
                <button
                  onClick={() => {
                    setPreviewTime(0);
                    setIsPreviewPlaying(false);
                  }}
                  className="px-3 py-2 border border-foreground bg-background text-foreground hover:bg-accent hover:text-background focus:outline-none focus:ring-2 focus:ring-accent flex items-center gap-2 noto-sans-jp-light"
                >
                  <RotateCcw className="w-4 h-4" />
                  リセット
                </button>
                <button
                  onClick={copyToClipboard}
                  disabled={!generatedCode}
                  className="px-4 py-2 border border-foreground bg-background text-foreground hover:bg-accent hover:text-background disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-accent flex items-center gap-2 noto-sans-jp-regular"
                >
                  <Copy className="w-4 h-4" />
                  コピー
                </button>
              </div>
            </div>

            <div className="border border-foreground p-4 bg-base min-h-32">
              <pre className="whitespace-pre-wrap text-sm text-foreground noto-sans-jp-light leading-relaxed font-mono">
                {generatedCode || "エクスプレッションを選択してください..."}
              </pre>
            </div>

            {/* Preview Time Display */}
            {selectedExpression && (
              <div className="border border-foreground p-4 bg-base">
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
                  Effectsでは、このエクスプレッションが時間に応じて値を変化させます。
                </div>
              </div>
            )}

            {/* Example Display */}
            {selectedExpression && (
              <div className="border border-foreground p-4 bg-base">
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
