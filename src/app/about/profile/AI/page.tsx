'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { Bot, User, Send, Sparkles } from 'lucide-react';

interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  content: string;
  timestamp: string;
}

const predefinedQuestions = [
  'samuidoについて教えて',
  'どんなスキルを持っていますか？',
  '最近の作品を教えて',
  '連絡先を教えて',
  'コーヒーは好きですか？',
];

const aiResponses: Record<string, string> = {
  'samuidoについて教えて': `こんにちは！私はsamuido（さむいど）のAI版プロフィールです。

samuido（本名：木村友亮）は、Web開発、デザイン、映像制作など幅広い分野で活動するクリエイター・エンジニアです。

現在は高専生として学びながら、個人開発やコンテスト参加なども積極的に行っています。

特徴的なのは「やる気になれば何でもできる」というスタンスで、新しい技術や分野にも果敢に挑戦し続けていることです。`,

  'どんなスキルを持っていますか？': `samuidoのスキルセットは非常に幅広いです：

🎨 **デザイン**
- Photoshop, Illustrator, Adobe XD, Figma
- UI/UX デザイン、グラフィックデザイン

💻 **プログラミング**
- JavaScript, TypeScript, React, Next.js
- HTML/CSS, Tailwind CSS
- C/C++/C#, Node.js

🎬 **映像制作**
- After Effects, Premiere Pro, Blender
- モーショングラフィックス、エフェクト制作

🎮 **その他**
- Unity, Cubase, p5.js, PIXI.js, GSAP

技術力と創造性の両方を兼ね備えているのが強みです。`,

  '最近の作品を教えて': `最近の主要な作品をご紹介します：

🌐 **React Portfolio Website**
- このウェブサイト自体が最新の作品です
- Next.js 15 + React 19 で構築
- レスポンシブデザイン、アニメーション

🛠️ **開発ツール**
- Color Palette Generator
- QR Code Generator
- Text Counter & Analyzer

🏆 **受賞歴**
- 中国地区高専コンピュータフェスティバル2024 ゲーム部門 1位
- U-16プログラミングコンテスト山口大会 技術賞・企業賞

他にも多数のプロジェクトが進行中です！`,

  '連絡先を教えて': `samuidoへの連絡先は以下の通りです：

📧 **開発・技術依頼**
- rebuild.up.up@gmail.com
- Twitter: @361do_sleep

🎨 **映像・デザイン依頼**
- 361do.sleep@gmail.com
- Twitter: @361do_design

お仕事の依頼、技術的な質問、コラボレーションなど、お気軽にご連絡ください！

同業者の方との交流も大歓迎です。`,

  'コーヒーは好きですか？': `実は、samuidoはコーヒーよりも緑茶派なんです！ ☕→🍵

夜中に作業することが多いので、カフェインは緑茶で摂取することが多いようです。

制作のお供には音楽も欠かせません。ジャンルは問わず、その時の気分に合わせて色々聴いています。

作業環境にはこだわりがあり、集中できる空間作りにも気を配っています。`,

  'default': `申し訳ございません。その質問についてはまだ学習データがないようです。

以下のような質問でしたら、詳しくお答えできます：

• samuidoについて教えて
• どんなスキルを持っていますか？
• 最近の作品を教えて
• 連絡先を教えて
• コーヒーは好きですか？

または、直接本人にお問い合わせください：
📧 rebuild.up.up@gmail.com`,
};

export default function AIProfilePage() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    const initialMessage: ChatMessage = {
      id: '1',
      sender: 'ai',
      content: `こんにちは！私はsamuido（さむいど）のAI版プロフィールです。

何でもお気軽にお聞きください！
下のボタンをクリックするか、直接質問を入力してください。`,
      timestamp: new Date().toLocaleTimeString(),
    };
    setMessages([initialMessage]);
  }, []);

  const handleSendMessage = async (content: string) => {
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      content,
      timestamp: new Date().toLocaleTimeString(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    setTimeout(() => {
      const response = aiResponses[content] || aiResponses['default'];
      const aiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'ai',
        content: response,
        timestamp: new Date().toLocaleTimeString(),
      };

      setMessages(prev => [...prev, aiMessage]);
      setIsTyping(false);
    }, 1000 + Math.random() * 2000);
  };

  const handleInputSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim()) {
      handleSendMessage(inputValue);
    }
  };

  return (
    <div className="bg-gray min-h-screen">
      {/* Navigation */}
      <nav className="border-foreground/20 border-b p-4">
        <div className="mx-auto max-w-7xl">
          <Link
            href="/about"
            className="neue-haas-grotesk-display text-primary hover:text-primary/80 text-2xl"
          >
            ← About
          </Link>
        </div>
      </nav>

      {/* Header */}
      <header className="px-4 py-8 text-center">
        <div className="bg-gradient-to-r from-green-500 to-blue-500 mx-auto mb-4 h-16 w-16 rounded-full flex items-center justify-center">
          <Bot size={32} className="text-white" />
        </div>
        <h1 className="neue-haas-grotesk-display text-primary mb-2 text-3xl md:text-4xl">
          AI Chat Profile
        </h1>
        <p className="noto-sans-jp text-foreground/80 text-sm md:text-base">
          AIとチャットしながらsamuidoについて知ろう
        </p>
      </header>

      {/* Chat Interface */}
      <main className="mx-auto max-w-3xl px-4 pb-32">
        <div className="border-foreground/20 bg-gray/50 border rounded-lg">
          {/* Chat Messages */}
          <div className="p-6 space-y-4 max-h-96 overflow-y-auto">
            {messages.map(message => (
              <div
                key={message.id}
                className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                    message.sender === 'user'
                      ? 'bg-primary text-white'
                      : 'bg-foreground/10 text-foreground'
                  }`}
                >
                  <div className="flex items-center space-x-2 mb-1">
                    {message.sender === 'user' ? (
                      <User size={14} />
                    ) : (
                      <Bot size={14} />
                    )}
                    <span className="text-xs opacity-70">
                      {message.sender === 'user' ? 'You' : 'AI samuido'}
                    </span>
                    <span className="text-xs opacity-50">{message.timestamp}</span>
                  </div>
                  <div className="text-sm whitespace-pre-line leading-relaxed">
                    {message.content}
                  </div>
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-foreground/10 text-foreground max-w-xs lg:max-w-md px-4 py-2 rounded-lg">
                  <div className="flex items-center space-x-2 mb-1">
                    <Bot size={14} />
                    <span className="text-xs opacity-70">AI samuido</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <div className="bg-foreground/30 w-2 h-2 rounded-full animate-bounce"></div>
                    <div className="bg-foreground/30 w-2 h-2 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="bg-foreground/30 w-2 h-2 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Quick Questions */}
          <div className="border-t border-foreground/20 p-4">
            <h3 className="neue-haas-grotesk-display text-foreground mb-3 text-sm">
              よくある質問
            </h3>
            <div className="flex flex-wrap gap-2">
              {predefinedQuestions.map(question => (
                <button
                  key={question}
                  onClick={() => handleSendMessage(question)}
                  className="border-foreground/20 text-foreground/80 hover:border-primary hover:text-primary border px-3 py-1 rounded text-xs transition-colors"
                >
                  {question}
                </button>
              ))}
            </div>
          </div>

          {/* Input Form */}
          <form onSubmit={handleInputSubmit} className="border-t border-foreground/20 p-4">
            <div className="flex items-center space-x-2">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="質問を入力してください..."
                className="flex-1 border-foreground/20 bg-gray/50 text-foreground border rounded px-3 py-2 text-sm focus:outline-none focus:border-primary"
              />
              <button
                type="submit"
                disabled={!inputValue.trim() || isTyping}
                className="bg-primary hover:bg-primary/90 disabled:opacity-50 text-white px-4 py-2 rounded flex items-center space-x-1 transition-colors"
              >
                <Send size={16} />
                <span className="text-sm">送信</span>
              </button>
            </div>
          </form>
        </div>

        {/* Note */}
        <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-start space-x-3">
            <Sparkles size={20} className="text-yellow-600 mt-0.5" />
            <div>
              <h3 className="neue-haas-grotesk-display text-yellow-800 mb-1 text-sm">
                注意事項
              </h3>
              <p className="noto-sans-jp text-yellow-700 text-xs leading-relaxed">
                これは実際のAIではなく、事前に設定された回答を表示するデモンストレーションです。
                実際の質問やお問い合わせは、下記の連絡先までお気軽にどうぞ。
              </p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <section className="mt-8 text-center">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <Link
              href="/about/profile/real"
              className="group border-foreground/20 bg-gray/50 hover:border-primary border p-4 rounded transition-colors"
            >
              <h3 className="neue-haas-grotesk-display text-foreground group-hover:text-primary text-lg">
                正式なプロフィール
              </h3>
              <p className="noto-sans-jp text-foreground/70 text-sm">詳しい経歴・受賞歴</p>
            </Link>

            <Link
              href="/about/profile/handle"
              className="group border-foreground/20 bg-gray/50 hover:border-primary border p-4 rounded transition-colors"
            >
              <h3 className="neue-haas-grotesk-display text-foreground group-hover:text-primary text-lg">
                カジュアル版
              </h3>
              <p className="noto-sans-jp text-foreground/70 text-sm">ラフな自己紹介</p>
            </Link>

            <Link
              href="/contact"
              className="group border-foreground/20 bg-gray/50 hover:border-primary border p-4 rounded transition-colors"
            >
              <h3 className="neue-haas-grotesk-display text-foreground group-hover:text-primary text-lg">
                実際のお問い合わせ
              </h3>
              <p className="noto-sans-jp text-foreground/70 text-sm">連絡フォーム</p>
            </Link>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-foreground/20 border-t py-8 text-center">
        <p className="noto-sans-jp text-foreground/60 text-sm">
          © 2025 samuido. AI Chat Profile Demo.
        </p>
      </footer>
    </div>
  );
}