import { Metadata } from "next";
import { ArrowLeft, Bot, Send, User, Loader2 } from "lucide-react";
import Link from "next/link";

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
        alt: "AI samuidoチャット",
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

// Sample chat data for demo
const initialMessages = [
  {
    id: "1",
    sender: "ai",
    content: "こんにちは！AIのsamuidoです。私のプロフィール、作品、技術について何でも質問してください！",
    timestamp: new Date(Date.now() - 60000),
  },
];

// Suggested questions
const suggestedQuestions = [
  "どんなスキルを持っていますか？",
  "代表的な作品を教えてください",
  "プログラミングを始めたきっかけは？",
  "今後の目標は何ですか？",
  "デザインで大切にしていることは？",
  "受賞歴について詳しく教えてください",
];

export default function AIProfilePage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "samuido AI Chat",
    "description": "AIのsamuidoとチャット形式で対話できるアプリケーション",
    "url": "/about/profile/AI",
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
      <div className="min-h-screen bg-[#222] text-white flex flex-col">
        {/* Header */}
        <header className="bg-[#333] border-b border-[#444] flex-shrink-0">
          <div className="max-w-4xl mx-auto px-4 py-4">
            <nav className="flex items-center gap-4">
              <Link href="/about" className="text-[#0000ff] hover:opacity-80 transition-opacity">
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-[#0000ff] rounded-full flex items-center justify-center">
                  <Bot className="w-5 h-5 text-white" />
                </div>
                <h1 className="neue-haas-grotesk-display text-xl text-white">AI Chat - samuido</h1>
              </div>
            </nav>
          </div>
        </header>

        {/* Main Chat Container */}
        <main className="flex-1 max-w-4xl mx-auto w-full px-4 py-6 flex flex-col">
          {/* Chat Messages Area */}
          <div className="flex-1 bg-[#333] rounded-sm mb-4 flex flex-col">
            {/* Messages */}
            <div className="flex-1 p-6 overflow-y-auto space-y-4">
              {initialMessages.map((message) => (
                <div
                  key={message.id}
                  className={`flex gap-3 ${message.sender === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
                >
                  {/* Avatar */}
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                    message.sender === 'ai' ? 'bg-[#0000ff]' : 'bg-[#666]'
                  }`}>
                    {message.sender === 'ai' ? (
                      <Bot className="w-6 h-6 text-white" />
                    ) : (
                      <User className="w-6 h-6 text-white" />
                    )}
                  </div>
                  
                  {/* Message Bubble */}
                  <div className={`max-w-[70%] p-4 rounded-lg ${
                    message.sender === 'ai' 
                      ? 'bg-[#222] text-white' 
                      : 'bg-[#0000ff] text-white'
                  }`}>
                    <p className="leading-relaxed">{message.content}</p>
                    <div className="mt-2 text-xs opacity-70">
                      {message.timestamp.toLocaleTimeString('ja-JP', { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Suggested Questions */}
            <div className="px-6 pb-4">
              <div className="mb-4">
                <h3 className="text-sm text-gray-400 mb-3">推奨質問：</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {suggestedQuestions.map((question, index) => (
                    <button
                      key={index}
                      className="text-left p-3 bg-[#222] border border-[#444] rounded-sm text-sm text-gray-300 hover:border-[#0000ff] hover:text-[#0000ff] transition-colors"
                      onClick={() => {
                        // In a real implementation, this would send the question
                        console.log('Sending question:', question);
                      }}
                    >
                      {question}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Input Area */}
          <div className="bg-[#333] p-4 rounded-sm">
            <div className="flex gap-3">
              <input
                type="text"
                placeholder="AIのsamuidoに質問してみてください..."
                className="flex-1 bg-[#222] border border-[#444] rounded-sm px-4 py-3 text-white placeholder-gray-400 focus:border-[#0000ff] focus:outline-none"
              />
              <button className="bg-[#0000ff] hover:bg-[#0066ff] px-6 py-3 rounded-sm text-white transition-colors flex items-center gap-2">
                <Send className="w-4 h-4" />
                送信
              </button>
            </div>
            
            {/* Status */}
            <div className="mt-3 text-xs text-gray-400 text-center">
              <div className="flex items-center justify-center gap-2">
                <Loader2 className="w-3 h-3 animate-spin" />
                AIの回答を待っています...
              </div>
            </div>
          </div>

          {/* Disclaimer */}
          <div className="mt-4 text-xs text-gray-400 text-center max-w-2xl mx-auto">
            <p>
              このAIチャットはデモンストレーション版です。
              実際の実装ではDify APIと連携してリアルタイムでAIと対話できます。
            </p>
          </div>
        </main>
      </div>
    </>
  );
}