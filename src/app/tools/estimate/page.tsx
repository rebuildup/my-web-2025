"use client";

import { useState } from "react";
import Card from "@/components/Card";
import Button from "@/components/Button";
import type { Metadata } from "next";

interface EstimateData {
  projectType: string;
  complexity: "simple" | "medium" | "complex";
  pages: number;
  features: string[];
  deadline: "normal" | "urgent";
  maintenance: boolean;
}

export const metadata: Metadata = {
  title: "見積り計算機 | Tools | samuido",
  description:
    "samuidoのWeb制作見積り計算機。プロジェクトの規模と要件に基づいて自動的に見積りを算出。",
  keywords: ["samuido", "見積り計算機", "Web制作", "見積り", "料金計算"],
  openGraph: {
    title: "見積り計算機 | Tools | samuido",
    description:
      "samuidoのWeb制作見積り計算機。プロジェクトの規模と要件に基づいて自動的に見積りを算出。",
    url: "https://yusuke-kim.com/tools/estimate",
  },
  twitter: {
    title: "見積り計算機 | Tools | samuido",
    description:
      "samuidoのWeb制作見積り計算機。プロジェクトの規模と要件に基づいて自動的に見積りを算出。",
  },
};

export default function EstimatePage() {
  const [estimate, setEstimate] = useState<EstimateData>({
    projectType: "",
    complexity: "medium",
    pages: 1,
    features: [],
    deadline: "normal",
    maintenance: false,
  });

  const [result, setResult] = useState<number | null>(null);

  const projectTypes = [
    { id: "landing", name: "ランディングページ", basePrice: 50000 },
    { id: "corporate", name: "コーポレートサイト", basePrice: 150000 },
    { id: "ecommerce", name: "ECサイト", basePrice: 300000 },
    { id: "webapp", name: "Webアプリケーション", basePrice: 500000 },
    { id: "custom", name: "カスタム開発", basePrice: 200000 },
  ];

  const complexityMultiplier = {
    simple: 0.7,
    medium: 1.0,
    complex: 1.5,
  };

  const deadlineMultiplier = {
    normal: 1.0,
    urgent: 1.3,
  };

  const additionalFeatures = [
    { id: "cms", name: "CMS機能", price: 50000 },
    { id: "multilang", name: "多言語対応", price: 80000 },
    { id: "seo", name: "SEO最適化", price: 30000 },
    { id: "analytics", name: "アクセス解析", price: 20000 },
    { id: "responsive", name: "レスポンシブ対応", price: 40000 },
    { id: "animation", name: "アニメーション", price: 60000 },
    { id: "api", name: "API連携", price: 100000 },
    { id: "payment", name: "決済機能", price: 120000 },
  ];

  const calculateEstimate = () => {
    const selectedProject = projectTypes.find(
      (p) => p.id === estimate.projectType
    );
    if (!selectedProject) return;

    let total = selectedProject.basePrice;

    // ページ数による調整（2ページ目以降は基本料金の10%ずつ追加）
    if (estimate.pages > 1) {
      total += selectedProject.basePrice * 0.1 * (estimate.pages - 1);
    }

    // 複雑度による調整
    total *= complexityMultiplier[estimate.complexity];

    // 追加機能による調整
    const featureCost = estimate.features.reduce((sum, featureId) => {
      const feature = additionalFeatures.find((f) => f.id === featureId);
      return sum + (feature?.price || 0);
    }, 0);
    total += featureCost;

    // 納期による調整
    total *= deadlineMultiplier[estimate.deadline];

    // 保守契約
    if (estimate.maintenance) {
      total += total * 0.15; // 年間保守費用として15%追加
    }

    setResult(Math.round(total));
  };

  const handleFeatureToggle = (featureId: string) => {
    setEstimate((prev) => ({
      ...prev,
      features: prev.features.includes(featureId)
        ? prev.features.filter((f) => f !== featureId)
        : [...prev.features, featureId],
    }));
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-6">
            見積り計算機
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            プロジェクトの要件を入力して、自動的に見積りを算出します。
          </p>
        </div>

        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Calculator Form */}
            <Card className="p-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                プロジェクト詳細
              </h2>

              {/* Project Type */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  プロジェクトタイプ
                </label>
                <div className="grid grid-cols-1 gap-3">
                  {projectTypes.map((type) => (
                    <button
                      key={type.id}
                      onClick={() =>
                        setEstimate((prev) => ({
                          ...prev,
                          projectType: type.id,
                        }))
                      }
                      className={`p-4 text-left rounded-lg border-2 transition-all ${
                        estimate.projectType === type.id
                          ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                          : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
                      }`}
                    >
                      <div className="font-semibold text-gray-900 dark:text-white">
                        {type.name}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        基本料金: ¥{type.basePrice.toLocaleString()}〜
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Pages */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  ページ数
                </label>
                <input
                  type="number"
                  min="1"
                  max="50"
                  value={estimate.pages}
                  onChange={(e) =>
                    setEstimate((prev) => ({
                      ...prev,
                      pages: parseInt(e.target.value) || 1,
                    }))
                  }
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-white"
                />
              </div>

              {/* Complexity */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  複雑度
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { id: "simple", name: "シンプル", desc: "基本的な機能のみ" },
                    { id: "medium", name: "標準", desc: "一般的な機能" },
                    { id: "complex", name: "複雑", desc: "高度な機能" },
                  ].map((complexity) => (
                    <button
                      key={complexity.id}
                      onClick={() =>
                        setEstimate((prev) => ({
                          ...prev,
                          complexity: complexity.id as any,
                        }))
                      }
                      className={`p-3 text-center rounded-lg border-2 transition-all ${
                        estimate.complexity === complexity.id
                          ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                          : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
                      }`}
                    >
                      <div className="font-medium text-gray-900 dark:text-white">
                        {complexity.name}
                      </div>
                      <div className="text-xs text-gray-600 dark:text-gray-400">
                        {complexity.desc}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Additional Features */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  追加機能
                </label>
                <div className="grid grid-cols-1 gap-3">
                  {additionalFeatures.map((feature) => (
                    <label
                      key={feature.id}
                      className="flex items-center p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={estimate.features.includes(feature.id)}
                        onChange={() => handleFeatureToggle(feature.id)}
                        className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <div className="ml-3 flex-1">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {feature.name}
                        </div>
                        <div className="text-xs text-gray-600 dark:text-gray-400">
                          +¥{feature.price.toLocaleString()}
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Deadline */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  納期
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() =>
                      setEstimate((prev) => ({ ...prev, deadline: "normal" }))
                    }
                    className={`p-4 text-center rounded-lg border-2 transition-all ${
                      estimate.deadline === "normal"
                        ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                        : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
                    }`}
                  >
                    <div className="font-medium text-gray-900 dark:text-white">
                      通常納期
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      追加料金なし
                    </div>
                  </button>
                  <button
                    onClick={() =>
                      setEstimate((prev) => ({ ...prev, deadline: "urgent" }))
                    }
                    className={`p-4 text-center rounded-lg border-2 transition-all ${
                      estimate.deadline === "urgent"
                        ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                        : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
                    }`}
                  >
                    <div className="font-medium text-gray-900 dark:text-white">
                      急ぎ
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      +30%
                    </div>
                  </button>
                </div>
              </div>

              {/* Maintenance */}
              <div className="mb-6">
                <label className="flex items-center p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={estimate.maintenance}
                    onChange={(e) =>
                      setEstimate((prev) => ({
                        ...prev,
                        maintenance: e.target.checked,
                      }))
                    }
                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <div className="ml-3">
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      年間保守契約
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">
                      年間費用として見積り額の15%追加
                    </div>
                  </div>
                </label>
              </div>

              <Button
                onClick={calculateEstimate}
                disabled={!estimate.projectType}
                className="w-full"
                size="lg"
              >
                見積りを計算する
              </Button>
            </Card>

            {/* Result */}
            <Card className="p-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                見積り結果
              </h2>

              {result ? (
                <div className="space-y-6">
                  {/* Total Amount */}
                  <div className="text-center p-6 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                      概算見積り額
                    </div>
                    <div className="text-4xl font-bold text-blue-600 dark:text-blue-400">
                      ¥{result.toLocaleString()}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                      (税別)
                    </div>
                  </div>

                  {/* Breakdown */}
                  <div className="space-y-3">
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      内訳
                    </h3>
                    {(() => {
                      const selectedProject = projectTypes.find(
                        (p) => p.id === estimate.projectType
                      );
                      if (!selectedProject) return null;

                      let baseAmount = selectedProject.basePrice;
                      if (estimate.pages > 1) {
                        baseAmount +=
                          selectedProject.basePrice * 0.1 * (estimate.pages - 1);
                      }
                      const complexityAmount =
                        baseAmount * complexityMultiplier[estimate.complexity] -
                        baseAmount;
                      const featureAmount = estimate.features.reduce(
                        (sum, featureId) => {
                          const feature = additionalFeatures.find(
                            (f) => f.id === featureId
                          );
                          return sum + (feature?.price || 0);
                        },
                        0
                      );
                      const urgentAmount =
                        estimate.deadline === "urgent"
                          ? (baseAmount +
                              complexityAmount +
                              featureAmount) *
                            0.3
                          : 0;
                      const maintenanceAmount = estimate.maintenance
                        ? result * 0.15
                        : 0;

                      return (
                        <>
                          <div className="flex justify-between py-2 border-b border-gray-200 dark:border-gray-700">
                            <span>{selectedProject.name}</span>
                            <span>¥{baseAmount.toLocaleString()}</span>
                          </div>
                          {complexityAmount > 0 && (
                            <div className="flex justify-between py-2 border-b border-gray-200 dark:border-gray-700">
                              <span>複雑度調整</span>
                              <span>¥{complexityAmount.toLocaleString()}</span>
                            </div>
                          )}
                          {featureAmount > 0 && (
                            <div className="flex justify-between py-2 border-b border-gray-200 dark:border-gray-700">
                              <span>追加機能</span>
                              <span>¥{featureAmount.toLocaleString()}</span>
                            </div>
                          )}
                          {urgentAmount > 0 && (
                            <div className="flex justify-between py-2 border-b border-gray-200 dark:border-gray-700">
                              <span>急ぎ対応</span>
                              <span>¥{urgentAmount.toLocaleString()}</span>
                            </div>
                          )}
                          {maintenanceAmount > 0 && (
                            <div className="flex justify-between py-2 border-b border-gray-200 dark:border-gray-700">
                              <span>年間保守費</span>
                              <span>¥{maintenanceAmount.toLocaleString()}</span>
                            </div>
                          )}
                        </>
                      );
                    })()}
                  </div>

                  {/* Notes */}
                  <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                    <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                      ご注意
                    </h4>
                    <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                      <li>• こちらは概算見積りです</li>
                      <li>• 実際の見積りは要件詳細により変動する場合があります</li>
                      <li>• 正式なお見積りは別途ご相談ください</li>
                    </ul>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-3 mt-6">
                    <Button href="/about#contact" className="flex-1">
                      お問い合わせ
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => window.print()}
                      className="flex-1"
                    >
                      印刷
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">🧮</div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    見積りを計算します
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    左側のフォームにプロジェクト詳細を入力して、
                    見積りボタンを押してください。
                  </p>
                </div>
              )}
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
