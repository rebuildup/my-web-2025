"use client";

import { useState } from "react";

interface EstimateData {
  projectType: string;
  complexity: "simple" | "medium" | "complex";
  pages: number;
  features: string[];
  deadline: "normal" | "urgent";
  maintenance: boolean;
}

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

  const basePrices = {
    landing: 150000,
    corporate: 300000,
    ecommerce: 800000,
    webapp: 1200000,
  };

  const complexityMultipliers = {
    simple: 0.8,
    medium: 1.0,
    complex: 1.4,
  };

  const featurePrices = {
    cms: 100000,
    blog: 80000,
    ecommerce: 400000,
    booking: 200000,
    auth: 150000,
    payment: 250000,
    multilang: 120000,
    api: 180000,
  };

  const calculateEstimate = () => {
    if (!estimate.projectType) return;

    let total =
      basePrices[estimate.projectType as keyof typeof basePrices] || 0;

    // ページ数による追加料金
    if (estimate.pages > 5) {
      total += (estimate.pages - 5) * 30000;
    }

    // 複雑度の調整
    total *= complexityMultipliers[estimate.complexity];

    // 機能による追加料金
    estimate.features.forEach((feature) => {
      total += featurePrices[feature as keyof typeof featurePrices] || 0;
    });

    // 納期による調整
    if (estimate.deadline === "urgent") {
      total *= 1.3;
    }

    // 保守サポートによる追加
    if (estimate.maintenance) {
      total += total * 0.1;
    }

    setResult(Math.round(total));
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#222222",
        color: "#ffffff",
        padding: "2rem",
      }}
    >
      <div className="container">
        <h1
          style={{
            color: "#ffffff",
            marginBottom: "1rem",
          }}
        >
          見積り計算機
        </h1>
        <p
          style={{
            color: "#ffffff",
            fontSize: "1.125rem",
            marginBottom: "2rem",
            opacity: 0.9,
          }}
        >
          プロジェクトの要件を入力して、自動的に見積りを算出します。
        </p>

        <form
          style={{
            backgroundColor: "rgba(255,255,255,0.1)",
            padding: "2rem",
            borderRadius: "12px",
            border: "1px solid rgba(255,255,255,0.2)",
            marginBottom: "2rem",
          }}
        >
          <div style={{ marginBottom: "1.5rem" }}>
            <label
              style={{
                display: "block",
                marginBottom: "0.5rem",
                fontWeight: "500",
                color: "#ffffff",
              }}
            >
              プロジェクトタイプ
            </label>
            <select
              value={estimate.projectType}
              onChange={(e) =>
                setEstimate((prev) => ({
                  ...prev,
                  projectType: e.target.value,
                }))
              }
              style={{
                width: "100%",
                padding: "0.75rem",
                border: "1px solid rgba(255,255,255,0.3)",
                borderRadius: "8px",
                backgroundColor: "rgba(255,255,255,0.1)",
                color: "#ffffff",
                fontSize: "1rem",
              }}
            >
              <option value="">選択してください</option>
              <option value="landing">ランディングページ</option>
              <option value="corporate">コーポレートサイト</option>
              <option value="ecommerce">ECサイト</option>
              <option value="webapp">Webアプリケーション</option>
            </select>
          </div>

          <div style={{ marginBottom: "1.5rem" }}>
            <label
              style={{
                display: "block",
                marginBottom: "0.5rem",
                fontWeight: "500",
                color: "#ffffff",
              }}
            >
              ページ数
            </label>
            <input
              type="number"
              value={estimate.pages}
              onChange={(e) =>
                setEstimate((prev) => ({
                  ...prev,
                  pages: parseInt(e.target.value) || 1,
                }))
              }
              style={{
                width: "100%",
                padding: "0.75rem",
                border: "1px solid rgba(255,255,255,0.3)",
                borderRadius: "8px",
                backgroundColor: "rgba(255,255,255,0.1)",
                color: "#ffffff",
                fontSize: "1rem",
              }}
            />
          </div>

          <div style={{ marginBottom: "1.5rem" }}>
            <label
              style={{
                display: "block",
                marginBottom: "0.5rem",
                fontWeight: "500",
                color: "#ffffff",
              }}
            >
              複雑度
            </label>
            <select
              value={estimate.complexity}
              onChange={(e) =>
                setEstimate((prev) => ({
                  ...prev,
                  complexity: e.target.value as "simple" | "medium" | "complex",
                }))
              }
              style={{
                width: "100%",
                padding: "0.75rem",
                border: "1px solid rgba(255,255,255,0.3)",
                borderRadius: "8px",
                backgroundColor: "rgba(255,255,255,0.1)",
                color: "#ffffff",
                fontSize: "1rem",
              }}
            >
              <option value="simple">シンプル</option>
              <option value="medium">標準</option>
              <option value="complex">複雑</option>
            </select>
          </div>

          <button
            type="button"
            onClick={calculateEstimate}
            style={{
              padding: "0.75rem 2rem",
              backgroundColor: "#0000ff",
              color: "#ffffff",
              border: "none",
              borderRadius: "8px",
              fontSize: "1rem",
              fontWeight: "500",
              cursor: "pointer",
              transition: "opacity 0.3s ease",
            }}
          >
            見積りを計算
          </button>
        </form>

        {result && (
          <div
            style={{
              backgroundColor: "rgba(0,0,255,0.1)",
              padding: "2rem",
              borderRadius: "12px",
              border: "2px solid #0000ff",
              textAlign: "center",
            }}
          >
            <h2
              style={{
                color: "#0000ff",
                marginBottom: "1rem",
                fontSize: "1.5rem",
              }}
            >
              見積り結果
            </h2>
            <p
              style={{
                color: "#ffffff",
                fontSize: "2rem",
                fontWeight: "bold",
              }}
            >
              概算費用: ¥{result.toLocaleString()}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}