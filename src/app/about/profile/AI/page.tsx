"use client";

import Link from "next/link";
import type { Metadata } from "next";
import { useState, useRef, useEffect } from "react";
import { ArrowLeft, Bot, Send, User, Loader2 } from "lucide-react";

export const metadata: Metadata = {
  title: "AI Chat - samuido | AIのsamuidoと対話",
  description: "AIのsamuidoとチャット形式で対話。プロフィール、作品、技術について質問できます。",
  keywords: ["AIチャット", "samuido", "対話", "プロフィール", "作品", "技術"],
  robots: "index, follow",
  openGraph: {
    title: "AI Chat - samuido | AIのsamuidoと対話",
    description: "AIのsamuidoとチャット形式で対話。プロフィール、作品、技術について質問できます。",
    type: "website",
    url: "/about/profile/AI",
    images: [
      {
        url: "/about/profile-AI-og-image.jpg",
        width: 1200,
        height: 630,
        alt: "AI Chat samuido",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "AI Chat - samuido | AIのsamuidoと対話",
    description: "AIのsamuidoとチャット形式で対話。プロフィール、作品、技術について質問できます。",
    images: ["/about/profile-AI-twitter-image.jpg"],
    creator: "@361do_sleep",
  },
};

interface Message {
  id: string;
  content: string;
  timestamp: Date;
  sender: 'user' | 'ai';
  isTyping?: boolean;
}

const suggestedQuestions = [
  "プロフィールについて教えてください",
  "どんな技術スタックを使っていますか？",
  "最近作った作品は何ですか？",
  "After Effectsプラグイン開発について",
  "フロントエンド開発の経験は？",
  "映像制作について聞きたいです",
];

export default function AIProfilePage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      content: '//samuidoが現れました\n\nこんにちは！何か質問があれば気軽に聞いてください。',
      timestamp: new Date(),
      sender: 'ai'
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputMessage,
      timestamp: new Date(),
      sender: 'user'
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    // Simulate AI response delay
    setTimeout(() => {
      const aiResponse = generateAIResponse(inputMessage);
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: aiResponse,
        timestamp: new Date(),
        sender: 'ai'
      };

      setMessages(prev => [...prev, aiMessage]);
      setIsLoading(false);
    }, 1000 + Math.random() * 2000);
  };

  const generateAIResponse = (question: string): string => {
    const lowerQuestion = question.toLowerCase();
    
    if (lowerQuestion.includes('プロフィール') || lowerQuestion.includes('自己紹介')) {
      return 'そうですね 僕はsamuidoというハンドルネームで活動しています\n\nグラフィックデザイン、映像制作、個人開発など幅広くやってます\n高専生で制御情報工学科にいます\n\nやる気になれば何でもできるのが強みかもしれません(笑)';
    }
    
    if (lowerQuestion.includes('技術') || lowerQuestion.includes('スタック') || lowerQuestion.includes('プログラミング')) {
      return 'メインはフロントエンドですね\nReact、Next.js、TypeScriptあたりを使ってます\n\nAfter Effectsのプラグイン開発でC++も書きます\nAe_MultiSlicerとかAe_Stretchとか公開してます\n\nデザインはPhotoshop、Illustrator、Figmaを使ってます';
    }
    
    if (lowerQuestion.includes('作品') || lowerQuestion.includes('ポートフォリオ')) {
      return '最近はWebサイト制作が多いですね\nこのポートフォリオサイトもNext.jsで作りました\n\nAfter Effectsプラグインの開発もしてます\nGitHubで公開してるので見てみてください\n\n映像制作だとボカロのMVとか歌ってみたのMVを作ったりしてます';
    }
    
    if (lowerQuestion.includes('after effects') || lowerQuestion.includes('プラグイン')) {
      return 'After EffectsプラグインはC++で開発してます\nAviutlのリリックモーションをAeで再現したくて始めました\n\nAe_MultiSlicerは複数のレイヤーを一括でスライスできるプラグインです\nAe_Stretchは画像を引き延ばすエフェクトですね\n\nAdobe CEP(Common Extensibility Platform)を使ってUIも作ってます';
    }
    
    if (lowerQuestion.includes('映像') || lowerQuestion.includes('動画') || lowerQuestion.includes('編集')) {
      return 'AviutlからAfter Effectsに移行しました\nリリックモーション、アニメーションMVの制作依頼を受けたりしてます\n\nBlenderで3D制作もやります 3Dエフェクトは本当に面倒なので後回しです(笑)\n\nPremiere Proは基本的な編集で使ってます';
    }
    
    if (lowerQuestion.includes('Unity') || lowerQuestion.includes('ゲーム')) {
      return '高専1年の時に音楽ゲームを作りました\n中国地区高専コンピュータフェスティバル2024のゲーム部門で1位取れました\n\nC#でスクリプト書いて、UI/UXデザインも自分でやりました\nUnityは楽しいですが、最近はWeb開発に時間を使ってます';
    }
    
    if (lowerQuestion.includes('フロントエンド') || lowerQuestion.includes('web')) {
      return 'React、Next.jsがメインですね\nTypeScriptは必須だと思ってます\n\nTailwind CSSで効率的にスタイリング\np5.js、PIXI.js、GSAPでクリエイティブなアニメーションも作ります\n\n最近はモダンなWeb技術を使って表現の幅を広げることに興味があります';
    }
    
    if (lowerQuestion.includes('学校') || lowerQuestion.includes('高専')) {
      return '宇部高専の制御情報工学科3年です\n学生寮の2人部屋に住んでます\n\n5畳のスペースで椅子に寝そべって作業してます(笑)\n夜型で金土は23時から5時までオールすることも\n\n消灯後に映像編集とかプログラミングしてます';
    }
    
    // Default responses based on question style
    if (question.includes('？') || question.includes('?')) {
      return 'そうですね なんでも聞いてください\n\nあまり詳しくないことも適当なことしか言えませんが、分かる範囲でお答えします';
    }
    
    // Short acknowledgments for statements
    if (question.length < 20) {
      return 'そうですね\n\nありがとうございます';
    }
    
    // Default response
    return 'なるほど 興味深いですね\n\n具体的に何か聞きたいことがあれば教えてください\n技術的なことでも制作のことでも何でも';
  };

  const handleSuggestedQuestion = (question: string) => {
    setInputMessage(question);
    inputRef.current?.focus();
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "samuido AI Chat",
    "description": "AIのsamuidoとチャット形式で対話できるアプリケーション",
    "url": "https://yusuke-kim.com/about/profile/AI",
    "applicationCategory": "CommunicationApplication",
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
      
      <div className="min-h-screen bg-gray flex flex-col">
        {/* Navigation */}
        <nav className="border-b border-foreground/20 p-4 flex-shrink-0">
          <div className="max-w-7xl mx-auto">
            <Link 
              href="/about" 
              className="neue-haas-grotesk-display text-2xl text-primary hover:text-primary/80 flex items-center gap-2"
            >
              <ArrowLeft size={24} />
              About
            </Link>
          </div>
        </nav>

        {/* Header */}
        <header className="text-center py-8 px-4 border-b border-foreground/20 flex-shrink-0">
          <div className="max-w-4xl mx-auto">
            <div className="flex justify-center mb-4">
              <div className="p-3 border-2 border-primary rounded-full">
                <Bot size={32} className="text-primary" />
              </div>
            </div>
            <h1 className="neue-haas-grotesk-display text-4xl md:text-6xl text-primary mb-2">
              AI samuido
            </h1>
            <p className="noto-sans-jp text-foreground/80">
              AIのsamuidoと対話してみてください
            </p>
          </div>
        </header>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col max-w-4xl mx-auto w-full px-4 py-6">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto mb-6 space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`flex gap-3 max-w-[80%] ${message.sender === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                  {/* Avatar */}
                  <div className={`flex-shrink-0 w-8 h-8 rounded-full border-2 flex items-center justify-center ${
                    message.sender === 'user' 
                      ? 'border-blue-500 bg-blue-500 text-white' 
                      : 'border-primary bg-gray'
                  }`}>
                    {message.sender === 'user' ? <User size={16} /> : <Bot size={16} className="text-primary" />}
                  </div>
                  
                  {/* Message Bubble */}
                  <div className={`p-4 rounded-lg ${
                    message.sender === 'user'
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray/50 border border-foreground/20 text-foreground'
                  }`}>
                    <div className="whitespace-pre-wrap noto-sans-jp text-sm leading-relaxed">
                      {message.content}
                    </div>
                    <div className={`text-xs mt-2 ${
                      message.sender === 'user' ? 'text-blue-100' : 'text-foreground/50'
                    }`}>
                      {message.timestamp.toLocaleTimeString('ja-JP', { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {/* Typing Indicator */}
            {isLoading && (
              <div className="flex justify-start">
                <div className="flex gap-3 max-w-[80%]">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full border-2 border-primary bg-gray flex items-center justify-center">
                    <Bot size={16} className="text-primary" />
                  </div>
                  <div className="p-4 rounded-lg bg-gray/50 border border-foreground/20">
                    <div className="flex items-center gap-2">
                      <Loader2 size={16} className="animate-spin text-primary" />
                      <span className="noto-sans-jp text-sm text-foreground/70">
                        samuidoが考えています...
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Suggested Questions */}
          {messages.length === 1 && (
            <div className="mb-6">
              <h3 className="neue-haas-grotesk-display text-lg text-foreground mb-4">
                質問例：
              </h3>
              <div className="flex flex-wrap gap-2">
                {suggestedQuestions.map((question, index) => (
                  <button
                    key={index}
                    onClick={() => handleSuggestedQuestion(question)}
                    className="px-3 py-2 text-sm border border-foreground/20 bg-gray/50 hover:bg-gray transition-colors noto-sans-jp text-foreground/80 hover:text-foreground"
                  >
                    {question}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input Area */}
          <div className="border border-foreground/20 bg-gray/50 rounded-lg p-4 flex-shrink-0">
            <div className="flex gap-3">
              <input
                ref={inputRef}
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="samuidoに質問してみてください..."
                className="flex-1 bg-transparent border-none outline-none noto-sans-jp text-foreground placeholder-foreground/50"
                disabled={isLoading}
              />
              <button
                onClick={handleSendMessage}
                disabled={!inputMessage.trim() || isLoading}
                className="p-2 bg-primary text-white rounded hover:bg-primary/80 disabled:bg-primary/30 disabled:cursor-not-allowed transition-colors"
              >
                {isLoading ? (
                  <Loader2 size={20} className="animate-spin" />
                ) : (
                  <Send size={20} />
                )}
              </button>
            </div>
            <div className="mt-2 text-xs noto-sans-jp text-foreground/50">
              Enterで送信 • Shift+Enterで改行
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="border-t border-foreground/20 py-4 text-center flex-shrink-0">
          <p className="noto-sans-jp text-foreground/60 text-sm">
            ※ これはAIによるシミュレーションです
          </p>
        </footer>
      </div>
    </>
  );
}