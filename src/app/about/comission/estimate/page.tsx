"use client";

import { Metadata } from "next";
import { ArrowLeft, Calculator, Download, Mail, Info, DollarSign } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";

// Real-time price calculator for video production
const estimatorData = {
  serviceTypes: [
    { id: "mv", name: "ミュージックビデオ", basePrice: 200000 },
    { id: "motion", name: "モーショングラフィックス", basePrice: 50000 },
    { id: "animation", name: "アニメーション", basePrice: 80000 },
    { id: "editing", name: "動画編集", basePrice: 30000 },
  ],
  duration: [
    { id: "short", name: "30秒以下", multiplier: 1.0 },
    { id: "medium", name: "1分以下", multiplier: 1.4 },
    { id: "long", name: "3分以下", multiplier: 1.8 },
    { id: "extended", name: "5分以下", multiplier: 2.5 },
  ],
  complexity: [
    { id: "simple", name: "シンプル", multiplier: 1.0 },
    { id: "standard", name: "標準", multiplier: 1.6 },
    { id: "advanced", name: "高品質", multiplier: 2.6 },
    { id: "premium", name: "プレミアム", multiplier: 4.0 },
  ],
  revisions: [
    { id: "1", name: "1回", additionalCost: 0 },
    { id: "3", name: "3回", additionalCost: 10000 },
    { id: "5", name: "5回", additionalCost: 20000 },
    { id: "unlimited", name: "無制限", additionalCost: 50000 },
  ],
  additionalServices: [
    { id: "script", name: "脚本作成", cost: 30000 },
    { id: "voiceover", name: "ナレーション", cost: 25000 },
    { id: "music", name: "オリジナル楽曲", cost: 50000 },
    { id: "translation", name: "字幕翻訳", cost: 15000 },
    { id: "rush", name: "特急仕上げ", cost: 80000 },
  ],
};

interface EstimateState {
  serviceType: string;
  duration: string;
  complexity: string;
  revisions: string;
  additionalServices: string[];
  totalCost: number;
}

export default function EstimatePage() {
  const [estimate, setEstimate] = useState<EstimateState>({
    serviceType: "mv",
    duration: "short",
    complexity: "simple",
    revisions: "1",
    additionalServices: [],
    totalCost: 0,
  });

  const [showBreakdown, setShowBreakdown] = useState(false);

  // Calculate total cost in real-time
  useEffect(() => {
    const service = estimatorData.serviceTypes.find(s => s.id === estimate.serviceType);
    const durationMultiplier = estimatorData.duration.find(d => d.id === estimate.duration)?.multiplier || 1;
    const complexityMultiplier = estimatorData.complexity.find(c => c.id === estimate.complexity)?.multiplier || 1;
    const revisionsAdditional = estimatorData.revisions.find(r => r.id === estimate.revisions)?.additionalCost || 0;
    
    const additionalServicesCost = estimate.additionalServices.reduce((total, serviceId) => {
      const service = estimatorData.additionalServices.find(s => s.id === serviceId);
      return total + (service?.cost || 0);
    }, 0);

    const baseCost = (service?.basePrice || 0) * durationMultiplier * complexityMultiplier;
    const totalCost = baseCost + revisionsAdditional + additionalServicesCost;

    setEstimate(prev => ({ ...prev, totalCost }));
  }, [estimate.serviceType, estimate.duration, estimate.complexity, estimate.revisions, estimate.additionalServices]);

  const updateEstimate = (field: keyof EstimateState, value: any) => {
    setEstimate(prev => ({ ...prev, [field]: value }));
  };

  const toggleAdditionalService = (serviceId: string) => {
    setEstimate(prev => ({
      ...prev,
      additionalServices: prev.additionalServices.includes(serviceId)
        ? prev.additionalServices.filter(id => id !== serviceId)
        : [...prev.additionalServices, serviceId]
    }));
  };

  const generateEstimateReport = () => {
    const service = estimatorData.serviceTypes.find(s => s.id === estimate.serviceType);
    const duration = estimatorData.duration.find(d => d.id === estimate.duration);
    const complexity = estimatorData.complexity.find(c => c.id === estimate.complexity);
    const revisions = estimatorData.revisions.find(r => r.id === estimate.revisions);
    
    const report = {
      service: service?.name,
      duration: duration?.name,
      complexity: complexity?.name,
      revisions: revisions?.name,
      additionalServices: estimate.additionalServices.map(id => 
        estimatorData.additionalServices.find(s => s.id === id)?.name
      ),
      totalCost: estimate.totalCost,
      date: new Date().toLocaleDateString('ja-JP'),
    };
    
    // In a real implementation, this would generate a PDF or send to email
    console.log('Estimate report:', report);
    alert('お見積もりレポートを生成しました！');
  };

  return (
    <div className="min-h-screen bg-[#222] text-white">
      {/* Header */}
      <header className="bg-[#333] border-b border-[#444]">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <nav className="flex items-center gap-4">
            <Link href="/about" className="text-[#0000ff] hover:opacity-80 transition-opacity">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <h1 className="neue-haas-grotesk-display text-xl text-white">料金計算機</h1>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* Hero Section */}
        <section className="text-center mb-12">
          <div className="w-16 h-16 bg-[#0000ff] rounded-full mx-auto mb-4 flex items-center justify-center">
            <Calculator className="w-8 h-8 text-white" />
          </div>
          <h2 className="neue-haas-grotesk-display text-3xl mb-4">リアルタイム料金計算機</h2>
          <p className="text-gray-300 max-w-2xl mx-auto">
            プロジェクトの内容を選択するだけで、リアルタイムで料金を算出します。
          </p>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Calculator Form */}
          <div className="lg:col-span-2 space-y-8">
            {/* Service Type */}
            <div className="bg-[#333] p-6 rounded-sm">
              <h3 className="neue-haas-grotesk-display text-lg mb-4 text-[#0000ff]">サービス種別</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {estimatorData.serviceTypes.map((service) => (
                  <label key={service.id} className="flex items-center gap-3 p-3 bg-[#222] rounded cursor-pointer hover:bg-[#2a2a2a] transition-colors">
                    <input
                      type="radio"
                      name="serviceType"
                      value={service.id}
                      checked={estimate.serviceType === service.id}
                      onChange={(e) => updateEstimate('serviceType', e.target.value)}
                      className="text-[#0000ff]" 
                    />
                    <div>
                      <div className="text-white font-medium">{service.name}</div>
                      <div className="text-sm text-gray-400">¥{service.basePrice.toLocaleString()}~</div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Duration */}
            <div className="bg-[#333] p-6 rounded-sm">
              <h3 className="neue-haas-grotesk-display text-lg mb-4 text-[#0000ff]">動画の長さ</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {estimatorData.duration.map((dur) => (
                  <label key={dur.id} className="flex items-center gap-2 p-3 bg-[#222] rounded cursor-pointer hover:bg-[#2a2a2a] transition-colors">
                    <input
                      type="radio"
                      name="duration"
                      value={dur.id}
                      checked={estimate.duration === dur.id}
                      onChange={(e) => updateEstimate('duration', e.target.value)}
                      className="text-[#0000ff]"
                    />
                    <span className="text-white text-sm">{dur.name}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Complexity */}
            <div className="bg-[#333] p-6 rounded-sm">
              <h3 className="neue-haas-grotesk-display text-lg mb-4 text-[#0000ff]">複雑度</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {estimatorData.complexity.map((comp) => (
                  <label key={comp.id} className="flex items-center gap-2 p-3 bg-[#222] rounded cursor-pointer hover:bg-[#2a2a2a] transition-colors">
                    <input
                      type="radio"
                      name="complexity"
                      value={comp.id}
                      checked={estimate.complexity === comp.id}
                      onChange={(e) => updateEstimate('complexity', e.target.value)}
                      className="text-[#0000ff]"
                    />
                    <span className="text-white text-sm">{comp.name}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Revisions */}
            <div className="bg-[#333] p-6 rounded-sm">
              <h3 className="neue-haas-grotesk-display text-lg mb-4 text-[#0000ff]">修正回数</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {estimatorData.revisions.map((rev) => (
                  <label key={rev.id} className="flex items-center gap-2 p-3 bg-[#222] rounded cursor-pointer hover:bg-[#2a2a2a] transition-colors">
                    <input
                      type="radio"
                      name="revisions"
                      value={rev.id}
                      checked={estimate.revisions === rev.id}
                      onChange={(e) => updateEstimate('revisions', e.target.value)}
                      className="text-[#0000ff]"
                    />
                    <div>
                      <div className="text-white text-sm">{rev.name}</div>
                      {rev.additionalCost > 0 && (
                        <div className="text-xs text-gray-400">+¥{rev.additionalCost.toLocaleString()}</div>
                      )}
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Additional Services */}
            <div className="bg-[#333] p-6 rounded-sm">
              <h3 className="neue-haas-grotesk-display text-lg mb-4 text-[#0000ff]">オプションサービス</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {estimatorData.additionalServices.map((service) => (
                  <label key={service.id} className="flex items-center gap-3 p-3 bg-[#222] rounded cursor-pointer hover:bg-[#2a2a2a] transition-colors">
                    <input
                      type="checkbox"
                      checked={estimate.additionalServices.includes(service.id)}
                      onChange={() => toggleAdditionalService(service.id)}
                      className="text-[#0000ff]"
                    />
                    <div>
                      <div className="text-white font-medium">{service.name}</div>
                      <div className="text-sm text-gray-400">+¥{service.cost.toLocaleString()}</div>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Cost Summary */}
          <div className="lg:col-span-1">
            <div className="bg-[#333] p-6 rounded-sm sticky top-8">
              <h3 className="neue-haas-grotesk-display text-xl mb-6 text-[#0000ff] text-center">見積もり総額</h3>
              
              <div className="text-center mb-6">
                <div className="text-4xl font-bold text-white mb-2">
                  ¥{estimate.totalCost.toLocaleString()}
                </div>
                <div className="text-sm text-gray-400">（税込み）</div>
              </div>

              <button
                onClick={() => setShowBreakdown(!showBreakdown)}
                className="w-full flex items-center justify-center gap-2 bg-[#222] hover:bg-[#2a2a2a] px-4 py-2 rounded-sm text-white text-sm transition-colors mb-4"
              >
                <Info className="w-4 h-4" />
                詳細内訳を{showBreakdown ? '非表示' : '表示'}
              </button>

              {showBreakdown && (
                <div className="bg-[#222] p-4 rounded-sm mb-4 text-sm space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-300">ベース料金:</span>
                    <span className="text-white">
                      ¥{(estimatorData.serviceTypes.find(s => s.id === estimate.serviceType)?.basePrice || 0).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">長さ係数:</span>
                    <span className="text-white">
                      ×{estimatorData.duration.find(d => d.id === estimate.duration)?.multiplier || 1}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">複雑度係数:</span>
                    <span className="text-white">
                      ×{estimatorData.complexity.find(c => c.id === estimate.complexity)?.multiplier || 1}
                    </span>
                  </div>
                  {estimate.additionalServices.length > 0 && (
                    <div className="border-t border-[#444] pt-2">
                      <div className="text-gray-300 mb-1">オプション:</div>
                      {estimate.additionalServices.map(serviceId => {
                        const service = estimatorData.additionalServices.find(s => s.id === serviceId);
                        return (
                          <div key={serviceId} className="flex justify-between pl-4">
                            <span className="text-gray-400 text-xs">{service?.name}:</span>
                            <span className="text-white text-xs">+¥{service?.cost.toLocaleString()}</span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              <div className="space-y-3">
                <button
                  onClick={generateEstimateReport}
                  className="w-full flex items-center justify-center gap-2 bg-[#0000ff] hover:bg-[#0066ff] px-4 py-3 rounded-sm text-white transition-colors"
                >
                  <Download className="w-4 h-4" />
                  見積もり書をダウンロード
                </button>
                
                <a
                  href="mailto:361do.sleep@gmail.com?subject=映像制作のお見積もりについて&body=見積もり金額: ¥{estimate.totalCost.toLocaleString()}"
                  className="w-full flex items-center justify-center gap-2 bg-[#333] hover:bg-[#444] px-4 py-3 rounded-sm text-white border border-[#666] transition-colors"
                >
                  <Mail className="w-4 h-4" />
                  お問い合わせ
                </a>
              </div>

              <div className="mt-6 text-xs text-gray-400 text-center">
                <p className="mb-2">
                  ※ こちらは目安の料金です。
                </p>
                <p>
                  正式なお見積もりは、ヒアリング後にご提示いたします。
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}