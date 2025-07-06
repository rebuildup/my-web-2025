'use client';

import Link from "next/link";
import { useState, useEffect } from "react";
import { 
  ArrowLeft, 
  Play,
  Pause,
  Copy,
  Search,
  Filter,
  Star,
  Download,
  Code2,
  Zap,
  RotateCcw,
  Settings,
  Palette,
  Move,
  Sparkles
} from "lucide-react";

interface AEExpression {
  id: string;
  name: string;
  description: string;
  category: 'animation' | 'effect' | 'transform' | 'utility';
  code: string;
  parameters: {
    name: string;
    type: 'number' | 'string' | 'boolean' | 'select';
    default: any;
    min?: number;
    max?: number;
    options?: string[];
    description: string;
  }[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  tags: string[];
  isFavorite?: boolean;
  usageCount?: number;
}

const categories = [
  { id: 'all', name: '全て', icon: <Code2 size={16} /> },
  { id: 'animation', name: 'アニメーション', icon: <Zap size={16} /> },
  { id: 'effect', name: 'エフェクト', icon: <Sparkles size={16} /> },
  { id: 'transform', name: '変形', icon: <Move size={16} /> },
  { id: 'utility', name: 'ユーティリティ', icon: <Settings size={16} /> },
];

const sampleExpressions: AEExpression[] = [
  {
    id: 'wiggle',
    name: 'Wiggle',
    description: 'ランダムな動きを生成します',
    category: 'animation',
    code: 'wiggle(frequency, amplitude)',
    parameters: [
      { name: 'frequency', type: 'number', default: 1, min: 0.1, max: 10, description: 'ぶれの頻度' },
      { name: 'amplitude', type: 'number', default: 50, min: 1, max: 1000, description: 'ぶれの幅' }
    ],
    difficulty: 'beginner',
    tags: ['ランダム', '動き', 'アニメーション'],
    usageCount: 2847
  },
  {
    id: 'loopOut',
    name: 'Loop Out',
    description: 'アニメーションをループします',
    category: 'animation',
    code: 'loopOut(type, numKeyframes)',
    parameters: [
      { name: 'type', type: 'select', default: 'cycle', options: ['cycle', 'pingpong', 'offset', 'continue'], description: 'ループの種類' },
      { name: 'numKeyframes', type: 'number', default: 0, min: 0, max: 10, description: 'キーフレーム数' }
    ],
    difficulty: 'intermediate',
    tags: ['ループ', 'キーフレーム'],
    usageCount: 1923
  },
  {
    id: 'time',
    name: 'Time',
    description: '時間に基づくアニメーション',
    category: 'animation',
    code: 'time * multiplier',
    parameters: [
      { name: 'multiplier', type: 'number', default: 100, min: 0.1, max: 1000, description: '時間の倍率' }
    ],
    difficulty: 'beginner',
    tags: ['時間', 'アニメーション'],
    usageCount: 3124
  },
  {
    id: 'bounce',
    name: 'Bounce',
    description: 'バウンス効果を作成',
    category: 'animation',
    code: 'amplitude = params.amplitude;\nfrequency = params.frequency;\ndecay = params.decay;\nMath.sin(frequency * time * Math.PI * 2) * amplitude * Math.exp(-decay * time)',
    parameters: [
      { name: 'amplitude', type: 'number', default: 100, min: 1, max: 500, description: 'バウンスの高さ' },
      { name: 'frequency', type: 'number', default: 2, min: 0.1, max: 10, description: 'バウンスの頻度' },
      { name: 'decay', type: 'number', default: 2, min: 0, max: 10, description: '減衰率' }
    ],
    difficulty: 'advanced',
    tags: ['バウンス', 'イージング'],
    usageCount: 856
  },
  {
    id: 'blur',
    name: 'Blur Effect',
    description: 'ぼかし効果を動的に制御',
    category: 'effect',
    code: '[intensity, intensity]',
    parameters: [
      { name: 'intensity', type: 'number', default: 10, min: 0, max: 100, description: 'ぼかしの強度' }
    ],
    difficulty: 'beginner',
    tags: ['ぼかし', 'エフェクト'],
    usageCount: 1456
  },
  {
    id: 'scale-pulse',
    name: 'Scale Pulse',
    description: 'スケールのパルス効果',
    category: 'transform',
    code: 'baseScale = params.baseScale;\namp = params.amplitude;\nfreq = params.frequency;\n[baseScale + Math.sin(time * freq) * amp, baseScale + Math.sin(time * freq) * amp]',
    parameters: [
      { name: 'baseScale', type: 'number', default: 100, min: 1, max: 500, description: 'ベーススケール' },
      { name: 'amplitude', type: 'number', default: 20, min: 1, max: 100, description: 'パルスの振幅' },
      { name: 'frequency', type: 'number', default: 2, min: 0.1, max: 10, description: 'パルスの頻度' }
    ],
    difficulty: 'intermediate',
    tags: ['スケール', 'パルス'],
    usageCount: 734
  }
];

export default function AEExpressionPage() {
  const [expressions] = useState<AEExpression[]>(sampleExpressions);
  const [selectedExpression, setSelectedExpression] = useState<AEExpression | null>(null);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [parameterValues, setParameterValues] = useState<Record<string, any>>({});
  const [generatedCode, setGeneratedCode] = useState('');
  const [isPlaying, setIsPlaying] = useState(false);
  const [favorites, setFavorites] = useState<string[]>([]);

  useEffect(() => {
    if (selectedExpression) {
      // Initialize parameter values with defaults
      const initialParams: Record<string, any> = {};
      selectedExpression.parameters.forEach(param => {
        initialParams[param.name] = param.default;
      });
      setParameterValues(initialParams);
    }
  }, [selectedExpression]);

  useEffect(() => {
    if (selectedExpression) {
      generateCode();
    }
  }, [parameterValues, selectedExpression]);

  const generateCode = () => {
    if (!selectedExpression) return;
    
    let code = selectedExpression.code;
    selectedExpression.parameters.forEach(param => {
      const value = parameterValues[param.name] || param.default;
      if (param.type === 'string' || param.type === 'select') {
        code = code.replace(new RegExp(`params\\.${param.name}`, 'g'), `"${value}"`);
      } else {
        code = code.replace(new RegExp(`params\\.${param.name}`, 'g'), value.toString());
      }
      // Also replace direct parameter names
      code = code.replace(new RegExp(`\\b${param.name}\\b`, 'g'), value.toString());
    });
    setGeneratedCode(code);
  };

  const filteredExpressions = expressions.filter(expr => {
    const matchesCategory = selectedCategory === 'all' || expr.category === selectedCategory;
    const matchesSearch = searchQuery === '' || 
      expr.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      expr.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      expr.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    
    return matchesCategory && matchesSearch;
  });

  const toggleFavorite = (expressionId: string) => {
    setFavorites(prev => 
      prev.includes(expressionId) 
        ? prev.filter(id => id !== expressionId)
        : [...prev, expressionId]
    );
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      // Show success feedback (implement toast if needed)
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "AE Expression Tool",
    "description": "AfterEffectsのエクスプレッションをScratch風ブロックUIで設定",
    "url": "https://yusuke-kim.com/tools/ae-expression",
    "applicationCategory": "DesignApplication",
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
              AE Expression Tool
            </h1>
          </div>
        </nav>

        <div className="max-w-7xl mx-auto p-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-120px)]">
            {/* Expression Library */}
            <div className="lg:col-span-1 border border-foreground/20 bg-gray/50 flex flex-col">
              <div className="p-4 border-b border-foreground/20">
                <h2 className="neue-haas-grotesk-display text-lg text-foreground mb-4">
                  エクスプレッション一覧
                </h2>
                
                {/* Search */}
                <div className="relative mb-4">
                  <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-foreground/50" />
                  <input
                    type="text"
                    placeholder="検索..."
                    className="w-full pl-10 pr-4 py-2 border border-foreground/20 bg-gray text-foreground rounded-none focus:border-primary focus:outline-none noto-sans-jp text-sm"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>

                {/* Categories */}
                <div className="flex flex-wrap gap-2">
                  {categories.map((category) => (
                    <button
                      key={category.id}
                      onClick={() => setSelectedCategory(category.id)}
                      className={`flex items-center space-x-1 px-3 py-1 border transition-colors text-sm ${
                        selectedCategory === category.id
                          ? 'border-primary bg-primary/10 text-primary'
                          : 'border-foreground/20 text-foreground/70 hover:border-primary/50'
                      }`}
                    >
                      {category.icon}
                      <span>{category.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Expression List */}
              <div className="flex-1 overflow-y-auto">
                {filteredExpressions.map((expression) => (
                  <div
                    key={expression.id}
                    onClick={() => setSelectedExpression(expression)}
                    className={`p-4 border-b border-foreground/20 cursor-pointer hover:bg-primary/5 transition-colors ${
                      selectedExpression?.id === expression.id ? 'bg-primary/10 border-primary/30' : ''
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="neue-haas-grotesk-display text-sm text-foreground">
                        {expression.name}
                      </h3>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleFavorite(expression.id);
                        }}
                        className="p-1 hover:bg-foreground/10 rounded"
                      >
                        <Star
                          size={14}
                          className={`${
                            favorites.includes(expression.id)
                              ? 'text-yellow-500 fill-current'
                              : 'text-foreground/40'
                          }`}
                        />
                      </button>
                    </div>
                    
                    <p className="noto-sans-jp text-xs text-foreground/70 mb-2">
                      {expression.description}
                    </p>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex flex-wrap gap-1">
                        {expression.tags.slice(0, 2).map((tag) => (
                          <span
                            key={tag}
                            className="px-2 py-1 bg-foreground/10 text-foreground/70 text-xs rounded"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                      <div className="text-xs text-foreground/50">
                        {expression.usageCount?.toLocaleString()}回
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Main Editor */}
            <div className="lg:col-span-2 grid grid-rows-2 gap-6">
              {/* Parameter Panel */}
              <div className="border border-foreground/20 bg-gray/50 p-4">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="neue-haas-grotesk-display text-lg text-foreground">
                    {selectedExpression ? selectedExpression.name : 'エクスプレッションを選択'}
                  </h2>
                  
                  {selectedExpression && (
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => setIsPlaying(!isPlaying)}
                        className="flex items-center space-x-1 px-3 py-1 border border-primary text-primary hover:bg-primary/10"
                      >
                        {isPlaying ? <Pause size={14} /> : <Play size={14} />}
                        <span className="text-sm">{isPlaying ? '停止' : '再生'}</span>
                      </button>
                      
                      <button
                        onClick={() => copyToClipboard(generatedCode)}
                        className="flex items-center space-x-1 px-3 py-1 border border-foreground/20 text-foreground hover:bg-foreground/10"
                      >
                        <Copy size={14} />
                        <span className="text-sm">コピー</span>
                      </button>
                    </div>
                  )}
                </div>

                {selectedExpression ? (
                  <div>
                    <p className="noto-sans-jp text-sm text-foreground/70 mb-4">
                      {selectedExpression.description}
                    </p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {selectedExpression.parameters.map((param) => (
                        <div key={param.name} className="space-y-2">
                          <label className="neue-haas-grotesk-display text-sm text-foreground">
                            {param.name}
                          </label>
                          <p className="noto-sans-jp text-xs text-foreground/60">
                            {param.description}
                          </p>
                          
                          {param.type === 'number' ? (
                            <div className="space-y-2">
                              <input
                                type="range"
                                min={param.min || 0}
                                max={param.max || 100}
                                step={0.1}
                                value={parameterValues[param.name] || param.default}
                                onChange={(e) => setParameterValues(prev => ({
                                  ...prev,
                                  [param.name]: parseFloat(e.target.value)
                                }))}
                                className="w-full"
                              />
                              <input
                                type="number"
                                min={param.min}
                                max={param.max}
                                step={0.1}
                                value={parameterValues[param.name] || param.default}
                                onChange={(e) => setParameterValues(prev => ({
                                  ...prev,
                                  [param.name]: parseFloat(e.target.value)
                                }))}
                                className="w-full px-3 py-2 border border-foreground/20 bg-gray text-foreground rounded-none focus:border-primary focus:outline-none"
                              />
                            </div>
                          ) : param.type === 'select' ? (
                            <select
                              value={parameterValues[param.name] || param.default}
                              onChange={(e) => setParameterValues(prev => ({
                                ...prev,
                                [param.name]: e.target.value
                              }))}
                              className="w-full px-3 py-2 border border-foreground/20 bg-gray text-foreground rounded-none focus:border-primary focus:outline-none"
                            >
                              {param.options?.map((option) => (
                                <option key={option} value={option}>
                                  {option}
                                </option>
                              ))}
                            </select>
                          ) : param.type === 'boolean' ? (
                            <label className="flex items-center space-x-2">
                              <input
                                type="checkbox"
                                checked={parameterValues[param.name] || param.default}
                                onChange={(e) => setParameterValues(prev => ({
                                  ...prev,
                                  [param.name]: e.target.checked
                                }))}
                                className="w-4 h-4"
                              />
                              <span className="text-sm">有効</span>
                            </label>
                          ) : (
                            <input
                              type="text"
                              value={parameterValues[param.name] || param.default}
                              onChange={(e) => setParameterValues(prev => ({
                                ...prev,
                                [param.name]: e.target.value
                              }))}
                              className="w-full px-3 py-2 border border-foreground/20 bg-gray text-foreground rounded-none focus:border-primary focus:outline-none"
                            />
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Code2 size={48} className="mx-auto text-foreground/30 mb-4" />
                    <p className="noto-sans-jp text-foreground/60">
                      左側のリストからエクスプレッションを選択してください
                    </p>
                  </div>
                )}
              </div>

              {/* Code Preview */}
              <div className="border border-foreground/20 bg-gray/50 p-4">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="neue-haas-grotesk-display text-lg text-foreground">
                    生成コード
                  </h2>
                  
                  {generatedCode && (
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => copyToClipboard(generatedCode)}
                        className="flex items-center space-x-1 px-3 py-1 border border-primary text-primary hover:bg-primary/10"
                      >
                        <Copy size={14} />
                        <span className="text-sm">コピー</span>
                      </button>
                      
                      <button
                        className="flex items-center space-x-1 px-3 py-1 border border-foreground/20 text-foreground hover:bg-foreground/10"
                      >
                        <Download size={14} />
                        <span className="text-sm">ダウンロード</span>
                      </button>
                    </div>
                  )}
                </div>

                <div className="bg-gray border border-foreground/10 p-4 rounded-none h-64 overflow-auto">
                  <pre className="text-sm font-mono text-foreground whitespace-pre-wrap">
                    {generatedCode || '// エクスプレッションを選択すると、ここにコードが表示されます'}
                  </pre>
                </div>

                {selectedExpression && (
                  <div className="mt-4 p-3 bg-primary/5 border border-primary/20">
                    <h3 className="neue-haas-grotesk-display text-sm text-primary mb-2">
                      使用方法
                    </h3>
                    <ol className="noto-sans-jp text-sm text-foreground/70 space-y-1">
                      <li>1. After Effectsでレイヤーのプロパティを選択</li>
                      <li>2. Alt + クリックで時計アイコンをエクスプレッションモードに</li>
                      <li>3. 生成されたコードをコピー&ペースト</li>
                      <li>4. Enterでエクスプレッションを適用</li>
                    </ol>
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