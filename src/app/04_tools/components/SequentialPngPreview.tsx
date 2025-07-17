'use client';

import React, { useState, useCallback, useEffect, useRef } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Play,
  Pause,
  Upload,
  Settings,
  Check,
  RefreshCw,
  Image,
} from 'lucide-react';
import NextImage from 'next/image';

interface ImageSequence {
  name: string;
  files: File[];
  previewUrls: string[];
  pattern: string;
  baseNumber: number;
  padding: number;
}

interface PreviewSettings {
  autoPlay: boolean;
  playbackSpeed: number; // frames per second
  loop: boolean;
  showFilenames: boolean;
}

const SequentialPngPreview: React.FC = () => {
  // State for image sequences
  const [sequences, setSequences] = useState<ImageSequence[]>([]);
  const [activeSequence, setActiveSequence] = useState<number>(0);
  const [currentFrame, setCurrentFrame] = useState<number>(0);

  // State for settings
  const [settings, setSettings] = useState<PreviewSettings>({
    autoPlay: false,
    playbackSpeed: 12,
    loop: true,
    showFilenames: true,
  });

  // State for UI
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [showSettings, setShowSettings] = useState<boolean>(false);
  const [notification, setNotification] = useState<string | null>(null);

  // Refs
  const fileInputRef = useRef<HTMLInputElement>(null);
  const animationRef = useRef<number | null>(null);
  const lastFrameTimeRef = useRef<number>(0);

  // Extract sequence pattern from filenames
  const extractSequencePattern = useCallback(
    (filenames: string[]): { pattern: string; baseNumber: number; padding: number } => {
      if (filenames.length === 0) {
        return { pattern: '', baseNumber: 0, padding: 0 };
      }

      // Find common prefix and suffix
      const firstFile = filenames[0];
      const lastFile = filenames[filenames.length - 1];

      let prefixLength = 0;
      while (
        prefixLength < firstFile.length &&
        prefixLength < lastFile.length &&
        firstFile[prefixLength] === lastFile[prefixLength]
      ) {
        prefixLength++;
      }

      // Find where the number ends in the first filename
      let numberEndPos = prefixLength;
      while (numberEndPos < firstFile.length && /\d/.test(firstFile[numberEndPos])) {
        numberEndPos++;
      }

      const prefix = firstFile.substring(0, prefixLength);
      const suffix = firstFile.substring(numberEndPos);

      // Extract the number from the first filename
      const numberMatch = firstFile.substring(prefixLength).match(/^\d+/);
      const baseNumber = numberMatch ? parseInt(numberMatch[0], 10) : 0;
      const padding = numberMatch ? numberMatch[0].length : 0;

      return {
        pattern: `${prefix}[#]${suffix}`,
        baseNumber,
        padding,
      };
    },
    []
  );

  // Handle file selection
  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(e.target.files || []);

      if (files.length === 0) {
        return;
      }

      setIsLoading(true);

      // Filter for PNG files
      const pngFiles = files.filter(file => file.type === 'image/png');

      if (pngFiles.length === 0) {
        setNotification('No PNG files found in selection');
        setTimeout(() => setNotification(null), 3000);
        setIsLoading(false);
        return;
      }

      // Sort files by name
      pngFiles.sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true }));

      // Create preview URLs
      const previewUrls = pngFiles.map(file => URL.createObjectURL(file));

      // Extract pattern from filenames
      const filenames = pngFiles.map(file => file.name);
      const { pattern, baseNumber, padding } = extractSequencePattern(filenames);

      // Create a name for the sequence based on common parts
      const sequenceName = pattern.replace(
        '[#]',
        `${baseNumber}-${baseNumber + pngFiles.length - 1}`
      );

      // Add new sequence
      setSequences(prev => [
        ...prev,
        {
          name: sequenceName,
          files: pngFiles,
          previewUrls,
          pattern,
          baseNumber,
          padding,
        },
      ]);

      // Set as active sequence if it's the first one
      if (sequences.length === 0) {
        setActiveSequence(0);
        setCurrentFrame(0);
      }

      setIsLoading(false);
      setNotification(`Added ${pngFiles.length} images to sequence`);
      setTimeout(() => setNotification(null), 3000);

      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    },
    [sequences, extractSequencePattern]
  );

  // Handle sequence selection
  const handleSelectSequence = useCallback((index: number) => {
    setActiveSequence(index);
    setCurrentFrame(0);
    stopPlayback();
  }, []);

  const stopPlayback = useCallback(() => {
    if (animationRef.current !== null) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }
    setIsPlaying(false);
  }, []);

  // Handle sequence removal
  const handleRemoveSequence = useCallback(
    (index: number) => {
      // Revoke object URLs to prevent memory leaks
      sequences[index].previewUrls.forEach(url => URL.revokeObjectURL(url));

      setSequences(prev => prev.filter((_, i) => i !== index));

      // Update active sequence if needed
      if (activeSequence === index) {
        setActiveSequence(prev => (prev > 0 ? prev - 1 : 0));
        setCurrentFrame(0);
      } else if (activeSequence > index) {
        setActiveSequence(prev => prev - 1);
      }
      stopPlayback();
    },
    [sequences, activeSequence, stopPlayback]
  );

  // Navigation functions
  const goToNextFrame = useCallback(() => {
    if (sequences.length === 0) return;

    setCurrentFrame(prev => {
      const maxFrame = sequences[activeSequence].files.length - 1;
      if (prev >= maxFrame) {
        return settings.loop ? 0 : maxFrame;
      }
      return prev + 1;
    });
  }, [sequences, activeSequence, settings.loop]);

  const goToPrevFrame = useCallback(() => {
    if (sequences.length === 0) return;

    setCurrentFrame(prev => {
      const maxFrame = sequences[activeSequence].files.length - 1;
      if (prev <= 0) {
        return settings.loop ? maxFrame : 0;
      }
      return prev - 1;
    });
  }, [sequences, activeSequence, settings.loop]);

  // Playback functions
  const startPlayback = useCallback(() => {
    if (sequences.length === 0) return;

    setIsPlaying(true);
    lastFrameTimeRef.current = performance.now();

    const animate = (time: number) => {
      if (time - lastFrameTimeRef.current >= 1000 / settings.playbackSpeed) {
        goToNextFrame();
        lastFrameTimeRef.current = time;
      }
      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);
  }, [sequences, settings.playbackSpeed, goToNextFrame]);

  const togglePlayback = useCallback(() => {
    if (isPlaying) {
      stopPlayback();
    } else {
      startPlayback();
    }
  }, [isPlaying, startPlayback, stopPlayback]);

  // Auto-play when settings change
  useEffect(() => {
    if (settings.autoPlay && sequences.length > 0 && !isPlaying) {
      startPlayback();
    }
  }, [settings.autoPlay, sequences, isPlaying, startPlayback]);

  // Clean up object URLs when component unmounts
  useEffect(() => {
    return () => {
      sequences.forEach(sequence => {
        sequence.previewUrls.forEach(url => URL.revokeObjectURL(url));
      });
    };
  }, [sequences]);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') {
        goToNextFrame();
      } else if (e.key === 'ArrowLeft') {
        goToPrevFrame();
      } else if (e.key === ' ') {
        togglePlayback();
        e.preventDefault();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [goToNextFrame, goToPrevFrame, togglePlayback]);

  // Render functions
  const renderCurrentFrame = () => {
    if (sequences.length === 0) {
      return (
        <div className="flex h-64 w-full flex-col items-center justify-center rounded border bg-gray-50 p-6 text-center">
          <Image className="mb-4 text-gray-400" size={48} />
          <p className="text-foreground/70 mb-4">No image sequences loaded</p>
          <label className="bg-primary hover:bg-primary/80 flex cursor-pointer items-center space-x-2 rounded px-4 py-2 text-white transition-colors">
            <Upload size={16} />
            <span>Select PNG Sequence</span>
            <input
              type="file"
              accept="image/png"
              multiple
              onChange={handleFileSelect}
              className="hidden"
              ref={fileInputRef}
            />
          </label>
        </div>
      );
    }

    const sequence = sequences[activeSequence];
    const currentUrl = sequence.previewUrls[currentFrame];
    const currentFile = sequence.files[currentFrame];

    return (
      <div className="flex flex-col items-center">
        <div className="relative">
          <NextImage
            src={currentUrl}
            alt={`Frame ${currentFrame}`}
            width={800}
            height={600}
            className="max-h-[60vh] w-auto rounded border bg-gray-50"
          />
          {settings.showFilenames && (
            <div className="bg-foreground/80 text-background absolute right-0 bottom-0 left-0 p-2 text-center text-sm">
              {currentFile.name}
            </div>
          )}
        </div>

        <div className="mt-4 flex w-full items-center justify-between">
          <div className="text-foreground/70 text-sm">
            Frame {currentFrame + 1} of {sequence.files.length}
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={goToPrevFrame}
              className="border-foreground/20 text-foreground/70 hover:border-primary/50 flex h-8 w-8 items-center justify-center rounded-full border transition-colors"
              title="Previous frame"
            >
              <ChevronLeft size={16} />
            </button>

            <button
              onClick={togglePlayback}
              className="bg-primary hover:bg-primary/80 flex h-10 w-10 items-center justify-center rounded-full text-white transition-colors"
              title={isPlaying ? 'Pause' : 'Play'}
            >
              {isPlaying ? <Pause size={18} /> : <Play size={18} />}
            </button>

            <button
              onClick={goToNextFrame}
              className="border-foreground/20 text-foreground/70 hover:border-primary/50 flex h-8 w-8 items-center justify-center rounded-full border transition-colors"
              title="Next frame"
            >
              <ChevronRight size={16} />
            </button>
          </div>

          <div className="text-foreground/70 text-sm">{settings.playbackSpeed} fps</div>
        </div>

        <div className="mt-2 w-full">
          <input
            type="range"
            min="0"
            max={sequence.files.length - 1}
            value={currentFrame}
            onChange={e => {
              setCurrentFrame(parseInt(e.target.value, 10));
              if (isPlaying) {
                stopPlayback();
              }
            }}
            className="w-full"
          />
        </div>
      </div>
    );
  };

  const renderSequenceList = () => {
    if (sequences.length === 0) {
      return null;
    }

    return (
      <div className="border-foreground/20 mt-6 border p-4">
        <h3 className="neue-haas-grotesk-display text-foreground mb-3 text-lg">Loaded Sequences</h3>
        <div className="space-y-2">
          {sequences.map((sequence, index) => (
            <div
              key={index}
              className={`flex items-center justify-between rounded p-2 ${
                index === activeSequence ? 'bg-primary/10' : 'hover:bg-gray-100'
              }`}
            >
              <div
                className="flex flex-1 cursor-pointer items-center"
                onClick={() => handleSelectSequence(index)}
              >
                <div className="mr-2 h-10 w-10 overflow-hidden rounded border">
                  <NextImage
                    src={sequence.previewUrls[0]}
                    alt={`Thumbnail for ${sequence.name}`}
                    width={40}
                    height={40}
                    className="h-full w-full object-cover"
                  />
                </div>
                <div>
                  <div className="text-foreground text-sm font-medium">{sequence.name}</div>
                  <div className="text-foreground/70 text-xs">{sequence.files.length} frames</div>
                </div>
              </div>
              <button
                onClick={() => handleRemoveSequence(index)}
                className="text-foreground/50 ml-2 text-sm hover:text-red-500"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderSettings = () => {
    return (
      <div className="border-foreground/20 mt-6 border p-4">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="neue-haas-grotesk-display text-foreground text-lg">Settings</h3>
          <button
            onClick={() => setShowSettings(!showSettings)}
            className={`text-sm transition-colors ${showSettings ? 'text-primary' : 'text-foreground/60'}`}
          >
            {showSettings ? 'Hide' : 'Show'}
          </button>
        </div>

        {showSettings && (
          <div className="space-y-4">
            <div>
              <label className="noto-sans-jp text-foreground mb-2 block text-sm font-medium">
                Playback Speed: {settings.playbackSpeed} fps
              </label>
              <input
                type="range"
                min="1"
                max="60"
                value={settings.playbackSpeed}
                onChange={e =>
                  setSettings({ ...settings, playbackSpeed: parseInt(e.target.value, 10) })
                }
                className="w-full"
              />
            </div>

            <div className="flex items-center space-x-4">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="autoPlay"
                  checked={settings.autoPlay}
                  onChange={e => setSettings({ ...settings, autoPlay: e.target.checked })}
                  className="mr-2 h-4 w-4"
                />
                <label htmlFor="autoPlay" className="noto-sans-jp text-foreground text-sm">
                  Auto-play
                </label>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="loop"
                  checked={settings.loop}
                  onChange={e => setSettings({ ...settings, loop: e.target.checked })}
                  className="mr-2 h-4 w-4"
                />
                <label htmlFor="loop" className="noto-sans-jp text-foreground text-sm">
                  Loop playback
                </label>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="showFilenames"
                  checked={settings.showFilenames}
                  onChange={e => setSettings({ ...settings, showFilenames: e.target.checked })}
                  className="mr-2 h-4 w-4"
                />
                <label htmlFor="showFilenames" className="noto-sans-jp text-foreground text-sm">
                  Show filenames
                </label>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-foreground/20 border p-6">
        <h2 className="neue-haas-grotesk-display text-foreground mb-6 text-2xl">
          <Image className="mr-2 inline" size={24} />
          Sequential PNG Preview
        </h2>
        <div className="flex flex-wrap gap-3">
          <label className="bg-primary hover:bg-primary/80 flex cursor-pointer items-center space-x-2 px-4 py-2 text-white transition-colors">
            <Upload size={16} />
            <span>Select PNG Sequence</span>
            <input
              type="file"
              accept="image/png"
              multiple
              onChange={handleFileSelect}
              className="hidden"
              ref={fileInputRef}
            />
          </label>

          <button
            onClick={() => setShowSettings(!showSettings)}
            className="border-foreground/20 text-foreground/70 hover:border-primary/50 flex items-center space-x-1 border px-4 py-2 text-sm transition-colors"
          >
            <Settings size={14} />
            <span>{showSettings ? 'Hide Settings' : 'Show Settings'}</span>
          </button>
        </div>

        {/* Loading indicator */}
        {isLoading && (
          <div className="mt-4 flex items-center">
            <RefreshCw className="text-primary mr-2 animate-spin" size={16} />
            <span className="text-foreground/70 text-sm">Loading images...</span>
          </div>
        )}

        {/* Notification */}
        {notification && (
          <div className="bg-primary/10 text-primary mt-4 flex items-center gap-2 rounded-md p-2 text-sm">
            <Check size={16} />
            <span>{notification}</span>
          </div>
        )}
      </div>

      {/* Preview area */}
      <div className="border-foreground/20 border p-6">
        <h3 className="neue-haas-grotesk-display text-foreground mb-4 text-xl">Image Preview</h3>
        {renderCurrentFrame()}
      </div>

      {/* Settings */}
      {renderSettings()}

      {/* Sequence list */}
      {renderSequenceList()}
    </div>
  );
};

export default SequentialPngPreview;
