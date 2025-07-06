import Link from 'next/link';
import type { Metadata } from 'next';
import { ArrowLeft, Palette, Sparkles, Play, Eye, RotateCcw, Download } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Design Playground - samuido | デザイン実験場',
  description:
    'デザインの実験場。実験的なライブラリやアニメーションの実装、クリエイティブなビジュアル表現を探求します。',
  keywords: [
    'デザイン実験',
    'クリエイティブ',
    'アニメーション',
    'ビジュアル表現',
    'ライブラリ',
    'インタラクティブ',
    'プロトタイプ',
  ],
  robots: 'index, follow',
  openGraph: {
    title: 'Design Playground - samuido | デザイン実験場',
    description:
      'デザインの実験場。実験的なライブラリやアニメーションの実装、クリエイティブなビジュアル表現を探求します。',
    type: 'website',
    url: '/portfolio/playground/design',
    images: [
      {
        url: '/portfolio-playground-design-og.jpg',
        width: 1200,
        height: 630,
        alt: 'Design Playground - samuido',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Design Playground - samuido | デザイン実験場',
    description:
      'デザインの実験場。実験的なライブラリやアニメーションの実装、クリエイティブなビジュアル表現を探求します。',
    images: ['/portfolio-playground-design-twitter.jpg'],
    creator: '@361do_sleep',
  },
};

interface PlaygroundExperiment {
  id: string;
  title: string;
  description: string;
  category: 'animation' | 'interaction' | 'visual' | 'prototype';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  technologies: string[];
  demoUrl?: string;
  codeUrl?: string;
  featured: boolean;
  views: number;
  likes: number;
}

const experiments: PlaygroundExperiment[] = [
  {
    id: 'morphing-shapes',
    title: 'Morphing Geometric Shapes',
    description: 'SVGアニメーションとCSS Transitionsを使用した図形の変形アニメーション実験。フレーマーモーションライクな滑らかな変形を実現。',
    category: 'animation',
    difficulty: 'intermediate',
    technologies: ['CSS Animations', 'SVG', 'Framer Motion', 'React'],
    featured: true,
    views: 1247,
    likes: 89,
  },
  {
    id: 'particle-cursor',
    title: 'Interactive Particle Cursor',
    description: 'マウスカーソルに追従するパーティクルシステム。Canvas APIとRAFを使用したリアルタイムパーティクル表現。',
    category: 'interaction',
    difficulty: 'advanced',
    technologies: ['Canvas API', 'RAF', 'TypeScript', 'Math.js'],
    featured: true,
    views: 892,
    likes: 67,
  },
  {
    id: 'fluid-gradient',
    title: 'Fluid Gradient Background',
    description: 'WebGLシェーダーを使用した流体的なグラデーション背景。リアルタイムで変化する美しいビジュアル表現。',
    category: 'visual',
    difficulty: 'advanced',
    technologies: ['WebGL', 'GLSL', 'Three.js', 'Shaders'],
    featured: true,
    views: 654,
    likes: 45,
  },
  {
    id: 'scroll-reveal',
    title: 'Advanced Scroll Reveal',
    description: 'Intersection Observer APIを使用した高度なスクロール連動アニメーション。パフォーマンスを重視した実装。',
    category: 'animation',
    difficulty: 'intermediate',
    technologies: ['Intersection Observer', 'GSAP', 'CSS Custom Properties'],
    featured: false,
    views: 432,
    likes: 31,
  },
  {
    id: 'color-palette-generator',
    title: 'AI Color Palette Generator',
    description: 'カラーセオリーに基づくAIパレット生成ツール。ハーモニー理論とアクセシビリティを考慮した配色提案。',
    category: 'prototype',
    difficulty: 'advanced',
    technologies: ['Color Theory', 'AI/ML', 'WCAG', 'React'],
    featured: false,
    views: 321,
    likes: 28,
  },
  {
    id: 'micro-interactions',
    title: 'Micro Interactions Library',
    description: 'UIコンポーネント用のマイクロインタラクションコレクション。ユーザビリティを向上させる細やかなアニメーション。',
    category: 'interaction',
    difficulty: 'beginner',
    technologies: ['React', 'CSS Transitions', 'Framer Motion'],
    featured: false,
    views: 187,
    likes: 12,
  },
];

function getCategoryColor(category: string): string {
  const colorMap: Record<string, string> = {
    animation: 'bg-blue-500/20 text-blue-700',
    interaction: 'bg-green-500/20 text-green-700',
    visual: 'bg-purple-500/20 text-purple-700',
    prototype: 'bg-orange-500/20 text-orange-700',
  };
  return colorMap[category] || 'bg-gray-500/20 text-gray-700';
}

function getDifficultyColor(difficulty: string): string {
  const colorMap: Record<string, string> = {
    beginner: 'bg-green-100 text-green-800',
    intermediate: 'bg-yellow-100 text-yellow-800',
    advanced: 'bg-red-100 text-red-800',
  };
  return colorMap[difficulty] || 'bg-gray-100 text-gray-800';
}

function getCategoryIcon(category: string): React.ReactNode {
  const iconMap: Record<string, React.ReactNode> = {
    animation: <Sparkles size={16} />,
    interaction: <Play size={16} />,
    visual: <Palette size={16} />,
    prototype: <Eye size={16} />,
  };
  return iconMap[category] || <Palette size={16} />;
}

export default function DesignPlaygroundPage() {
  const featuredExperiments = experiments.filter(exp => exp.featured);
  const otherExperiments = experiments.filter(exp => !exp.featured);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: 'Design Playground - samuido',
    description: 'デザインの実験場。実験的なライブラリやアニメーションの実装を探求。',
    url: 'https://yusuke-kim.com/portfolio/playground/design',
    author: {
      '@type': 'Person',
      name: '木村友亮',
      alternateName: 'samuido',
    },
    mainEntity: {
      '@type': 'ItemList',
      name: 'Design Experiments',
      description: 'Collection of design experiments and interactive prototypes',
      numberOfItems: experiments.length,
      itemListElement: experiments.map((exp, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        item: {
          '@type': 'CreativeWork',
          name: exp.title,
          description: exp.description,
          keywords: exp.technologies.join(', '),
        },
      })),
    },
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
          <div className="mx-auto max-w-7xl flex items-center justify-between">
            <Link
              href="/portfolio"
              className="neue-haas-grotesk-display text-primary hover:text-primary/80 flex items-center space-x-2 text-lg"
            >
              <ArrowLeft size={20} />
              <span>Portfolio</span>
            </Link>
            
            <div className="flex items-center space-x-4">
              <Link
                href="/portfolio/playground/WebGL"
                className="text-foreground/70 hover:text-primary text-sm transition-colors"
              >
                WebGL Playground
              </Link>
            </div>
          </div>
        </nav>

        {/* Header */}
        <header className="border-foreground/20 border-b bg-gradient-to-r from-purple-500/10 via-pink-500/10 to-blue-500/10 px-4 py-16">
          <div className="mx-auto max-w-7xl text-center">
            <div className="flex items-center justify-center space-x-4 mb-6">
              <div className="bg-primary/20 p-4 rounded-xl">
                <Palette size={40} className="text-primary" />
              </div>
              <div>
                <h1 className="neue-haas-grotesk-display text-primary mb-2 text-5xl md:text-7xl font-bold">
                  Design Playground
                </h1>
                <p className="zen-kaku-gothic-new text-primary/80 text-xl">
                  デザイン実験場
                </p>
              </div>
            </div>
            
            <p className="noto-sans-jp text-foreground/80 mb-8 text-lg leading-relaxed max-w-3xl mx-auto">
              実験的なライブラリやアニメーションの実装を通じて、デザインの可能性を探求します。
              インタラクティブなプロトタイプ、ビジュアルエフェクト、アニメーションライブラリなど、
              クリエイティブなWeb技術の実験場です。
            </p>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl mx-auto">
              <div className="bg-gray/50 border border-foreground/20 p-4 rounded-lg text-center">
                <div className="neue-haas-grotesk-display text-primary mb-1 text-2xl">
                  {experiments.length}
                </div>
                <div className="noto-sans-jp text-foreground/70 text-sm">Experiments</div>
              </div>
              
              <div className="bg-gray/50 border border-foreground/20 p-4 rounded-lg text-center">
                <div className="neue-haas-grotesk-display text-primary mb-1 text-2xl">
                  {new Set(experiments.flatMap(exp => exp.technologies)).size}
                </div>
                <div className="noto-sans-jp text-foreground/70 text-sm">Technologies</div>
              </div>
              
              <div className="bg-gray/50 border border-foreground/20 p-4 rounded-lg text-center">
                <div className="neue-haas-grotesk-display text-primary mb-1 text-2xl">
                  {experiments.reduce((sum, exp) => sum + exp.views, 0)}
                </div>
                <div className="noto-sans-jp text-foreground/70 text-sm">Total Views</div>
              </div>
              
              <div className="bg-gray/50 border border-foreground/20 p-4 rounded-lg text-center">
                <div className="neue-haas-grotesk-display text-primary mb-1 text-2xl">
                  {experiments.reduce((sum, exp) => sum + exp.likes, 0)}
                </div>
                <div className="noto-sans-jp text-foreground/70 text-sm">Total Likes</div>
              </div>
            </div>
          </div>
        </header>

        {/* Featured Experiments */}
        <section className="border-foreground/20 border-b px-4 py-16">
          <div className="mx-auto max-w-7xl">
            <h2 className="neue-haas-grotesk-display text-foreground mb-12 text-center text-3xl">
              Featured Experiments
            </h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {featuredExperiments.map(experiment => (
                <div
                  key={experiment.id}
                  className="group bg-gray/50 border border-foreground/20 rounded-xl overflow-hidden hover:shadow-xl transition-all duration-500 hover:scale-[1.02]"
                >
                  {/* Demo Preview */}
                  <div className="aspect-video bg-gradient-to-br from-primary/20 to-primary/10 relative overflow-hidden">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-primary/60 text-5xl">
                        {experiment.category === 'animation' ? '🎭' :
                         experiment.category === 'interaction' ? '🎮' :
                         experiment.category === 'visual' ? '🎨' : '🧪'}
                      </div>
                    </div>
                    
                    {/* Hover Overlay */}
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <div className="text-center text-white">
                        <Play size={32} className="mx-auto mb-2" />
                        <span className="text-sm">View Experiment</span>
                      </div>
                    </div>

                    {/* Category Badge */}
                    <div className="absolute top-3 left-3">
                      <span className={`rounded-full px-3 py-1 text-xs font-medium flex items-center space-x-1 ${getCategoryColor(experiment.category)}`}>
                        {getCategoryIcon(experiment.category)}
                        <span>{experiment.category}</span>
                      </span>
                    </div>

                    {/* Difficulty Badge */}
                    <div className="absolute top-3 right-3">
                      <span className={`rounded-full px-3 py-1 text-xs font-medium ${getDifficultyColor(experiment.difficulty)}`}>
                        {experiment.difficulty}
                      </span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-6">
                    <h3 className="neue-haas-grotesk-display text-foreground group-hover:text-primary mb-3 text-xl font-semibold transition-colors">
                      {experiment.title}
                    </h3>
                    
                    <p className="noto-sans-jp text-foreground/70 mb-4 text-sm leading-relaxed">
                      {experiment.description}
                    </p>

                    {/* Technologies */}
                    <div className="mb-4">
                      <div className="flex flex-wrap gap-1">
                        {experiment.technologies.slice(0, 3).map(tech => (
                          <span
                            key={tech}
                            className="bg-foreground/10 text-foreground/70 rounded px-2 py-1 text-xs"
                          >
                            {tech}
                          </span>
                        ))}
                        {experiment.technologies.length > 3 && (
                          <span className="text-foreground/60 text-xs self-center">
                            +{experiment.technologies.length - 3}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Stats & Actions */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4 text-xs text-foreground/60">
                        <div className="flex items-center space-x-1">
                          <Eye size={12} />
                          <span>{experiment.views}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Sparkles size={12} />
                          <span>{experiment.likes}</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <button className="text-primary hover:text-primary/80 p-2 rounded-lg transition-colors">
                          <Play size={16} />
                        </button>
                        <button className="text-primary hover:text-primary/80 p-2 rounded-lg transition-colors">
                          <Download size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* All Experiments */}
        <section className="px-4 py-16">
          <div className="mx-auto max-w-7xl">
            <h2 className="neue-haas-grotesk-display text-foreground mb-12 text-center text-3xl">
              All Experiments
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {otherExperiments.map(experiment => (
                <div
                  key={experiment.id}
                  className="group bg-gray/50 border border-foreground/20 rounded-lg p-6 hover:shadow-lg transition-all duration-300"
                >
                  <div className="flex items-start space-x-4">
                    <div className={`p-3 rounded-lg ${getCategoryColor(experiment.category)}`}>
                      {getCategoryIcon(experiment.category)}
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="neue-haas-grotesk-display text-foreground group-hover:text-primary text-lg font-medium transition-colors">
                          {experiment.title}
                        </h3>
                        <span className={`rounded px-2 py-1 text-xs ${getDifficultyColor(experiment.difficulty)}`}>
                          {experiment.difficulty}
                        </span>
                      </div>
                      
                      <p className="noto-sans-jp text-foreground/70 mb-3 text-sm leading-relaxed">
                        {experiment.description}
                      </p>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex flex-wrap gap-1">
                          {experiment.technologies.slice(0, 2).map(tech => (
                            <span
                              key={tech}
                              className="bg-foreground/10 text-foreground/70 rounded px-2 py-1 text-xs"
                            >
                              {tech}
                            </span>
                          ))}
                        </div>
                        
                        <div className="flex items-center space-x-3 text-xs text-foreground/60">
                          <div className="flex items-center space-x-1">
                            <Eye size={12} />
                            <span>{experiment.views}</span>
                          </div>
                          <button className="text-primary hover:text-primary/80 transition-colors">
                            <Play size={14} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Experiment Categories */}
        <section className="border-foreground/20 border-t px-4 py-16">
          <div className="mx-auto max-w-7xl">
            <h2 className="neue-haas-grotesk-display text-foreground mb-12 text-center text-3xl">
              Experiment Categories
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="text-center p-6">
                <div className="bg-blue-500/20 p-4 rounded-lg mb-4 inline-block">
                  <Sparkles size={32} className="text-blue-600" />
                </div>
                <h3 className="neue-haas-grotesk-display text-foreground mb-2 text-lg">
                  Animation
                </h3>
                <p className="noto-sans-jp text-foreground/70 text-sm">
                  CSS animations, transitions, and motion graphics
                </p>
              </div>
              
              <div className="text-center p-6">
                <div className="bg-green-500/20 p-4 rounded-lg mb-4 inline-block">
                  <Play size={32} className="text-green-600" />
                </div>
                <h3 className="neue-haas-grotesk-display text-foreground mb-2 text-lg">
                  Interaction
                </h3>
                <p className="noto-sans-jp text-foreground/70 text-sm">
                  User interactions and micro-animations
                </p>
              </div>
              
              <div className="text-center p-6">
                <div className="bg-purple-500/20 p-4 rounded-lg mb-4 inline-block">
                  <Palette size={32} className="text-purple-600" />
                </div>
                <h3 className="neue-haas-grotesk-display text-foreground mb-2 text-lg">
                  Visual
                </h3>
                <p className="noto-sans-jp text-foreground/70 text-sm">
                  Visual effects and artistic expressions
                </p>
              </div>
              
              <div className="text-center p-6">
                <div className="bg-orange-500/20 p-4 rounded-lg mb-4 inline-block">
                  <Eye size={32} className="text-orange-600" />
                </div>
                <h3 className="neue-haas-grotesk-display text-foreground mb-2 text-lg">
                  Prototype
                </h3>
                <p className="noto-sans-jp text-foreground/70 text-sm">
                  Interactive prototypes and tools
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-foreground/20 border-t py-8 text-center">
          <p className="noto-sans-jp text-foreground/60 text-sm">
            © 2025 samuido (木村友亮). All rights reserved.
          </p>
          <div className="mt-4 flex justify-center space-x-6">
            <Link href="/contact" className="text-foreground/60 hover:text-primary text-sm">
              Contact
            </Link>
            <Link href="/about" className="text-foreground/60 hover:text-primary text-sm">
              About
            </Link>
          </div>
        </footer>
      </div>
    </>
  );
}