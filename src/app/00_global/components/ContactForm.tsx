'use client';

import React, { useState, useEffect } from 'react';
import { Send, RefreshCw, Check, AlertCircle } from 'lucide-react';
import AccessibleRecaptcha from './AccessibleRecaptcha';

interface FormData {
  name: string;
  email: string;
  subject: string;
  message: string;
  inquiryType: 'development' | 'design' | 'general';
}

interface FormErrors {
  name?: string;
  email?: string;
  subject?: string;
  message?: string;
  recaptcha?: string;
  general?: string;
}

interface ContactFormProps {
  recaptchaSiteKey?: string;
}

export default function ContactForm({
  recaptchaSiteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY,
}: ContactFormProps) {
  // Form state
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    subject: '',
    message: '',
    inquiryType: 'general',
  });

  // Form validation and submission state
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [recaptchaToken, setRecaptchaToken] = useState<string | null>(null);
  const [securityScore, setSecurityScore] = useState(0);

  // Refs (removed unused recaptchaRef)

  // Update security score when form data changes
  useEffect(() => {
    let score = 0;
    if (formData.name) score += 20;
    if (formData.email) score += 20;
    if (formData.subject) score += 20;
    if (formData.message) score += 20;
    if (recaptchaToken) score += 20;
    setSecurityScore(score);
  }, [formData, recaptchaToken]);

  // Handle form input changes
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    // Clear error for this field when user types
    if (errors[name as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  // Handle reCAPTCHA verification
  const handleRecaptchaChange = (token: string | null) => {
    setRecaptchaToken(token);
    if (errors.recaptcha) {
      setErrors(prev => ({ ...prev, recaptcha: undefined }));
    }
  };

  // Validate form data
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // Name validation
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters long';
    }

    // Email validation
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else {
      const emailRegex = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;
      if (!emailRegex.test(formData.email)) {
        newErrors.email = 'Please enter a valid email address';
      }
    }

    // Subject validation
    if (!formData.subject.trim()) {
      newErrors.subject = 'Subject is required';
    } else if (formData.subject.trim().length < 5) {
      newErrors.subject = 'Subject must be at least 5 characters long';
    }

    // Message validation
    if (!formData.message.trim()) {
      newErrors.message = 'Message is required';
    } else if (formData.message.trim().length < 10) {
      newErrors.message = 'Message must be at least 10 characters long';
    }

    // reCAPTCHA validation
    if (!recaptchaToken) {
      newErrors.recaptcha = 'Please complete the reCAPTCHA verification';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate form
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setErrors({});

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          recaptchaToken,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to submit form. Please try again.');
      }

      // Success
      setSubmitSuccess(true);
      resetForm();
    } catch (error) {
      setErrors({
        general:
          error instanceof Error ? error.message : 'Failed to submit form. Please try again.',
      });
      console.error('Contact form submission error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      subject: '',
      message: '',
      inquiryType: 'general',
    });
    setRecaptchaToken(null);
    // recaptchaRefは使用しないように修正
    setErrors({});
  };

  // Handle clear button click
  const handleClear = () => {
    resetForm();
  };

  // Handle sending another message after success
  const handleSendAnother = () => {
    setSubmitSuccess(false);
  };

  return (
    <div className="mx-auto w-full max-w-2xl">
      {submitSuccess ? (
        <div className="border-primary/30 bg-primary/5 border p-6 text-center">
          <div className="mb-4 flex justify-center">
            <div className="bg-primary/20 rounded-full p-3">
              <Check className="text-primary h-8 w-8" />
            </div>
          </div>
          <h3 className="text-foreground mb-2 text-xl font-medium">Message Sent Successfully!</h3>
          <p className="text-foreground/70 mb-6">
            Thank you for contacting us. We have received your message and will get back to you
            soon.
          </p>
          <button
            onClick={handleSendAnother}
            className="bg-primary hover:bg-primary/90 px-6 py-2 text-white transition-colors"
          >
            Send Another Message
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Security score */}
          <div className="mb-6">
            <div className="mb-1 flex items-center justify-between">
              <span className="text-foreground/70 text-sm">Security Score</span>
              <span className="text-sm font-medium">{securityScore}%</span>
            </div>
            <div className="bg-foreground/10 h-2 w-full">
              <div
                className="bg-primary h-2 transition-all duration-300"
                style={{ width: `${securityScore}%` }}
              />
            </div>
          </div>

          {/* General error message */}
          {errors.general && (
            <div className="flex items-start border border-red-300 bg-red-50 p-3 text-red-700">
              <AlertCircle className="mt-0.5 mr-2 h-5 w-5 flex-shrink-0" />
              <p>{errors.general}</p>
            </div>
          )}

          {/* Name */}
          <div>
            <label htmlFor="name" className="text-foreground mb-1 block text-sm font-medium">
              Full Name <span className="text-red-500">*</span>
            </label>
            <input
              id="name"
              name="name"
              type="text"
              value={formData.name}
              onChange={handleChange}
              className={`w-full border ${errors.name ? 'border-red-500' : 'border-foreground/20'} text-foreground focus:border-primary bg-transparent p-2 focus:outline-none`}
              placeholder="Your name"
            />
            {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name}</p>}
          </div>

          {/* Email */}
          <div>
            <label htmlFor="email" className="text-foreground mb-1 block text-sm font-medium">
              Email Address <span className="text-red-500">*</span>
            </label>
            <input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              className={`w-full border ${errors.email ? 'border-red-500' : 'border-foreground/20'} text-foreground focus:border-primary bg-transparent p-2 focus:outline-none`}
              placeholder="your.email@example.com"
            />
            {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email}</p>}
          </div>

          {/* Inquiry Type */}
          <div>
            <label htmlFor="inquiryType" className="text-foreground mb-1 block text-sm font-medium">
              Inquiry Type <span className="text-red-500">*</span>
            </label>
            <select
              id="inquiryType"
              name="inquiryType"
              value={formData.inquiryType}
              onChange={handleChange}
              className="border-foreground/20 text-foreground focus:border-primary w-full border bg-transparent p-2 focus:outline-none"
            >
              <option value="general">General Inquiry</option>
              <option value="development">Development Work</option>
              <option value="design">Design/Video Work</option>
            </select>
          </div>

          {/* Subject */}
          <div>
            <label htmlFor="subject" className="text-foreground mb-1 block text-sm font-medium">
              Subject <span className="text-red-500">*</span>
            </label>
            <input
              id="subject"
              name="subject"
              type="text"
              value={formData.subject}
              onChange={handleChange}
              className={`w-full border ${errors.subject ? 'border-red-500' : 'border-foreground/20'} text-foreground focus:border-primary bg-transparent p-2 focus:outline-none`}
              placeholder="Subject of your message"
            />
            {errors.subject && <p className="mt-1 text-xs text-red-500">{errors.subject}</p>}
          </div>

          {/* Message */}
          <div>
            <label htmlFor="message" className="text-foreground mb-1 block text-sm font-medium">
              Message <span className="text-red-500">*</span>
            </label>
            <textarea
              id="message"
              name="message"
              value={formData.message}
              onChange={handleChange}
              rows={6}
              className={`w-full border ${errors.message ? 'border-red-500' : 'border-foreground/20'} text-foreground focus:border-primary bg-transparent p-2 focus:outline-none`}
              placeholder="Your message here..."
            />
            {errors.message && <p className="mt-1 text-xs text-red-500">{errors.message}</p>}
          </div>

          {/* reCAPTCHA */}
          <div>
            <div className="mb-2">
              <AccessibleRecaptcha
                siteKey={recaptchaSiteKey}
                onChange={handleRecaptchaChange}
                theme="light"
                onExpired={() => {
                  setRecaptchaToken(null);
                  setErrors(prev => ({
                    ...prev,
                    recaptcha: 'reCAPTCHA verification expired. Please verify again.',
                  }));
                }}
                onError={error => {
                  console.error('reCAPTCHA error:', error);
                  setErrors(prev => ({
                    ...prev,
                    recaptcha: 'Failed to load reCAPTCHA. Please try again later.',
                  }));
                }}
              />
            </div>
            {errors.recaptcha && <p className="mt-1 text-xs text-red-500">{errors.recaptcha}</p>}
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-between pt-2">
            <button
              type="button"
              onClick={handleClear}
              className="border-foreground/20 text-foreground/70 hover:border-primary/50 hover:text-primary border px-4 py-2 transition-colors"
            >
              <RefreshCw className="mr-2 inline-block h-4 w-4" />
              Clear
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-primary hover:bg-primary/90 flex items-center px-6 py-2 text-white transition-colors"
            >
              {isSubmitting ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" />
                  Send Message
                </>
              )}
            </button>
          </div>

          {/* Privacy notice */}
          <div className="text-foreground/50 pt-4 text-center text-xs">
            By submitting this form, you agree to our privacy policy. We&apos;ll never share your
            information with third parties.
          </div>
        </form>
      )}
    </div>
  );
}
