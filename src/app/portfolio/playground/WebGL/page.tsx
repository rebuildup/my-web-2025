import Link from 'next/link';
import type { Metadata } from 'next';
import { ArrowLeft, Zap, Play, Eye, RotateCcw, Download, Cpu, Monitor } from 'lucide-react';

export const metadata: Metadata = {
  title: 'WebGL Playground - samuido | WebGL実験場',
  description:
    'Three.jsやWebGPUを使用したWebGLグラフィックス実験。リアルタイムレンダリング、シェーダー、3Dアニメーションの実装を探求します。',
  keywords: [
    'WebGL',
    'Three.js',
    'WebGPU',
    'シェーダー',
    '3Dアニメーション',
    'リアルタイムレンダリング',
    'GLSL',
    'グラフィックス',
  ],
  robots: 'index, follow',
  openGraph: {
    title: 'WebGL Playground - samuido | WebGL実験場',
    description:
      'Three.jsやWebGPUを使用したWebGLグラフィックス実験。リアルタイムレンダリング、シェーダー、3Dアニメーションの実装を探求します。',
    type: 'website',
    url: '/portfolio/playground/WebGL',
    images: [
      {
        url: '/portfolio-playground-webgl-og.jpg',
        width: 1200,
        height: 630,
        alt: 'WebGL Playground - samuido',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'WebGL Playground - samuido | WebGL実験場',
    description:
      'Three.jsやWebGPUを使用したWebGLグラフィックス実験。リアルタイムレンダリング、シェーダー、3Dアニメーションの実装を探求します。',
    images: ['/portfolio-playground-webgl-twitter.jpg'],
    creator: '@361do_sleep',
  },
};

interface WebGLExperiment {
  id: string;
  title: string;
  description: string;
  category: 'shaders' | '3d-scene' | 'particle-system' | 'post-processing' | 'simulation';
  complexity: 'simple' | 'intermediate' | 'complex';
  technologies: string[];
  performance: 'low' | 'medium' | 'high';
  demoUrl?: string;
  codeUrl?: string;
  featured: boolean;
  views: number;
  likes: number;
}

const webglExperiments: WebGLExperiment[] = [
  {
    id: 'particle-galaxy',
    title: 'Interactive Particle Galaxy',
    description: 'Three.jsとカスタムシェーダーを使用した10万個のパーティクルによる銀河系シミュレーション。マウス操作でリアルタイム回転とズーム操作が可能。',
    category: 'particle-system',
    complexity: 'complex',
    technologies: ['Three.js', 'GLSL', 'WebGL', 'Custom Shaders', 'BufferGeometry'],
    performance: 'high',
    featured: true,
    views: 2156,
    likes: 143,
  },
  {
    id: 'shader-morphing',
    title: 'Morphing Shader Effects',
    description: 'Fragment shaderを使用した時間ベースの変形エフェクト。ノイズ関数とサイン波を組み合わせた有機的な変形表現。',
    category: 'shaders',
    complexity: 'intermediate',
    technologies: ['GLSL', 'Fragment Shaders', 'Noise Functions', 'Three.js'],
    performance: 'medium',
    featured: true,
    views: 1543,
    likes: 98,
  },
  {
    id: 'procedural-terrain',
    title: 'Procedural Terrain Generation',
    description: 'Perlinノイズを使用したリアルタイム地形生成。高度マップ、法線マップ、マルチテクスチャリングによる詳細な地形表現。',
    category: '3d-scene',
    complexity: 'complex',
    technologies: ['Three.js', 'Perlin Noise', 'Displacement Mapping', 'Multi-texturing'],
    performance: 'high',
    featured: true,
    views: 1287,
    likes: 76,
  },
  {
    id: 'fluid-simulation',
    title: 'Real-time Fluid Simulation',
    description: 'WebGLを使用したリアルタイム流体シミュレーション。Navier-Stokes方程式による物理的に正確な流体動作。',
    category: 'simulation',
    complexity: 'complex',
    technologies: ['WebGL', 'Physics Simulation', 'Navier-Stokes', 'Compute Shaders'],
    performance: 'high',
    featured: false,
    views: 987,
    likes: 62,
  },
  {
    id: 'bloom-post-processing',
    title: 'Advanced Bloom Post-processing',
    description: '多段階ブルームエフェクトとトーンマッピングによる HDR レンダリング。映画的な視覚効果の実現。',
    category: 'post-processing',
    complexity: 'intermediate',
    technologies: ['Post-processing', 'HDR Rendering', 'Bloom Effect', 'Tone Mapping'],
    performance: 'medium',
    featured: false,
    views: 654,
    likes: 41,
  },
  {
    id: 'procedural-city',
    title: 'Procedural City Generator',
    description: 'アルゴリズムによる都市の自動生成。建物の配置、道路網、照明システムを含む複雑な3D都市環境。',
    category: '3d-scene',
    complexity: 'complex',
    technologies: ['Procedural Generation', 'Instancing', 'LOD System', 'Lighting'],
    performance: 'high',
    featured: false,
    views: 543,
    likes: 38,
  },
];

function getCategoryColor(category: string): string {
  const colorMap: Record<string, string> = {
    shaders: 'bg-blue-500/20 text-blue-700',
    '3d-scene': 'bg-green-500/20 text-green-700',
    'particle-system': 'bg-purple-500/20 text-purple-700',
    'post-processing': 'bg-orange-500/20 text-orange-700',
    simulation: 'bg-red-500/20 text-red-700',
  };
  return colorMap[category] || 'bg-gray-500/20 text-gray-700';
}

function getComplexityColor(complexity: string): string {
  const colorMap: Record<string, string> = {
    simple: 'bg-green-100 text-green-800',
    intermediate: 'bg-yellow-100 text-yellow-800',
    complex: 'bg-red-100 text-red-800',
  };
  return colorMap[complexity] || 'bg-gray-100 text-gray-800';
}

function getPerformanceColor(performance: string): string {
  const colorMap: Record<string, string> = {
    low: 'bg-green-100 text-green-800',
    medium: 'bg-yellow-100 text-yellow-800',
    high: 'bg-red-100 text-red-800',
  };
  return colorMap[performance] || 'bg-gray-100 text-gray-800';
}

function getCategoryIcon(category: string): React.ReactNode {
  const iconMap: Record<string, React.ReactNode> = {
    shaders: <Zap size={16} />,
    '3d-scene': <Monitor size={16} />,
    'particle-system': <Play size={16} />,
    'post-processing': <Eye size={16} />,
    simulation: <Cpu size={16} />,
  };
  return iconMap[category] || <Zap size={16} />;
}

export default function WebGLPlaygroundPage() {
  const featuredExperiments = webglExperiments.filter(exp => exp.featured);
  const otherExperiments = webglExperiments.filter(exp => !exp.featured);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: 'WebGL Playground - samuido',
    description: 'Three.jsやWebGPUを使用したWebGLグラフィックス実験場',
    url: 'https://yusuke-kim.com/portfolio/playground/WebGL',
    author: {
      '@type': 'Person',
      name: '木村友亮',
      alternateName: 'samuido',
    },
    mainEntity: {
      '@type': 'ItemList',
      name: 'WebGL Experiments',
      description: 'Collection of WebGL graphics experiments and 3D demos',
      numberOfItems: webglExperiments.length,
      itemListElement: webglExperiments.map((exp, index) => ({
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
                href="/portfolio/playground/design"
                className="text-foreground/70 hover:text-primary text-sm transition-colors"
              >
                Design Playground
              </Link>
            </div>
          </div>
        </nav>

        {/* Header */}
        <header className="border-foreground/20 border-b bg-gradient-to-r from-blue-500/10 via-cyan-500/10 to-purple-500/10 px-4 py-16">
          <div className="mx-auto max-w-7xl text-center">
            <div className="flex items-center justify-center space-x-4 mb-6">
              <div className="bg-primary/20 p-4 rounded-xl">
                <Zap size={40} className="text-primary" />
              </div>
              <div>
                <h1 className="neue-haas-grotesk-display text-primary mb-2 text-5xl md:text-7xl font-bold">
                  WebGL Playground
                </h1>
                <p className="zen-kaku-gothic-new text-primary/80 text-xl">
                  WebGL実験場
                </p>
              </div>
            </div>
            
            <p className="noto-sans-jp text-foreground/80 mb-8 text-lg leading-relaxed max-w-3xl mx-auto">
              Three.jsやWebGPUを使用したグラフィックス実験の実装場。
              スクロールトリガー、アニメーション、リアルタイムレンダリングなど、
              様々な実験的実装を通じて3Dグラフィックスの可能性を探求します。
            </p>

            {/* Performance Warning */}
            <div className="bg-yellow-100 border border-yellow-300 rounded-lg p-4 max-w-2xl mx-auto mb-8">
              <div className="flex items-center justify-center space-x-2 text-yellow-800">
                <Cpu size={16} />
                <span className="text-sm font-medium">
                  WebGL実験はGPU集約的です。性能の低いデバイスでは動作が重くなる場合があります。
                </span>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl mx-auto">
              <div className="bg-gray/50 border border-foreground/20 p-4 rounded-lg text-center">
                <div className="neue-haas-grotesk-display text-primary mb-1 text-2xl">
                  {webglExperiments.length}
                </div>
                <div className="noto-sans-jp text-foreground/70 text-sm">WebGL Demos</div>
              </div>
              
              <div className="bg-gray/50 border border-foreground/20 p-4 rounded-lg text-center">
                <div className="neue-haas-grotesk-display text-primary mb-1 text-2xl">
                  {new Set(webglExperiments.flatMap(exp => exp.technologies)).size}
                </div>
                <div className="noto-sans-jp text-foreground/70 text-sm">Technologies</div>
              </div>
              
              <div className="bg-gray/50 border border-foreground/20 p-4 rounded-lg text-center">
                <div className="neue-haas-grotesk-display text-primary mb-1 text-2xl">
                  {webglExperiments.reduce((sum, exp) => sum + exp.views, 0)}
                </div>
                <div className="noto-sans-jp text-foreground/70 text-sm">Total Views</div>
              </div>
              
              <div className="bg-gray/50 border border-foreground/20 p-4 rounded-lg text-center">
                <div className="neue-haas-grotesk-display text-primary mb-1 text-2xl">
                  {webglExperiments.filter(exp => exp.performance === 'high').length}
                </div>
                <div className="noto-sans-jp text-foreground/70 text-sm">GPU Intensive</div>
              </div>
            </div>
          </div>
        </header>

        {/* Featured WebGL Experiments */}
        <section className="border-foreground/20 border-b px-4 py-16">
          <div className="mx-auto max-w-7xl">
            <h2 className="neue-haas-grotesk-display text-foreground mb-12 text-center text-3xl">
              Featured WebGL Experiments
            </h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {featuredExperiments.map(experiment => (
                <div
                  key={experiment.id}
                  className="group bg-gray/50 border border-foreground/20 rounded-xl overflow-hidden hover:shadow-xl transition-all duration-500 hover:scale-[1.02]"
                >
                  {/* WebGL Demo Preview */}
                  <div className="aspect-video bg-gradient-to-br from-blue-500/20 via-purple-500/20 to-cyan-500/20 relative overflow-hidden">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-primary/60 text-5xl">
                        {experiment.category === 'shaders' ? '⚡' :
                         experiment.category === '3d-scene' ? '🏗️' :
                         experiment.category === 'particle-system' ? '✨' :
                         experiment.category === 'post-processing' ? '🎭' : '🧪'}
                      </div>
                    </div>
                    
                    {/* Interactive Overlay */}
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <div className="text-center text-white">
                        <Play size={32} className="mx-auto mb-2" />
                        <span className="text-sm">Launch WebGL Demo</span>
                      </div>
                    </div>

                    {/* Category & Performance Badges */}
                    <div className="absolute top-3 left-3 right-3 flex justify-between">
                      <span className={`rounded-full px-3 py-1 text-xs font-medium flex items-center space-x-1 ${getCategoryColor(experiment.category)}`}>
                        {getCategoryIcon(experiment.category)}
                        <span>{experiment.category}</span>
                      </span>
                      
                      <div className="flex space-x-1">
                        <span className={`rounded-full px-2 py-1 text-xs ${getComplexityColor(experiment.complexity)}`}>
                          {experiment.complexity}
                        </span>
                        <span className={`rounded-full px-2 py-1 text-xs ${getPerformanceColor(experiment.performance)}`}>
                          {experiment.performance}
                        </span>
                      </div>
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
                            className="bg-blue-500/20 text-blue-700 rounded px-2 py-1 text-xs"
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
                          <Zap size={12} />
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

        {/* All WebGL Experiments */}
        <section className="px-4 py-16">
          <div className="mx-auto max-w-7xl">
            <h2 className="neue-haas-grotesk-display text-foreground mb-12 text-center text-3xl">
              All WebGL Experiments
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
                        <div className="flex space-x-1">
                          <span className={`rounded px-2 py-1 text-xs ${getComplexityColor(experiment.complexity)}`}>
                            {experiment.complexity}
                          </span>
                          <span className={`rounded px-2 py-1 text-xs ${getPerformanceColor(experiment.performance)}`}>
                            GPU: {experiment.performance}
                          </span>
                        </div>
                      </div>
                      
                      <p className="noto-sans-jp text-foreground/70 mb-3 text-sm leading-relaxed">
                        {experiment.description}
                      </p>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex flex-wrap gap-1">
                          {experiment.technologies.slice(0, 2).map(tech => (
                            <span
                              key={tech}
                              className="bg-blue-500/20 text-blue-700 rounded px-2 py-1 text-xs"
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

        {/* WebGL Technology Stack */}
        <section className="border-foreground/20 border-t px-4 py-16">
          <div className="mx-auto max-w-7xl">
            <h2 className="neue-haas-grotesk-display text-foreground mb-12 text-center text-3xl">
              WebGL Technology Stack
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
              <div className="text-center p-6">
                <div className="bg-blue-500/20 p-4 rounded-lg mb-4 inline-block">
                  <Zap size={32} className="text-blue-600" />
                </div>
                <h3 className="neue-haas-grotesk-display text-foreground mb-2 text-lg">
                  Shaders
                </h3>
                <p className="noto-sans-jp text-foreground/70 text-sm">
                  GLSL vertex and fragment shaders
                </p>
              </div>
              
              <div className="text-center p-6">
                <div className="bg-green-500/20 p-4 rounded-lg mb-4 inline-block">
                  <Monitor size={32} className="text-green-600" />
                </div>
                <h3 className="neue-haas-grotesk-display text-foreground mb-2 text-lg">
                  3D Scenes
                </h3>
                <p className="noto-sans-jp text-foreground/70 text-sm">
                  Complex 3D environments and models
                </p>
              </div>
              
              <div className="text-center p-6">
                <div className="bg-purple-500/20 p-4 rounded-lg mb-4 inline-block">
                  <Play size={32} className="text-purple-600" />
                </div>
                <h3 className="neue-haas-grotesk-display text-foreground mb-2 text-lg">
                  Particles
                </h3>
                <p className="noto-sans-jp text-foreground/70 text-sm">
                  Large-scale particle systems
                </p>
              </div>
              
              <div className="text-center p-6">
                <div className="bg-orange-500/20 p-4 rounded-lg mb-4 inline-block">
                  <Eye size={32} className="text-orange-600" />
                </div>
                <h3 className="neue-haas-grotesk-display text-foreground mb-2 text-lg">
                  Post-processing
                </h3>
                <p className="noto-sans-jp text-foreground/70 text-sm">
                  HDR and visual effects pipeline
                </p>
              </div>
              
              <div className="text-center p-6">
                <div className="bg-red-500/20 p-4 rounded-lg mb-4 inline-block">
                  <Cpu size={32} className="text-red-600" />
                </div>
                <h3 className="neue-haas-grotesk-display text-foreground mb-2 text-lg">
                  Simulation
                </h3>
                <p className="noto-sans-jp text-foreground/70 text-sm">
                  Physics and fluid simulations
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