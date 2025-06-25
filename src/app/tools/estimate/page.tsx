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

        <div className="max-w-4xl mx-auto">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Coming Soon
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              見積り計算機能を開発中です。しばらくお待ちください。
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
