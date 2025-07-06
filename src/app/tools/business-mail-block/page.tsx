'use client';

import Link from "next/link";
import { useState, useEffect } from "react";
import { 
  ArrowLeft, 
  Copy,
  Download,
  Search,
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
  Star,
  Mail,
  FileText,
  User,
  MessageSquare
} from "lucide-react";

interface MailBlock {
  id: string;
  name: string;
  category: 'greeting' | 'body' | 'closing' | 'signature';
  content: string;
  variables: string[];
  isCustomizable: boolean;
  difficulty: 'easy' | 'medium' | 'hard';
  tags: string[];
  usageCount?: number;
}

interface TemplateBlock {
  id: string;
  blockId: string;
  content: string;
  customContent?: string;
  variables?: Record<string, string>;
}

const categories = [
  { id: 'all', name: '全て', icon: <Mail size={16} /> },
  { id: 'greeting', name: '挨拶', icon: <User size={16} /> },
  { id: 'body', name: '本文', icon: <MessageSquare size={16} /> },
  { id: 'closing', name: '締め', icon: <FileText size={16} /> },
  { id: 'signature', name: '署名', icon: <FileText size={16} /> },
];

const sampleBlocks: MailBlock[] = [
  {
    id: 'greeting-first',
    name: '初回挨拶',
    category: 'greeting',
    content: 'はじめまして、[会社名]の[名前]です。',
    variables: ['会社名', '名前'],
    isCustomizable: true,
    difficulty: 'easy',
    tags: ['初回', '挨拶', 'ビジネス'],
    usageCount: 1543
  },
  {
    id: 'greeting-continuous',
    name: '継続挨拶',
    category: 'greeting',
    content: 'いつもお世話になっております。[会社名]の[名前]です。',
    variables: ['会社名', '名前'],
    isCustomizable: true,
    difficulty: 'easy',
    tags: ['継続', '挨拶', 'ビジネス'],
    usageCount: 2891
  },
  {
    id: 'greeting-seasonal',
    name: '季節挨拶',
    category: 'greeting',
    content: '[季節の挨拶]、いかがお過ごしでしょうか。',
    variables: ['季節の挨拶'],
    isCustomizable: true,
    difficulty: 'medium',
    tags: ['季節', '挨拶'],
    usageCount: 672
  },
  {
    id: 'body-request',
    name: '依頼',
    category: 'body',
    content: 'つきましては、[内容]についてご相談させていただきたく存じます。',
    variables: ['内容'],
    isCustomizable: true,
    difficulty: 'medium',
    tags: ['依頼', '相談'],
    usageCount: 1834
  },
  {
    id: 'body-confirm',
    name: '確認',
    category: 'body',
    content: 'ご多忙の中恐縮ですが、[内容]についてご確認をお願いいたします。',
    variables: ['内容'],
    isCustomizable: true,
    difficulty: 'medium',
    tags: ['確認', '依頼'],
    usageCount: 1245
  },
  {
    id: 'body-report',
    name: '報告',
    category: 'body',
    content: 'この度、[内容]についてご報告させていただきます。',
    variables: ['内容'],
    isCustomizable: true,
    difficulty: 'easy',
    tags: ['報告', '連絡'],
    usageCount: 987
  },
  {
    id: 'closing-consideration',
    name: '返信依頼',
    category: 'closing',
    content: 'ご検討のほど、よろしくお願いいたします。',
    variables: [],
    isCustomizable: false,
    difficulty: 'easy',
    tags: ['返信', '依頼'],
    usageCount: 2156
  },
  {
    id: 'closing-contact',
    name: '連絡依頼',
    category: 'closing',
    content: 'ご不明な点がございましたら、お気軽にお声がけください。',
    variables: [],
    isCustomizable: false,
    difficulty: 'easy',
    tags: ['連絡', '依頼'],
    usageCount: 1789
  },
  {
    id: 'closing-cooperation',
    name: '協力依頼',
    category: 'closing',
    content: 'ご協力のほど、よろしくお願いいたします。',
    variables: [],
    isCustomizable: false,
    difficulty: 'easy',
    tags: ['協力', '依頼'],
    usageCount: 1432
  },
  {
    id: 'signature-basic',
    name: '基本署名',
    category: 'signature',
    content: '━━━━━━━━━━━━━━━━━━━━━━\n[会社名] [部署名]\n[名前]\nTEL: [電話番号]\nEmail: [メールアドレス]\n━━━━━━━━━━━━━━━━━━━━━━',
    variables: ['会社名', '部署名', '名前', '電話番号', 'メールアドレス'],
    isCustomizable: true,
    difficulty: 'medium',
    tags: ['署名', '連絡先'],
    usageCount: 3245
  },
  {
    id: 'signature-social',
    name: 'SNS付き署名',
    category: 'signature',
    content: '━━━━━━━━━━━━━━━━━━━━━━\n[会社名] [部署名]\n[名前]\nTEL: [電話番号]\nEmail: [メールアドレス]\nTwitter: [Twitterアカウント]\nLinkedIn: [LinkedInプロフィール]\n━━━━━━━━━━━━━━━━━━━━━━',
    variables: ['会社名', '部署名', '名前', '電話番号', 'メールアドレス', 'Twitterアカウント', 'LinkedInプロフィール'],
    isCustomizable: true,
    difficulty: 'hard',
    tags: ['署名', 'SNS', '連絡先'],
    usageCount: 789
  }
];

export default function BusinessMailBlockPage() {
  const [blocks] = useState<MailBlock[]>(sampleBlocks);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [templateBlocks, setTemplateBlocks] = useState<TemplateBlock[]>([]);
  const [generatedMail, setGeneratedMail] = useState('');
  const [variables, setVariables] = useState<Record<string, string>>({});
  const [favorites, setFavorites] = useState<string[]>([]);

  useEffect(() => {
    generateMail();
  }, [templateBlocks, variables]);

  const generateMail = () => {
    let mail = '';
    
    templateBlocks.forEach((templateBlock, index) => {
      const block = blocks.find(b => b.id === templateBlock.blockId);
      if (!block) return;
      
      let content = templateBlock.customContent || block.content;
      
      // Replace variables
      block.variables.forEach(variable => {
        const value = variables[variable] || `[${variable}]`;
        content = content.replace(new RegExp(`\\[${variable}\\]`, 'g'), value);
      });
      
      mail += content;
      if (index < templateBlocks.length - 1) {
        mail += '\n\n';
      }
    });
    
    setGeneratedMail(mail);
  };

  const filteredBlocks = blocks.filter(block => {
    const matchesCategory = selectedCategory === 'all' || block.category === selectedCategory;
    const matchesSearch = searchQuery === '' || 
      block.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      block.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      block.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    
    return matchesCategory && matchesSearch;
  });

  const addBlockToTemplate = (block: MailBlock) => {
    const newTemplateBlock: TemplateBlock = {
      id: Date.now().toString(),
      blockId: block.id,
      content: block.content
    };
    setTemplateBlocks(prev => [...prev, newTemplateBlock]);
    
    // Add variables to the variables state
    block.variables.forEach(variable => {
      if (!variables[variable]) {
        setVariables(prev => ({ ...prev, [variable]: '' }));
      }
    });
  };

  const removeBlockFromTemplate = (templateBlockId: string) => {
    setTemplateBlocks(prev => prev.filter(block => block.id !== templateBlockId));
  };

  const moveBlockUp = (index: number) => {
    if (index === 0) return;
    const newBlocks = [...templateBlocks];
    [newBlocks[index - 1], newBlocks[index]] = [newBlocks[index], newBlocks[index - 1]];
    setTemplateBlocks(newBlocks);
  };

  const moveBlockDown = (index: number) => {
    if (index === templateBlocks.length - 1) return;
    const newBlocks = [...templateBlocks];
    [newBlocks[index], newBlocks[index + 1]] = [newBlocks[index + 1], newBlocks[index]];
    setTemplateBlocks(newBlocks);
  };

  const toggleFavorite = (blockId: string) => {
    setFavorites(prev => 
      prev.includes(blockId) 
        ? prev.filter(id => id !== blockId)
        : [...prev, blockId]
    );
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const downloadMail = () => {
    const blob = new Blob([generatedMail], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'business-mail.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "Business Mail Block Tool",
    "description": "ビジネスメールをScratch風ブロックUIで作成",
    "url": "https://yusuke-kim.com/tools/business-mail-block",
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
              Business Mail Block Tool
            </h1>
          </div>
        </nav>

        <div className="max-w-7xl mx-auto p-4">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[calc(100vh-120px)]">
            {/* Block Library */}
            <div className="lg:col-span-1 border border-foreground/20 bg-gray/50 flex flex-col">
              <div className="p-4 border-b border-foreground/20">
                <h2 className="neue-haas-grotesk-display text-lg text-foreground mb-4">
                  メールブロック
                </h2>
                
                {/* Search */}
                <div className="relative mb-4">
                  <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-foreground/50" />
                  <input
                    type="text"
                    placeholder="ブロックを検索..."
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

              {/* Block List */}
              <div className="flex-1 overflow-y-auto">
                {filteredBlocks.map((block) => (
                  <div
                    key={block.id}
                    className="p-4 border-b border-foreground/20 hover:bg-primary/5 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="neue-haas-grotesk-display text-sm text-foreground">
                        {block.name}
                      </h3>
                      <div className="flex items-center space-x-1">
                        <button
                          onClick={() => toggleFavorite(block.id)}
                          className="p-1 hover:bg-foreground/10 rounded"
                        >
                          <Star
                            size={14}
                            className={`${
                              favorites.includes(block.id)
                                ? 'text-yellow-500 fill-current'
                                : 'text-foreground/40'
                            }`}
                          />
                        </button>
                        <button
                          onClick={() => addBlockToTemplate(block)}
                          className="p-1 hover:bg-primary/10 rounded text-primary"
                          title="テンプレートに追加"
                        >
                          <Plus size={14} />
                        </button>
                      </div>
                    </div>
                    
                    <p className="noto-sans-jp text-xs text-foreground/70 mb-2 line-clamp-2">
                      {block.content}
                    </p>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex flex-wrap gap-1">
                        {block.tags.slice(0, 2).map((tag) => (
                          <span
                            key={tag}
                            className="px-2 py-1 bg-foreground/10 text-foreground/70 text-xs rounded"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                      <div className="text-xs text-foreground/50">
                        {block.usageCount?.toLocaleString()}回
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Template Builder */}
            <div className="lg:col-span-1 border border-foreground/20 bg-gray/50 flex flex-col">
              <div className="p-4 border-b border-foreground/20">
                <h2 className="neue-haas-grotesk-display text-lg text-foreground mb-2">
                  テンプレート
                </h2>
                <p className="noto-sans-jp text-xs text-foreground/60">
                  左のブロックを追加してメールを組み立てます
                </p>
              </div>

              <div className="flex-1 overflow-y-auto p-4">
                {templateBlocks.length === 0 ? (
                  <div className="text-center py-8">
                    <Mail size={48} className="mx-auto text-foreground/30 mb-4" />
                    <p className="noto-sans-jp text-foreground/60 text-sm">
                      ブロックを追加してください
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {templateBlocks.map((templateBlock, index) => {
                      const block = blocks.find(b => b.id === templateBlock.blockId);
                      if (!block) return null;
                      
                      return (
                        <div
                          key={templateBlock.id}
                          className="border border-primary/30 bg-primary/5 p-3 rounded"
                        >
                          <div className="flex items-center justify-between mb-2">
                            <span className="neue-haas-grotesk-display text-sm text-primary">
                              {block.name}
                            </span>
                            <div className="flex items-center space-x-1">
                              <button
                                onClick={() => moveBlockUp(index)}
                                disabled={index === 0}
                                className="p-1 hover:bg-foreground/10 rounded disabled:opacity-50"
                              >
                                <ArrowUp size={12} />
                              </button>
                              <button
                                onClick={() => moveBlockDown(index)}
                                disabled={index === templateBlocks.length - 1}
                                className="p-1 hover:bg-foreground/10 rounded disabled:opacity-50"
                              >
                                <ArrowDown size={12} />
                              </button>
                              <button
                                onClick={() => removeBlockFromTemplate(templateBlock.id)}
                                className="p-1 hover:bg-red-500/10 rounded text-red-500"
                              >
                                <Trash2 size={12} />
                              </button>
                            </div>
                          </div>
                          
                          <p className="noto-sans-jp text-xs text-foreground/70">
                            {block.content}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Variables Panel */}
            <div className="lg:col-span-1 border border-foreground/20 bg-gray/50 flex flex-col">
              <div className="p-4 border-b border-foreground/20">
                <h2 className="neue-haas-grotesk-display text-lg text-foreground mb-2">
                  変数設定
                </h2>
                <p className="noto-sans-jp text-xs text-foreground/60">
                  メールで使用する変数を設定します
                </p>
              </div>

              <div className="flex-1 overflow-y-auto p-4">
                {Object.keys(variables).length === 0 ? (
                  <div className="text-center py-8">
                    <FileText size={48} className="mx-auto text-foreground/30 mb-4" />
                    <p className="noto-sans-jp text-foreground/60 text-sm">
                      変数を含むブロックを追加すると<br />
                      ここに表示されます
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {Object.entries(variables).map(([variable, value]) => (
                      <div key={variable} className="space-y-2">
                        <label className="neue-haas-grotesk-display text-sm text-foreground">
                          {variable}
                        </label>
                        <input
                          type="text"
                          value={value}
                          onChange={(e) => setVariables(prev => ({
                            ...prev,
                            [variable]: e.target.value
                          }))}
                          placeholder={`${variable}を入力`}
                          className="w-full px-3 py-2 border border-foreground/20 bg-gray text-foreground rounded-none focus:border-primary focus:outline-none noto-sans-jp text-sm"
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Mail Preview */}
            <div className="lg:col-span-1 border border-foreground/20 bg-gray/50 flex flex-col">
              <div className="p-4 border-b border-foreground/20">
                <div className="flex items-center justify-between">
                  <h2 className="neue-haas-grotesk-display text-lg text-foreground">
                    メールプレビュー
                  </h2>
                  
                  {generatedMail && (
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => copyToClipboard(generatedMail)}
                        className="flex items-center space-x-1 px-3 py-1 border border-primary text-primary hover:bg-primary/10"
                      >
                        <Copy size={14} />
                        <span className="text-sm">コピー</span>
                      </button>
                      
                      <button
                        onClick={downloadMail}
                        className="flex items-center space-x-1 px-3 py-1 border border-foreground/20 text-foreground hover:bg-foreground/10"
                      >
                        <Download size={14} />
                        <span className="text-sm">保存</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-4">
                <div className="bg-white border border-foreground/10 p-6 min-h-full">
                  <pre className="noto-sans-jp text-sm text-gray-800 whitespace-pre-wrap leading-relaxed">
                    {generatedMail || '件名: \n\n[宛先様]\n\nテンプレートを組み立てると、ここにメールが表示されます。'}
                  </pre>
                </div>
              </div>

              {templateBlocks.length > 0 && (
                <div className="p-4 border-t border-foreground/20 bg-primary/5">
                  <h3 className="neue-haas-grotesk-display text-sm text-primary mb-2">
                    使用ガイド
                  </h3>
                  <ul className="noto-sans-jp text-xs text-foreground/70 space-y-1">
                    <li>• 左からブロックを追加してメールを構成</li>
                    <li>• 変数に値を入力してカスタマイズ</li>
                    <li>• 順序を調整して最適な構成に</li>
                    <li>• 完成したらコピーまたはダウンロード</li>
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}