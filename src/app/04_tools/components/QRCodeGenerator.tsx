'use client';

import React, { useState, useCallback, useEffect, useRef } from 'react';
import { Download, Copy, QrCode, Check, RefreshCw, Settings } from 'lucide-react';
import NextImage from 'next/image';

// QR Code options interface
interface QRCodeOptions {
  text: string;
  size: number;
  errorCorrectionLevel: 'L' | 'M' | 'Q' | 'H';
  darkColor: string;
  lightColor: string;
  includeMargin: boolean;
  logo?: string | null;
  logoSize?: number;
}

const QRCodeGenerator: React.FC = () => {
  // Default QR code options
  const defaultOptions: QRCodeOptions = {
    text: '',
    size: 200,
    errorCorrectionLevel: 'M',
    darkColor: '#000000',
    lightColor: '#FFFFFF',
    includeMargin: true,
    logo: null,
    logoSize: 50,
  };

  // State
  const [options, setOptions] = useState<QRCodeOptions>(defaultOptions);
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [showAdvanced, setShowAdvanced] = useState<boolean>(false);
  const [copySuccess, setCopySuccess] = useState<string | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const qrCodeRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Generate QR code
  const generateQRCode = useCallback(async () => {
    if (!options.text.trim()) {
      setCopySuccess('Please enter text for the QR code');
      setTimeout(() => setCopySuccess(null), 2000);
      return;
    }

    setIsGenerating(true);

    try {
      // Dynamically import QRCode library to reduce initial bundle size
      const QRCodeStyling = (await import('qr-code-styling')).default;

      const qrCode = new QRCodeStyling({
        width: options.size,
        height: options.size,
        type: 'svg',
        data: options.text,
        dotsOptions: {
          color: options.darkColor,
          type: 'square',
        },
        backgroundOptions: {
          color: options.lightColor,
        },
        cornersSquareOptions: {
          type: 'square',
        },
        cornersDotOptions: {
          type: 'square',
        },
        qrOptions: {
          errorCorrectionLevel: options.errorCorrectionLevel,
          typeNumber: 0,
        },
        imageOptions: options.logo
          ? {
              hideBackgroundDots: true,
              imageSize: options.logoSize ? options.logoSize / 100 : 0.5,
              margin: 5,
              crossOrigin: 'anonymous',
            }
          : undefined,
        image: options.logo || undefined,
      });

      // Clear previous QR code
      if (qrCodeRef.current) {
        qrCodeRef.current.innerHTML = '';
        await qrCode.append(qrCodeRef.current);
      }

      // Generate data URL for download
      const blob = await qrCode.getRawData('png');
      if (blob) {
        const url = URL.createObjectURL(blob as Blob);
        setQrCodeUrl(url);
      }
    } catch (error) {
      console.error('Error generating QR code:', error);
      setCopySuccess('Error generating QR code');
      setTimeout(() => setCopySuccess(null), 2000);
    } finally {
      setIsGenerating(false);
    }
  }, [options]);

  // Generate QR code when options change
  useEffect(() => {
    if (options.text) {
      const timer = setTimeout(() => {
        generateQRCode();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [options, generateQRCode]);

  // Handle text input change
  const handleTextChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setOptions(prev => ({ ...prev, text: e.target.value }));
  }, []);

  // Handle size change
  const handleSizeChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const size = parseInt(e.target.value, 10);
    setOptions(prev => ({ ...prev, size }));
  }, []);

  // Handle error correction level change
  const handleErrorCorrectionChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    setOptions(prev => ({
      ...prev,
      errorCorrectionLevel: e.target.value as 'L' | 'M' | 'Q' | 'H',
    }));
  }, []);

  // Handle color change
  const handleColorChange = useCallback((color: string, type: 'dark' | 'light') => {
    setOptions(prev => ({
      ...prev,
      [type === 'dark' ? 'darkColor' : 'lightColor']: color,
    }));
  }, []);

  // Handle margin toggle
  const handleMarginToggle = useCallback(() => {
    setOptions(prev => ({ ...prev, includeMargin: !prev.includeMargin }));
  }, []);

  // Handle logo upload
  const handleLogoUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        setLogoPreview(result);
        setOptions(prev => ({ ...prev, logo: result }));
      };
      reader.readAsDataURL(file);
    }
  }, []);

  // Handle logo size change
  const handleLogoSizeChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const logoSize = parseInt(e.target.value, 10);
    setOptions(prev => ({ ...prev, logoSize }));
  }, []);

  // Remove logo
  const handleRemoveLogo = useCallback(() => {
    setOptions(prev => ({ ...prev, logo: null }));
    setLogoPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, []);

  // Download QR code
  const downloadQRCode = useCallback(() => {
    if (!qrCodeUrl) {
      generateQRCode().then(() => {
        if (qrCodeUrl) {
          const link = document.createElement('a');
          link.href = qrCodeUrl;
          link.download = `qrcode-${new Date().getTime()}.png`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        }
      });
    } else {
      const link = document.createElement('a');
      link.href = qrCodeUrl;
      link.download = `qrcode-${new Date().getTime()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  }, [qrCodeUrl, generateQRCode]);

  // Copy QR code as image
  const copyQRCodeAsImage = useCallback(async () => {
    if (!qrCodeRef.current) return;

    try {
      // Create a canvas from the SVG
      const svg = qrCodeRef.current.querySelector('svg');
      if (!svg) return;

      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      canvas.width = options.size;
      canvas.height = options.size;

      // Draw white background
      ctx.fillStyle = options.lightColor;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Convert SVG to image
      const svgData = new XMLSerializer().serializeToString(svg);
      const img = new Image();
      img.src = 'data:image/svg+xml;base64,' + btoa(svgData);

      await new Promise<void>(resolve => {
        img.onload = () => {
          ctx.drawImage(img, 0, 0);
          resolve();
        };
      });

      // Copy canvas to clipboard
      canvas.toBlob(async blob => {
        if (blob) {
          try {
            await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
            setCopySuccess('QR code copied to clipboard!');
            setTimeout(() => setCopySuccess(null), 2000);
          } catch (err) {
            console.error('Failed to copy QR code:', err);
            setCopySuccess('Failed to copy QR code');
            setTimeout(() => setCopySuccess(null), 2000);
          }
        }
      });
    } catch (err) {
      console.error('Error copying QR code:', err);
      setCopySuccess('Error copying QR code');
      setTimeout(() => setCopySuccess(null), 2000);
    }
  }, [options.size, options.lightColor]);

  // Copy QR code text
  const copyQRCodeText = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(options.text);
      setCopySuccess('Text copied to clipboard!');
      setTimeout(() => setCopySuccess(null), 2000);
    } catch (err) {
      console.error('Failed to copy text:', err);
      setCopySuccess('Failed to copy text');
      setTimeout(() => setCopySuccess(null), 2000);
    }
  }, [options.text]);

  return (
    <div className="space-y-6">
      {/* QR Code Input */}
      <div className="border-foreground/20 border p-6">
        <h2 className="neue-haas-grotesk-display text-foreground mb-6 text-2xl">
          <QrCode className="mr-2 inline" size={24} />
          QR Code Generator
        </h2>
        <div className="space-y-4">
          <div>
            <label className="noto-sans-jp text-foreground mb-2 block text-sm font-medium">
              Enter text or URL
            </label>
            <textarea
              value={options.text}
              onChange={handleTextChange}
              placeholder="Enter text or URL to encode in the QR code"
              className="border-foreground/20 bg-gray text-foreground noto-sans-jp h-24 w-full border px-4 py-3 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="noto-sans-jp text-foreground mb-2 block text-sm font-medium">
                QR Code Size: {options.size}px
              </label>
              <input
                type="range"
                min="100"
                max="500"
                step="10"
                value={options.size}
                onChange={handleSizeChange}
                className="w-full"
              />
            </div>
            <div>
              <label className="noto-sans-jp text-foreground mb-2 block text-sm font-medium">
                Error Correction Level
              </label>
              <select
                value={options.errorCorrectionLevel}
                onChange={handleErrorCorrectionChange}
                className="border-foreground/20 bg-gray text-foreground w-full border px-3 py-2 focus:outline-none"
              >
                <option value="L">Low (7%)</option>
                <option value="M">Medium (15%)</option>
                <option value="Q">Quartile (25%)</option>
                <option value="H">High (30%)</option>
              </select>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <button
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="border-foreground/20 text-foreground/70 hover:border-primary/50 flex items-center space-x-1 border px-4 py-2 text-sm transition-colors"
            >
              <Settings size={14} />
              <span>{showAdvanced ? 'Hide Advanced Options' : 'Show Advanced Options'}</span>
            </button>
            <button
              onClick={generateQRCode}
              disabled={isGenerating}
              className="bg-primary hover:bg-primary/80 flex items-center space-x-2 px-4 py-2 text-white transition-colors disabled:opacity-50"
            >
              <RefreshCw size={16} className={isGenerating ? 'animate-spin' : ''} />
              <span>Generate QR Code</span>
            </button>
          </div>

          {showAdvanced && (
            <div className="border-foreground/10 mt-4 space-y-4 border-t pt-4">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label className="noto-sans-jp text-foreground mb-2 block text-sm font-medium">
                    Foreground Color
                  </label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="color"
                      value={options.darkColor}
                      onChange={e => handleColorChange(e.target.value, 'dark')}
                      className="h-8 w-8 cursor-pointer"
                    />
                    <input
                      type="text"
                      value={options.darkColor}
                      onChange={e => handleColorChange(e.target.value, 'dark')}
                      className="border-foreground/20 bg-gray text-foreground w-24 border px-2 py-1 text-sm focus:outline-none"
                    />
                  </div>
                </div>
                <div>
                  <label className="noto-sans-jp text-foreground mb-2 block text-sm font-medium">
                    Background Color
                  </label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="color"
                      value={options.lightColor}
                      onChange={e => handleColorChange(e.target.value, 'light')}
                      className="h-8 w-8 cursor-pointer"
                    />
                    <input
                      type="text"
                      value={options.lightColor}
                      onChange={e => handleColorChange(e.target.value, 'light')}
                      className="border-foreground/20 bg-gray text-foreground w-24 border px-2 py-1 text-sm focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="includeMargin"
                  checked={options.includeMargin}
                  onChange={handleMarginToggle}
                  className="h-4 w-4"
                />
                <label htmlFor="includeMargin" className="noto-sans-jp text-foreground text-sm">
                  Include Margin
                </label>
              </div>

              <div>
                <label className="noto-sans-jp text-foreground mb-2 block text-sm font-medium">
                  Add Logo (optional)
                </label>
                <div className="flex flex-wrap items-end gap-3">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleLogoUpload}
                    className="text-foreground/70 text-sm"
                    ref={fileInputRef}
                  />
                  {logoPreview && (
                    <div className="flex items-center space-x-2">
                      <NextImage
                        src={logoPreview}
                        alt="Logo preview"
                        width={40}
                        height={40}
                        className="h-10 w-10 object-contain"
                      />
                      <button
                        onClick={handleRemoveLogo}
                        className="text-foreground/50 text-xs hover:text-red-500"
                      >
                        Remove
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {logoPreview && (
                <div>
                  <label className="noto-sans-jp text-foreground mb-2 block text-sm font-medium">
                    Logo Size: {options.logoSize}%
                  </label>
                  <input
                    type="range"
                    min="10"
                    max="50"
                    step="5"
                    value={options.logoSize}
                    onChange={handleLogoSizeChange}
                    className="w-full"
                  />
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* QR Code Display */}
      <div className="border-foreground/20 border p-6">
        <h3 className="neue-haas-grotesk-display text-foreground mb-4 text-xl">
          Generated QR Code
        </h3>
        <div className="flex flex-col items-center justify-center space-y-4">
          <div
            ref={qrCodeRef}
            className="flex h-64 w-64 items-center justify-center rounded border bg-white"
          >
            {!options.text && (
              <p className="text-foreground/50 text-center text-sm">
                Enter text or URL to generate a QR code
              </p>
            )}
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={downloadQRCode}
              disabled={!options.text}
              className="bg-primary hover:bg-primary/80 flex items-center space-x-2 px-4 py-2 text-white transition-colors disabled:opacity-50"
            >
              <Download size={16} />
              <span>Download PNG</span>
            </button>
            <button
              onClick={copyQRCodeAsImage}
              disabled={!options.text}
              className="border-primary text-primary hover:bg-primary/10 flex items-center space-x-2 border px-4 py-2 transition-colors disabled:opacity-50"
            >
              <Copy size={16} />
              <span>Copy Image</span>
            </button>
            <button
              onClick={copyQRCodeText}
              disabled={!options.text}
              className="border-foreground/20 text-foreground/70 hover:border-primary/50 flex items-center space-x-1 border px-4 py-2 text-sm transition-colors disabled:opacity-50"
            >
              <Copy size={14} />
              <span>Copy Text</span>
            </button>
          </div>
        </div>

        {/* Copy notification */}
        {copySuccess && (
          <div className="bg-primary/10 text-primary mt-4 flex items-center gap-2 rounded-md p-2 text-sm">
            <Check size={16} />
            <span>{copySuccess}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default QRCodeGenerator;
