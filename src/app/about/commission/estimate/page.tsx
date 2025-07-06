"use client";

import Link from "next/link";
import type { Metadata } from "next";
import { useState } from "react";
import { Calculator, Copy, Share, Download, Info } from "lucide-react";

const metadata: Metadata = {
  title: "Video Estimate Calculator - samuido | 映像制作見積もり計算機",
  description: "映像制作の見積もりを自動計算。動画の長さ、品質、編集内容に応じてリアルタイムで料金を算出。",
  keywords: ["映像制作", "見積もり", "料金計算", "動画制作", "編集", "価格", "自動計算"],
  robots: "index, follow",
  canonical: "https://yusuke-kim.com/about/commission/estimate",
  openGraph: {
    title: "Video Estimate Calculator - samuido | 映像制作見積もり計算機",
    description: "映像制作の見積もりを自動計算。動画の長さ、品質、編集内容に応じてリアルタイムで料金を算出。",
    type: "website",
    url: "https://yusuke-kim.com/about/commission/estimate",
    images: [
      {
        url: "https://yusuke-kim.com/about/commission-estimate-og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Video Estimate Calculator - samuido",
      },
    ],
    siteName: "samuido",
    locale: "ja_JP",
  },
  twitter: {
    card: "summary_large_image",
    title: "Video Estimate Calculator - samuido | 映像制作見積もり計算機",
    description: "映像制作の見積もりを自動計算。動画の長さ、品質、編集内容に応じてリアルタイムで料金を算出。",
    images: ["https://yusuke-kim.com/about/commission-estimate-twitter-image.jpg"],
    creator: "@361do_design",
  },
};

interface EstimateForm {
  videoType: string;
  duration: string;
  quality: string;
  editing: string[];
  deadline: string;
}

export default function EstimateCalculatorPage() {
  const [form, setForm] = useState<EstimateForm>({
    videoType: "",
    duration: "",
    quality: "",
    editing: [],
    deadline: ""
  });

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "samuido Video Estimate Calculator",
    "description": "映像制作の見積もりを自動計算するアプリケーション",
    "url": "https://yusuke-kim.com/about/commission/estimate",
    "applicationCategory": "BusinessApplication",
    "operatingSystem": "Web Browser",
    "author": {
      "@type": "Person",
      "name": "木村友亮",
      "alternateName": "samuido"
    },
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "JPY"
    }
  };

  const videoTypes = [
    { value: "mv", label: "MV (ミュージックビデオ)", basePrice: 6000 },
    { value: "lyric", label: "リリックモーション", basePrice: 5000 },
    { value: "illustration", label: "イラストアニメーション", basePrice: 4000 },
    { value: "promotion", label: "プロモーション映像", basePrice: 8000 },
    { value: "short", label: "短編映像 (20秒以内)", basePrice: 1000 }
  ];

  const durations = [
    { value: "30s", label: "30秒", multiplier: 0.5 },
    { value: "1min", label: "1分", multiplier: 1 },
    { value: "2min", label: "2分", multiplier: 1.8 },
    { value: "3min", label: "3分", multiplier: 2.5 },
    { value: "5min", label: "5分", multiplier: 4 },
    { value: "10min", label: "10分", multiplier: 7 },
    { value: "other", label: "その他", multiplier: 1 }
  ];

  const qualities = [
    { value: "standard", label: "標準", multiplier: 1 },
    { value: "high", label: "高品質", multiplier: 1.5 },
    { value: "premium", label: "最高品質", multiplier: 2 }
  ];

  const editingOptions = [
    { value: "basic", label: "基本的な編集", price: 0 },
    { value: "effects", label: "エフェクト追加", price: 2000 },
    { value: "animation", label: "アニメーション制作", price: 3000 },
    { value: "3dcg", label: "3DCG制作", price: 5000 },
    { value: "color", label: "カラーグレーディング", price: 1500 }
  ];

  const deadlines = [
    { value: "1week", label: "1週間", multiplier: 2 },
    { value: "2weeks", label: "2週間", multiplier: 1.5 },
    { value: "1month", label: "1ヶ月", multiplier: 1 },
    { value: "2months", label: "2ヶ月", multiplier: 0.9 },
    { value: "other", label: "その他", multiplier: 1 }
  ];

  const calculateEstimate = () => {
    const videoType = videoTypes.find(v => v.value === form.videoType);
    const duration = durations.find(d => d.value === form.duration);
    const quality = qualities.find(q => q.value === form.quality);
    const deadline = deadlines.find(d => d.value === form.deadline);

    if (!videoType || !duration || !quality || !deadline) {
      return {
        basePrice: 0,
        qualityPrice: 0,
        editingPrice: 0,
        deadlinePrice: 0,
        total: 0
      };
    }

    const basePrice = videoType.basePrice * duration.multiplier;
    const qualityPrice = basePrice * (quality.multiplier - 1);
    const editingPrice = form.editing.reduce((total, editValue) => {
      const edit = editingOptions.find(e => e.value === editValue);
      return total + (edit?.price || 0);
    }, 0);
    const deadlinePrice = basePrice * (deadline.multiplier - 1);
    const total = basePrice + qualityPrice + editingPrice + deadlinePrice;

    return {
      basePrice: Math.round(basePrice),
      qualityPrice: Math.round(qualityPrice),
      editingPrice,
      deadlinePrice: Math.round(deadlinePrice),
      total: Math.round(total)
    };
  };

  const estimate = calculateEstimate();

  const handleEditingChange = (value: string, checked: boolean) => {
    if (checked) {
      setForm(prev => ({
        ...prev,
        editing: [...prev.editing, value]
      }));
    } else {
      setForm(prev => ({
        ...prev,
        editing: prev.editing.filter(e => e !== value)
      }));
    }
  };

  const copyToClipboard = () => {
    const text = `
映像制作見積もり結果

映像種類: ${videoTypes.find(v => v.value === form.videoType)?.label || "未選択"}
映像の長さ: ${durations.find(d => d.value === form.duration)?.label || "未選択"}
品質レベル: ${qualities.find(q => q.value === form.quality)?.label || "未選択"}
編集内容: ${form.editing.map(e => editingOptions.find(o => o.value === e)?.label).join(", ") || "基本編集のみ"}
納期: ${deadlines.find(d => d.value === form.deadline)?.label || "未選択"}

料金内訳:
基本料金: ¥${estimate.basePrice.toLocaleString()}
品質料金: ¥${estimate.qualityPrice.toLocaleString()}
編集料金: ¥${estimate.editingPrice.toLocaleString()}
納期料金: ¥${estimate.deadlinePrice.toLocaleString()}

合計: ¥${estimate.total.toLocaleString()}

※この見積もりは目安です。正確な料金は個別にご相談ください。
samuido - https://yusuke-kim.com
    `.trim();

    navigator.clipboard.writeText(text);
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      
      <div className="min-h-screen bg-gray">
        {/* Navigation */}
        <nav className="border-b border-foreground/20 p-4">
          <div className="max-w-7xl mx-auto flex justify-between items-center">
            <Link 
              href="/about" 
              className="neue-haas-grotesk-display text-xl text-primary hover:text-primary/80"
            >
              ← About
            </Link>
            <div className="flex gap-4">
              <Link 
                href="/about/commission/develop" 
                className="neue-haas-grotesk-display text-sm text-foreground hover:text-primary"
              >
                Develop
              </Link>
              <Link 
                href="/about/commission/video" 
                className="neue-haas-grotesk-display text-sm text-foreground hover:text-primary"
              >
                Video
              </Link>
            </div>
          </div>
        </nav>

        {/* Hero Header */}
        <header className="text-center py-16 px-4">
          <h1 className="neue-haas-grotesk-display text-5xl md:text-7xl text-primary mb-4">
            見積もり計算機
          </h1>
          <h2 className="zen-kaku-gothic-new text-2xl md:text-3xl text-foreground mb-6">
            映像制作の料金を自動計算
          </h2>
          <p className="noto-sans-jp text-lg md:text-xl text-foreground/80 max-w-3xl mx-auto leading-relaxed">
            動画の長さ、品質、編集内容に応じて<br />
            リアルタイムで料金を算出します
          </p>
          <div className="mt-8 h-1 w-32 bg-primary mx-auto"></div>
        </header>

        {/* Main Content */}
        <main className="max-w-6xl mx-auto px-4 pb-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Form Section */}
            <section>
              <h2 className="neue-haas-grotesk-display text-3xl text-foreground mb-8">
                見積もりフォーム
              </h2>
              
              <div className="space-y-8">
                {/* Video Type */}
                <div>
                  <h3 className="neue-haas-grotesk-display text-xl text-foreground mb-4">
                    映像の種類
                  </h3>
                  <div className="space-y-2">
                    {videoTypes.map((type) => (
                      <label key={type.value} className="flex items-center gap-3 p-3 border border-foreground/20 hover:border-primary cursor-pointer">
                        <input
                          type="radio"
                          name="videoType"
                          value={type.value}
                          checked={form.videoType === type.value}
                          onChange={(e) => setForm(prev => ({ ...prev, videoType: e.target.value }))}
                          className="text-primary"
                        />
                        <span className="noto-sans-jp text-foreground">{type.label}</span>
                        <span className="noto-sans-jp text-sm text-foreground/50 ml-auto">
                          ¥{type.basePrice.toLocaleString()}~
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Duration */}
                <div>
                  <h3 className="neue-haas-grotesk-display text-xl text-foreground mb-4">
                    映像の長さ
                  </h3>
                  <div className="grid grid-cols-2 gap-2">
                    {durations.map((duration) => (
                      <label key={duration.value} className="flex items-center gap-3 p-3 border border-foreground/20 hover:border-primary cursor-pointer">
                        <input
                          type="radio"
                          name="duration"
                          value={duration.value}
                          checked={form.duration === duration.value}
                          onChange={(e) => setForm(prev => ({ ...prev, duration: e.target.value }))}
                          className="text-primary"
                        />
                        <span className="noto-sans-jp text-foreground">{duration.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Quality */}
                <div>
                  <h3 className="neue-haas-grotesk-display text-xl text-foreground mb-4">
                    品質レベル
                  </h3>
                  <div className="space-y-2">
                    {qualities.map((quality) => (
                      <label key={quality.value} className="flex items-center gap-3 p-3 border border-foreground/20 hover:border-primary cursor-pointer">
                        <input
                          type="radio"
                          name="quality"
                          value={quality.value}
                          checked={form.quality === quality.value}
                          onChange={(e) => setForm(prev => ({ ...prev, quality: e.target.value }))}
                          className="text-primary"
                        />
                        <span className="noto-sans-jp text-foreground">{quality.label}</span>
                        <span className="noto-sans-jp text-sm text-foreground/50 ml-auto">
                          ×{quality.multiplier}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Editing */}
                <div>
                  <h3 className="neue-haas-grotesk-display text-xl text-foreground mb-4">
                    編集内容 (複数選択可)
                  </h3>
                  <div className="space-y-2">
                    {editingOptions.map((edit) => (
                      <label key={edit.value} className="flex items-center gap-3 p-3 border border-foreground/20 hover:border-primary cursor-pointer">
                        <input
                          type="checkbox"
                          checked={form.editing.includes(edit.value)}
                          onChange={(e) => handleEditingChange(edit.value, e.target.checked)}
                          className="text-primary"
                        />
                        <span className="noto-sans-jp text-foreground">{edit.label}</span>
                        <span className="noto-sans-jp text-sm text-foreground/50 ml-auto">
                          {edit.price > 0 ? `+¥${edit.price.toLocaleString()}` : "無料"}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Deadline */}
                <div>
                  <h3 className="neue-haas-grotesk-display text-xl text-foreground mb-4">
                    納期
                  </h3>
                  <div className="grid grid-cols-2 gap-2">
                    {deadlines.map((deadline) => (
                      <label key={deadline.value} className="flex items-center gap-3 p-3 border border-foreground/20 hover:border-primary cursor-pointer">
                        <input
                          type="radio"
                          name="deadline"
                          value={deadline.value}
                          checked={form.deadline === deadline.value}
                          onChange={(e) => setForm(prev => ({ ...prev, deadline: e.target.value }))}
                          className="text-primary"
                        />
                        <span className="noto-sans-jp text-foreground">{deadline.label}</span>
                        <span className="noto-sans-jp text-sm text-foreground/50 ml-auto">
                          ×{deadline.multiplier}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </section>

            {/* Results Section */}
            <section>
              <h2 className="neue-haas-grotesk-display text-3xl text-foreground mb-8">
                見積もり結果
              </h2>
              
              <div className="sticky top-8">
                <div className="border-2 border-primary p-8 bg-gray/50">
                  <div className="flex items-center gap-3 mb-6">
                    <Calculator size={32} className="text-primary" />
                    <h3 className="neue-haas-grotesk-display text-2xl text-foreground">
                      料金内訳
                    </h3>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex justify-between items-center py-2 border-b border-foreground/20">
                      <span className="noto-sans-jp text-foreground">基本料金</span>
                      <span className="noto-sans-jp text-foreground font-medium">
                        ¥{estimate.basePrice.toLocaleString()}
                      </span>
                    </div>
                    
                    <div className="flex justify-between items-center py-2 border-b border-foreground/20">
                      <span className="noto-sans-jp text-foreground">品質料金</span>
                      <span className="noto-sans-jp text-foreground font-medium">
                        ¥{estimate.qualityPrice.toLocaleString()}
                      </span>
                    </div>
                    
                    <div className="flex justify-between items-center py-2 border-b border-foreground/20">
                      <span className="noto-sans-jp text-foreground">編集料金</span>
                      <span className="noto-sans-jp text-foreground font-medium">
                        ¥{estimate.editingPrice.toLocaleString()}
                      </span>
                    </div>
                    
                    <div className="flex justify-between items-center py-2 border-b border-foreground/20">
                      <span className="noto-sans-jp text-foreground">納期料金</span>
                      <span className="noto-sans-jp text-foreground font-medium">
                        ¥{estimate.deadlinePrice.toLocaleString()}
                      </span>
                    </div>
                    
                    <div className="flex justify-between items-center py-4 border-t-2 border-primary">
                      <span className="neue-haas-grotesk-display text-xl text-foreground">
                        合計
                      </span>
                      <span className="neue-haas-grotesk-display text-2xl text-primary font-bold">
                        ¥{estimate.total.toLocaleString()}
                      </span>
                    </div>
                  </div>
                  
                  {/* Action Buttons */}
                  <div className="mt-8 space-y-3">
                    <button
                      onClick={copyToClipboard}
                      className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-primary text-white hover:bg-primary/90 transition-colors"
                    >
                      <Copy size={20} />
                      <span className="noto-sans-jp font-medium">結果をコピー</span>
                    </button>
                    
                    <div className="grid grid-cols-2 gap-3">
                      <button className="flex items-center justify-center gap-2 px-4 py-2 border border-primary text-primary hover:bg-primary hover:text-white transition-colors">
                        <Share size={16} />
                        <span className="noto-sans-jp text-sm">共有</span>
                      </button>
                      
                      <button className="flex items-center justify-center gap-2 px-4 py-2 border border-primary text-primary hover:bg-primary hover:text-white transition-colors">
                        <Download size={16} />
                        <span className="noto-sans-jp text-sm">PDF</span>
                      </button>
                    </div>
                  </div>
                  
                  {/* Disclaimer */}
                  <div className="mt-6 p-4 bg-foreground/5 border border-foreground/20">
                    <div className="flex items-start gap-2">
                      <Info size={16} className="text-foreground/60 mt-1 flex-shrink-0" />
                      <p className="noto-sans-jp text-xs text-foreground/60 leading-relaxed">
                        この見積もりは目安です。実際の料金は内容により変動する場合があります。
                        正確な料金については個別にご相談ください。
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </div>

          {/* Contact Section */}
          <section className="mt-20">
            <h2 className="neue-haas-grotesk-display text-3xl text-foreground text-center mb-8">
              お見積もり後のご相談
            </h2>
            
            <div className="max-w-2xl mx-auto text-center">
              <p className="noto-sans-jp text-foreground/80 mb-8 leading-relaxed">
                見積もり結果をもとに、詳細なご相談をお受けいたします。<br />
                お気軽にお問い合わせください。
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Link
                  href="/contact"
                  className="flex items-center justify-center gap-2 px-6 py-3 bg-primary text-white hover:bg-primary/90 transition-colors"
                >
                  お問い合わせフォーム →
                </Link>
                
                <Link
                  href="/about/commission/video"
                  className="flex items-center justify-center gap-2 px-6 py-3 border border-primary text-primary hover:bg-primary hover:text-white transition-colors"
                >
                  映像依頼詳細 →
                </Link>
              </div>
            </div>
          </section>
        </main>

        {/* Footer */}
        <footer className="border-t border-foreground/20 py-8 text-center">
          <p className="noto-sans-jp text-foreground/60 text-sm">
            © 2025 samuido (木村友亮). All rights reserved.
          </p>
        </footer>
      </div>
    </>
  );
}