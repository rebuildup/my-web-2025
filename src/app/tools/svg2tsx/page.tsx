'use client';

import Link from "next/link";
import { useState, useRef, useCallback } from "react";
import { 
  ArrowLeft, 
  Upload,
  Copy,
  Download,
  Code2,
  FileText,
  Settings,
  Eye,
  EyeOff,
  Zap,
  Palette,
  RotateCcw,
  CheckCircle,
  AlertCircle
} from "lucide-react";

interface ConversionSettings {
  componentName: string;
  propsType: string;
  defaultValues: Record<string, any>;
  removeUnnecessaryAttrs: boolean;
  optimizePaths: boolean;
  colorToVariables: boolean;
  sizeToProps: boolean;
  indentSize: number;
  exportType: 'default' | 'named';
  fileExtension: '.tsx' | '.ts' | '.jsx' | '.js';
  addComments: boolean;
}

interface ConversionResult {
  tsx: string;
  preview: string;
  errors: string[];
  warnings: string[];
}

export default function SVG2TSXPage() {
  const [svgInput, setSvgInput] = useState('');
  const [result, setResult] = useState<ConversionResult | null>(null);
  const [settings, setSettings] = useState<ConversionSettings>({
    componentName: 'SvgComponent',
    propsType: 'React.SVGProps<SVGSVGElement>',
    defaultValues: {},
    removeUnnecessaryAttrs: true,
    optimizePaths: false,
    colorToVariables: true,
    sizeToProps: true,
    indentSize: 2,
    exportType: 'default',
    fileExtension: '.tsx',
    addComments: true
  });
  const [dragActive, setDragActive] = useState(false);
  const [showPreview, setShowPreview] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = useCallback((files: FileList) => {
    const file = files[0];
    if (!file) return;
    
    if (!file.type.includes('svg') && !file.name.toLowerCase().endsWith('.svg')) {
      alert('SVGファイルを選択してください。');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      setSvgInput(content);
      convertSVG(content);
    };
    reader.readAsText(file);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileUpload(e.dataTransfer.files);
    }
  }, [handleFileUpload]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
  }, []);

  const convertSVG = useCallback((svg: string) => {
    const errors: string[] = [];
    const warnings: string[] = [];
    
    try {
      // Parse SVG
      const parser = new DOMParser();
      const doc = parser.parseFromString(svg, 'image/svg+xml');
      const svgElement = doc.querySelector('svg');
      
      if (!svgElement) {
        errors.push('有効なSVG要素が見つかりませんでした。');
        setResult({ tsx: '', preview: '', errors, warnings });
        return;
      }

      // Convert attributes
      const convertedSvg = processSVGElement(svgElement.cloneNode(true) as SVGSVGElement, settings);
      
      // Generate TSX
      const tsx = generateTSX(convertedSvg, settings);
      
      // Generate preview
      const preview = generatePreview(convertedSvg);
      
      setResult({ tsx, preview, errors, warnings });
    } catch (error) {
      errors.push(`変換エラー: ${error}`);
      setResult({ tsx: '', preview: '', errors, warnings });
    }
  }, [settings]);

  const processSVGElement = (svgElement: SVGSVGElement, settings: ConversionSettings): SVGSVGElement => {
    // Remove unnecessary attributes
    if (settings.removeUnnecessaryAttrs) {
      const unnecessaryAttrs = ['id', 'class', 'xmlns:xlink', 'xml:space'];
      unnecessaryAttrs.forEach(attr => {
        svgElement.removeAttribute(attr);
      });
    }

    // Convert size to props
    if (settings.sizeToProps) {
      const width = svgElement.getAttribute('width');
      const height = svgElement.getAttribute('height');
      
      if (width && !width.includes('%')) {
        svgElement.setAttribute('width', '{width || "' + width + '"}');
      }
      if (height && !height.includes('%')) {
        svgElement.setAttribute('height', '{height || "' + height + '"}');
      }
    }

    // Convert colors to variables
    if (settings.colorToVariables) {
      const colorAttributes = ['fill', 'stroke'];
      const processElement = (element: Element) => {
        colorAttributes.forEach(attr => {
          const value = element.getAttribute(attr);
          if (value && value !== 'none' && value !== 'currentColor' && value.startsWith('#')) {
            element.setAttribute(attr, `{${attr} || "${value}"}`);
          }
        });
        
        // Process children
        Array.from(element.children).forEach(processElement);
      };
      
      processElement(svgElement);
    }

    return svgElement;
  };

  const generateTSX = (svgElement: SVGSVGElement, settings: ConversionSettings): string => {
    const indent = ' '.repeat(settings.indentSize);
    let tsx = '';
    
    // Add imports
    tsx += `import React from 'react';\n\n`;
    
    // Add comments
    if (settings.addComments) {
      tsx += `/**\n`;
      tsx += ` * ${settings.componentName} - Generated SVG Component\n`;
      tsx += ` * Generated with SVG2TSX Converter\n`;
      tsx += ` */\n`;
    }
    
    // Add interface if needed
    if (settings.colorToVariables || settings.sizeToProps) {
      tsx += `interface ${settings.componentName}Props extends ${settings.propsType} {\n`;
      
      if (settings.sizeToProps) {
        tsx += `${indent}width?: string | number;\n`;
        tsx += `${indent}height?: string | number;\n`;
      }
      
      if (settings.colorToVariables) {
        tsx += `${indent}fill?: string;\n`;
        tsx += `${indent}stroke?: string;\n`;
      }
      
      tsx += `}\n\n`;
    }
    
    // Add component
    const propsType = (settings.colorToVariables || settings.sizeToProps) 
      ? `${settings.componentName}Props` 
      : settings.propsType;
    
    tsx += `const ${settings.componentName}: React.FC<${propsType}> = (`;
    
    if (settings.colorToVariables || settings.sizeToProps) {
      tsx += `{\n`;
      if (settings.sizeToProps) {
        tsx += `${indent}width,\n${indent}height,\n`;
      }
      if (settings.colorToVariables) {
        tsx += `${indent}fill,\n${indent}stroke,\n`;
      }
      tsx += `${indent}...props\n}) => {\n`;
    } else {
      tsx += `props) => {\n`;
    }
    
    tsx += `${indent}return (\n`;
    
    // Convert SVG to JSX
    let svgJSX = svgElement.outerHTML;
    
    // Convert attributes to JSX format
    svgJSX = svgJSX
      .replace(/class="/g, 'className="')
      .replace(/stroke-width/g, 'strokeWidth')
      .replace(/fill-rule/g, 'fillRule')
      .replace(/clip-rule/g, 'clipRule')
      .replace(/stroke-linecap/g, 'strokeLinecap')
      .replace(/stroke-linejoin/g, 'strokeLinejoin')
      .replace(/stroke-dasharray/g, 'strokeDasharray')
      .replace(/stroke-dashoffset/g, 'strokeDashoffset')
      .replace(/xmlns:xlink/g, 'xmlnsXlink')
      .replace(/xlink:href/g, 'xlinkHref');
    
    // Add props spread
    svgJSX = svgJSX.replace('<svg', '<svg {...props}');
    
    // Format SVG with proper indentation
    const lines = svgJSX.split('\n');
    const indentedSvg = lines.map((line, index) => {
      if (index === 0) return indent + indent + line;
      return indent + indent + line;
    }).join('\n');
    
    tsx += indentedSvg + '\n';
    tsx += `${indent});\n`;
    tsx += `};\n\n`;
    
    // Add export
    if (settings.exportType === 'default') {
      tsx += `export default ${settings.componentName};\n`;
    } else {
      tsx += `export { ${settings.componentName} };\n`;
    }
    
    return tsx;
  };

  const generatePreview = (svgElement: SVGSVGElement): string => {
    return svgElement.outerHTML;
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const downloadFile = (content: string, filename: string) => {
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const resetConverter = () => {
    setSvgInput('');
    setResult(null);
  };

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "SVG to TSX Converter",
    "description": "SVG画像をReactコンポーネントに変換",
    "url": "https://yusuke-kim.com/tools/svg2tsx",
    "applicationCategory": "DeveloperApplication",
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
      
      <div className="min-h-screen bg-gray text-foreground">
        {/* Navigation */}
        <nav className="border-b border-foreground/20 p-4">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <Link 
              href="/tools" 
              className="flex items-center space-x-2 neue-haas-grotesk-display text-lg text-primary hover:text-primary/80"
            >
              <ArrowLeft size={20} />
              <span>Tools</span>
            </Link>
            
            <h1 className="neue-haas-grotesk-display text-xl text-foreground">
              SVG to TSX Converter
            </h1>
          </div>
        </nav>

        <div className="max-w-7xl mx-auto p-4">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Input Area */}
            <div className="lg:col-span-2 space-y-4">
              {/* Upload/Input */}
              <div className="border border-foreground/20 bg-gray/50">
                <div className="p-4 border-b border-foreground/20">
                  <div className="flex items-center justify-between">
                    <h2 className="neue-haas-grotesk-display text-lg text-foreground">
                      SVG入力
                    </h2>
                    
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="flex items-center space-x-1 px-3 py-1 border border-primary text-primary hover:bg-primary/10"
                      >
                        <Upload size={14} />
                        <span>ファイル</span>
                      </button>
                      
                      <button
                        onClick={resetConverter}
                        className="flex items-center space-x-1 px-3 py-1 border border-foreground/20 text-foreground hover:bg-foreground/10"
                      >
                        <RotateCcw size={14} />
                        <span>クリア</span>
                      </button>
                    </div>
                  </div>
                </div>

                <div className="p-4">
                  {!svgInput ? (
                    <div
                      className={`border-2 border-dashed p-8 text-center transition-colors ${
                        dragActive 
                          ? 'border-primary bg-primary/5' 
                          : 'border-foreground/30 hover:border-primary/50'
                      }`}
                      onDrop={handleDrop}
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                    >
                      <Code2 size={48} className="mx-auto text-foreground/30 mb-4" />
                      <p className="noto-sans-jp text-foreground/70 mb-4">
                        SVGファイルをドラッグ&ドロップ、または下のエリアにSVGコードを貼り付けてください
                      </p>
                    </div>
                  ) : null}
                  
                  <textarea
                    value={svgInput}
                    onChange={(e) => {
                      setSvgInput(e.target.value);
                      if (e.target.value.trim()) {
                        convertSVG(e.target.value);
                      }
                    }}
                    placeholder="SVGコードをここに貼り付けるか、上にファイルをドロップしてください..."
                    className="w-full h-64 p-4 border border-foreground/20 bg-gray text-foreground rounded-none focus:border-primary focus:outline-none font-mono text-sm resize-none"
                  />
                  
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".svg,image/svg+xml"
                    onChange={(e) => {
                      if (e.target.files) {
                        handleFileUpload(e.target.files);
                      }
                    }}
                    className="hidden"
                  />
                </div>
              </div>

              {/* SVG Preview */}
              {svgInput && (
                <div className="border border-foreground/20 bg-gray/50">
                  <div className="p-4 border-b border-foreground/20">
                    <div className="flex items-center justify-between">
                      <h3 className="neue-haas-grotesk-display text-lg text-foreground">
                        SVGプレビュー
                      </h3>
                      
                      <button
                        onClick={() => setShowPreview(!showPreview)}
                        className="flex items-center space-x-1 px-3 py-1 border border-foreground/20 text-foreground hover:bg-foreground/10"
                      >
                        {showPreview ? <EyeOff size={14} /> : <Eye size={14} />}
                        <span>{showPreview ? '非表示' : '表示'}</span>
                      </button>
                    </div>
                  </div>
                  
                  {showPreview && (
                    <div className="p-8 bg-white border-t border-foreground/20 flex justify-center">
                      <div 
                        dangerouslySetInnerHTML={{ __html: result?.preview || svgInput }}
                        className="max-w-full max-h-64"
                      />
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Settings Panel */}
            <div className="border border-foreground/20 bg-gray/50">
              <div className="p-4 border-b border-foreground/20">
                <h3 className="neue-haas-grotesk-display text-lg text-foreground flex items-center">
                  <Settings size={20} className="mr-2" />
                  変換設定
                </h3>
              </div>
              
              <div className="p-4 space-y-4 max-h-[calc(100vh-200px)] overflow-y-auto">
                {/* Basic Settings */}
                <div>
                  <label className="block text-sm text-foreground/70 mb-2">
                    コンポーネント名
                  </label>
                  <input
                    type="text"
                    value={settings.componentName}
                    onChange={(e) => setSettings(prev => ({ ...prev, componentName: e.target.value }))}
                    className="w-full px-3 py-2 border border-foreground/20 bg-gray text-foreground rounded-none focus:border-primary focus:outline-none text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm text-foreground/70 mb-2">
                    Props型
                  </label>
                  <input
                    type="text"
                    value={settings.propsType}
                    onChange={(e) => setSettings(prev => ({ ...prev, propsType: e.target.value }))}
                    className="w-full px-3 py-2 border border-foreground/20 bg-gray text-foreground rounded-none focus:border-primary focus:outline-none text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm text-foreground/70 mb-2">
                    ファイル拡張子
                  </label>
                  <select
                    value={settings.fileExtension}
                    onChange={(e) => setSettings(prev => ({ ...prev, fileExtension: e.target.value as any }))}
                    className="w-full px-3 py-2 border border-foreground/20 bg-gray text-foreground rounded-none focus:border-primary focus:outline-none text-sm"
                  >
                    <option value=".tsx">.tsx</option>
                    <option value=".ts">.ts</option>
                    <option value=".jsx">.jsx</option>
                    <option value=".js">.js</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm text-foreground/70 mb-2">
                    エクスポート形式
                  </label>
                  <select
                    value={settings.exportType}
                    onChange={(e) => setSettings(prev => ({ ...prev, exportType: e.target.value as any }))}
                    className="w-full px-3 py-2 border border-foreground/20 bg-gray text-foreground rounded-none focus:border-primary focus:outline-none text-sm"
                  >
                    <option value="default">デフォルトエクスポート</option>
                    <option value="named">名前付きエクスポート</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm text-foreground/70 mb-2">
                    インデント: {settings.indentSize} スペース
                  </label>
                  <input
                    type="range"
                    min={2}
                    max={8}
                    step={2}
                    value={settings.indentSize}
                    onChange={(e) => setSettings(prev => ({ ...prev, indentSize: parseInt(e.target.value) }))}
                    className="w-full"
                  />
                </div>

                {/* Optimization Settings */}
                <div className="border-t border-foreground/20 pt-4">
                  <h4 className="neue-haas-grotesk-display text-sm text-foreground mb-3">
                    最適化オプション
                  </h4>
                  
                  <div className="space-y-3">
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={settings.removeUnnecessaryAttrs}
                        onChange={(e) => setSettings(prev => ({ ...prev, removeUnnecessaryAttrs: e.target.checked }))}
                        className="w-4 h-4"
                      />
                      <span className="text-sm text-foreground/70">不要属性削除</span>
                    </label>
                    
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={settings.colorToVariables}
                        onChange={(e) => setSettings(prev => ({ ...prev, colorToVariables: e.target.checked }))}
                        className="w-4 h-4"
                      />
                      <span className="text-sm text-foreground/70">色の変数化</span>
                    </label>
                    
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={settings.sizeToProps}
                        onChange={(e) => setSettings(prev => ({ ...prev, sizeToProps: e.target.checked }))}
                        className="w-4 h-4"
                      />
                      <span className="text-sm text-foreground/70">サイズをProps化</span>
                    </label>
                    
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={settings.addComments}
                        onChange={(e) => setSettings(prev => ({ ...prev, addComments: e.target.checked }))}
                        className="w-4 h-4"
                      />
                      <span className="text-sm text-foreground/70">コメント追加</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {/* Output Area */}
            <div className="border border-foreground/20 bg-gray/50">
              <div className="p-4 border-b border-foreground/20">
                <div className="flex items-center justify-between">
                  <h3 className="neue-haas-grotesk-display text-lg text-foreground">
                    TSX出力
                  </h3>
                  
                  {result?.tsx && (
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => copyToClipboard(result.tsx)}
                        className="flex items-center space-x-1 px-3 py-1 border border-primary text-primary hover:bg-primary/10"
                      >
                        <Copy size={14} />
                        <span>コピー</span>
                      </button>
                      
                      <button
                        onClick={() => downloadFile(result.tsx, `${settings.componentName}${settings.fileExtension}`)}
                        className="flex items-center space-x-1 px-3 py-1 border border-foreground/20 text-foreground hover:bg-foreground/10"
                      >
                        <Download size={14} />
                        <span>保存</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="h-[calc(100vh-300px)] overflow-auto">
                {result ? (
                  <div>
                    {/* Errors and Warnings */}
                    {(result.errors.length > 0 || result.warnings.length > 0) && (
                      <div className="p-4 border-b border-foreground/20">
                        {result.errors.map((error, index) => (
                          <div key={index} className="flex items-center space-x-2 text-red-500 text-sm mb-1">
                            <AlertCircle size={14} />
                            <span>{error}</span>
                          </div>
                        ))}
                        {result.warnings.map((warning, index) => (
                          <div key={index} className="flex items-center space-x-2 text-yellow-500 text-sm mb-1">
                            <AlertCircle size={14} />
                            <span>{warning}</span>
                          </div>
                        ))}
                      </div>
                    )}
                    
                    {/* Code Output */}
                    <pre className="p-4 text-sm font-mono text-foreground whitespace-pre-wrap overflow-auto">
                      {result.tsx || '// SVGを入力すると、ここにTSXコードが表示されます'}
                    </pre>
                  </div>
                ) : (
                  <div className="p-8 text-center">
                    <FileText size={48} className="mx-auto text-foreground/30 mb-4" />
                    <p className="noto-sans-jp text-foreground/60">
                      SVGを入力すると、ここにTSXコードが表示されます
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}