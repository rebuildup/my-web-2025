'use client';

import { Metadata } from 'next';
import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'ai';
  timestamp: Date;
  typing?: boolean;
}

// Predefined responses based on the AI prompt personality
const aiResponses = {
  greeting: [
    "//samuidoが現れました",
    "そうですね こんにちは",
    "お疲れ様です"
  ],
  profile: [
    "そうですね 高専3年でWeb制作とか映像制作をやってます",
    "プログラミングとデザインが好きで、最近はAfter Effectsのプラグイン開発とかしてますね",
    "あまり詳しくないですが、フロントエンドを中心にいろいろ触ってる感じです"
  ],
  skills: [
    "技術スタックは React、TypeScript、After Effects辺りをよく使います",
    "映像制作だとAfter EffectsとPremiere Pro、デザインはPhotoshopとIllustratorですね",
    "最近はC++でプラグイン開発もやってます 面白いですよ(笑)"
  ],
  projects: [
    "Sequential PNG Preview Pluginとか、Color Palette Generatorを作りました",
    "After EffectsのプラグインをGitHubで公開してます 数スターですが(笑)",
    "MVとかリリックモーションの制作依頼もやってますね"
  ],
  tools: [
    "開発環境はCursorに移行しました VSCodeから変えたんですが、AI連携が便利で",
    "学生版1年無料だったので試してみたら結構良くて",
    "力技ですが、不具合を見て修正を繰り返すだけです"
  ],
  workflow: [
    "一旦完成形をイメージするためにNotionに書き出して、大体考えがまとまったらClaudeに聞きますね",
    "あとは不具合を見て修正を繰り返すだけです",
    "完成形イメージができる学習が「楽しい実践」だと思ってます"
  ],
  hobby: [
    "夜型で、金土は23時から5時まで作業してることが多いです",
    "寮の5畳スペースで、椅子に寝そべって作業してます",
    "エナドリ（緑モンスター、zone）とお菓子は欠かせません(笑)"
  ],
  philosophy: [
    "samuidoの意味は「360でも365でもない、ずれていて特別じゃない＋360を超える」って感じです",
    "「最大多数の幸福」という価値観でやってます",
    "まず形にしてから改善するタイプですね"
  ],
  contact: [
    "開発関連なら @361do_sleep、映像・デザイン関連なら @361do_design です",
    "GitHubは https://github.com/rebuildup でやってます",
    "よろしくお願いします"
  ],
  default: [
    "そうですね",
    "なるほど",
    "わかります",
    "そんな感じですかね",
    "確かに",
    "あまり詳しくないので適当なことしか言えませんが、調べてみますね",
    "力になれず申し訳ない、、、"
  ]
};

// Suggested questions for users
const suggestedQuestions = [
  "プロフィールを教えて",
  "どんな技術を使ってる？",
  "制作したものについて聞きたい",
  "普段の作業環境は？",
  "連絡先を教えて",
  "開発の進め方は？"
];

export default function AIProfilePage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: "//samuidoが現れました",
      sender: 'ai',
      timestamp: new Date()
    },
    {
      id: '2',
      content: "こんにちは！何か質問があればお気軽にどうぞ",
      sender: 'ai',
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(scrollToBottom, [messages]);

  // Simple keyword matching for responses
  const getAIResponse = (userMessage: string): string => {
    const message = userMessage.toLowerCase();
    
    if (message.includes('プロフィール') || message.includes('自己紹介') || message.includes('について')) {
      return aiResponses.profile[Math.floor(Math.random() * aiResponses.profile.length)];
    }
    if (message.includes('技術') || message.includes('スキル') || message.includes('言語')) {
      return aiResponses.skills[Math.floor(Math.random() * aiResponses.skills.length)];
    }
    if (message.includes('作品') || message.includes('プロジェクト') || message.includes('制作')) {
      return aiResponses.projects[Math.floor(Math.random() * aiResponses.projects.length)];
    }
    if (message.includes('ツール') || message.includes('環境') || message.includes('開発')) {
      return aiResponses.tools[Math.floor(Math.random() * aiResponses.tools.length)];
    }
    if (message.includes('進め方') || message.includes('方法') || message.includes('フロー')) {
      return aiResponses.workflow[Math.floor(Math.random() * aiResponses.workflow.length)];
    }
    if (message.includes('趣味') || message.includes('普段') || message.includes('生活')) {
      return aiResponses.hobby[Math.floor(Math.random() * aiResponses.hobby.length)];
    }
    if (message.includes('考え') || message.includes('価値観') || message.includes('samuido')) {
      return aiResponses.philosophy[Math.floor(Math.random() * aiResponses.philosophy.length)];
    }
    if (message.includes('連絡') || message.includes('contact') || message.includes('twitter')) {
      return aiResponses.contact[Math.floor(Math.random() * aiResponses.contact.length)];
    }
    if (message.includes('こんにちは') || message.includes('はじめまして') || message.includes('hello')) {
      return aiResponses.greeting[Math.floor(Math.random() * aiResponses.greeting.length)];
    }
    
    return aiResponses.default[Math.floor(Math.random() * aiResponses.default.length)];
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputMessage,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsTyping(true);

    // Simulate typing delay
    setTimeout(() => {
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        content: getAIResponse(inputMessage),
        sender: 'ai',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, aiResponse]);
      setIsTyping(false);
    }, 1000 + Math.random() * 2000); // 1-3 second delay
  };

  const handleSuggestedQuestion = (question: string) => {
    setInputMessage(question);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <section className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 py-12 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="mb-6">
            <div className="w-24 h-24 bg-gradient-to-br from-white/20 to-white/10 rounded-full mx-auto mb-4 flex items-center justify-center text-3xl">
              🤖
            </div>
            <h1 className="text-3xl md:text-5xl font-bold text-white mb-3">
              AI Chat
            </h1>
            <p className="text-lg text-indigo-200 mb-4">
              AIのsamuidoとチャット形式で対話
            </p>
            <p className="text-sm text-indigo-100 max-w-2xl mx-auto">
              プロフィール、作品、技術について質問できます
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-3">
            <Link
              href="/about"
              className="px-4 py-2 border-2 border-white text-white rounded-lg hover:bg-white hover:text-indigo-600 transition-all duration-200 text-sm"
            >
              ← About に戻る
            </Link>
            <Link
              href="/about/profile/real"
              className="px-4 py-2 bg-white text-indigo-600 rounded-lg hover:bg-indigo-50 transition-all duration-200 text-sm"
            >
              本名版プロフィール
            </Link>
            <Link
              href="/about/profile/handle"
              className="px-4 py-2 bg-white text-indigo-600 rounded-lg hover:bg-indigo-50 transition-all duration-200 text-sm"
            >
              ハンドルネーム版
            </Link>
          </div>
        </div>
      </section>

      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Chat Interface */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Chat Header */}
          <div className="bg-gradient-to-r from-indigo-500 to-purple-500 p-4">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center text-xl mr-3">
                🤖
              </div>
              <div>
                <h3 className="text-white font-semibold">AI samuido</h3>
                <p className="text-indigo-200 text-sm">オンライン</p>
              </div>
            </div>
          </div>

          {/* Messages Area */}
          <div className="h-96 overflow-y-auto p-4 space-y-4">
            {messages.map((message) => (
              <MessageBubble key={message.id} message={message} />
            ))}
            
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-gray-100 rounded-2xl px-4 py-3 max-w-xs">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Suggested Questions */}
          <div className="border-t bg-gray-50 p-4">
            <p className="text-sm text-gray-600 mb-2">💡 おすすめの質問:</p>
            <div className="flex flex-wrap gap-2">
              {suggestedQuestions.map((question, index) => (
                <button
                  key={index}
                  onClick={() => handleSuggestedQuestion(question)}
                  className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-xs hover:bg-indigo-200 transition-colors"
                >
                  {question}
                </button>
              ))}
            </div>
          </div>

          {/* Input Area */}
          <div className="border-t p-4">
            <div className="flex items-end space-x-2">
              <div className="flex-1">
                <textarea
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="メッセージを入力..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
                  rows={1}
                />
              </div>
              <button
                onClick={handleSendMessage}
                disabled={!inputMessage.trim() || isTyping}
                className="px-6 py-3 bg-indigo-600 text-white rounded-2xl hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                送信
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Enter で送信、Shift + Enter で改行
            </p>
          </div>
        </div>

        {/* AI Information */}
        <div className="mt-8 bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            🤖 AIについて
          </h3>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-gray-900 mb-2">学習データ</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• プロフィール情報（基本情報、スキル、経歴）</li>
                <li>• 作品データ（ポートフォリオの作品情報）</li>
                <li>• 記事内容（ブログやチュートリアル）</li>
                <li>• 技術情報（使用技術や制作手法）</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-2">対話可能な内容</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• プロフィールについての質問</li>
                <li>• 作品についての質問</li>
                <li>• 技術についての質問</li>
                <li>• 制作過程についての質問</li>
              </ul>
            </div>
          </div>
          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-800">
              <span className="font-medium">注意:</span> 
              このAIはsamuidoの人格を模擬したデモ版です。実際のDify連携により、より自然な対話が可能になります。
            </p>
          </div>
        </div>

        {/* Related Links */}
        <section className="mt-8">
          <h3 className="text-xl font-bold text-gray-900 mb-6 text-center">
            関連ページ
          </h3>
          <div className="grid md:grid-cols-3 gap-6">
            <Link
              href="/about/profile/real"
              className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow group"
            >
              <div className="text-3xl mb-3">👨‍💻</div>
              <h4 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-indigo-600 transition-colors">
                本名プロフィール
              </h4>
              <p className="text-gray-600 text-sm">
                詳細な経歴とスキル
              </p>
            </Link>
            <Link
              href="/about/profile/handle"
              className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow group"
            >
              <div className="text-3xl mb-3">😎</div>
              <h4 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-indigo-600 transition-colors">
                ハンドルネーム版
              </h4>
              <p className="text-gray-600 text-sm">
                技術スタックと活動
              </p>
            </Link>
            <Link
              href="/workshop"
              className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow group"
            >
              <div className="text-3xl mb-3">🛠️</div>
              <h4 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-indigo-600 transition-colors">
                Workshop
              </h4>
              <p className="text-gray-600 text-sm">
                プラグインとツール
              </p>
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}

// Message Bubble Component
interface MessageBubbleProps {
  message: Message;
}

function MessageBubble({ message }: MessageBubbleProps) {
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('ja-JP', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (message.sender === 'user') {
    return (
      <div className="flex justify-end">
        <div className="bg-indigo-600 text-white rounded-2xl px-4 py-3 max-w-xs lg:max-w-md">
          <p className="whitespace-pre-wrap">{message.content}</p>
          <p className="text-xs text-indigo-200 mt-1 text-right">
            {formatTime(message.timestamp)}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-start">
      <div className="flex items-start space-x-2">
        <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full flex items-center justify-center text-white text-sm flex-shrink-0">
          🤖
        </div>
        <div className="bg-gray-100 rounded-2xl px-4 py-3 max-w-xs lg:max-w-md">
          <p className="whitespace-pre-wrap">{message.content}</p>
          <p className="text-xs text-gray-500 mt-1">
            {formatTime(message.timestamp)}
          </p>
        </div>
      </div>
    </div>
  );
}

// This would be used for static generation in a real implementation
export const metadata: Metadata = {
  title: 'AI Chat - samuido | AIのsamuidoと対話',
  description: 'AIのsamuidoとチャット形式で対話。プロフィール、作品、技術について質問できます。',
  keywords: ['AIチャット', 'samuido', '対話', 'プロフィール', '作品', '技術'],
  robots: 'index, follow',
  openGraph: {
    title: 'AI Chat - samuido | AIのsamuidoと対話',
    description: 'AIのsamuidoとチャット形式で対話。プロフィール、作品、技術について質問できます。',
    type: 'website',
    url: 'https://yusuke-kim.com/about/profile/AI',
    images: [
      {
        url: 'https://yusuke-kim.com/about/profile-AI-og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'AI Chat - samuido'
      }
    ],
    siteName: 'samuido',
    locale: 'ja_JP'
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AI Chat - samuido | AIのsamuidoと対話',
    description: 'AIのsamuidoとチャット形式で対话。プロフィール、作品、技術について質問できます。',
    images: ['https://yusuke-kim.com/about/profile-AI-twitter-image.jpg'],
    creator: '@361do_sleep'
  },
  alternates: {
    canonical: 'https://yusuke-kim.com/about/profile/AI'
  }
};