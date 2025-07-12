'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { GridLayout, GridContainer, GridContent, GridSection } from '@/components/GridSystem';
import { Send, Bot, Loader2, MessageCircle, Sparkles } from 'lucide-react';

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'ai';
  timestamp: Date;
}

export default function AIProfilePage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content:
        'こんにちは！私はsamuidoのAIアシスタントです。プロフィールや作品について何でも質問してください！',
      sender: 'ai',
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputValue,
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    // Simulate AI response (replace with actual Dify API call)
    setTimeout(() => {
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        content: generateAIResponse(inputValue),
        sender: 'ai',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, aiResponse]);
      setIsLoading(false);
    }, 1000);
  };

  const generateAIResponse = (userInput: string): string => {
    const responses = {
      プロフィール:
        '私は木村友亮（samuido）です。現役高専生で、Webデザイナー・開発者として活動しています。グラフィックデザイン、映像制作、個人開発など幅広く取り組んでいます。',
      スキル:
        '主なスキルは以下の通りです：\n• デザイン: Photoshop, Illustrator, Figma\n• プログラミング: JavaScript, TypeScript, React, NextJS\n• 映像: AfterEffects, Premiere Pro\n• その他: Unity, Blender',
      作品: 'ポートフォリオサイトで作品を公開しています。Web開発、映像制作、ゲーム開発など様々なジャンルの作品があります。詳しくはポートフォリオページをご覧ください。',
      連絡先:
        '以下の方法で連絡可能です：\n• メール: 361do.sleep@gmail.com\n• Twitter: @361do_sleep (開発関連)\n• Twitter: @361do_design (映像・デザイン関連)',
      経歴: '2023年に高専に入学し、現在在学中です。U-16プログラミングコンテストで受賞歴があり、中国地区高専コンピュータフェスティバル2024でゲーム部門1位を獲得しました。',
    };

    const lowerInput = userInput.toLowerCase();

    if (lowerInput.includes('プロフィール') || lowerInput.includes('自己紹介')) {
      return responses['プロフィール'];
    } else if (lowerInput.includes('スキル') || lowerInput.includes('技術')) {
      return responses['スキル'];
    } else if (lowerInput.includes('作品') || lowerInput.includes('ポートフォリオ')) {
      return responses['作品'];
    } else if (lowerInput.includes('連絡') || lowerInput.includes('メール')) {
      return responses['連絡先'];
    } else if (lowerInput.includes('経歴') || lowerInput.includes('受賞')) {
      return responses['経歴'];
    } else {
      return '申し訳ございません。もう少し具体的に質問していただけますか？プロフィール、スキル、作品、連絡先、経歴などについてお答えできます。';
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <GridLayout background={false} className="bg-gray">
      {/* Navigation */}
      <nav className="border-foreground/20 border-b p-4">
        <GridContainer padding={false} className="flex items-center justify-between">
          <Link
            href="/01_about"
            className="neue-haas-grotesk-display text-primary hover:text-primary/80 text-xl"
          >
            ← About
          </Link>
          <div className="text-foreground/60 text-sm">AI Chat</div>
        </GridContainer>
      </nav>

      {/* Header */}
      <GridSection spacing="md">
        <div className="mb-6 flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-r from-blue-500 to-purple-500">
            <Bot size={32} className="text-white" />
          </div>
          <div>
            <h1 className="neue-haas-grotesk-display text-primary text-3xl md:text-4xl">AI Chat</h1>
            <p className="noto-sans-jp text-foreground/80 text-lg">AIのsamuidoと対話</p>
          </div>
        </div>
        <p className="noto-sans-jp text-foreground/80">
          AIのsamuidoとチャット形式で対話。プロフィール、作品、技術について質問できます。
        </p>
      </GridSection>

      {/* Main Content */}
      <main>
        <GridContainer className="pb-16">
          <GridContent cols={{ xs: 1, md: 1, xl: 4, '2xl': 4 }} className="gap-8">
            {/* Chat Interface */}
            <div className="lg:col-span-3">
              <div className="border-foreground/20 bg-gray/50 flex h-[600px] flex-col rounded-lg border">
                {/* Chat Header */}
                <div className="border-foreground/20 border-b p-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-r from-blue-500 to-purple-500">
                      <Bot size={20} className="text-white" />
                    </div>
                    <div>
                      <h3 className="neue-haas-grotesk-display text-foreground font-medium">
                        samuido AI
                      </h3>
                      <p className="text-foreground/60 text-sm">オンライン</p>
                    </div>
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 space-y-4 overflow-y-auto p-4">
                  {messages.map(message => (
                    <div
                      key={message.id}
                      className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[80%] rounded-lg p-3 ${
                          message.sender === 'user'
                            ? 'bg-primary text-white'
                            : 'bg-foreground/10 text-foreground'
                        }`}
                      >
                        <div className="flex items-start gap-2">
                          {message.sender === 'ai' && (
                            <Bot size={16} className="text-primary mt-0.5 flex-shrink-0" />
                          )}
                          <div className="flex-1">
                            <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                            <p className="mt-1 text-xs opacity-60">
                              {message.timestamp.toLocaleTimeString()}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}

                  {isLoading && (
                    <div className="flex justify-start">
                      <div className="bg-foreground/10 text-foreground rounded-lg p-3">
                        <div className="flex items-center gap-2">
                          <Bot size={16} className="text-primary" />
                          <div className="flex items-center gap-1">
                            <Loader2 size={16} className="animate-spin" />
                            <span className="text-sm">入力中...</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                <div className="border-foreground/20 border-t p-4">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={inputValue}
                      onChange={e => setInputValue(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="メッセージを入力..."
                      className="bg-foreground/5 text-foreground border-foreground/20 focus:ring-primary flex-1 rounded-lg border px-3 py-2 focus:ring-2 focus:outline-none"
                      disabled={isLoading}
                    />
                    <button
                      onClick={handleSendMessage}
                      disabled={!inputValue.trim() || isLoading}
                      className="bg-primary hover:bg-primary/90 disabled:bg-foreground/20 rounded-lg px-4 py-2 text-white transition-colors disabled:cursor-not-allowed"
                    >
                      <Send size={16} />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              <h2 className="neue-haas-grotesk-display text-foreground text-2xl">質問例</h2>

              <div className="space-y-4">
                <div className="border-foreground/20 bg-gray/50 rounded-lg border p-4">
                  <h3 className="neue-haas-grotesk-display text-foreground mb-3 flex items-center gap-2 text-lg">
                    <MessageCircle size={20} />
                    よくある質問
                  </h3>
                  <div className="space-y-2">
                    <button
                      onClick={() => setInputValue('プロフィールについて教えて')}
                      className="text-foreground/80 hover:text-foreground text-left text-sm transition-colors"
                    >
                      • プロフィールについて教えて
                    </button>
                    <button
                      onClick={() => setInputValue('スキルは何がありますか？')}
                      className="text-foreground/80 hover:text-foreground text-left text-sm transition-colors"
                    >
                      • スキルは何がありますか？
                    </button>
                    <button
                      onClick={() => setInputValue('作品を見せて')}
                      className="text-foreground/80 hover:text-foreground text-left text-sm transition-colors"
                    >
                      • 作品を見せて
                    </button>
                    <button
                      onClick={() => setInputValue('連絡先を教えて')}
                      className="text-foreground/80 hover:text-foreground text-left text-sm transition-colors"
                    >
                      • 連絡先を教えて
                    </button>
                    <button
                      onClick={() => setInputValue('経歴について教えて')}
                      className="text-foreground/80 hover:text-foreground text-left text-sm transition-colors"
                    >
                      • 経歴について教えて
                    </button>
                  </div>
                </div>

                <div className="border-foreground/20 bg-gray/50 rounded-lg border p-4">
                  <h3 className="neue-haas-grotesk-display text-foreground mb-3 flex items-center gap-2 text-lg">
                    <Sparkles size={20} />
                    機能
                  </h3>
                  <div className="text-foreground/60 space-y-2 text-sm">
                    <p>• プロフィール情報の質問</p>
                    <p>• 作品についての質問</p>
                    <p>• 技術についての質問</p>
                    <p>• 制作過程についての質問</p>
                  </div>
                </div>

                <div className="border-foreground/20 bg-gray/50 rounded-lg border p-4">
                  <h3 className="neue-haas-grotesk-display text-foreground mb-3 text-lg">
                    注意事項
                  </h3>
                  <div className="text-foreground/60 space-y-2 text-sm">
                    <p>• チャット内容は記録されません</p>
                    <p>• 個人情報は適切に管理されます</p>
                    <p>• 質問は日本語でお願いします</p>
                  </div>
                </div>
              </div>
            </div>
          </GridContent>
        </GridContainer>
      </main>
    </GridLayout>
  );
}
