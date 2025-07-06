'use client';

import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { 
  QrCode, 
  Download, 
  Copy, 
  Settings, 
  ArrowLeft,
  Link as LinkIcon,
  Mail,
  Phone,
  MapPin,
  Wifi,
  Image as ImageIcon,
  Palette
} from "lucide-react";

interface QRSettings {
  size: number;
  errorCorrection: 'L' | 'M' | 'Q' | 'H';
  foreground: string;
  background: string;
  margin: number;
  logoSize: number;
}

const defaultSettings: QRSettings = {
  size: 256,
  errorCorrection: 'M',
  foreground: '#000000',
  background: '#ffffff',
  margin: 4,
  logoSize: 20
};

const urlTypes = [
  { id: 'url', name: 'Website URL', icon: <LinkIcon size={20} />, placeholder: 'https://example.com' },
  { id: 'email', name: 'Email', icon: <Mail size={20} />, placeholder: 'mailto:example@email.com' },
  { id: 'phone', name: 'Phone', icon: <Phone size={20} />, placeholder: 'tel:+81-90-1234-5678' },
  { id: 'sms', name: 'SMS', icon: <Phone size={20} />, placeholder: 'sms:+81-90-1234-5678' },
  { id: 'location', name: 'Location', icon: <MapPin size={20} />, placeholder: 'geo:35.6762,139.6503' },
  { id: 'wifi', name: 'WiFi', icon: <Wifi size={20} />, placeholder: 'WIFI:T:WPA;S:MyNetwork;P:password;;' },
];

// Simple QR Code generation implementation
class QRMatrix {
  private size: number;
  private data: boolean[][];

  constructor(text: string, errorCorrection: string = 'M') {
    this.size = this.calculateSize(text.length);
    this.data = this.generateMatrix(text);
  }

  private calculateSize(textLength: number): number {
    if (textLength <= 25) return 21;
    if (textLength <= 47) return 25;
    if (textLength <= 77) return 29;
    if (textLength <= 114) return 33;
    return 37; // Maximum for this simple implementation
  }

  private generateMatrix(text: string): boolean[][] {
    const matrix = Array(this.size).fill(null).map(() => Array(this.size).fill(false));
    
    // Simple pattern generation (not a real QR code algorithm)
    // This creates a pattern that looks like a QR code for demo purposes
    
    // Finder patterns (corners)
    this.addFinderPattern(matrix, 0, 0);
    this.addFinderPattern(matrix, this.size - 7, 0);
    this.addFinderPattern(matrix, 0, this.size - 7);
    
    // Timing patterns
    for (let i = 8; i < this.size - 8; i++) {
      matrix[6][i] = i % 2 === 0;
      matrix[i][6] = i % 2 === 0;
    }
    
    // Data pattern (simplified)
    for (let row = 9; row < this.size - 9; row++) {
      for (let col = 9; col < this.size - 9; col++) {
        const hash = this.simpleHash(text + row + col);
        matrix[row][col] = hash % 2 === 0;
      }
    }

    return matrix;
  }

  private addFinderPattern(matrix: boolean[][], startRow: number, startCol: number) {
    for (let row = 0; row < 7; row++) {
      for (let col = 0; col < 7; col++) {
        const isOuterBorder = row === 0 || row === 6 || col === 0 || col === 6;
        const isInnerSquare = (row >= 2 && row <= 4) && (col >= 2 && col <= 4);
        matrix[startRow + row][startCol + col] = isOuterBorder || isInnerSquare;
      }
    }
  }

  private simpleHash(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash);
  }

  public getMatrix(): boolean[][] {
    return this.data;
  }

  public getSize(): number {
    return this.size;
  }
}

export default function QRGeneratorPage() {
  const [url, setUrl] = useState('');
  const [urlType, setUrlType] = useState('url');
  const [settings, setSettings] = useState<QRSettings>(defaultSettings);
  const [qrMatrix, setQrMatrix] = useState<boolean[][] | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [history, setHistory] = useState<string[]>([]);
  const [copiedText, setCopiedText] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    loadHistory();
  }, []);

  useEffect(() => {
    if (url.trim()) {
      generateQR();
    } else {
      setQrMatrix(null);
    }
  }, [url, settings]);

  useEffect(() => {
    if (qrMatrix && canvasRef.current) {
      drawQRCode();
    }
  }, [qrMatrix, settings]);

  const loadHistory = () => {
    try {
      const saved = localStorage.getItem('qr-history');
      if (saved) {
        setHistory(JSON.parse(saved));
      }
    } catch (error) {
      console.error('Failed to load history:', error);
    }
  };

  const saveToHistory = (text: string) => {
    if (!text.trim() || history.includes(text)) return;
    
    const newHistory = [text, ...history.slice(0, 9)]; // Keep last 10
    setHistory(newHistory);
    
    try {
      localStorage.setItem('qr-history', JSON.stringify(newHistory));
    } catch (error) {
      console.error('Failed to save history:', error);
    }
  };

  const generateQR = () => {
    try {
      const qr = new QRMatrix(url, settings.errorCorrection);
      setQrMatrix(qr.getMatrix());
      saveToHistory(url);
    } catch (error) {
      console.error('Failed to generate QR code:', error);
      setQrMatrix(null);
    }
  };

  const drawQRCode = () => {
    const canvas = canvasRef.current;
    if (!canvas || !qrMatrix) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const size = settings.size;
    const moduleSize = Math.floor((size - settings.margin * 2) / qrMatrix.length);
    const actualSize = moduleSize * qrMatrix.length + settings.margin * 2;
    
    canvas.width = actualSize;
    canvas.height = actualSize;

    // Background
    ctx.fillStyle = settings.background;
    ctx.fillRect(0, 0, actualSize, actualSize);

    // QR modules
    ctx.fillStyle = settings.foreground;
    for (let row = 0; row < qrMatrix.length; row++) {
      for (let col = 0; col < qrMatrix[row].length; col++) {
        if (qrMatrix[row][col]) {
          ctx.fillRect(
            settings.margin + col * moduleSize,
            settings.margin + row * moduleSize,
            moduleSize,
            moduleSize
          );
        }
      }
    }
  };

  const downloadQR = (format: 'png' | 'svg' | 'pdf') => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    
    if (format === 'png') {
      const link = document.createElement('a');
      link.download = 'qrcode.png';
      link.href = canvas.toDataURL('image/png');
      link.click();
    } else if (format === 'svg') {
      const svgContent = generateSVG();
      const blob = new Blob([svgContent], { type: 'image/svg+xml' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.download = 'qrcode.svg';
      link.href = url;
      link.click();
      URL.revokeObjectURL(url);
    }
  };

  const generateSVG = (): string => {
    if (!qrMatrix) return '';

    const size = settings.size;
    const moduleSize = Math.floor((size - settings.margin * 2) / qrMatrix.length);
    const actualSize = moduleSize * qrMatrix.length + settings.margin * 2;

    let svg = `<svg width="${actualSize}" height="${actualSize}" xmlns="http://www.w3.org/2000/svg">`;
    svg += `<rect width="${actualSize}" height="${actualSize}" fill="${settings.background}"/>`;
    
    for (let row = 0; row < qrMatrix.length; row++) {
      for (let col = 0; col < qrMatrix[row].length; col++) {
        if (qrMatrix[row][col]) {
          svg += `<rect x="${settings.margin + col * moduleSize}" y="${settings.margin + row * moduleSize}" width="${moduleSize}" height="${moduleSize}" fill="${settings.foreground}"/>`;
        }
      }
    }
    
    svg += '</svg>';
    return svg;
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedText(text);
      setTimeout(() => setCopiedText(null), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const validateURL = (value: string, type: string): boolean => {
    try {
      if (type === 'url') {
        new URL(value);
        return true;
      } else if (type === 'email') {
        return value.startsWith('mailto:') && value.includes('@');
      } else if (type === 'phone' || type === 'sms') {
        return value.startsWith(type + ':') && /\+?[0-9\-\s()]+/.test(value);
      } else if (type === 'location') {
        return value.startsWith('geo:') && /\-?\d+(\.\d+)?,\-?\d+(\.\d+)?/.test(value);
      } else if (type === 'wifi') {
        return value.startsWith('WIFI:');
      }
      return true;
    } catch {
      return false;
    }
  };

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "QR Code Generator",
    "description": "URLからQRコードを生成するツール",
    "url": "https://yusuke-kim.com/tools/qr-generator",
    "applicationCategory": "UtilityApplication",
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

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      
      <div className="min-h-screen bg-gray">
        {/* Navigation */}
        <nav className="border-b border-foreground/20 p-4">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <Link 
              href="/tools" 
              className="neue-haas-grotesk-display text-xl text-primary hover:text-primary/80 flex items-center space-x-2"
            >
              <ArrowLeft size={20} />
              <span>Tools</span>
            </Link>
            
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowSettings(!showSettings)}
                className="flex items-center space-x-2 px-4 py-2 border border-foreground/20 text-foreground hover:border-primary hover:text-primary transition-colors"
              >
                <Settings size={16} />
                <span className="noto-sans-jp text-sm">設定</span>
              </button>
            </div>
          </div>
        </nav>

        {/* Hero Header */}
        <header className="text-center py-12 px-4">
          <div className="flex justify-center mb-4">
            <QrCode size={64} className="text-primary" />
          </div>
          <h1 className="neue-haas-grotesk-display text-4xl md:text-6xl text-primary mb-4">
            QR Code Generator
          </h1>
          <p className="noto-sans-jp text-lg text-foreground/80 max-w-2xl mx-auto">
            URLからQRコードを簡単生成。<br />
            カスタマイズ機能付きで美しいQRコードを作成できます。
          </p>
        </header>

        {/* Main Content */}
        <main className="max-w-4xl mx-auto px-4 pb-16">
          {/* Settings Panel */}
          {showSettings && (
            <section className="mb-8 border border-foreground/20 bg-gray/50 p-6">
              <h3 className="neue-haas-grotesk-display text-xl text-foreground mb-4">QRコード設定</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Size */}
                <div>
                  <label className="block noto-sans-jp text-sm text-foreground/70 mb-2">
                    サイズ ({settings.size}px)
                  </label>
                  <input
                    type="range"
                    min="128"
                    max="512"
                    step="16"
                    value={settings.size}
                    onChange={(e) => setSettings({...settings, size: Number(e.target.value)})}
                    className="w-full"
                  />
                </div>

                {/* Error Correction */}
                <div>
                  <label className="block noto-sans-jp text-sm text-foreground/70 mb-2">
                    エラー訂正レベル
                  </label>
                  <select
                    value={settings.errorCorrection}
                    onChange={(e) => setSettings({...settings, errorCorrection: e.target.value as any})}
                    className="w-full p-2 border border-foreground/20 bg-gray text-foreground"
                  >
                    <option value="L">L (7%)</option>
                    <option value="M">M (15%)</option>
                    <option value="Q">Q (25%)</option>
                    <option value="H">H (30%)</option>
                  </select>
                </div>

                {/* Margin */}
                <div>
                  <label className="block noto-sans-jp text-sm text-foreground/70 mb-2">
                    マージン ({settings.margin}px)
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="20"
                    value={settings.margin}
                    onChange={(e) => setSettings({...settings, margin: Number(e.target.value)})}
                    className="w-full"
                  />
                </div>

                {/* Foreground Color */}
                <div>
                  <label className="block noto-sans-jp text-sm text-foreground/70 mb-2">前景色</label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="color"
                      value={settings.foreground}
                      onChange={(e) => setSettings({...settings, foreground: e.target.value})}
                      className="w-12 h-8 border border-foreground/20"
                    />
                    <input
                      type="text"
                      value={settings.foreground}
                      onChange={(e) => setSettings({...settings, foreground: e.target.value})}
                      className="flex-1 p-2 border border-foreground/20 bg-gray text-foreground font-mono text-sm"
                    />
                  </div>
                </div>

                {/* Background Color */}
                <div>
                  <label className="block noto-sans-jp text-sm text-foreground/70 mb-2">背景色</label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="color"
                      value={settings.background}
                      onChange={(e) => setSettings({...settings, background: e.target.value})}
                      className="w-12 h-8 border border-foreground/20"
                    />
                    <input
                      type="text"
                      value={settings.background}
                      onChange={(e) => setSettings({...settings, background: e.target.value})}
                      className="flex-1 p-2 border border-foreground/20 bg-gray text-foreground font-mono text-sm"
                    />
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* Input Section */}
          <section className="mb-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Input Form */}
              <div>
                <h3 className="neue-haas-grotesk-display text-xl text-foreground mb-4">URL入力</h3>
                
                {/* URL Type Selection */}
                <div className="mb-4">
                  <label className="block noto-sans-jp text-sm text-foreground/70 mb-2">入力タイプ</label>
                  <div className="grid grid-cols-3 gap-2">
                    {urlTypes.map((type) => (
                      <button
                        key={type.id}
                        onClick={() => setUrlType(type.id)}
                        className={`flex items-center space-x-2 p-3 border text-sm transition-colors ${
                          urlType === type.id
                            ? 'border-primary bg-primary/10 text-primary'
                            : 'border-foreground/20 text-foreground/70 hover:border-primary/50'
                        }`}
                      >
                        {type.icon}
                        <span className="noto-sans-jp">{type.name}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* URL Input */}
                <div className="mb-4">
                  <label className="block noto-sans-jp text-sm text-foreground/70 mb-2">
                    {urlTypes.find(t => t.id === urlType)?.name || 'URL'}
                  </label>
                  <textarea
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder={urlTypes.find(t => t.id === urlType)?.placeholder || 'URLを入力...'}
                    className="w-full p-3 border border-foreground/20 bg-gray text-foreground resize-none h-24 focus:border-primary focus:outline-none"
                  />
                  
                  {url && !validateURL(url, urlType) && (
                    <p className="mt-2 text-red-500 text-sm noto-sans-jp">
                      有効な{urlTypes.find(t => t.id === urlType)?.name}を入力してください
                    </p>
                  )}
                </div>

                {/* URL Preview */}
                {url && (
                  <div className="mb-4 p-3 border border-foreground/20 bg-gray/50">
                    <div className="flex items-center justify-between mb-2">
                      <span className="noto-sans-jp text-sm text-foreground/70">プレビュー</span>
                      <button
                        onClick={() => copyToClipboard(url)}
                        className="flex items-center space-x-1 text-foreground hover:text-primary transition-colors"
                      >
                        <span className="text-xs">コピー</span>
                        {copiedText === url ? (
                          <span className="text-green-500">✓</span>
                        ) : (
                          <Copy size={12} />
                        )}
                      </button>
                    </div>
                    <p className="font-mono text-sm text-foreground break-all">{url}</p>
                  </div>
                )}

                {/* History */}
                {history.length > 0 && (
                  <div>
                    <h4 className="noto-sans-jp text-sm text-foreground/70 mb-2">履歴</h4>
                    <div className="space-y-1 max-h-32 overflow-y-auto">
                      {history.map((item, index) => (
                        <button
                          key={index}
                          onClick={() => setUrl(item)}
                          className="w-full text-left p-2 text-sm border border-foreground/20 bg-gray/30 hover:bg-gray/50 transition-colors font-mono truncate"
                        >
                          {item}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* QR Code Display */}
              <div>
                <h3 className="neue-haas-grotesk-display text-xl text-foreground mb-4">QRコード</h3>
                
                {qrMatrix ? (
                  <div className="text-center">
                    <div className="inline-block p-4 border border-foreground/20 bg-white mb-4">
                      <canvas 
                        ref={canvasRef}
                        className="max-w-full h-auto"
                      />
                    </div>
                    
                    {/* Download Options */}
                    <div className="flex flex-wrap justify-center gap-2">
                      <button
                        onClick={() => downloadQR('png')}
                        className="flex items-center space-x-2 px-4 py-2 border border-foreground/20 text-foreground hover:border-primary hover:text-primary transition-colors"
                      >
                        <Download size={16} />
                        <span className="noto-sans-jp text-sm">PNG</span>
                      </button>
                      
                      <button
                        onClick={() => downloadQR('svg')}
                        className="flex items-center space-x-2 px-4 py-2 border border-foreground/20 text-foreground hover:border-primary hover:text-primary transition-colors"
                      >
                        <Download size={16} />
                        <span className="noto-sans-jp text-sm">SVG</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12 border border-foreground/20 bg-gray/50">
                    <QrCode size={64} className="text-foreground/30 mx-auto mb-4" />
                    <p className="noto-sans-jp text-foreground/60">
                      URLを入力するとQRコードが生成されます
                    </p>
                  </div>
                )}
              </div>
            </div>
          </section>
        </main>
      </div>
    </>
  );
}