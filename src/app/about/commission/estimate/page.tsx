"use client";

import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { Calculator, Copy, RefreshCw } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

interface EstimateForm {
  videoType: string;
  duration: string;
  quality: string;
  editing: string[];
  deadline: string;
}

interface PricingResult {
  basePrice: number;
  qualityMultiplier: number;
  editingPrice: number;
  deadlineMultiplier: number;
  total: number;
  breakdown: {
    base: number;
    quality: number;
    editing: number;
    deadline: number;
  };
}

const VIDEO_TYPES = [
  { value: "mv-cover", label: "歌ってみたMV", basePrice: 5000 },
  { value: "mv-original", label: "オリジナルMV", basePrice: 6000 },
  {
    value: "short-video",
    label: "OP/ED/トランジション（20秒以内）",
    basePrice: 1000,
  },
  { value: "lyric-motion", label: "リリックモーション", basePrice: 4000 },
  {
    value: "illustration-animation",
    label: "イラストアニメーション",
    basePrice: 5500,
  },
  { value: "promotion", label: "プロモーション映像", basePrice: 8000 },
];

const DURATIONS = [
  { value: "30s", label: "30秒", multiplier: 0.5 },
  { value: "1m", label: "1分", multiplier: 1.0 },
  { value: "2m", label: "2分", multiplier: 1.5 },
  { value: "3m", label: "3分", multiplier: 2.0 },
  { value: "5m", label: "5分", multiplier: 3.0 },
  { value: "10m", label: "10分", multiplier: 5.0 },
  { value: "custom", label: "その他", multiplier: 1.0 },
];

const QUALITY_LEVELS = [
  { value: "standard", label: "標準", multiplier: 1.0 },
  { value: "high", label: "高品質", multiplier: 1.3 },
  { value: "premium", label: "最高品質", multiplier: 1.6 },
];

const EDITING_OPTIONS = [
  { value: "basic", label: "基本的な編集", price: 0 },
  { value: "effects", label: "エフェクト追加", price: 2000 },
  { value: "animation", label: "アニメーション制作", price: 3000 },
  { value: "3dcg", label: "3DCG制作", price: 5000 },
  { value: "color-grading", label: "カラーグレーディング", price: 1500 },
];

const DEADLINES = [
  { value: "1week", label: "1週間", multiplier: 2.0 },
  { value: "2weeks", label: "2週間", multiplier: 1.5 },
  { value: "1month", label: "1ヶ月", multiplier: 1.0 },
  { value: "2months", label: "2ヶ月", multiplier: 0.9 },
  { value: "flexible", label: "その他", multiplier: 1.0 },
];

export default function EstimatePage() {
  const [form, setForm] = useState<EstimateForm>({
    videoType: "",
    duration: "",
    quality: "standard",
    editing: ["basic"],
    deadline: "1month",
  });

  const [result, setResult] = useState<PricingResult | null>(null);

  const calculatePrice = useCallback((): PricingResult => {
    const videoType = VIDEO_TYPES.find((v) => v.value === form.videoType);
    const duration = DURATIONS.find((d) => d.value === form.duration);
    const quality = QUALITY_LEVELS.find((q) => q.value === form.quality);
    const deadline = DEADLINES.find((d) => d.value === form.deadline);

    if (!videoType || !duration || !quality || !deadline) {
      return {
        basePrice: 0,
        qualityMultiplier: 1,
        editingPrice: 0,
        deadlineMultiplier: 1,
        total: 0,
        breakdown: { base: 0, quality: 0, editing: 0, deadline: 0 },
      };
    }

    const basePrice = videoType.basePrice * duration.multiplier;
    const qualityPrice = basePrice * (quality.multiplier - 1);
    const editingPrice = form.editing.reduce((sum, editingValue) => {
      const editing = EDITING_OPTIONS.find((e) => e.value === editingValue);
      return sum + (editing?.price || 0);
    }, 0);
    const deadlinePrice = basePrice * (deadline.multiplier - 1);

    const total = basePrice + qualityPrice + editingPrice + deadlinePrice;

    return {
      basePrice,
      qualityMultiplier: quality.multiplier,
      editingPrice,
      deadlineMultiplier: deadline.multiplier,
      total,
      breakdown: {
        base: basePrice,
        quality: qualityPrice,
        editing: editingPrice,
        deadline: deadlinePrice,
      },
    };
  }, [form]);

  useEffect(() => {
    if (form.videoType && form.duration) {
      setResult(calculatePrice());
    }
  }, [form, calculatePrice]);

  const handleEditingChange = (value: string, checked: boolean) => {
    if (value === "basic") return; // Basic editing is always included

    setForm((prev) => ({
      ...prev,
      editing: checked
        ? [...prev.editing, value]
        : prev.editing.filter((e) => e !== value),
    }));
  };

  const resetForm = () => {
    setForm({
      videoType: "",
      duration: "",
      quality: "standard",
      editing: ["basic"],
      deadline: "1month",
    });
    setResult(null);
  };

  const copyResult = async () => {
    if (!result) return;

    const text = `映像制作見積もり結果
映像の種類: ${VIDEO_TYPES.find((v) => v.value === form.videoType)?.label}
長さ: ${DURATIONS.find((d) => d.value === form.duration)?.label}
品質: ${QUALITY_LEVELS.find((q) => q.value === form.quality)?.label}
編集内容: ${form.editing.map((e) => EDITING_OPTIONS.find((opt) => opt.value === e)?.label).join(", ")}
納期: ${DEADLINES.find((d) => d.value === form.deadline)?.label}

料金内訳:
基本料金: ¥${result.breakdown.base.toLocaleString()}
品質料金: ¥${result.breakdown.quality.toLocaleString()}
編集料金: ¥${result.breakdown.editing.toLocaleString()}
納期料金: ¥${result.breakdown.deadline.toLocaleString()}

合計: ¥${result.total.toLocaleString()}

※この見積もりは目安です。詳細はお問い合わせください。`;

    try {
      await navigator.clipboard.writeText(text);
      alert("見積もり結果をコピーしました");
    } catch (error) {
      console.error("Failed to copy to clipboard:", error);
      alert("コピーに失敗しました");
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <main className="flex items-center py-10">
        <div className="container-system">
          <div className="space-y-10">
            {/* Breadcrumbs */}
            <Breadcrumbs
              items={[
                { label: "Home", href: "/" },
                { label: "About", href: "/about" },
                { label: "Commission", href: "/about/commission" },
                { label: "Estimate", isCurrent: true },
              ]}
              className="pt-4"
            />

            {/* Header */}
            <header className="space-y-12">
              <h1 className="neue-haas-grotesk-display text-6xl text-primary">
                映像制作見積もり計算機
              </h1>
              <p className="noto-sans-jp-light text-sm max-w leading-loose">
                映像制作の見積もりを自動計算します.
                <br />
                料金の目安を事前に確認できます.
              </p>
            </header>

            <div className="grid-system grid-1 lg:grid-2 gap-8">
              {/* Form */}
              <div className="space-y-6">
                <div className="bg-base border border-foreground p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="neue-haas-grotesk-display text-3xl text-primary">
                      見積もりフォーム
                    </h2>
                    <button
                      onClick={resetForm}
                      className="flex items-center text-accent border border-accent px-2 py-1 text-sm noto-sans-jp-light"
                    >
                      <RefreshCw className="w-4 h-4 mr-1" />
                      リセット
                    </button>
                  </div>

                  {/* Video Type */}
                  <div className="mb-6">
                    <label
                      htmlFor="videoType"
                      className="block zen-kaku-gothic-new text-lg text-primary mb-2"
                    >
                      映像の種類 *
                    </label>
                    <select
                      id="videoType"
                      value={form.videoType}
                      onChange={(e) =>
                        setForm((prev) => ({
                          ...prev,
                          videoType: e.target.value,
                        }))
                      }
                      className="w-full p-3 bg-background border border-foreground text-foreground noto-sans-jp-light text-sm"
                      required
                    >
                      <option value="">選択してください</option>
                      {VIDEO_TYPES.map((type) => (
                        <option key={type.value} value={type.value}>
                          {type.label} (基本料金: ¥
                          {type.basePrice.toLocaleString()})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Duration */}
                  <div className="mb-6">
                    <label
                      htmlFor="duration"
                      className="block zen-kaku-gothic-new text-lg text-primary mb-2"
                    >
                      映像の長さ *
                    </label>
                    <select
                      id="duration"
                      value={form.duration}
                      onChange={(e) =>
                        setForm((prev) => ({
                          ...prev,
                          duration: e.target.value,
                        }))
                      }
                      className="w-full p-3 bg-background border border-foreground text-foreground noto-sans-jp-light text-sm"
                      required
                    >
                      <option value="">選択してください</option>
                      {DURATIONS.map((duration) => (
                        <option key={duration.value} value={duration.value}>
                          {duration.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Quality */}
                  <div className="mb-6">
                    <label className="block zen-kaku-gothic-new text-lg text-primary mb-2">
                      品質レベル
                    </label>
                    <div className="space-y-2">
                      {QUALITY_LEVELS.map((quality) => (
                        <label
                          key={quality.value}
                          className="flex items-center"
                        >
                          <input
                            type="radio"
                            name="quality"
                            value={quality.value}
                            checked={form.quality === quality.value}
                            onChange={(e) =>
                              setForm((prev) => ({
                                ...prev,
                                quality: e.target.value,
                              }))
                            }
                            className="mr-2"
                          />
                          <span className="noto-sans-jp-light text-sm text-foreground">
                            {quality.label} (×{quality.multiplier})
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Editing */}
                  <div className="mb-6">
                    <label className="block zen-kaku-gothic-new text-lg text-primary mb-2">
                      編集内容
                    </label>
                    <div className="space-y-2">
                      {EDITING_OPTIONS.map((editing) => (
                        <label
                          key={editing.value}
                          className="flex items-center"
                        >
                          <input
                            type="checkbox"
                            checked={form.editing.includes(editing.value)}
                            onChange={(e) =>
                              handleEditingChange(
                                editing.value,
                                e.target.checked,
                              )
                            }
                            disabled={editing.value === "basic"}
                            className="mr-2"
                          />
                          <span className="noto-sans-jp-light text-sm text-foreground">
                            {editing.label}
                            {editing.price > 0 &&
                              ` (+¥${editing.price.toLocaleString()})`}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Deadline */}
                  <div className="mb-6">
                    <label
                      htmlFor="deadline"
                      className="block zen-kaku-gothic-new text-lg text-primary mb-2"
                    >
                      納期
                    </label>
                    <select
                      id="deadline"
                      value={form.deadline}
                      onChange={(e) =>
                        setForm((prev) => ({
                          ...prev,
                          deadline: e.target.value,
                        }))
                      }
                      className="w-full p-3 bg-background border border-foreground text-foreground noto-sans-jp-light text-sm"
                    >
                      {DEADLINES.map((deadline) => (
                        <option key={deadline.value} value={deadline.value}>
                          {deadline.label}{" "}
                          {deadline.multiplier !== 1.0 &&
                            `(×${deadline.multiplier})`}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Result */}
              <div className="space-y-6">
                {result && result.total > 0 ? (
                  <div className="bg-base border border-foreground p-4">
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="neue-haas-grotesk-display text-3xl text-primary">
                        見積もり結果
                      </h2>
                      <Calculator className="w-6 h-6 text-accent" />
                    </div>

                    {/* Total */}
                    <div className="bg-background border border-accent p-4 mb-4">
                      <div className="text-center">
                        <p className="noto-sans-jp-light text-sm text-foreground mb-1">
                          合計金額
                        </p>
                        <p className="neue-haas-grotesk-display text-4xl text-accent">
                          ¥{result.total.toLocaleString()}
                        </p>
                      </div>
                    </div>

                    {/* Breakdown */}
                    <div className="space-y-3 mb-6">
                      <h3 className="zen-kaku-gothic-new text-lg text-primary">
                        料金内訳
                      </h3>

                      <div className="flex justify-between">
                        <span className="noto-sans-jp-light text-sm text-foreground">
                          基本料金
                        </span>
                        <span className="noto-sans-jp-light text-sm text-foreground">
                          ¥{result.breakdown.base.toLocaleString()}
                        </span>
                      </div>

                      {result.breakdown.quality > 0 && (
                        <div className="flex justify-between">
                          <span className="noto-sans-jp-light text-sm text-foreground">
                            品質料金
                          </span>
                          <span className="noto-sans-jp-light text-sm text-foreground">
                            ¥{result.breakdown.quality.toLocaleString()}
                          </span>
                        </div>
                      )}

                      {result.breakdown.editing > 0 && (
                        <div className="flex justify-between">
                          <span className="noto-sans-jp-light text-sm text-foreground">
                            編集料金
                          </span>
                          <span className="noto-sans-jp-light text-sm text-foreground">
                            ¥{result.breakdown.editing.toLocaleString()}
                          </span>
                        </div>
                      )}

                      {result.breakdown.deadline > 0 && (
                        <div className="flex justify-between">
                          <span className="noto-sans-jp-light text-sm text-foreground">
                            納期料金
                          </span>
                          <span className="noto-sans-jp-light text-sm text-foreground">
                            ¥{result.breakdown.deadline.toLocaleString()}
                          </span>
                        </div>
                      )}

                      <hr className="border-foreground my-2" />
                      <div className="flex justify-between">
                        <span className="zen-kaku-gothic-new text-base text-primary">
                          合計
                        </span>
                        <span className="zen-kaku-gothic-new text-base text-accent">
                          ¥{result.total.toLocaleString()}
                        </span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col sm:flex-row gap-3">
                      <button
                        onClick={copyResult}
                        className="flex items-center justify-center border border-foreground text-center p-4 noto-sans-jp-regular text-base leading-snug"
                      >
                        <Copy className="w-4 h-4 mr-2" />
                        コピー
                      </button>
                    </div>

                    <div className="mt-6 bg-base border border-accent p-4">
                      <p className="noto-sans-jp-light text-sm text-accent">
                        ※この見積もりは目安です。実際の料金は詳細な要件により変動する場合があります。
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="bg-base border border-foreground p-4 text-center">
                    <Calculator className="w-12 h-12 text-foreground mx-auto mb-4" />
                    <p className="noto-sans-jp-light text-sm text-foreground">
                      映像の種類と長さを選択すると
                      <br />
                      見積もりが表示されます
                    </p>
                  </div>
                )}

                {/* Contact CTA */}
                <div className="bg-base border border-foreground p-4">
                  <h3 className="zen-kaku-gothic-new text-lg text-primary mb-3">
                    正式なお見積もりをご希望の方
                  </h3>
                  <p className="noto-sans-jp-light text-sm text-foreground mb-4">
                    より詳細な見積もりや、ご不明な点がございましたらお気軽にお問い合わせください。
                  </p>
                  <div className="grid-system grid-1 xs:grid-2 sm:grid-2 md:grid-2 gap-3">
                    <Link
                      href="/contact"
                      className="border border-foreground text-center p-4 flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-foreground focus:ring-offset-2 focus:ring-offset-background"
                    >
                      <span className="noto-sans-jp-regular text-base leading-snug">
                        お問い合わせ
                      </span>
                    </Link>
                    <Link
                      href="/about/commission/video"
                      className="border border-foreground text-center p-4 flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-foreground focus:ring-offset-2 focus:ring-offset-background"
                    >
                      <span className="noto-sans-jp-regular text-base leading-snug">
                        映像依頼について
                      </span>
                    </Link>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <footer className="pt-4 border-t border-foreground">
              <div className="text-center">
                <p className="shippori-antique-b1-regular text-sm inline-block">
                  © 2025 samuido - Estimate Calculator
                </p>
              </div>
            </footer>
          </div>
        </div>
      </main>
    </div>
  );
}
