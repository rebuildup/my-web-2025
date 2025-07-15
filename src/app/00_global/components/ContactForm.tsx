import React, { useState, useRef, useEffect } from 'react';
// 型定義がない場合の暫定対応
// @ts-expect-error: No type definitions for react-google-recaptcha
import ReCAPTCHA from 'react-google-recaptcha';
import { Shield, AlertTriangle, CheckCircle } from 'lucide-react';

interface FormData {
  name: string;
  email: string;
  subject: string;
  message: string;
}

interface FormErrors {
  name?: string;
  email?: string;
  subject?: string;
  message?: string;
  recaptcha?: string;
}

const ContactForm: React.FC = () => {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [recaptchaToken, setRecaptchaToken] = useState<string | null>(null);
  const [securityScore, setSecurityScore] = useState(0);
  const recaptchaRef = useRef<ReCAPTCHA>(null);

  // Simulate security score calculation
  useEffect(() => {
    const calculateSecurityScore = () => {
      let score = 0;
      if (formData.name.length > 2) score += 20;
      if (formData.email.includes('@') && formData.email.includes('.')) score += 20;
      if (formData.subject.length > 5) score += 20;
      if (formData.message.length > 10) score += 20;
      if (recaptchaToken) score += 20;
      setSecurityScore(score);
    };

    calculateSecurityScore();
  }, [formData, recaptchaToken]);

  const validateForm = (): FormErrors => {
    const newErrors: FormErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.subject.trim()) {
      newErrors.subject = 'Subject is required';
    }

    if (!formData.message.trim()) {
      newErrors.message = 'Message is required';
    } else if (formData.message.length < 10) {
      newErrors.message = 'Message must be at least 10 characters long';
    }

    if (!recaptchaToken) {
      newErrors.recaptcha = 'Please complete the reCAPTCHA verification';
    }

    return newErrors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors = validateForm();

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsSubmitting(true);
    setErrors({});

    try {
      // Submit form with reCAPTCHA token
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

      if (response.ok) {
        setSubmitted(true);
        setFormData({ name: '', email: '', subject: '', message: '' });
        setRecaptchaToken(null);
        recaptchaRef.current?.reset();
      } else {
        throw new Error('Failed to submit form');
      }
    } catch (error) {
      console.error('Failed to submit form:', error);
      setErrors({ recaptcha: 'Failed to submit form. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    // Clear error for this field when user starts typing
    if (errors[name as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const handleRecaptchaChange = (token: string | null) => {
    setRecaptchaToken(token);
    if (token && errors.recaptcha) {
      setErrors(prev => ({ ...prev, recaptcha: undefined }));
    }
  };

  const handleRecaptchaError = () => {
    setRecaptchaToken(null);
    setErrors(prev => ({ ...prev, recaptcha: 'reCAPTCHA error. Please try again.' }));
  };

  const handleRecaptchaExpired = () => {
    setRecaptchaToken(null);
    setErrors(prev => ({ ...prev, recaptcha: 'reCAPTCHA expired. Please verify again.' }));
  };

  if (submitted) {
    return (
      <div className="rounded-none bg-gray-800 p-6 text-white">
        <div className="rounded-none border border-green-700 bg-green-900 p-6 text-center">
          <CheckCircle size={48} className="mx-auto mb-4 text-green-400" />
          <h3 className="mb-2 text-xl font-bold text-green-400">Message Sent Successfully!</h3>
          <p className="mb-4 text-green-300">
            Thank you for your message. Your form was securely submitted and we&apos;ll get back to
            you soon.
          </p>
          <div className="mb-4 flex items-center justify-center gap-2 text-sm text-green-300">
            <Shield size={16} />
            <span>Verified with reCAPTCHA</span>
          </div>
          <button
            onClick={() => {
              setSubmitted(false);
              setSecurityScore(0);
            }}
            className="mt-4 rounded-none bg-blue-500 px-4 py-2 text-white transition-colors hover:bg-blue-600"
          >
            Send Another Message
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-none bg-gray-800 p-6 text-white">
      <h2 className="neue-haas-grotesk-display mb-4 text-xl font-bold text-blue-500">
        Contact Form
      </h2>

      {/* Security Score Display */}
      <div className="mb-6 rounded-none border border-gray-600 bg-gray-700 p-4">
        <div className="mb-2 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield size={16} className="text-blue-400" />
            <span className="text-sm font-medium text-gray-300">Security Score</span>
          </div>
          <span
            className={`font-bold ${
              securityScore >= 80
                ? 'text-green-400'
                : securityScore >= 60
                  ? 'text-yellow-400'
                  : 'text-red-400'
            }`}
          >
            {securityScore}%
          </span>
        </div>
        <div className="h-2 w-full rounded-none bg-gray-600">
          <div
            className={`h-full rounded-none transition-all duration-500 ${
              securityScore >= 80
                ? 'bg-green-500'
                : securityScore >= 60
                  ? 'bg-yellow-500'
                  : 'bg-red-500'
            }`}
            style={{ width: `${securityScore}%` }}
          />
        </div>
        <div className="mt-2 flex items-center gap-2">
          {securityScore >= 80 && <CheckCircle size={14} className="text-green-400" />}
          {securityScore < 80 && securityScore >= 60 && (
            <AlertTriangle size={14} className="text-yellow-400" />
          )}
          {securityScore < 60 && <AlertTriangle size={14} className="text-red-400" />}
          <span className="text-xs text-gray-400">
            {securityScore >= 80 && 'High security - Ready to submit'}
            {securityScore < 80 && securityScore >= 60 && 'Medium security - Complete all fields'}
            {securityScore < 60 && 'Low security - Please fill out the form and verify reCAPTCHA'}
          </span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div>
            <label htmlFor="name" className="mb-2 block text-sm font-medium text-gray-300">
              Full Name *
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className={`w-full rounded-none border bg-gray-700 px-3 py-2 text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none ${
                errors.name ? 'border-red-500' : 'border-gray-600'
              }`}
              placeholder="Enter your full name"
            />
            {errors.name && <p className="mt-1 text-sm text-red-400">{errors.name}</p>}
          </div>

          <div>
            <label htmlFor="email" className="mb-2 block text-sm font-medium text-gray-300">
              Email Address *
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className={`w-full rounded-none border bg-gray-700 px-3 py-2 text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none ${
                errors.email ? 'border-red-500' : 'border-gray-600'
              }`}
              placeholder="Enter your email address"
            />
            {errors.email && <p className="mt-1 text-sm text-red-400">{errors.email}</p>}
          </div>
        </div>

        <div>
          <label htmlFor="subject" className="mb-2 block text-sm font-medium text-gray-300">
            Subject *
          </label>
          <input
            type="text"
            id="subject"
            name="subject"
            value={formData.subject}
            onChange={handleChange}
            className={`w-full rounded-none border bg-gray-700 px-3 py-2 text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none ${
              errors.subject ? 'border-red-500' : 'border-gray-600'
            }`}
            placeholder="Enter the subject of your message"
          />
          {errors.subject && <p className="mt-1 text-sm text-red-400">{errors.subject}</p>}
        </div>

        <div>
          <label htmlFor="message" className="mb-2 block text-sm font-medium text-gray-300">
            Message *
          </label>
          <textarea
            id="message"
            name="message"
            value={formData.message}
            onChange={handleChange}
            rows={6}
            className={`w-full resize-none rounded-none border bg-gray-700 px-3 py-2 text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none ${
              errors.message ? 'border-red-500' : 'border-gray-600'
            }`}
            placeholder="Enter your message here..."
          />
          {errors.message && <p className="mt-1 text-sm text-red-400">{errors.message}</p>}
        </div>

        {/* reCAPTCHA */}
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-300">
            Security Verification *
          </label>
          <div className="flex flex-col items-start gap-2">
            <ReCAPTCHA
              ref={recaptchaRef}
              sitekey={
                process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY ||
                '6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI'
              }
              onChange={handleRecaptchaChange}
              onError={handleRecaptchaError}
              onExpired={handleRecaptchaExpired}
              theme="dark"
              size="normal"
              data-testid="recaptcha"
            />
            {errors.recaptcha && <p className="text-sm text-red-400">{errors.recaptcha}</p>}
          </div>
          <div className="mt-2 flex items-center gap-2 text-xs text-gray-400">
            <Shield size={12} />
            <span>
              This form is protected by reCAPTCHA and subject to Google&apos;s Privacy Policy and
              Terms of Service.
            </span>
          </div>
        </div>

        <div className="flex gap-4">
          <button
            type="submit"
            disabled={isSubmitting}
            className={`rounded-none px-6 py-2 font-medium transition-colors ${
              isSubmitting
                ? 'cursor-not-allowed bg-gray-600 text-gray-400'
                : 'bg-blue-500 text-white hover:bg-blue-600'
            }`}
          >
            {isSubmitting ? 'Sending...' : 'Send Message'}
          </button>
          <button
            type="button"
            onClick={() => {
              setFormData({ name: '', email: '', subject: '', message: '' });
              setErrors({});
              setRecaptchaToken(null);
              recaptchaRef.current?.reset();
            }}
            className="rounded-none bg-gray-600 px-6 py-2 font-medium text-white transition-colors hover:bg-gray-700"
          >
            Clear
          </button>
        </div>
      </form>
    </div>
  );
};

export default ContactForm;
