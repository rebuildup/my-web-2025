'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Mail, Phone, MessageCircle, CheckCircle, AlertCircle, Send } from 'lucide-react';
import { validateContactForm } from '@/lib/utils/validation';
import { GridLayout, GridContainer, GridContent, GridSection } from '@/components/GridSystem';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    content: '',
    category: '',
    company: '',
    phone: '',
    contactMethod: 'email',
  });

  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [showConfirmation, setShowConfirmation] = useState(false);

  const categories = [
    { value: 'development', label: '開発依頼' },
    { value: 'video', label: '映像制作依頼' },
    { value: 'plugin', label: 'プラグイン・ツールについて' },
    { value: 'other', label: 'その他' },
  ];

  const contactMethods = [
    { value: 'email', label: 'メール' },
    { value: 'phone', label: '電話' },
    { value: 'either', label: 'どちらでも' },
  ];

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
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
        recaptchaToken: 'mock-token', // In real implementation, get from reCAPTCHA
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
          contactMethod: 'email',
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
    '@context': 'https://schema.org',
    '@type': 'ContactPage',
    name: 'samuido Contact',
    description: 'お問い合わせフォーム',
    url: 'https://yusuke-kim.com/contact',
    mainEntity: {
      '@type': 'ContactPoint',
      contactType: 'customer service',
      email: '361do.sleep@gmail.com',
      availableLanguage: 'Japanese',
    },
    author: {
      '@type': 'Person',
      name: '木村友亮',
      alternateName: 'samuido',
    },
  };

  if (showConfirmation) {
    return (
      <GridLayout background={false} className="bg-gray">
        <nav className="border-foreground/20 border-b p-4">
          <GridContainer>
            <Link
              href="/"
              className="neue-haas-grotesk-display text-primary hover:text-primary/80 text-2xl"
            >
              ← Home
            </Link>
          </GridContainer>
        </nav>

        <GridSection spacing="lg">
          <div className="mb-8 text-center">
            <h1 className="neue-haas-grotesk-display text-primary mb-4 text-4xl">送信内容の確認</h1>
            <p className="noto-sans-jp text-foreground/70">
              以下の内容で送信いたします。よろしければ「送信する」ボタンを押してください。
            </p>
          </div>

          <div className="bg-gray/50 border-foreground/20 mb-8 border p-6">
            <div className="space-y-4">
              <div>
                <div className="text-foreground/60 mb-1 text-sm">お名前</div>
                <div className="text-foreground">{formData.name}</div>
              </div>

              <div>
                <div className="text-foreground/60 mb-1 text-sm">メールアドレス</div>
                <div className="text-foreground">{formData.email}</div>
              </div>

              {formData.company && (
                <div>
                  <div className="text-foreground/60 mb-1 text-sm">会社名・組織名</div>
                  <div className="text-foreground">{formData.company}</div>
                </div>
              )}

              {formData.phone && (
                <div>
                  <div className="text-foreground/60 mb-1 text-sm">電話番号</div>
                  <div className="text-foreground">{formData.phone}</div>
                </div>
              )}

              <div>
                <div className="text-foreground/60 mb-1 text-sm">カテゴリー</div>
                <div className="text-foreground">
                  {categories.find(cat => cat.value === formData.category)?.label ||
                    formData.category}
                </div>
              </div>

              <div>
                <div className="text-foreground/60 mb-1 text-sm">件名</div>
                <div className="text-foreground">{formData.subject}</div>
              </div>

              <div>
                <div className="text-foreground/60 mb-1 text-sm">お問い合わせ内容</div>
                <div className="text-foreground whitespace-pre-wrap">{formData.content}</div>
              </div>

              <div>
                <div className="text-foreground/60 mb-1 text-sm">希望連絡方法</div>
                <div className="text-foreground">
                  {contactMethods.find(method => method.value === formData.contactMethod)?.label}
                </div>
              </div>
            </div>
          </div>

          <div className="flex space-x-4">
            <button
              onClick={() => setShowConfirmation(false)}
              className="border-foreground/30 text-foreground hover:border-foreground/50 flex-1 border px-6 py-3 transition-colors"
            >
              戻って修正
            </button>

            <button
              onClick={handleConfirmSubmit}
              disabled={isSubmitting}
              className="bg-primary hover:bg-primary/90 flex flex-1 items-center justify-center space-x-2 px-6 py-3 text-white transition-colors disabled:cursor-not-allowed disabled:opacity-50"
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
        </GridSection>
      </GridLayout>
    );
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <GridLayout background={false} className="bg-gray">
        {/* Navigation */}
        <nav className="border-foreground/20 border-b p-4">
          <GridContainer>
            <Link
              href="/"
              className="neue-haas-grotesk-display text-primary hover:text-primary/80 text-2xl"
            >
              ← Home
            </Link>
          </GridContainer>
        </nav>

        {/* Hero Header */}
        <header className="px-4 py-16 text-center">
          <h1 className="neue-haas-grotesk-display text-primary mb-6 text-6xl md:text-8xl">
            Contact
          </h1>
          <GridContainer>
            <p className="noto-sans-jp text-foreground/80 mb-8 text-xl leading-relaxed md:text-2xl">
              Webデザイン・開発のご依頼、プラグイン・ツールについてのご質問、
              <br />
              その他お問い合わせはこちらから
            </p>
          </GridContainer>
          <div className="bg-primary mx-auto mt-8 h-1 w-32"></div>
        </header>

        {/* Main Content */}
        <main className="pb-16">
          <GridContainer>
          {/* Status Messages */}
          {submitStatus === 'success' && (
            <div className="mb-8 flex items-center space-x-2 border border-green-500 bg-green-500/10 p-4 text-green-500">
              <CheckCircle size={20} />
              <div>
                <div className="font-medium">送信完了</div>
                <div className="text-sm">
                  お問い合わせを受け付けました。返信までしばらくお待ちください。
                </div>
              </div>
            </div>
          )}

          {submitStatus === 'error' && (
            <div className="mb-8 flex items-center space-x-2 border border-red-500 bg-red-500/10 p-4 text-red-500">
              <AlertCircle size={20} />
              <div>
                <div className="font-medium">送信エラー</div>
                <div className="text-sm">
                  送信に失敗しました。しばらく時間をおいて再度お試しください。
                </div>
              </div>
            </div>
          )}

          {/* Contact Information */}
          <section className="mb-12">
            <h2 className="neue-haas-grotesk-display text-foreground mb-6 text-2xl">連絡先情報</h2>

            <GridContent cols={{ xs: 1, md: 3, xl: 3, '2xl': 3 }}>
              <div className="border-foreground/20 bg-gray/50 flex items-center space-x-3 border p-4">
                <Mail size={24} className="text-primary" />
                <div>
                  <div className="text-foreground/60 text-sm">メール</div>
                  <div className="text-foreground">361do.sleep@gmail.com</div>
                </div>
              </div>

              <div className="border-foreground/20 bg-gray/50 flex items-center space-x-3 border p-4">
                <MessageCircle size={24} className="text-primary" />
                <div>
                  <div className="text-foreground/60 text-sm">Twitter</div>
                  <div className="text-foreground">@361do_sleep</div>
                </div>
              </div>

              <div className="border-foreground/20 bg-gray/50 flex items-center space-x-3 border p-4">
                <Phone size={24} className="text-primary" />
                <div>
                  <div className="text-foreground/60 text-sm">応答時間</div>
                  <div className="text-foreground">24-48時間</div>
                </div>
              </div>
            </GridContent>
          </section>

          {/* Contact Form */}
          <section>
            <h2 className="neue-haas-grotesk-display text-foreground mb-6 text-2xl">
              お問い合わせフォーム
            </h2>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Name and Email */}
              <GridContent cols={{ xs: 1, md: 2, xl: 2, '2xl': 2 }}>
                <div>
                  <label htmlFor="name" className="text-foreground mb-2 block text-sm font-medium">
                    お名前 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="border-foreground/20 bg-gray text-foreground focus:border-primary w-full border px-4 py-3 focus:outline-none"
                    required
                  />
                  {errors.name && (
                    <div className="mt-1 text-sm text-red-500">{errors.name.join(', ')}</div>
                  )}
                </div>

                <div>
                  <label htmlFor="email" className="text-foreground mb-2 block text-sm font-medium">
                    メールアドレス <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="border-foreground/20 bg-gray text-foreground focus:border-primary w-full border px-4 py-3 focus:outline-none"
                    required
                  />
                  {errors.email && (
                    <div className="mt-1 text-sm text-red-500">{errors.email.join(', ')}</div>
                  )}
                </div>
              </GridContent>

              {/* Company and Phone */}
              <GridContent cols={{ xs: 1, md: 2, xl: 2, '2xl': 2 }}>
                <div>
                  <label
                    htmlFor="company"
                    className="text-foreground mb-2 block text-sm font-medium"
                  >
                    会社名・組織名
                  </label>
                  <input
                    type="text"
                    id="company"
                    name="company"
                    value={formData.company}
                    onChange={handleInputChange}
                    className="border-foreground/20 bg-gray text-foreground focus:border-primary w-full border px-4 py-3 focus:outline-none"
                  />
                </div>

                <div>
                  <label htmlFor="phone" className="text-foreground mb-2 block text-sm font-medium">
                    電話番号
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="border-foreground/20 bg-gray text-foreground focus:border-primary w-full border px-4 py-3 focus:outline-none"
                  />
                </div>
              </GridContent>

              {/* Category and Contact Method */}
              <GridContent cols={{ xs: 1, md: 2, xl: 2, '2xl': 2 }}>
                <div>
                  <label
                    htmlFor="category"
                    className="text-foreground mb-2 block text-sm font-medium"
                  >
                    カテゴリー <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="category"
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    className="border-foreground/20 bg-gray text-foreground focus:border-primary w-full border px-4 py-3 focus:outline-none"
                    required
                  >
                    <option value="">選択してください</option>
                    {categories.map(category => (
                      <option key={category.value} value={category.value}>
                        {category.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="contactMethod"
                    className="text-foreground mb-2 block text-sm font-medium"
                  >
                    希望連絡方法
                  </label>
                  <select
                    id="contactMethod"
                    name="contactMethod"
                    value={formData.contactMethod}
                    onChange={handleInputChange}
                    className="border-foreground/20 bg-gray text-foreground focus:border-primary w-full border px-4 py-3 focus:outline-none"
                  >
                    {contactMethods.map(method => (
                      <option key={method.value} value={method.value}>
                        {method.label}
                      </option>
                    ))}
                  </select>
                </div>
              </GridContent>

              {/* Subject */}
              <div>
                <label htmlFor="subject" className="text-foreground mb-2 block text-sm font-medium">
                  件名 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleInputChange}
                  className="border-foreground/20 bg-gray text-foreground focus:border-primary w-full border px-4 py-3 focus:outline-none"
                  required
                />
                {errors.subject && (
                  <div className="mt-1 text-sm text-red-500">{errors.subject.join(', ')}</div>
                )}
              </div>

              {/* Content */}
              <div>
                <label htmlFor="content" className="text-foreground mb-2 block text-sm font-medium">
                  お問い合わせ内容 <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="content"
                  name="content"
                  value={formData.content}
                  onChange={handleInputChange}
                  rows={8}
                  className="border-foreground/20 bg-gray text-foreground focus:border-primary resize-vertical w-full border px-4 py-3 focus:outline-none"
                  placeholder="お問い合わせ内容をできるだけ詳しくお書きください。"
                  required
                />
                <div className="text-foreground/60 mt-1 text-sm">
                  {formData.content.length}/2000文字
                </div>
                {errors.content && (
                  <div className="mt-1 text-sm text-red-500">{errors.content.join(', ')}</div>
                )}
              </div>

              {/* reCAPTCHA Notice */}
              <div className="text-foreground/60 text-sm">
                このサイトはreCAPTCHAによって保護されており、Googleの
                <a
                  href="https://policies.google.com/privacy"
                  className="text-primary hover:underline"
                >
                  プライバシーポリシー
                </a>
                と
                <a
                  href="https://policies.google.com/terms"
                  className="text-primary hover:underline"
                >
                  利用規約
                </a>
                が適用されます。
              </div>

              {/* Submit Button */}
              <div>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-primary hover:bg-primary/90 flex w-full items-center justify-center space-x-2 px-6 py-4 text-lg text-white transition-colors disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <MessageCircle size={20} />
                  <span>確認画面へ進む</span>
                </button>
              </div>
            </form>
          </section>
          </GridContainer>
        </main>

        {/* Footer */}
        <footer className="border-foreground/20 border-t py-8 text-center">
          <GridContainer>
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
          </GridContainer>
        </footer>
      </GridLayout>
    </>
  );
}
