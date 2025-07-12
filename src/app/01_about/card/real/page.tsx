'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { GridLayout, GridContainer, GridContent, GridSection } from '@/components/GridSystem';
import { Download, QrCode, Mail, ExternalLink, Copy, Check } from 'lucide-react';

export default function RealCardPage() {
  // const [selectedProfile, setSelectedProfile] = useState<'real' | 'handle'>('real');
  const [copied, setCopied] = useState(false);

  const contactInfo = {
    name: '木村友亮',
    title: 'Webデザイナー・開発者',
    email: '361do.sleep@gmail.com',
    twitterDev: '@361do_sleep',
    twitterDesign: '@361do_design',
    website: 'yusuke-kim.com',
    skills: ['React', 'NextJS', 'TypeScript', 'AfterEffects', 'Photoshop'],
  };

  const handleCopyContact = () => {
    const contactText = `${contactInfo.name}\n${contactInfo.title}\n${contactInfo.email}\n${contactInfo.twitterDev} (開発関連)\n${contactInfo.twitterDesign} (映像・デザイン関連)\n${contactInfo.website}`;
    navigator.clipboard.writeText(contactText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadPDF = () => {
    // PDF download functionality would be implemented here
    console.log('Downloading PDF...');
  };

  const handleDownloadPNG = () => {
    // PNG download functionality would be implemented here
    console.log('Downloading PNG...');
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
          <div className="text-foreground/60 text-sm">デジタル名刺</div>
        </GridContainer>
      </nav>

      {/* Header */}
      <GridSection spacing="md">
        <h1 className="neue-haas-grotesk-display text-primary mb-4 text-3xl md:text-4xl">
          デジタル名刺
        </h1>
        <p className="noto-sans-jp text-foreground/80">
          木村友亮のデジタル名刺です。QRコード付きでダウンロード可能です。
        </p>
      </GridSection>

      {/* Main Content */}
      <main>
        <GridContainer className="pb-16">
          <GridContent cols={{ xs: 1, md: 2, xl: 3, '2xl': 3 }} className="gap-8">
            {/* Business Card Display */}
            <div className="lg:col-span-2">
              <div className="border-foreground/20 bg-gray/50 rounded-lg border p-6">
                <h2 className="neue-haas-grotesk-display text-foreground mb-6 text-2xl">
                  名刺プレビュー
                </h2>

                {/* Business Card */}
                <div className="mb-6 flex justify-center">
                  <div className="border-foreground/20 relative h-48 w-80 overflow-hidden rounded-lg border-2 bg-white p-6 shadow-lg">
                    {/* Gradient Background */}
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-purple-500/10"></div>

                    {/* Card Content */}
                    <div className="relative z-10 flex h-full flex-col justify-between">
                      {/* Header */}
                      <div>
                        <h3 className="neue-haas-grotesk-display mb-1 text-2xl font-bold text-gray-800">
                          {contactInfo.name}
                        </h3>
                        <p className="mb-3 text-sm text-gray-600">{contactInfo.title}</p>
                      </div>

                      {/* Skills */}
                      <div className="mb-4">
                        <div className="flex flex-wrap gap-1">
                          {contactInfo.skills.map(skill => (
                            <span
                              key={skill}
                              className="rounded bg-blue-100 px-2 py-1 text-xs text-blue-800"
                            >
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Contact Info */}
                      <div className="space-y-1 text-sm text-gray-700">
                        <div className="flex items-center gap-2">
                          <Mail size={14} className="text-gray-500" />
                          <span>{contactInfo.email}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <ExternalLink size={14} className="text-gray-500" />
                          <span>{contactInfo.twitterDev} (開発関連)</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <ExternalLink size={14} className="text-gray-500" />
                          <span>{contactInfo.twitterDesign} (映像・デザイン関連)</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <ExternalLink size={14} className="text-gray-500" />
                          <span>{contactInfo.website}</span>
                        </div>
                      </div>

                      {/* QR Code Placeholder */}
                      <div className="absolute right-4 bottom-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded bg-gray-200">
                          <QrCode size={20} className="text-gray-500" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap justify-center gap-3">
                  <button
                    onClick={handleCopyContact}
                    className="bg-primary hover:bg-primary/90 flex items-center gap-2 rounded-lg px-4 py-2 text-white transition-colors"
                  >
                    {copied ? <Check size={16} /> : <Copy size={16} />}
                    {copied ? 'コピー完了' : '連絡先をコピー'}
                  </button>
                  <button
                    onClick={handleDownloadPDF}
                    className="bg-foreground/10 hover:bg-foreground/20 text-foreground flex items-center gap-2 rounded-lg px-4 py-2 transition-colors"
                  >
                    <Download size={16} />
                    PDF ダウンロード
                  </button>
                  <button
                    onClick={handleDownloadPNG}
                    className="bg-foreground/10 hover:bg-foreground/20 text-foreground flex items-center gap-2 rounded-lg px-4 py-2 transition-colors"
                  >
                    <Download size={16} />
                    PNG ダウンロード
                  </button>
                </div>
              </div>
            </div>

            {/* QR Code & Info */}
            <div className="space-y-6">
              <h2 className="neue-haas-grotesk-display text-foreground text-2xl">QRコード</h2>

              {/* QR Code */}
              <div className="border-foreground/20 bg-gray/50 rounded-lg border p-6">
                <div className="mb-4 flex justify-center">
                  <div className="border-foreground/20 flex h-32 w-32 items-center justify-center rounded-lg border bg-white">
                    <QrCode size={64} className="text-gray-400" />
                  </div>
                </div>
                <p className="text-foreground/60 text-center text-sm">
                  このQRコードをスキャンすると
                  <br />
                  このページにアクセスできます
                </p>
              </div>

              {/* Contact Details */}
              <div className="border-foreground/20 bg-gray/50 rounded-lg border p-6">
                <h3 className="neue-haas-grotesk-display text-foreground mb-4 text-lg">
                  連絡先詳細
                </h3>
                <div className="space-y-3 text-sm">
                  <div>
                    <p className="text-foreground/60">名前</p>
                    <p className="text-foreground font-medium">{contactInfo.name}</p>
                  </div>
                  <div>
                    <p className="text-foreground/60">職種</p>
                    <p className="text-foreground font-medium">{contactInfo.title}</p>
                  </div>
                  <div>
                    <p className="text-foreground/60">メール</p>
                    <p className="text-foreground font-medium">{contactInfo.email}</p>
                  </div>
                  <div>
                    <p className="text-foreground/60">Twitter (開発)</p>
                    <p className="text-foreground font-medium">{contactInfo.twitterDev}</p>
                  </div>
                  <div>
                    <p className="text-foreground/60">Twitter (映像・デザイン)</p>
                    <p className="text-foreground font-medium">{contactInfo.twitterDesign}</p>
                  </div>
                  <div>
                    <p className="text-foreground/60">ウェブサイト</p>
                    <p className="text-foreground font-medium">{contactInfo.website}</p>
                  </div>
                </div>
              </div>

              {/* Skills */}
              <div className="border-foreground/20 bg-gray/50 rounded-lg border p-6">
                <h3 className="neue-haas-grotesk-display text-foreground mb-4 text-lg">スキル</h3>
                <div className="flex flex-wrap gap-2">
                  {contactInfo.skills.map(skill => (
                    <span
                      key={skill}
                      className="bg-foreground/10 text-foreground/80 rounded px-2 py-1 text-sm"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </GridContent>
        </GridContainer>
      </main>
    </GridLayout>
  );
}
