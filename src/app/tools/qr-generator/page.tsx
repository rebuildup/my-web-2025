"use client";

import { Metadata } from "next";
import { ArrowLeft, Download, Share, QrCode, Type, Link, Copy } from "lucide-react";
import Link from "next/link";
import { useState, useRef } from "react";

export const metadata: Metadata = {
  title: "QRコードジェネレーター - samuido Tools",
  description: "テキスト、URL、連絡先なQRコードを簡単に作成。サイズ、色、フォーマットをカスタマイズしてダウンロード。",
  keywords: ["QRコード", "ジェネレーター", "ツール", "URL", "テキスト", "ダウンロード"],
  robots: "index, follow",
  openGraph: {
    title: "QRコードジェネレーター - samuido Tools",
    description: "テキスト、URL、連絡先なQRコードを簡単に作成。サイズ、色、フォーマットをカスタマイズしてダウンロード。",
    type: "website",
    url: "/tools/qr-generator",
    images: [
      {
        url: "/tools/qr-generator-og.jpg",
        width: 1200,
        height: 630,
        alt: "QRコードジェネレーター",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "QRコードジェネレーター - samuido Tools",
    description: "テキスト、URL、連絡先のQRコードを簡単に作成。サイズ、色、フォーマットをカスタマイズしてダウンロード。",
    images: ["/tools/qr-generator-twitter.jpg"],
    creator: "@361do_sleep",
  },
};

// QR Code presets
const qrPresets = [
  { id: "text", name: "テキスト", placeholder: "任意のテキストを入力", prefix: "" },
  { id: "url", name: "URL", placeholder: "https://example.com", prefix: "" },
  { id: "email", name: "メール", placeholder: "name@example.com", prefix: "mailto:" },
  { id: "phone", name: "電話番号", placeholder: "090-1234-5678", prefix: "tel:" },
  { id: "sms", name: "SMS", placeholder: "090-1234-5678", prefix: "sms:" },
  { id: "wifi", name: "Wi-Fi", placeholder: "SSID;PASSWORD", prefix: "WIFI:T:WPA;S:" },
];

const qrSizes = [
  { id: "small", name: "小 (128px)", size: 128 },
  { id: "medium", name: "中 (256px)", size: 256 },
  { id: "large", name: "大 (512px)", size: 512 },
  { id: "xlarge", name: "特大 (1024px)", size: 1024 },
];

const QRCodePlaceholder = ({ size, foregroundColor, backgroundColor }: { 
  size: number; 
  foregroundColor: string;
  backgroundColor: string;
}) => (
  <div 
    className="flex items-center justify-center border-2 border-dashed border-[#444]"
    style={{ 
      width: Math.min(size, 300), 
      height: Math.min(size, 300),
      backgroundColor: backgroundColor,
    }}
  >
    <div className="text-center">
      <QrCode 
        className="mx-auto mb-2" 
        size={48} 
        style={{ color: foregroundColor }}
      />
      <p className="text-sm text-gray-400">QRコードプレビュー</p>
      <p className="text-xs text-gray-500">{size} × {size}px</p>
    </div>
  </div>
);

export default function QRGeneratorPage() {
  const [qrData, setQrData] = useState({
    type: "text",
    content: "",
    size: 256,
    foregroundColor: "#000000",
    backgroundColor: "#ffffff",
  });
  
  const [generatedUrl, setGeneratedUrl] = useState("");
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const generateQRCode = () => {
    const preset = qrPresets.find(p => p.id === qrData.type);
    const finalContent = preset ? preset.prefix + qrData.content : qrData.content;
    
    if (!finalContent.trim()) {
      alert("コンテンツを入力してください");
      return;
    }
    
    // In a real implementation, this would use a QR code library like qrcode
    // For now, we'll simulate the generation
    const simulatedUrl = `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==`;
    setGeneratedUrl(simulatedUrl);
    
    console.log('Generating QR code with:', {
      content: finalContent,
      size: qrData.size,
      foregroundColor: qrData.foregroundColor,
      backgroundColor: qrData.backgroundColor,
    });
  };

  const downloadQRCode = (format: 'png' | 'svg' | 'pdf') => {
    if (!generatedUrl) {
      alert("まずQRコードを生成してください");
      return;
    }
    
    // In a real implementation, this would download the actual file
    console.log(`Downloading QR code as ${format}`);
    alert(`QRコードを${format.toUpperCase()}形式でダウンロードしました！`);
  };

  const copyToClipboard = () => {
    if (generatedUrl) {
      navigator.clipboard.writeText(generatedUrl);
      alert("QRコードのURLをクリップボードにコピーしました！");
    }
  };

  const selectedPreset = qrPresets.find(p => p.id === qrData.type);
  const selectedSize = qrSizes.find(s => s.size === qrData.size);

  return (
    <div className="min-h-screen bg-[#222] text-white">
      {/* Header */}
      <header className="bg-[#333] border-b border-[#444]">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <nav className="flex items-center gap-4">
            <Link href="/tools" className="text-[#0000ff] hover:opacity-80 transition-opacity">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <h1 className="neue-haas-grotesk-display text-xl text-white">QRコードジェネレーター</h1>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* Tool Description */}
        <section className="text-center mb-8">
          <div className="w-16 h-16 bg-[#0000ff] rounded-full mx-auto mb-4 flex items-center justify-center">
            <QrCode className="w-8 h-8 text-white" />
          </div>
          <h2 className="neue-haas-grotesk-display text-2xl mb-3">簡単QRコード作成</h2>
          <p className="text-gray-300 max-w-2xl mx-auto">
            テキスト、URL、連絡先などを簡単にQRコードに変換。サイズや色をカスタマイズしてダウンロードできます。
          </p>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Settings Panel */}
          <div className="space-y-6">
            {/* QR Type */}
            <div className="bg-[#333] p-6 rounded-sm">
              <h3 className="neue-haas-grotesk-display text-lg mb-4 text-[#0000ff]">QRコードタイプ</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {qrPresets.map((preset) => (
                  <button
                    key={preset.id}
                    onClick={() => setQrData(prev => ({ ...prev, type: preset.id, content: "" }))}
                    className={`p-3 rounded-sm text-left transition-colors ${
                      qrData.type === preset.id
                        ? 'bg-[#0000ff] text-white'
                        : 'bg-[#222] text-gray-300 hover:bg-[#2a2a2a]'
                    }`}
                  >
                    <div className="font-medium">{preset.name}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Content Input */}
            <div className="bg-[#333] p-6 rounded-sm">
              <h3 className="neue-haas-grotesk-display text-lg mb-4 text-[#0000ff]">コンテンツ</h3>
              <div className="space-y-3">
                <textarea
                  value={qrData.content}
                  onChange={(e) => setQrData(prev => ({ ...prev, content: e.target.value }))}
                  placeholder={selectedPreset?.placeholder || "コンテンツを入力"}
                  className="w-full h-24 bg-[#222] border border-[#444] rounded-sm px-3 py-2 text-white placeholder-gray-400 focus:border-[#0000ff] focus:outline-none resize-none"
                />
                {selectedPreset?.prefix && (
                  <p className="text-sm text-gray-400">
                    プレフィックス: <code className="bg-[#222] px-1 rounded">{selectedPreset.prefix}</code>
                  </p>
                )}
              </div>
            </div>

            {/* Size Settings */}
            <div className="bg-[#333] p-6 rounded-sm">
              <h3 className="neue-haas-grotesk-display text-lg mb-4 text-[#0000ff]">サイズ設定</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {qrSizes.map((size) => (
                  <button
                    key={size.id}
                    onClick={() => setQrData(prev => ({ ...prev, size: size.size }))}
                    className={`p-3 rounded-sm text-center transition-colors ${
                      qrData.size === size.size
                        ? 'bg-[#0000ff] text-white'
                        : 'bg-[#222] text-gray-300 hover:bg-[#2a2a2a]'
                    }`}
                  >
                    <div className="text-sm font-medium">{size.name}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Color Settings */}
            <div className="bg-[#333] p-6 rounded-sm">
              <h3 className="neue-haas-grotesk-display text-lg mb-4 text-[#0000ff]">色設定</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-300 mb-2">前景色</label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      value={qrData.foregroundColor}
                      onChange={(e) => setQrData(prev => ({ ...prev, foregroundColor: e.target.value }))}
                      className="w-12 h-10 rounded border-0 cursor-pointer"
                    />
                    <input
                      type="text"
                      value={qrData.foregroundColor}
                      onChange={(e) => setQrData(prev => ({ ...prev, foregroundColor: e.target.value }))}
                      className="flex-1 bg-[#222] border border-[#444] rounded-sm px-3 py-2 text-white text-sm focus:border-[#0000ff] focus:outline-none"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm text-gray-300 mb-2">背景色</label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      value={qrData.backgroundColor}
                      onChange={(e) => setQrData(prev => ({ ...prev, backgroundColor: e.target.value }))}
                      className="w-12 h-10 rounded border-0 cursor-pointer"
                    />
                    <input
                      type="text"
                      value={qrData.backgroundColor}
                      onChange={(e) => setQrData(prev => ({ ...prev, backgroundColor: e.target.value }))}
                      className="flex-1 bg-[#222] border border-[#444] rounded-sm px-3 py-2 text-white text-sm focus:border-[#0000ff] focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Generate Button */}
            <button
              onClick={generateQRCode}
              disabled={!qrData.content.trim()}
              className="w-full bg-[#0000ff] hover:bg-[#0066ff] disabled:bg-[#555] disabled:cursor-not-allowed px-6 py-4 rounded-sm text-white font-medium transition-colors"
            >
              QRコードを生成
            </button>
          </div>

          {/* Preview Panel */}
          <div className="space-y-6">
            {/* QR Code Preview */}
            <div className="bg-[#333] p-6 rounded-sm">
              <h3 className="neue-haas-grotesk-display text-lg mb-4 text-[#0000ff]">プレビュー</h3>
              <div className="flex justify-center mb-4">
                <QRCodePlaceholder 
                  size={qrData.size} 
                  foregroundColor={qrData.foregroundColor}
                  backgroundColor={qrData.backgroundColor}
                />
              </div>
              <div className="text-center text-sm text-gray-400">
                サイズ: {selectedSize?.name} ({qrData.size} × {qrData.size}px)
              </div>
            </div>

            {/* Download Options */}
            {generatedUrl && (
              <div className="bg-[#333] p-6 rounded-sm">
                <h3 className="neue-haas-grotesk-display text-lg mb-4 text-[#0000ff]">ダウンロード</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
                  <button
                    onClick={() => downloadQRCode('png')}
                    className="flex items-center justify-center gap-2 bg-[#0000ff] hover:bg-[#0066ff] px-4 py-3 rounded-sm text-white transition-colors"
                  >
                    <Download className="w-4 h-4" />
                    PNG
                  </button>
                  <button
                    onClick={() => downloadQRCode('svg')}
                    className="flex items-center justify-center gap-2 bg-[#222] hover:bg-[#2a2a2a] px-4 py-3 rounded-sm text-white border border-[#444] transition-colors"
                  >
                    <Download className="w-4 h-4" />
                    SVG
                  </button>
                  <button
                    onClick={() => downloadQRCode('pdf')}
                    className="flex items-center justify-center gap-2 bg-[#222] hover:bg-[#2a2a2a] px-4 py-3 rounded-sm text-white border border-[#444] transition-colors"
                  >
                    <Download className="w-4 h-4" />
                    PDF
                  </button>
                </div>
                <button
                  onClick={copyToClipboard}
                  className="w-full flex items-center justify-center gap-2 bg-[#222] hover:bg-[#2a2a2a] px-4 py-3 rounded-sm text-white border border-[#444] transition-colors"
                >
                  <Copy className="w-4 h-4" />
                  URLをコピー
                </button>
              </div>
            )}

            {/* Usage Tips */}
            <div className="bg-[#333] p-6 rounded-sm">
              <h3 className="neue-haas-grotesk-display text-lg mb-4 text-[#0000ff]">使い方のコツ</h3>
              <ul className="space-y-2 text-sm text-gray-300">
                <li className="flex items-start gap-2">
                  <span className="text-[#0000ff] mt-1">•</span>
                  <span>高解像度で印刷する場合はSVGまたはPDFを選択</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#0000ff] mt-1">•</span>
                  <span>背景と前景のコントラストを高くすると読み取り精度が向上</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#0000ff] mt-1">•</span>
                  <span>印刷用途の場合は最低300px以上を推奨</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#0000ff] mt-1">•</span>
                  <span>URLの場合はhttps://を含めた完全なURLを入力</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Canvas for actual QR generation (hidden) */}
        <canvas ref={canvasRef} style={{ display: 'none' }} />
      </main>
    </div>
  );
}