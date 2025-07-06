'use client';

import Link from "next/link";
import type { Metadata } from "next";
import { useState } from "react";
import { Mail, Phone, MessageCircle, CheckCircle, AlertCircle, Send } from "lucide-react";
import { validateContactForm } from "@/lib/utils/validation";

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    content: '',
    category: '',
    company: '',
    phone: '',
    contactMethod: 'email'
  });
  
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [showConfirmation, setShowConfirmation] = useState(false);

  const categories = [
    { value: 'development', label: '開発依頼' },
    { value: 'video', label: '映像制作依頼' },
    { value: 'plugin', label: 'プラグイン・ツールについて' },
    { value: 'other', label: 'その他' }
  ];

  const contactMethods = [
    { value: 'email', label: 'メール' },
    { value: 'phone', label: '電話' },
    { value: 'either', label: 'どちらでも' }
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear errors for this field when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: [] }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    const validation = validateContactForm(formData);
    
    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }

    // Show confirmation screen
    setShowConfirmation(true);
  };

  const handleConfirmSubmit = async () => {
    setIsSubmitting(true);
    setSubmitStatus('idle');

    try {
      // Add reCAPTCHA token (would be implemented with actual reCAPTCHA)
      const formDataWithToken = {
        ...formData,
        recaptchaToken: 'mock-token' // In real implementation, get from reCAPTCHA
      };

      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formDataWithToken),
      });

      const result = await response.json();

      if (result.success) {
        setSubmitStatus('success');
        setFormData({
          name: '',
          email: '',
          subject: '',
          content: '',
          category: '',
          company: '',
          phone: '',
          contactMethod: 'email'
        });
        setShowConfirmation(false);
      } else {
        setSubmitStatus('error');
        if (result.errors) {
          setErrors(result.errors);
        }
      }
    } catch (error) {
      console.error('Contact form submission error:', error);
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ContactPage",
    "name": "samuido Contact",
    "description": "お問い合わせフォーム",
    "url": "https://yusuke-kim.com/contact",
    "mainEntity": {
      "@type": "ContactPoint",
      "contactType": "customer service",
      "email": "361do.sleep@gmail.com",
      "availableLanguage": "Japanese"
    },
    "author": {
      "@type": "Person",
      "name": "木村友亮",
      "alternateName": "samuido"
    }
  };

  if (showConfirmation) {
    return (
      <div className="min-h-screen bg-gray">
        <nav className="border-b border-foreground/20 p-4">
          <div className="max-w-7xl mx-auto">
            <Link 
              href="/" 
              className="neue-haas-grotesk-display text-2xl text-primary hover:text-primary/80"
            >
              ← Home
            </Link>
          </div>
        </nav>

        <div className="max-w-2xl mx-auto px-4 py-16">
          <div className="text-center mb-8">
            <h1 className="neue-haas-grotesk-display text-4xl text-primary mb-4">
              送信内容の確認
            </h1>
            <p className="noto-sans-jp text-foreground/70">
              以下の内容で送信いたします。よろしければ「送信する」ボタンを押してください。
            </p>
          </div>

          <div className="bg-gray/50 border border-foreground/20 p-6 mb-8">
            <div className="space-y-4">
              <div>
                <div className="text-sm text-foreground/60 mb-1">お名前</div>
                <div className="text-foreground">{formData.name}</div>
              </div>
              
              <div>
                <div className="text-sm text-foreground/60 mb-1">メールアドレス</div>
                <div className="text-foreground">{formData.email}</div>
              </div>
              
              {formData.company && (
                <div>
                  <div className="text-sm text-foreground/60 mb-1">会社名・組織名</div>
                  <div className="text-foreground">{formData.company}</div>
                </div>
              )}
              
              {formData.phone && (
                <div>
                  <div className="text-sm text-foreground/60 mb-1">電話番号</div>
                  <div className="text-foreground">{formData.phone}</div>
                </div>
              )}
              
              <div>
                <div className="text-sm text-foreground/60 mb-1">カテゴリー</div>
                <div className="text-foreground">
                  {categories.find(cat => cat.value === formData.category)?.label || formData.category}
                </div>
              </div>
              
              <div>
                <div className="text-sm text-foreground/60 mb-1">件名</div>
                <div className="text-foreground">{formData.subject}</div>
              </div>
              
              <div>
                <div className="text-sm text-foreground/60 mb-1">お問い合わせ内容</div>
                <div className="text-foreground whitespace-pre-wrap">{formData.content}</div>
              </div>
              
              <div>
                <div className="text-sm text-foreground/60 mb-1">希望連絡方法</div>
                <div className="text-foreground">
                  {contactMethods.find(method => method.value === formData.contactMethod)?.label}
                </div>
              </div>
            </div>
          </div>

          <div className="flex space-x-4">
            <button
              onClick={() => setShowConfirmation(false)}
              className="flex-1 px-6 py-3 border border-foreground/30 text-foreground hover:border-foreground/50 transition-colors"
            >
              戻って修正
            </button>
            
            <button
              onClick={handleConfirmSubmit}
              disabled={isSubmitting}
              className="flex-1 px-6 py-3 bg-primary text-white hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2"
            >
              {isSubmitting ? (
                <div className="loading"></div>
              ) : (
                <>
                  <Send size={20} />
                  <span>送信する</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      
      <div className="min-h-screen bg-gray">
        {/* Navigation */}
        <nav className="border-b border-foreground/20 p-4">
          <div className="max-w-7xl mx-auto">
            <Link 
              href="/" 
              className="neue-haas-grotesk-display text-2xl text-primary hover:text-primary/80"
            >
              ← Home
            </Link>
          </div>
        </nav>

        {/* Hero Header */}
        <header className="text-center py-16 px-4">
          <h1 className="neue-haas-grotesk-display text-6xl md:text-8xl text-primary mb-6">
            Contact
          </h1>
          <div className="max-w-4xl mx-auto">
            <p className="noto-sans-jp text-xl md:text-2xl text-foreground/80 leading-relaxed mb-8">
              Webデザイン・開発のご依頼、プラグイン・ツールについてのご質問、<br />
              その他お問い合わせはこちらから
            </p>
          </div>
          <div className="mt-8 h-1 w-32 bg-primary mx-auto"></div>
        </header>

        {/* Main Content */}
        <main className="max-w-4xl mx-auto px-4 pb-16">
          {/* Status Messages */}
          {submitStatus === 'success' && (
            <div className="mb-8 p-4 border border-green-500 bg-green-500/10 text-green-500 flex items-center space-x-2">
              <CheckCircle size={20} />
              <div>
                <div className="font-medium">送信完了</div>
                <div className="text-sm">お問い合わせを受け付けました。返信までしばらくお待ちください。</div>
              </div>
            </div>
          )}

          {submitStatus === 'error' && (
            <div className="mb-8 p-4 border border-red-500 bg-red-500/10 text-red-500 flex items-center space-x-2">
              <AlertCircle size={20} />
              <div>
                <div className="font-medium">送信エラー</div>
                <div className="text-sm">送信に失敗しました。しばらく時間をおいて再度お試しください。</div>
              </div>
            </div>
          )}

          {/* Contact Information */}
          <section className="mb-12">
            <h2 className="neue-haas-grotesk-display text-2xl text-foreground mb-6">
              連絡先情報
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="flex items-center space-x-3 p-4 border border-foreground/20 bg-gray/50">
                <Mail size={24} className="text-primary" />
                <div>
                  <div className="text-sm text-foreground/60">メール</div>
                  <div className="text-foreground">361do.sleep@gmail.com</div>
                </div>
              </div>
              
              <div className="flex items-center space-x-3 p-4 border border-foreground/20 bg-gray/50">
                <MessageCircle size={24} className="text-primary" />
                <div>
                  <div className="text-sm text-foreground/60">Twitter</div>
                  <div className="text-foreground">@361do_sleep</div>
                </div>
              </div>
              
              <div className="flex items-center space-x-3 p-4 border border-foreground/20 bg-gray/50">
                <Phone size={24} className="text-primary" />
                <div>
                  <div className="text-sm text-foreground/60">応答時間</div>
                  <div className="text-foreground">24-48時間</div>
                </div>
              </div>
            </div>
          </section>

          {/* Contact Form */}
          <section>
            <h2 className="neue-haas-grotesk-display text-2xl text-foreground mb-6">
              お問い合わせフォーム
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Name and Email */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-foreground mb-2">
                    お名前 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-foreground/20 bg-gray text-foreground focus:border-primary focus:outline-none"
                    required
                  />
                  {errors.name && (
                    <div className="mt-1 text-sm text-red-500">
                      {errors.name.join(', ')}
                    </div>
                  )}
                </div>
                
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-foreground mb-2">
                    メールアドレス <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-foreground/20 bg-gray text-foreground focus:border-primary focus:outline-none"
                    required
                  />
                  {errors.email && (
                    <div className="mt-1 text-sm text-red-500">
                      {errors.email.join(', ')}
                    </div>
                  )}
                </div>
              </div>

              {/* Company and Phone */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="company" className="block text-sm font-medium text-foreground mb-2">
                    会社名・組織名
                  </label>
                  <input
                    type="text"
                    id="company"
                    name="company"
                    value={formData.company}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-foreground/20 bg-gray text-foreground focus:border-primary focus:outline-none"
                  />
                </div>
                
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-foreground mb-2">
                    電話番号
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-foreground/20 bg-gray text-foreground focus:border-primary focus:outline-none"
                  />
                </div>
              </div>

              {/* Category and Contact Method */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="category" className="block text-sm font-medium text-foreground mb-2">
                    カテゴリー <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="category"
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-foreground/20 bg-gray text-foreground focus:border-primary focus:outline-none"
                    required
                  >
                    <option value="">選択してください</option>
                    {categories.map((category) => (
                      <option key={category.value} value={category.value}>
                        {category.label}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label htmlFor="contactMethod" className="block text-sm font-medium text-foreground mb-2">
                    希望連絡方法
                  </label>
                  <select
                    id="contactMethod"
                    name="contactMethod"
                    value={formData.contactMethod}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-foreground/20 bg-gray text-foreground focus:border-primary focus:outline-none"
                  >
                    {contactMethods.map((method) => (
                      <option key={method.value} value={method.value}>
                        {method.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Subject */}
              <div>
                <label htmlFor="subject" className="block text-sm font-medium text-foreground mb-2">
                  件名 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-foreground/20 bg-gray text-foreground focus:border-primary focus:outline-none"
                  required
                />
                {errors.subject && (
                  <div className="mt-1 text-sm text-red-500">
                    {errors.subject.join(', ')}
                  </div>
                )}
              </div>

              {/* Content */}
              <div>
                <label htmlFor="content" className="block text-sm font-medium text-foreground mb-2">
                  お問い合わせ内容 <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="content"
                  name="content"
                  value={formData.content}
                  onChange={handleInputChange}
                  rows={8}
                  className="w-full px-4 py-3 border border-foreground/20 bg-gray text-foreground focus:border-primary focus:outline-none resize-vertical"
                  placeholder="お問い合わせ内容をできるだけ詳しくお書きください。"
                  required
                />
                <div className="mt-1 text-sm text-foreground/60">
                  {formData.content.length}/2000文字
                </div>
                {errors.content && (
                  <div className="mt-1 text-sm text-red-500">
                    {errors.content.join(', ')}
                  </div>
                )}
              </div>

              {/* reCAPTCHA Notice */}
              <div className="text-sm text-foreground/60">
                このサイトはreCAPTCHAによって保護されており、Googleの
                <a href="https://policies.google.com/privacy" className="text-primary hover:underline">プライバシーポリシー</a>と
                <a href="https://policies.google.com/terms" className="text-primary hover:underline">利用規約</a>が適用されます。
              </div>

              {/* Submit Button */}
              <div>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full px-6 py-4 bg-primary text-white hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2 text-lg"
                >
                  <MessageCircle size={20} />
                  <span>確認画面へ進む</span>
                </button>
              </div>
            </form>
          </section>
        </main>

        {/* Footer */}
        <footer className="border-t border-foreground/20 py-8 text-center">
          <p className="noto-sans-jp text-foreground/60 text-sm">
            © 2025 samuido (木村友亮). All rights reserved.
          </p>
          <div className="mt-4 flex justify-center space-x-6">
            <Link href="/privacy-policy" className="text-foreground/60 hover:text-primary text-sm">
              Privacy Policy
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