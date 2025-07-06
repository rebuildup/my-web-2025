'use client';

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Download, Copy, Palette, Wifi, Mail, User, Link as LinkIcon, QrCode } from 'lucide-react';

type QRDataType = 'text' | 'url' | 'email' | 'phone' | 'sms' | 'wifi' | 'vcard';

interface WiFiConfig {
  ssid: string;
  password: string;
  security: 'WPA' | 'WEP' | 'nopass';
  hidden: boolean;
}

interface VCardConfig {
  firstName: string;
  lastName: string;
  organization: string;
  phone: string;
  email: string;
  website: string;
}

const QrGenerator: React.FC = () => {
  const [dataType, setDataType] = useState<QRDataType>('text');
  const [text, setText] = useState('');
  const [url, setUrl] = useState('https://');
  const [email, setEmail] = useState('');
  const [emailSubject, setEmailSubject] = useState('');
  const [emailBody, setEmailBody] = useState('');
  const [phone, setPhone] = useState('');
  const [smsNumber, setSmsNumber] = useState('');
  const [smsMessage, setSmsMessage] = useState('');
  const [wifi, setWifi] = useState<WiFiConfig>({
    ssid: '',
    password: '',
    security: 'WPA',
    hidden: false
  });
  const [vcard, setVcard] = useState<VCardConfig>({
    firstName: '',
    lastName: '',
    organization: '',
    phone: '',
    email: '',
    website: ''
  });
  
  // QR Code customization
  const [foregroundColor, setForegroundColor] = useState('#000000');
  const [backgroundColor, setBackgroundColor] = useState('#ffffff');
  const [size, setSize] = useState(256);
  const [errorCorrectionLevel, setErrorCorrectionLevel] = useState<'L' | 'M' | 'Q' | 'H'>('M');
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoDataUrl, setLogoDataUrl] = useState<string>('');
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);

  // Simple QR Code generation placeholder (would need actual QR library)
  const generateQRPattern = useCallback((data: string, size: number): ImageData => {
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d')!;
    
    // Simple placeholder pattern generation
    const moduleSize = size / 25; // 25x25 grid
    ctx.fillStyle = backgroundColor;
    ctx.fillRect(0, 0, size, size);
    
    ctx.fillStyle = foregroundColor;
    
    // Generate a pseudo-QR pattern based on data hash
    let hash = 0;
    for (let i = 0; i < data.length; i++) {
      hash = ((hash << 5) - hash + data.charCodeAt(i)) & 0xffffffff;
    }
    
    for (let y = 0; y < 25; y++) {
      for (let x = 0; x < 25; x++) {
        // Create finder patterns (corners)
        if ((x < 7 && y < 7) || (x > 17 && y < 7) || (x < 7 && y > 17)) {
          if ((x === 0 || x === 6 || y === 0 || y === 6) || 
              (x >= 2 && x <= 4 && y >= 2 && y <= 4)) {
            ctx.fillRect(x * moduleSize, y * moduleSize, moduleSize, moduleSize);
          }
        } else {
          // Pseudo-random pattern based on position and data hash
          const seed = (x * 25 + y + hash) % 100;
          if (seed < 45) {
            ctx.fillRect(x * moduleSize, y * moduleSize, moduleSize, moduleSize);
          }
        }
      }
    }
    
    return ctx.getImageData(0, 0, size, size);
  }, [foregroundColor, backgroundColor]);

  const generateQRData = useCallback((): string => {
    switch (dataType) {
      case 'text':
        return text;
      case 'url':
        return url;
      case 'email':
        return `mailto:${email}${emailSubject ? `?subject=${encodeURIComponent(emailSubject)}` : ''}${emailBody ? `${emailSubject ? '&' : '?'}body=${encodeURIComponent(emailBody)}` : ''}`;
      case 'phone':
        return `tel:${phone}`;
      case 'sms':
        return `sms:${smsNumber}${smsMessage ? `?body=${encodeURIComponent(smsMessage)}` : ''}`;
      case 'wifi':
        return `WIFI:T:${wifi.security};S:${wifi.ssid};P:${wifi.password};H:${wifi.hidden ? 'true' : 'false'};;`;
      case 'vcard':
        return `BEGIN:VCARD
VERSION:3.0
N:${vcard.lastName};${vcard.firstName};;;
FN:${vcard.firstName} ${vcard.lastName}
ORG:${vcard.organization}
TEL:${vcard.phone}
EMAIL:${vcard.email}
URL:${vcard.website}
END:VCARD`;
      default:
        return text;
    }
  }, [dataType, text, url, email, emailSubject, emailBody, phone, smsNumber, smsMessage, wifi, vcard]);

  const drawQRCode = useCallback(() => {
    if (!canvasRef.current) return;
    
    const qrData = generateQRData();
    if (!qrData.trim()) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d')!;
    
    canvas.width = size;
    canvas.height = size;
    
    // Generate QR pattern
    const qrImageData = generateQRPattern(qrData, size);
    ctx.putImageData(qrImageData, 0, 0);
    
    // Add logo if present
    if (logoDataUrl) {
      const logoImg = new Image();
      logoImg.onload = () => {
        const logoSize = size * 0.2; // 20% of QR size
        const logoX = (size - logoSize) / 2;
        const logoY = (size - logoSize) / 2;
        
        // White background for logo
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(logoX - 4, logoY - 4, logoSize + 8, logoSize + 8);
        
        // Draw logo
        ctx.drawImage(logoImg, logoX, logoY, logoSize, logoSize);
      };
      logoImg.src = logoDataUrl;
    }
  }, [generateQRData, generateQRPattern, size, logoDataUrl]);

  const handleLogoUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      setLogoFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setLogoDataUrl(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  }, []);

  const downloadQR = useCallback((format: 'png' | 'jpg' | 'svg') => {
    if (!canvasRef.current) return;
    
    const canvas = canvasRef.current;
    
    if (format === 'svg') {
      // Generate SVG (simplified)
      const qrData = generateQRData();
      const moduleSize = size / 25;
      
      let svgContent = `<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">`;
      svgContent += `<rect width="${size}" height="${size}" fill="${backgroundColor}"/>`;
      
      // Add QR modules (simplified)
      let hash = 0;
      for (let i = 0; i < qrData.length; i++) {
        hash = ((hash << 5) - hash + qrData.charCodeAt(i)) & 0xffffffff;
      }
      
      for (let y = 0; y < 25; y++) {
        for (let x = 0; x < 25; x++) {
          const seed = (x * 25 + y + hash) % 100;
          if (seed < 45) {
            svgContent += `<rect x="${x * moduleSize}" y="${y * moduleSize}" width="${moduleSize}" height="${moduleSize}" fill="${foregroundColor}"/>`;
          }
        }
      }
      
      svgContent += '</svg>';
      
      const blob = new Blob([svgContent], { type: 'image/svg+xml' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `qrcode.svg`;
      a.click();
      URL.revokeObjectURL(url);
    } else {
      const dataUrl = canvas.toDataURL(`image/${format}`);
      const a = document.createElement('a');
      a.href = dataUrl;
      a.download = `qrcode.${format}`;
      a.click();
    }
  }, [generateQRData, size, foregroundColor, backgroundColor]);

  const copyToClipboard = useCallback(async () => {
    if (!canvasRef.current) return;
    
    try {
      const canvas = canvasRef.current;
      canvas.toBlob(async (blob) => {
        if (blob) {
          await navigator.clipboard.write([
            new ClipboardItem({ 'image/png': blob })
          ]);
        }
      });
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  }, []);

  // Generate QR code when data changes
  useEffect(() => {
    drawQRCode();
  }, [drawQRCode]);

  const dataTypeOptions = [
    { value: 'text', label: 'Text', icon: <LinkIcon size={16} /> },
    { value: 'url', label: 'URL', icon: <LinkIcon size={16} /> },
    { value: 'email', label: 'Email', icon: <Mail size={16} /> },
    { value: 'phone', label: 'Phone', icon: <LinkIcon size={16} /> },
    { value: 'sms', label: 'SMS', icon: <LinkIcon size={16} /> },
    { value: 'wifi', label: 'WiFi', icon: <Wifi size={16} /> },
    { value: 'vcard', label: 'vCard', icon: <User size={16} /> },
  ];

  const renderDataTypeInputs = () => {
    switch (dataType) {
      case 'text':
        return (
          <div>
            <label className="noto-sans-jp text-foreground mb-2 block text-sm font-medium">
              Text Content
            </label>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Enter any text to generate QR code"
              className="border-foreground/20 bg-gray text-foreground noto-sans-jp h-24 w-full border px-3 py-2 focus:outline-none"
            />
          </div>
        );
      
      case 'url':
        return (
          <div>
            <label className="noto-sans-jp text-foreground mb-2 block text-sm font-medium">
              Website URL
            </label>
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.com"
              className="border-foreground/20 bg-gray text-foreground noto-sans-jp w-full border px-3 py-2 focus:outline-none"
            />
          </div>
        );
      
      case 'email':
        return (
          <div className="space-y-4">
            <div>
              <label className="noto-sans-jp text-foreground mb-2 block text-sm font-medium">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="user@example.com"
                className="border-foreground/20 bg-gray text-foreground noto-sans-jp w-full border px-3 py-2 focus:outline-none"
              />
            </div>
            <div>
              <label className="noto-sans-jp text-foreground mb-2 block text-sm font-medium">
                Subject (Optional)
              </label>
              <input
                type="text"
                value={emailSubject}
                onChange={(e) => setEmailSubject(e.target.value)}
                placeholder="Email subject"
                className="border-foreground/20 bg-gray text-foreground noto-sans-jp w-full border px-3 py-2 focus:outline-none"
              />
            </div>
            <div>
              <label className="noto-sans-jp text-foreground mb-2 block text-sm font-medium">
                Body (Optional)
              </label>
              <textarea
                value={emailBody}
                onChange={(e) => setEmailBody(e.target.value)}
                placeholder="Email body"
                className="border-foreground/20 bg-gray text-foreground noto-sans-jp h-20 w-full border px-3 py-2 focus:outline-none"
              />
            </div>
          </div>
        );
      
      case 'wifi':
        return (
          <div className="space-y-4">
            <div>
              <label className="noto-sans-jp text-foreground mb-2 block text-sm font-medium">
                Network Name (SSID)
              </label>
              <input
                type="text"
                value={wifi.ssid}
                onChange={(e) => setWifi({ ...wifi, ssid: e.target.value })}
                placeholder="WiFi network name"
                className="border-foreground/20 bg-gray text-foreground noto-sans-jp w-full border px-3 py-2 focus:outline-none"
              />
            </div>
            <div>
              <label className="noto-sans-jp text-foreground mb-2 block text-sm font-medium">
                Password
              </label>
              <input
                type="password"
                value={wifi.password}
                onChange={(e) => setWifi({ ...wifi, password: e.target.value })}
                placeholder="WiFi password"
                className="border-foreground/20 bg-gray text-foreground noto-sans-jp w-full border px-3 py-2 focus:outline-none"
              />
            </div>
            <div>
              <label className="noto-sans-jp text-foreground mb-2 block text-sm font-medium">
                Security Type
              </label>
              <select
                value={wifi.security}
                onChange={(e) => setWifi({ ...wifi, security: e.target.value as any })}
                className="border-foreground/20 bg-gray text-foreground noto-sans-jp w-full border px-3 py-2 focus:outline-none"
              >
                <option value="WPA">WPA/WPA2</option>
                <option value="WEP">WEP</option>
                <option value="nopass">No Password</option>
              </select>
            </div>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={wifi.hidden}
                onChange={(e) => setWifi({ ...wifi, hidden: e.target.checked })}
                className="text-primary focus:ring-primary"
              />
              <span className="noto-sans-jp text-foreground text-sm">Hidden Network</span>
            </label>
          </div>
        );
      
      case 'vcard':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="noto-sans-jp text-foreground mb-2 block text-sm font-medium">
                  First Name
                </label>
                <input
                  type="text"
                  value={vcard.firstName}
                  onChange={(e) => setVcard({ ...vcard, firstName: e.target.value })}
                  className="border-foreground/20 bg-gray text-foreground noto-sans-jp w-full border px-3 py-2 focus:outline-none"
                />
              </div>
              <div>
                <label className="noto-sans-jp text-foreground mb-2 block text-sm font-medium">
                  Last Name
                </label>
                <input
                  type="text"
                  value={vcard.lastName}
                  onChange={(e) => setVcard({ ...vcard, lastName: e.target.value })}
                  className="border-foreground/20 bg-gray text-foreground noto-sans-jp w-full border px-3 py-2 focus:outline-none"
                />
              </div>
            </div>
            <div>
              <label className="noto-sans-jp text-foreground mb-2 block text-sm font-medium">
                Organization
              </label>
              <input
                type="text"
                value={vcard.organization}
                onChange={(e) => setVcard({ ...vcard, organization: e.target.value })}
                className="border-foreground/20 bg-gray text-foreground noto-sans-jp w-full border px-3 py-2 focus:outline-none"
              />
            </div>
            <div>
              <label className="noto-sans-jp text-foreground mb-2 block text-sm font-medium">
                Phone
              </label>
              <input
                type="tel"
                value={vcard.phone}
                onChange={(e) => setVcard({ ...vcard, phone: e.target.value })}
                className="border-foreground/20 bg-gray text-foreground noto-sans-jp w-full border px-3 py-2 focus:outline-none"
              />
            </div>
            <div>
              <label className="noto-sans-jp text-foreground mb-2 block text-sm font-medium">
                Email
              </label>
              <input
                type="email"
                value={vcard.email}
                onChange={(e) => setVcard({ ...vcard, email: e.target.value })}
                className="border-foreground/20 bg-gray text-foreground noto-sans-jp w-full border px-3 py-2 focus:outline-none"
              />
            </div>
            <div>
              <label className="noto-sans-jp text-foreground mb-2 block text-sm font-medium">
                Website
              </label>
              <input
                type="url"
                value={vcard.website}
                onChange={(e) => setVcard({ ...vcard, website: e.target.value })}
                className="border-foreground/20 bg-gray text-foreground noto-sans-jp w-full border px-3 py-2 focus:outline-none"
              />
            </div>
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-foreground/20 border p-6">
        <h2 className="neue-haas-grotesk-display text-foreground mb-6 text-2xl">
          <QrCode className="mr-2 inline" size={24} />
          QR Code Generator
        </h2>
        
        {/* Data Type Selection */}
        <div className="mb-6">
          <label className="noto-sans-jp text-foreground mb-3 block text-sm font-medium">
            QR Code Type
          </label>
          <div className="grid grid-cols-2 gap-2 md:grid-cols-4 lg:grid-cols-7">
            {dataTypeOptions.map(option => (
              <button
                key={option.value}
                onClick={() => setDataType(option.value as QRDataType)}
                className={`flex items-center justify-center space-x-1 border px-3 py-2 text-sm transition-colors ${
                  dataType === option.value
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-foreground/20 text-foreground/70 hover:border-primary/50'
                }`}
              >
                {option.icon}
                <span>{option.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Data Input */}
        {renderDataTypeInputs()}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Customization */}
        <div className="border-foreground/20 border p-6">
          <h3 className="neue-haas-grotesk-display text-foreground mb-4 text-xl">
            Customization
          </h3>
          
          <div className="space-y-4">
            {/* Colors */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="noto-sans-jp text-foreground mb-2 block text-sm font-medium">
                  Foreground Color
                </label>
                <div className="flex items-center space-x-2">
                  <input
                    type="color"
                    value={foregroundColor}
                    onChange={(e) => setForegroundColor(e.target.value)}
                    className="border-foreground/20 h-10 w-16 border"
                  />
                  <input
                    type="text"
                    value={foregroundColor}
                    onChange={(e) => setForegroundColor(e.target.value)}
                    className="border-foreground/20 bg-gray text-foreground noto-sans-jp flex-1 border px-3 py-2 focus:outline-none"
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
                    value={backgroundColor}
                    onChange={(e) => setBackgroundColor(e.target.value)}
                    className="border-foreground/20 h-10 w-16 border"
                  />
                  <input
                    type="text"
                    value={backgroundColor}
                    onChange={(e) => setBackgroundColor(e.target.value)}
                    className="border-foreground/20 bg-gray text-foreground noto-sans-jp flex-1 border px-3 py-2 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Size */}
            <div>
              <label className="noto-sans-jp text-foreground mb-2 block text-sm font-medium">
                Size: {size}px
              </label>
              <input
                type="range"
                min="128"
                max="512"
                step="16"
                value={size}
                onChange={(e) => setSize(parseInt(e.target.value))}
                className="w-full"
              />
            </div>

            {/* Error Correction */}
            <div>
              <label className="noto-sans-jp text-foreground mb-2 block text-sm font-medium">
                Error Correction Level
              </label>
              <select
                value={errorCorrectionLevel}
                onChange={(e) => setErrorCorrectionLevel(e.target.value as any)}
                className="border-foreground/20 bg-gray text-foreground noto-sans-jp w-full border px-3 py-2 focus:outline-none"
              >
                <option value="L">Low (7%)</option>
                <option value="M">Medium (15%)</option>
                <option value="Q">Quartile (25%)</option>
                <option value="H">High (30%)</option>
              </select>
            </div>

            {/* Logo Upload */}
            <div>
              <label className="noto-sans-jp text-foreground mb-2 block text-sm font-medium">
                Logo (Optional)
              </label>
              <input
                ref={logoInputRef}
                type="file"
                accept="image/*"
                onChange={handleLogoUpload}
                className="border-foreground/20 bg-gray text-foreground noto-sans-jp w-full border px-3 py-2 focus:outline-none"
              />
              {logoFile && (
                <p className="text-foreground/60 mt-1 text-sm">
                  Logo: {logoFile.name}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* QR Code Preview */}
        <div className="border-foreground/20 border p-6">
          <h3 className="neue-haas-grotesk-display text-foreground mb-4 text-xl">
            Preview & Download
          </h3>
          
          <div className="space-y-4">
            {/* QR Code Display */}
            <div className="flex justify-center">
              <div className="border-foreground/20 border p-4">
                <canvas
                  ref={canvasRef}
                  style={{ maxWidth: '100%', height: 'auto' }}
                />
              </div>
            </div>

            {/* Download Buttons */}
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => downloadQR('png')}
                className="bg-primary hover:bg-primary/80 text-white flex items-center justify-center space-x-2 px-4 py-2 transition-colors"
              >
                <Download size={16} />
                <span>PNG</span>
              </button>
              
              <button
                onClick={() => downloadQR('jpg')}
                className="bg-primary hover:bg-primary/80 text-white flex items-center justify-center space-x-2 px-4 py-2 transition-colors"
              >
                <Download size={16} />
                <span>JPG</span>
              </button>
              
              <button
                onClick={() => downloadQR('svg')}
                className="bg-primary hover:bg-primary/80 text-white flex items-center justify-center space-x-2 px-4 py-2 transition-colors"
              >
                <Download size={16} />
                <span>SVG</span>
              </button>
              
              <button
                onClick={copyToClipboard}
                className="border-primary text-primary hover:bg-primary/10 flex items-center justify-center space-x-2 border px-4 py-2 transition-colors"
              >
                <Copy size={16} />
                <span>Copy</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QrGenerator;
