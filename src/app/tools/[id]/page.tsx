'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ContentItem } from '@/types/content';
import {
  ArrowLeft,
  ExternalLink,
  Download,
  Heart,
  Share2,
  Eye,
  Calendar,
  Tag,
  Star,
  TrendingUp,
  Users,
  Clock,
  Palette,
  QrCode,
  Type,
  Timer,
  Mail,
  Code2,
  Gamepad2,
  Image as ImageIcon,
  FileCode,
  Calculator,
} from 'lucide-react';

// Tool components mapping
import ColorPalette from '../components/ColorPalette';
import QrGenerator from '../components/QrGenerator';
import TextCounter from '../components/TextCounter';
import PomodoroTimer from '../components/PomodoroTimer';

const toolComponents: Record<string, React.ComponentType> = {
  'tool-1': ColorPalette,
  'color-palette': ColorPalette,
  'tool-2': QrGenerator,
  'qr-generator': QrGenerator,
  'tool-3': TextCounter,
  'text-counter': TextCounter,
  'tool-4': PomodoroTimer,
  'pomodoro-timer': PomodoroTimer,
};

const placeholderComponents: Record<string, React.ComponentType> = {
  'tool-5': () => <PlaceholderTool title="Business Mail Block" />,
  'business-mail-block': () => <PlaceholderTool title="Business Mail Block" />,
  'tool-6': () => <PlaceholderTool title="AE Expression Helper" />,
  'ae-expression': () => <PlaceholderTool title="AE Expression Helper" />,
  'tool-7': () => <PlaceholderTool title="ProtoType Game" />,
  'prototype-game': () => <PlaceholderTool title="ProtoType Game" />,
  'tool-8': () => <PlaceholderTool title="Sequential PNG Preview" />,
  'sequential-png-preview': () => <PlaceholderTool title="Sequential PNG Preview" />,
  'tool-9': () => <PlaceholderTool title="SVG to TSX Converter" />,
  'svg2tsx': () => <PlaceholderTool title="SVG to TSX Converter" />,
  'tool-10': () => <PlaceholderTool title="Pi Memory Game" />,
  'pi-game': () => <PlaceholderTool title="Pi Memory Game" />,
  'tool-11': () => <PlaceholderTool title="Commission Price Calculator" />,
  'price-calculator': () => <PlaceholderTool title="Commission Price Calculator" />,
};

function PlaceholderTool({ title }: { title: string }) {
  return (
    <div className="border-foreground/20 bg-gray/50 border p-12 text-center">
      <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-primary/10">
        <Code2 size={48} className="text-primary" />
      </div>
      <h2 className="neue-haas-grotesk-display text-foreground mb-4 text-2xl">{title}</h2>
      <p className="noto-sans-jp text-foreground/70 mb-6">
        This tool is coming soon! It's currently in development and will be available in a future update.
      </p>
      <div className="bg-primary/10 text-primary inline-block px-4 py-2 text-sm">
        Coming Soon
      </div>
    </div>
  );
}

export default function ToolPage() {
  const params = useParams();
  const id = params.id as string;
  
  const [tool, setTool] = useState<ContentItem | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isLiked, setIsLiked] = useState(false);
  const [likes, setLikes] = useState(0);
  const [views, setViews] = useState(0);

  useEffect(() => {
    const loadTool = async () => {
      try {
        const response = await fetch('/data/content/tool.json');
        const tools: ContentItem[] = await response.json();
        
        const foundTool = tools.find(t => t.id === id || t.id === `tool-${id}` || 
          t.title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') === id);
        
        if (foundTool) {
          setTool(foundTool);
          setLikes(foundTool.stats?.likes || 0);
          setViews(foundTool.stats?.views || 0);
          
          // Increment view count
          incrementViewCount(foundTool.id);
        } else {
          setError('Tool not found');
        }
      } catch (err) {
        setError('Failed to load tool');
        console.error('Error loading tool:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadTool();
  }, [id]);

  const incrementViewCount = async (toolId: string) => {
    try {
      await fetch(`/api/stats/tool`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: toolId, action: 'view' })
      });
      setViews(prev => prev + 1);
    } catch (error) {
      console.error('Failed to increment view count:', error);
    }
  };

  const handleLike = async () => {
    if (!tool) return;
    
    try {
      await fetch(`/api/stats/tool`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: tool.id, action: 'like' })
      });
      
      setIsLiked(!isLiked);
      setLikes(prev => isLiked ? prev - 1 : prev + 1);
    } catch (error) {
      console.error('Failed to update like:', error);
    }
  };

  const handleShare = async () => {
    if (!tool) return;
    
    try {
      await navigator.share({
        title: tool.title,
        text: tool.description,
        url: window.location.href
      });
    } catch (error) {
      // Fallback to clipboard
      navigator.clipboard.writeText(window.location.href);
    }
  };

  const getToolIcon = (title: string) => {
    const iconMap: Record<string, React.ReactNode> = {
      'Color Palette Generator': <Palette size={32} className="text-primary" />,
      'QR Code Generator': <QrCode size={32} className="text-primary" />,
      'Text Counter & Analyzer': <Type size={32} className="text-primary" />,
      'Pomodoro Timer': <Timer size={32} className="text-primary" />,
      'Business Mail Block': <Mail size={32} className="text-primary" />,
      'AE Expression Helper': <Code2 size={32} className="text-primary" />,
      'ProtoType Game': <Gamepad2 size={32} className="text-primary" />,
      'Sequential PNG Preview': <ImageIcon size={32} className="text-primary" />,
      'SVG to TSX Converter': <FileCode size={32} className="text-primary" />,
      'Pi Memory Game': <Gamepad2 size={32} className="text-primary" />,
      'Commission Price Calculator': <Calculator size={32} className="text-primary" />,
    };
    return iconMap[title] || <Code2 size={32} className="text-primary" />;
  };

  if (isLoading) {
    return (
      <div className="bg-gray min-h-screen">
        <nav className="border-foreground/20 border-b p-4">
          <div className="mx-auto max-w-7xl">
            <Link
              href="/tools"
              className="neue-haas-grotesk-display text-primary hover:text-primary/80 text-2xl"
            >
              ← Tools
            </Link>
          </div>
        </nav>
        
        <div className="flex min-h-[60vh] items-center justify-center">
          <div className="text-center">
            <div className="loading mx-auto mb-4"></div>
            <p className="text-foreground/60">Loading tool...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !tool) {
    return (
      <div className="bg-gray min-h-screen">
        <nav className="border-foreground/20 border-b p-4">
          <div className="mx-auto max-w-7xl">
            <Link
              href="/tools"
              className="neue-haas-grotesk-display text-primary hover:text-primary/80 text-2xl"
            >
              ← Tools
            </Link>
          </div>
        </nav>
        
        <div className="flex min-h-[60vh] items-center justify-center">
          <div className="text-center">
            <h1 className="neue-haas-grotesk-display text-foreground mb-4 text-4xl">Tool Not Found</h1>
            <p className="noto-sans-jp text-foreground/70 mb-6">
              The tool you're looking for doesn't exist or has been moved.
            </p>
            <Link
              href="/tools"
              className="bg-primary hover:bg-primary/90 inline-block px-6 py-3 text-white transition-colors"
            >
              Browse All Tools
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Get the appropriate component
  const ToolComponent = toolComponents[tool.id] || toolComponents[id] || placeholderComponents[tool.id] || placeholderComponents[id];

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: tool.title,
    description: tool.description,
    url: `https://yusuke-kim.com/tools/${id}`,
    applicationCategory: 'UtilityApplication',
    operatingSystem: 'Web Browser',
    author: {
      '@type': 'Person',
      name: '木村友亮',
      alternateName: 'samuido'
    },
    interactionStatistic: [
      {
        '@type': 'InteractionCounter',
        interactionType: 'https://schema.org/ViewAction',
        userInteractionCount: views
      },
      {
        '@type': 'InteractionCounter',
        interactionType: 'https://schema.org/LikeAction',
        userInteractionCount: likes
      }
    ]
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      
      <div className="bg-gray min-h-screen">
        {/* Navigation */}
        <nav className="border-foreground/20 border-b p-4">
          <div className="mx-auto max-w-7xl">
            <Link
              href="/tools"
              className="neue-haas-grotesk-display text-primary hover:text-primary/80 flex items-center gap-2 text-2xl"
            >
              <ArrowLeft size={24} />
              Tools
            </Link>
          </div>
        </nav>

        {/* Tool Header */}
        <header className="border-foreground/20 border-b px-4 py-8">
          <div className="mx-auto max-w-7xl">
            <div className="mb-6 flex items-start justify-between">
              <div className="flex items-start gap-6">
                <div className="from-primary/10 to-primary/5 flex h-16 w-16 items-center justify-center bg-gradient-to-br">
                  {getToolIcon(tool.title)}
                </div>
                
                <div>
                  <h1 className="neue-haas-grotesk-display text-primary mb-2 text-4xl md:text-5xl">
                    {tool.title}
                  </h1>
                  <p className="noto-sans-jp text-foreground/80 mb-4 text-lg md:text-xl">
                    {tool.description}
                  </p>
                  
                  <div className="mb-4 flex flex-wrap gap-2">
                    {tool.tags.map(tag => (
                      <span
                        key={tag}
                        className="bg-primary/20 text-primary rounded px-2 py-1 text-sm"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <button
                  onClick={handleLike}
                  className={`flex items-center gap-2 px-4 py-2 transition-colors ${
                    isLiked 
                      ? 'bg-red-500 text-white' 
                      : 'border-foreground/20 hover:border-primary border'
                  }`}
                >
                  <Heart size={20} className={isLiked ? 'fill-current' : ''} />
                  {likes}
                </button>
                
                <button
                  onClick={handleShare}
                  className="border-foreground/20 hover:border-primary flex items-center gap-2 border px-4 py-2 transition-colors"
                >
                  <Share2 size={20} />
                  Share
                </button>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
              <div className="border-foreground/20 bg-gray/50 border p-4 text-center">
                <div className="neue-haas-grotesk-display text-primary mb-1 text-2xl">
                  {views.toLocaleString()}
                </div>
                <div className="noto-sans-jp text-foreground/70 flex items-center justify-center gap-1 text-sm">
                  <Eye size={16} />
                  Views
                </div>
              </div>

              <div className="border-foreground/20 bg-gray/50 border p-4 text-center">
                <div className="neue-haas-grotesk-display text-primary mb-1 text-2xl">
                  {likes.toLocaleString()}
                </div>
                <div className="noto-sans-jp text-foreground/70 flex items-center justify-center gap-1 text-sm">
                  <Heart size={16} />
                  Likes
                </div>
              </div>

              <div className="border-foreground/20 bg-gray/50 border p-4 text-center">
                <div className="neue-haas-grotesk-display text-primary mb-1 text-2xl">
                  {tool.category}
                </div>
                <div className="noto-sans-jp text-foreground/70 flex items-center justify-center gap-1 text-sm">
                  <Tag size={16} />
                  Category
                </div>
              </div>

              <div className="border-foreground/20 bg-gray/50 border p-4 text-center">
                <div className="neue-haas-grotesk-display text-primary mb-1 text-2xl">
                  Free
                </div>
                <div className="noto-sans-jp text-foreground/70 flex items-center justify-center gap-1 text-sm">
                  <Star size={16} />
                  Price
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="mx-auto max-w-7xl px-4 py-8">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            {/* Tool Interface */}
            <div className="lg:col-span-2">
              <div className="border-foreground/20 bg-gray/50 border p-6">
                <h2 className="neue-haas-grotesk-display text-foreground mb-6 text-2xl">
                  Tool Interface
                </h2>
                
                {ToolComponent ? (
                  <ToolComponent />
                ) : (
                  <PlaceholderTool title={tool.title} />
                )}
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Tool Info */}
              <div className="border-foreground/20 bg-gray/50 border p-6">
                <h3 className="neue-haas-grotesk-display text-foreground mb-4 text-lg">
                  Tool Information
                </h3>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-foreground/70">Created</span>
                    <span className="text-foreground/90 text-sm">
                      {new Date(tool.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-foreground/70">Updated</span>
                    <span className="text-foreground/90 text-sm">
                      {new Date(tool.updatedAt || tool.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-foreground/70">Status</span>
                    <span className="bg-green-500/20 text-green-600 rounded px-2 py-1 text-xs">
                      {tool.status}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-foreground/70">Priority</span>
                    <span className="text-foreground/90 text-sm">{tool.priority}/100</span>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="border-foreground/20 bg-gray/50 border p-6">
                <h3 className="neue-haas-grotesk-display text-foreground mb-4 text-lg">
                  About This Tool
                </h3>
                
                {tool.content && (
                  <div className="prose prose-sm max-w-none">
                    <div className="noto-sans-jp text-foreground/80 whitespace-pre-wrap text-sm">
                      {tool.content.split('\n').slice(0, 10).join('\n')}
                    </div>
                  </div>
                )}
              </div>

              {/* Tags */}
              <div className="border-foreground/20 bg-gray/50 border p-6">
                <h3 className="neue-haas-grotesk-display text-foreground mb-4 text-lg">
                  Tags
                </h3>
                
                <div className="flex flex-wrap gap-2">
                  {tool.tags.map(tag => (
                    <span
                      key={tag}
                      className="bg-foreground/10 text-foreground/70 rounded px-2 py-1 text-xs"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="border-foreground/20 border-t py-8 text-center">
          <p className="noto-sans-jp text-foreground/60 text-sm">
            © 2025 samuido (木村友亮). All rights reserved.
          </p>
        </footer>
      </div>
    </>
  );
}