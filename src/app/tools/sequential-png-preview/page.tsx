'use client';

import Link from "next/link";
import { useState, useEffect, useRef, useCallback } from "react";
import { 
  ArrowLeft, 
  Upload,
  FolderOpen,
  FileArchive,
  Play,
  Pause,
  RotateCcw,
  Download,
  Settings,
  Grid3x3,
  SkipBack,
  SkipForward,
  Image as ImageIcon,
  Zap,
  Timer,
  Maximize2
} from "lucide-react";

interface ImageFile {
  file: File;
  url: string;
  name: string;
  size: number;
}

interface AnimationSettings {
  frameRate: number;
  loop: boolean;
  direction: 'forward' | 'reverse' | 'pingpong';
  quality: 'low' | 'medium' | 'high';
}

interface PreviewSettings {
  viewMode: 'animation' | 'grid' | 'timeline';
  showControls: boolean;
  autoPlay: boolean;
  backgroundColor: string;
  showGrid: boolean;
}

export default function SequentialPNGPreviewPage() {
  const [images, setImages] = useState<ImageFile[]>([]);
  const [currentFrame, setCurrentFrame] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [animationSettings, setAnimationSettings] = useState<AnimationSettings>({
    frameRate: 24,
    loop: true,
    direction: 'forward',
    quality: 'medium'
  });
  const [previewSettings, setPreviewSettings] = useState<PreviewSettings>({
    viewMode: 'animation',
    showControls: true,
    autoPlay: false,
    backgroundColor: '#000000',
    showGrid: false
  });
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const animationIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const [dragActive, setDragActive] = useState(false);

  useEffect(() => {
    if (isPlaying && images.length > 0) {
      const interval = 1000 / animationSettings.frameRate;
      animationIntervalRef.current = setInterval(() => {
        setCurrentFrame(prev => {
          if (animationSettings.direction === 'forward') {
            const next = prev + 1;
            if (next >= images.length) {
              return animationSettings.loop ? 0 : prev;
            }
            return next;
          } else if (animationSettings.direction === 'reverse') {
            const next = prev - 1;
            if (next < 0) {
              return animationSettings.loop ? images.length - 1 : prev;
            }
            return next;
          }
          return prev;
        });
      }, interval);
    } else {
      if (animationIntervalRef.current) {
        clearInterval(animationIntervalRef.current);
        animationIntervalRef.current = null;
      }
    }

    return () => {
      if (animationIntervalRef.current) {
        clearInterval(animationIntervalRef.current);
      }
    };
  }, [isPlaying, animationSettings, images.length]);

  useEffect(() => {
    if (images.length > 0 && canvasRef.current) {
      drawCurrentFrame();
    }
  }, [currentFrame, images, previewSettings]);

  const drawCurrentFrame = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || images.length === 0) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const image = new Image();
    image.onload = () => {
      // Set canvas size to image size
      canvas.width = image.width;
      canvas.height = image.height;
      
      // Clear canvas with background color
      ctx.fillStyle = previewSettings.backgroundColor;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Draw image
      ctx.drawImage(image, 0, 0);
      
      // Draw grid if enabled
      if (previewSettings.showGrid) {
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.lineWidth = 1;
        const gridSize = 50;
        
        for (let x = 0; x < canvas.width; x += gridSize) {
          ctx.beginPath();
          ctx.moveTo(x, 0);
          ctx.lineTo(x, canvas.height);
          ctx.stroke();
        }
        
        for (let y = 0; y < canvas.height; y += gridSize) {
          ctx.beginPath();
          ctx.moveTo(0, y);
          ctx.lineTo(canvas.width, y);
          ctx.stroke();
        }
      }
    };
    
    if (images[currentFrame]) {
      image.src = images[currentFrame].url;
    }
  }, [currentFrame, images, previewSettings]);

  const handleFiles = useCallback((files: FileList) => {
    setIsLoading(true);
    const pngFiles = Array.from(files).filter(file => 
      file.type === 'image/png' || file.name.toLowerCase().endsWith('.png')
    );
    
    if (pngFiles.length === 0) {
      alert('PNGファイルが見つかりませんでした。');
      setIsLoading(false);
      return;
    }

    // Sort files by name
    pngFiles.sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true }));

    const imageFiles: ImageFile[] = [];
    let loadedCount = 0;

    pngFiles.forEach((file, index) => {
      const url = URL.createObjectURL(file);
      imageFiles.push({
        file,
        url,
        name: file.name,
        size: file.size
      });
      
      // Preload image to check if it's valid
      const img = new Image();
      img.onload = () => {
        loadedCount++;
        if (loadedCount === pngFiles.length) {
          setImages(imageFiles);
          setCurrentFrame(0);
          setIsLoading(false);
          
          if (previewSettings.autoPlay) {
            setIsPlaying(true);
          }
        }
      };
      img.onerror = () => {
        loadedCount++;
        if (loadedCount === pngFiles.length) {
          setImages(imageFiles.filter((_, i) => i !== index));
          setCurrentFrame(0);
          setIsLoading(false);
        }
      };
      img.src = url;
    });
  }, [previewSettings.autoPlay]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  }, [handleFiles]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
  }, []);

  const togglePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const resetAnimation = () => {
    setIsPlaying(false);
    setCurrentFrame(0);
  };

  const nextFrame = () => {
    setCurrentFrame(prev => (prev + 1) % images.length);
  };

  const prevFrame = () => {
    setCurrentFrame(prev => (prev - 1 + images.length) % images.length);
  };

  const clearImages = () => {
    // Cleanup object URLs
    images.forEach(img => URL.revokeObjectURL(img.url));
    setImages([]);
    setCurrentFrame(0);
    setIsPlaying(false);
  };

  const exportAnimation = () => {
    // Implementation for exporting as GIF or MP4 would go here
    alert('エクスポート機能は開発中です。');
  };

  const totalSize = images.reduce((acc, img) => acc + img.size, 0);
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "Sequential PNG Preview",
    "description": "連番PNGファイルをアニメーションとしてプレビュー",
    "url": "https://yusuke-kim.com/tools/sequential-png-preview",
    "applicationCategory": "MultimediaApplication",
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
              Sequential PNG Preview
            </h1>
          </div>
        </nav>

        <div className="max-w-7xl mx-auto p-4">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Main Preview Area */}
            <div className="lg:col-span-3 space-y-4">
              {/* Upload Area */}
              {images.length === 0 ? (
                <div
                  className={`border-2 border-dashed p-12 text-center transition-colors ${
                    dragActive 
                      ? 'border-primary bg-primary/5' 
                      : 'border-foreground/30 hover:border-primary/50'
                  }`}
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                >
                  {isLoading ? (
                    <div className="space-y-4">
                      <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full mx-auto"></div>
                      <p className="noto-sans-jp text-foreground/70">
                        ファイルを読み込み中...
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <ImageIcon size={64} className="mx-auto text-foreground/30" />
                      <div>
                        <h3 className="neue-haas-grotesk-display text-xl text-foreground mb-2">
                          連番PNGファイルをアップロード
                        </h3>
                        <p className="noto-sans-jp text-foreground/70 mb-4">
                          複数のPNGファイルをドラッグ&ドロップ、または下のボタンから選択してください
                        </p>
                      </div>
                      
                      <div className="flex flex-wrap justify-center gap-4">
                        <button
                          onClick={() => fileInputRef.current?.click()}
                          className="flex items-center space-x-2 px-6 py-3 border border-primary text-primary hover:bg-primary/10"
                        >
                          <Upload size={20} />
                          <span>ファイル選択</span>
                        </button>
                        
                        <button
                          onClick={() => {
                            const input = document.createElement('input');
                            input.type = 'file';
                            input.webkitdirectory = true;
                            input.multiple = true;
                            input.accept = '.png,image/png';
                            input.onchange = (e) => {
                              const target = e.target as HTMLInputElement;
                              if (target.files) {
                                handleFiles(target.files);
                              }
                            };
                            input.click();
                          }}
                          className="flex items-center space-x-2 px-6 py-3 border border-foreground/20 text-foreground hover:bg-foreground/10"
                        >
                          <FolderOpen size={20} />
                          <span>フォルダ選択</span>
                        </button>
                      </div>
                      
                      <input
                        ref={fileInputRef}
                        type="file"
                        multiple
                        accept=".png,image/png"
                        onChange={(e) => {
                          if (e.target.files) {
                            handleFiles(e.target.files);
                          }
                        }}
                        className="hidden"
                      />
                    </div>
                  )}
                </div>
              ) : (
                <div className="border border-foreground/20 bg-gray/50">
                  {/* Controls */}
                  <div className="p-4 border-b border-foreground/20 flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={togglePlayPause}
                          className="flex items-center space-x-1 px-3 py-2 border border-primary text-primary hover:bg-primary/10"
                        >
                          {isPlaying ? <Pause size={16} /> : <Play size={16} />}
                          <span>{isPlaying ? '停止' : '再生'}</span>
                        </button>
                        
                        <button
                          onClick={resetAnimation}
                          className="p-2 border border-foreground/20 text-foreground hover:bg-foreground/10"
                        >
                          <RotateCcw size={16} />
                        </button>
                        
                        <button
                          onClick={prevFrame}
                          className="p-2 border border-foreground/20 text-foreground hover:bg-foreground/10"
                        >
                          <SkipBack size={16} />
                        </button>
                        
                        <button
                          onClick={nextFrame}
                          className="p-2 border border-foreground/20 text-foreground hover:bg-foreground/10"
                        >
                          <SkipForward size={16} />
                        </button>
                      </div>
                      
                      <div className="text-sm text-foreground/70">
                        フレーム: {currentFrame + 1} / {images.length}
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={exportAnimation}
                        className="flex items-center space-x-1 px-3 py-2 border border-foreground/20 text-foreground hover:bg-foreground/10"
                      >
                        <Download size={16} />
                        <span>エクスポート</span>
                      </button>
                      
                      <button
                        onClick={clearImages}
                        className="px-3 py-2 border border-red-500/50 text-red-500 hover:bg-red-500/10"
                      >
                        クリア
                      </button>
                    </div>
                  </div>

                  {/* Preview Canvas */}
                  <div className="p-4 flex justify-center" style={{ backgroundColor: previewSettings.backgroundColor }}>
                    <canvas
                      ref={canvasRef}
                      className="max-w-full max-h-[60vh] object-contain border border-foreground/20"
                    />
                  </div>

                  {/* Timeline */}
                  <div className="p-4 border-t border-foreground/20">
                    <div className="mb-2 flex justify-between text-sm text-foreground/70">
                      <span>タイムライン</span>
                      <span>{animationSettings.frameRate} FPS</span>
                    </div>
                    
                    <input
                      type="range"
                      min={0}
                      max={images.length - 1}
                      value={currentFrame}
                      onChange={(e) => setCurrentFrame(parseInt(e.target.value))}
                      className="w-full"
                    />
                    
                    <div className="mt-2 flex justify-between text-xs text-foreground/50">
                      <span>0s</span>
                      <span>{((images.length - 1) / animationSettings.frameRate).toFixed(1)}s</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Settings Panel */}
            <div className="space-y-6">
              {/* File Info */}
              {images.length > 0 && (
                <div className="border border-foreground/20 bg-gray/50 p-4">
                  <h3 className="neue-haas-grotesk-display text-lg text-foreground mb-4 flex items-center">
                    <ImageIcon size={20} className="mr-2" />
                    ファイル情報
                  </h3>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-foreground/70">ファイル数</span>
                      <span className="text-primary">{images.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-foreground/70">総容量</span>
                      <span className="text-primary">{formatFileSize(totalSize)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-foreground/70">現在のファイル</span>
                      <span className="text-primary text-xs">{images[currentFrame]?.name}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Animation Settings */}
              <div className="border border-foreground/20 bg-gray/50 p-4">
                <h3 className="neue-haas-grotesk-display text-lg text-foreground mb-4 flex items-center">
                  <Zap size={20} className="mr-2" />
                  アニメーション設定
                </h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm text-foreground/70 mb-2">
                      フレームレート: {animationSettings.frameRate} FPS
                    </label>
                    <input
                      type="range"
                      min={1}
                      max={60}
                      value={animationSettings.frameRate}
                      onChange={(e) => setAnimationSettings(prev => ({
                        ...prev,
                        frameRate: parseInt(e.target.value)
                      }))}
                      className="w-full"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm text-foreground/70 mb-2">再生方向</label>
                    <select
                      value={animationSettings.direction}
                      onChange={(e) => setAnimationSettings(prev => ({
                        ...prev,
                        direction: e.target.value as any
                      }))}
                      className="w-full px-3 py-2 border border-foreground/20 bg-gray text-foreground rounded-none focus:border-primary focus:outline-none"
                    >
                      <option value="forward">順再生</option>
                      <option value="reverse">逆再生</option>
                      <option value="pingpong">往復再生</option>
                    </select>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="loop"
                      checked={animationSettings.loop}
                      onChange={(e) => setAnimationSettings(prev => ({
                        ...prev,
                        loop: e.target.checked
                      }))}
                      className="w-4 h-4"
                    />
                    <label htmlFor="loop" className="text-sm text-foreground/70">
                      ループ再生
                    </label>
                  </div>
                </div>
              </div>

              {/* Preview Settings */}
              <div className="border border-foreground/20 bg-gray/50 p-4">
                <h3 className="neue-haas-grotesk-display text-lg text-foreground mb-4 flex items-center">
                  <Settings size={20} className="mr-2" />
                  表示設定
                </h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm text-foreground/70 mb-2">背景色</label>
                    <input
                      type="color"
                      value={previewSettings.backgroundColor}
                      onChange={(e) => setPreviewSettings(prev => ({
                        ...prev,
                        backgroundColor: e.target.value
                      }))}
                      className="w-full h-10 border border-foreground/20 rounded-none"
                    />
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="showGrid"
                      checked={previewSettings.showGrid}
                      onChange={(e) => setPreviewSettings(prev => ({
                        ...prev,
                        showGrid: e.target.checked
                      }))}
                      className="w-4 h-4"
                    />
                    <label htmlFor="showGrid" className="text-sm text-foreground/70">
                      グリッド表示
                    </label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="autoPlay"
                      checked={previewSettings.autoPlay}
                      onChange={(e) => setPreviewSettings(prev => ({
                        ...prev,
                        autoPlay: e.target.checked
                      }))}
                      className="w-4 h-4"
                    />
                    <label htmlFor="autoPlay" className="text-sm text-foreground/70">
                      自動再生
                    </label>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              {images.length > 0 && (
                <div className="border border-foreground/20 bg-gray/50 p-4">
                  <h3 className="neue-haas-grotesk-display text-lg text-foreground mb-4">
                    クイックアクション
                  </h3>
                  
                  <div className="space-y-2">
                    <button
                      onClick={() => setAnimationSettings(prev => ({ ...prev, frameRate: 12 }))}
                      className="w-full text-left px-3 py-2 border border-foreground/20 hover:bg-foreground/10 text-sm"
                    >
                      12 FPS (アニメーション)
                    </button>
                    <button
                      onClick={() => setAnimationSettings(prev => ({ ...prev, frameRate: 24 }))}
                      className="w-full text-left px-3 py-2 border border-foreground/20 hover:bg-foreground/10 text-sm"
                    >
                      24 FPS (映画)
                    </button>
                    <button
                      onClick={() => setAnimationSettings(prev => ({ ...prev, frameRate: 30 }))}
                      className="w-full text-left px-3 py-2 border border-foreground/20 hover:bg-foreground/10 text-sm"
                    >
                      30 FPS (ビデオ)
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}