"use client";

import {
  AlertCircle,
  CheckCircle,
  Loader2,
  Mail,
  RefreshCw,
  Save,
  User,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

interface ContactFormData {
  name: string;
  email: string;
  subject: string;
  message: string;
  type: "technical" | "design";
}

interface FormErrors {
  name?: string;
  email?: string;
  subject?: string;
  message?: string;
  general?: string;
}

interface FormMessages {
  en: {
    [key: string]: string;
  };
  ja: {
    [key: string]: string;
  };
}

interface ContactConfig {
  recaptchaSiteKey: string;
  emailRouting: {
    technical: {
      email: string;
      handle: string;
      description: string;
    };
    design: {
      email: string;
      handle: string;
      description: string;
    };
  };
  validation: {
    nameMinLength: number;
    nameMaxLength: number;
    subjectMinLength: number;
    subjectMaxLength: number;
    messageMinLength: number;
    messageMaxLength: number;
  };
}

export default function ContactPage() {
  const [formData, setFormData] = useState<ContactFormData>({
    name: "",
    email: "",
    subject: "",
    message: "",
    type: "technical",
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<
    "idle" | "success" | "error"
  >("idle");
  const [submitMessage, setSubmitMessage] = useState("");
  const [config, setConfig] = useState<ContactConfig | null>(null);
  const [recaptchaLoaded, setRecaptchaLoaded] = useState(false);
  const [language, setLanguage] = useState<"en" | "ja">("en");
  const [isDirty, setIsDirty] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [showConfirmation, setShowConfirmation] = useState(false);

  // Refs for focus management
  const formRef = useRef<HTMLFormElement>(null);
  const submitButtonRef = useRef<HTMLButtonElement>(null);

  // Multilingual messages - using useMemo to avoid dependency issues
  const messages: FormMessages = useMemo(
    () => ({
      en: {
        nameRequired: "Name is required",
        nameMinLength: "Name must be at least {min} characters",
        nameMaxLength: "Name must be less than {max} characters",
        emailRequired: "Email is required",
        emailInvalid: "Please enter a valid email address",
        subjectRequired: "Subject is required",
        subjectMinLength: "Subject must be at least {min} characters",
        subjectMaxLength: "Subject must be less than {max} characters",
        messageRequired: "Message is required",
        messageMinLength: "Message must be at least {min} characters",
        messageMaxLength: "Message must be less than {max} characters",
        formSaved: "Form data saved locally",
        formRestored: "Form data restored from previous session",
        confirmSubmission: "Are you sure you want to send this message?",
        submissionSuccess: "Your message has been sent successfully!",
        submissionError: "Failed to send message. Please try again.",
        networkError:
          "Network error. Please check your connection and try again.",
        spamDetected: "Message appears to be spam and cannot be sent",
        recaptchaFailed: "reCAPTCHA verification failed. Please try again.",
      },
      ja: {
        nameRequired: "お名前は必須です",
        nameMinLength: "お名前は{min}文字以上で入力してください",
        nameMaxLength: "お名前は{max}文字以内で入力してください",
        emailRequired: "メールアドレスは必須です",
        emailInvalid: "有効なメールアドレスを入力してください",
        subjectRequired: "件名は必須です",
        subjectMinLength: "件名は{min}文字以上で入力してください",
        subjectMaxLength: "件名は{max}文字以内で入力してください",
        messageRequired: "メッセージは必須です",
        messageMinLength: "メッセージは{min}文字以上で入力してください",
        messageMaxLength: "メッセージは{max}文字以内で入力してください",
        formSaved: "フォームデータをローカルに保存しました",
        formRestored: "前回のセッションからフォームデータを復元しました",
        confirmSubmission: "このメッセージを送信してもよろしいですか？",
        submissionSuccess: "メッセージが正常に送信されました！",
        submissionError:
          "メッセージの送信に失敗しました。もう一度お試しください。",
        networkError:
          "ネットワークエラーです。接続を確認してもう一度お試しください。",
        spamDetected: "スパムメッセージと判定されたため送信できません",
        recaptchaFailed:
          "reCAPTCHA認証に失敗しました。もう一度お試しください。",
      },
    }),
    [],
  );

  // Get localized message
  const getMessage = useCallback(
    (key: string, params?: Record<string, string | number>): string => {
      let message = messages[language][key] || messages.en[key] || key;
      if (params) {
        Object.entries(params).forEach(([param, value]) => {
          message = message.replace(`{${param}}`, String(value));
        });
      }
      return message;
    },
    [language, messages],
  );

  // Data persistence functions
  const saveFormData = useCallback(() => {
    try {
      const dataToSave = {
        ...formData,
        timestamp: new Date().toISOString(),
        language,
      };
      localStorage.setItem("contactFormData", JSON.stringify(dataToSave));
      setLastSaved(new Date());
      setIsDirty(false);
    } catch (error) {
      console.error("Failed to save form data:", error);
    }
  }, [formData, language]);

  const loadFormData = useCallback(() => {
    try {
      const saved = localStorage.getItem("contactFormData");
      if (saved) {
        const parsedData = JSON.parse(saved);
        const savedTime = new Date(parsedData.timestamp);
        const now = new Date();
        const hoursDiff =
          (now.getTime() - savedTime.getTime()) / (1000 * 60 * 60);

        // Only restore if saved within last 24 hours
        if (hoursDiff < 24) {
          setFormData({
            name: parsedData.name || "",
            email: parsedData.email || "",
            subject: parsedData.subject || "",
            message: parsedData.message || "",
            type: parsedData.type || "technical",
          });
          setLanguage(parsedData.language || "en");
          setLastSaved(savedTime);
          return true;
        }
      }
    } catch (error) {
      console.error("Failed to load form data:", error);
    }
    return false;
  }, []);

  const clearFormData = useCallback(() => {
    try {
      localStorage.removeItem("contactFormData");
      setLastSaved(null);
      setIsDirty(false);
    } catch (error) {
      console.error("Failed to clear form data:", error);
    }
  }, []);

  // Load contact configuration
  useEffect(() => {
    const loadConfig = async () => {
      try {
        const response = await fetch("/api/contact");
        if (response.ok) {
          const data = await response.json();
          setConfig(data.config);
        }
      } catch (error) {
        console.error("Failed to load contact config:", error);
      }
    };

    loadConfig();
  }, []);

  // Load reCAPTCHA script
  useEffect(() => {
    if (!config?.recaptchaSiteKey) return;

    const script = document.createElement("script");
    script.src = "https://www.google.com/recaptcha/api.js";
    script.async = true;
    script.defer = true;
    script.onload = () => setRecaptchaLoaded(true);
    document.head.appendChild(script);

    return () => {
      document.head.removeChild(script);
    };
  }, [config]);

  // Enhanced validation with Japanese language support
  const validateField = useCallback(
    (name: keyof ContactFormData, value: string): string => {
      if (!config) return "";

      switch (name) {
        case "name":
          if (!value.trim()) return getMessage("nameRequired");
          if (value.length < config.validation.nameMinLength)
            return getMessage("nameMinLength", {
              min: config.validation.nameMinLength,
            });
          if (value.length > config.validation.nameMaxLength)
            return getMessage("nameMaxLength", {
              max: config.validation.nameMaxLength,
            });
          break;

        case "email":
          if (!value.trim()) return getMessage("emailRequired");
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailRegex.test(value)) return getMessage("emailInvalid");
          break;

        case "subject":
          if (!value.trim()) return getMessage("subjectRequired");
          if (value.length < config.validation.subjectMinLength)
            return getMessage("subjectMinLength", {
              min: config.validation.subjectMinLength,
            });
          if (value.length > config.validation.subjectMaxLength)
            return getMessage("subjectMaxLength", {
              max: config.validation.subjectMaxLength,
            });
          break;

        case "message":
          if (!value.trim()) return getMessage("messageRequired");
          if (value.length < config.validation.messageMinLength)
            return getMessage("messageMinLength", {
              min: config.validation.messageMinLength,
            });
          if (value.length > config.validation.messageMaxLength)
            return getMessage("messageMaxLength", {
              max: config.validation.messageMaxLength,
            });
          break;
      }

      return "";
    },
    [config, getMessage],
  );

  const handleInputChange = useCallback(
    (
      e: React.ChangeEvent<
        HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
      >,
    ) => {
      const { name, value } = e.target;
      const fieldName = name as keyof ContactFormData;

      setFormData((prev) => ({ ...prev, [fieldName]: value }));
      setIsDirty(true);

      // Real-time validation
      const error = validateField(fieldName, value);
      setErrors((prev) => ({ ...prev, [fieldName]: error || undefined }));

      // Clear submit status when user starts typing
      if (submitStatus !== "idle") {
        setSubmitStatus("idle");
        setSubmitMessage("");
      }
    },
    [validateField, submitStatus],
  );

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    newErrors.name = validateField("name", formData.name);
    newErrors.email = validateField("email", formData.email);
    newErrors.subject = validateField("subject", formData.subject);
    newErrors.message = validateField("message", formData.message);

    // Remove empty errors
    Object.keys(newErrors).forEach((key) => {
      if (!newErrors[key as keyof FormErrors]) {
        delete newErrors[key as keyof FormErrors];
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      // Focus on first error field
      const firstErrorField = formRef.current?.querySelector(
        '[aria-invalid="true"]',
      ) as HTMLElement;
      if (firstErrorField) {
        firstErrorField.focus();
      }
      return;
    }

    // Show confirmation dialog
    if (!showConfirmation) {
      setShowConfirmation(true);
      return;
    }

    setIsSubmitting(true);
    setErrors({});
    setShowConfirmation(false);

    try {
      let recaptchaToken = "";

      // Get reCAPTCHA token if available
      if (recaptchaLoaded && window.grecaptcha && config?.recaptchaSiteKey) {
        try {
          recaptchaToken = await new Promise<string>((resolve, reject) => {
            window.grecaptcha.ready(() => {
              window.grecaptcha
                .execute(config.recaptchaSiteKey, { action: "contact" })
                .then(resolve)
                .catch(reject);
            });
          });
        } catch (error) {
          console.error("reCAPTCHA failed:", error);
          setSubmitStatus("error");
          setSubmitMessage(getMessage("recaptchaFailed"));
          setIsSubmitting(false);
          return;
        }
      }

      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          recaptchaToken,
        }),
      });

      const result = await response.json();

      if (result.success) {
        setSubmitStatus("success");
        setSubmitMessage(getMessage("submissionSuccess"));
        // Clear form and local storage
        setFormData({
          name: "",
          email: "",
          subject: "",
          message: "",
          type: "technical",
        });
        clearFormData();
        setIsDirty(false);

        // Focus on success message for screen readers
        setTimeout(() => {
          const successMessage = document.querySelector('[role="alert"]');
          if (successMessage) {
            (successMessage as HTMLElement).focus();
          }
        }, 100);
      } else {
        setSubmitStatus("error");
        setSubmitMessage(result.message || getMessage("submissionError"));

        if (result.errors) {
          const newErrors: FormErrors = {};
          result.errors.forEach((error: string) => {
            // Map server errors to localized messages
            if (error.includes("Name") || error.includes("お名前"))
              newErrors.name = error;
            else if (error.includes("Email") || error.includes("メール"))
              newErrors.email = error;
            else if (error.includes("Subject") || error.includes("件名"))
              newErrors.subject = error;
            else if (error.includes("Message") || error.includes("メッセージ"))
              newErrors.message = error;
            else if (error.includes("spam") || error.includes("スパム"))
              newErrors.general = getMessage("spamDetected");
            else newErrors.general = error;
          });
          setErrors(newErrors);
        }
      }
    } catch (error) {
      console.error("Form submission error:", error);
      setSubmitStatus("error");
      setSubmitMessage(getMessage("networkError"));
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = useCallback(() => {
    setFormData({
      name: "",
      email: "",
      subject: "",
      message: "",
      type: "technical",
    });
    setErrors({});
    setSubmitStatus("idle");
    setSubmitMessage("");
    setShowConfirmation(false);
    clearFormData();
    setIsDirty(false);
  }, [clearFormData]);

  // Auto-save functionality
  useEffect(() => {
    if (isDirty) {
      const timeoutId = setTimeout(() => {
        saveFormData();
      }, 2000); // Save after 2 seconds of inactivity

      return () => clearTimeout(timeoutId);
    }
  }, [formData, isDirty, saveFormData]);

  // Load saved data on mount
  useEffect(() => {
    const restored = loadFormData();
    if (restored) {
      // Show restoration message briefly
      const timeoutId = setTimeout(() => {
        setSubmitMessage(getMessage("formRestored"));
        setSubmitStatus("success");
        setTimeout(() => {
          setSubmitStatus("idle");
          setSubmitMessage("");
        }, 3000);
      }, 500);
      return () => clearTimeout(timeoutId);
    }
  }, [loadFormData, getMessage]);

  // Detect language preference
  useEffect(() => {
    const browserLang = navigator.language;
    if (browserLang.startsWith("ja")) {
      setLanguage("ja");
    }
  }, []);

  // Keyboard navigation support
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl/Cmd + S to save draft
      if ((e.ctrlKey || e.metaKey) && e.key === "s") {
        e.preventDefault();
        if (isDirty) {
          saveFormData();
        }
      }

      // Ctrl/Cmd + Enter to submit form
      if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
        e.preventDefault();
        if (submitButtonRef.current && !isSubmitting) {
          submitButtonRef.current.click();
        }
      }

      // Escape to close confirmation dialog
      if (e.key === "Escape" && showConfirmation) {
        setShowConfirmation(false);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isDirty, saveFormData, isSubmitting, showConfirmation]);

  // Focus management for accessibility
  useEffect(() => {
    if (submitStatus === "error" && Object.keys(errors).length > 0) {
      // Focus on first error field after validation
      const firstErrorField = formRef.current?.querySelector(
        '[aria-invalid="true"]',
      ) as HTMLElement;
      if (firstErrorField) {
        firstErrorField.focus();
      }
    }
  }, [errors, submitStatus]);

  if (!config) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span>Loading contact form...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <main id="main-content" role="main" className="py-10" tabIndex={-1}>
        <div className="container-system">
          <div className="flex justify-between items-center mb-8">
            <h1 className="neue-haas-grotesk-display text-4xl text-primary">
              Contact
            </h1>

            {/* Language Toggle */}
            <div className="flex items-center space-x-2">
              <span className="text-sm text-foreground/70">Language:</span>
              <button
                type="button"
                onClick={() => setLanguage(language === "en" ? "ja" : "en")}
                className="px-3 py-1 text-sm border border-foreground/20 hover:border-accent transition-colors focus:outline-none focus:ring-2 focus:ring-accent"
                aria-label={`Switch to ${language === "en" ? "Japanese" : "English"}`}
              >
                {language === "en" ? "日本語" : "English"}
              </button>
            </div>
          </div>

          {/* Form Status Indicators */}
          {lastSaved && (
            <div className="mb-4 flex items-center space-x-2 text-sm text-foreground/60">
              <Save className="h-4 w-4" />
              <span>
                {getMessage("formSaved")} - {lastSaved.toLocaleTimeString()}
              </span>
            </div>
          )}

          {/* Inquiry Type Selection */}
          <div className="mb-8 max-w-2xl">
            <h2 className="text-xl font-medium mb-4">Select Inquiry Type</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() =>
                  setFormData((prev) => ({ ...prev, type: "technical" }))
                }
                className={`p-4 border-2 rounded-lg text-left transition-colors ${
                  formData.type === "technical"
                    ? "border-accent bg-accent/10"
                    : "border-foreground/20 hover:border-accent/50"
                }`}
                aria-pressed={formData.type === "technical"}
              >
                <div className="flex items-center space-x-3">
                  <User className="h-5 w-5" />
                  <div>
                    <div className="font-medium">Technical & Development</div>
                    <div className="text-sm text-foreground/70">
                      {config.emailRouting.technical.description}
                    </div>
                    <div className="text-xs text-foreground/50 mt-1">
                      {config.emailRouting.technical.handle}
                    </div>
                  </div>
                </div>
              </button>

              <button
                type="button"
                onClick={() =>
                  setFormData((prev) => ({ ...prev, type: "design" }))
                }
                className={`p-4 border-2 rounded-lg text-left transition-colors ${
                  formData.type === "design"
                    ? "border-accent bg-accent/10"
                    : "border-foreground/20 hover:border-accent/50"
                }`}
                aria-pressed={formData.type === "design"}
              >
                <div className="flex items-center space-x-3">
                  <Mail className="h-5 w-5" />
                  <div>
                    <div className="font-medium">Video & Design</div>
                    <div className="text-sm text-foreground/70">
                      {config.emailRouting.design.description}
                    </div>
                    <div className="text-xs text-foreground/50 mt-1">
                      {config.emailRouting.design.handle}
                    </div>
                  </div>
                </div>
              </button>
            </div>
          </div>

          {/* Confirmation Dialog */}
          {showConfirmation && (
            <div
              className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
              role="dialog"
              aria-modal="true"
              aria-labelledby="confirm-title"
            >
              <div className="bg-background border border-foreground p-6 max-w-md mx-4">
                <h2 id="confirm-title" className="text-lg font-medium mb-4">
                  {getMessage("confirmSubmission")}
                </h2>
                <div className="space-y-2 mb-6 text-sm text-foreground/70">
                  <p>
                    <strong>Name:</strong> {formData.name}
                  </p>
                  <p>
                    <strong>Email:</strong> {formData.email}
                  </p>
                  <p>
                    <strong>Subject:</strong> {formData.subject}
                  </p>
                  <p>
                    <strong>Type:</strong> {formData.type}
                  </p>
                </div>
                <div className="flex space-x-4">
                  <button
                    type="button"
                    onClick={handleSubmit}
                    className="bg-accent text-background px-4 py-2 border border-accent hover:bg-background hover:text-accent transition-colors focus:outline-none focus:ring-2 focus:ring-accent"
                  >
                    {language === "en" ? "Send" : "送信"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowConfirmation(false)}
                    className="px-4 py-2 border border-foreground text-foreground hover:bg-foreground hover:text-background transition-colors focus:outline-none focus:ring-2 focus:ring-foreground"
                  >
                    {language === "en" ? "Cancel" : "キャンセル"}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Contact Form */}
          <form
            ref={formRef}
            data-testid="contact-form"
            onSubmit={handleSubmit}
            className="space-y-6 max-w-2xl"
            noValidate
          >
            {/* Name Field */}
            <div className="form-field">
              <label htmlFor="name" className="block text-sm font-medium mb-2">
                Name{" "}
                <span className="text-red-500" aria-label="必須項目">
                  *
                </span>
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className={`w-full p-3 border-2 bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent transition-colors min-h-[44px] ${
                  errors.name
                    ? "border-red-500 focus:ring-red-500"
                    : "border-foreground"
                }`}
                required
                aria-describedby={
                  ["name-hint", errors.name ? "name-error" : null]
                    .filter(Boolean)
                    .join(" ") || undefined
                }
                aria-invalid={!!errors.name}
                autoComplete="name"
                placeholder="お名前を入力してください"
              />
              <div id="name-hint" className="text-xs text-foreground/60 mt-1">
                {config.validation.nameMinLength}文字以上
                {config.validation.nameMaxLength}文字以内で入力してください
              </div>
              {errors.name && (
                <div
                  id="name-error"
                  data-testid="name-error"
                  className="error-message"
                  role="alert"
                  aria-live="polite"
                >
                  {errors.name}
                </div>
              )}
            </div>

            {/* Email Field */}
            <div className="form-field">
              <label htmlFor="email" className="block text-sm font-medium mb-2">
                Email{" "}
                <span className="text-red-500" aria-label="必須項目">
                  *
                </span>
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className={`w-full p-3 border-2 bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent transition-colors min-h-[44px] ${
                  errors.email
                    ? "border-red-500 focus:ring-red-500"
                    : "border-foreground"
                }`}
                required
                aria-describedby={
                  ["email-hint", errors.email ? "email-error" : null]
                    .filter(Boolean)
                    .join(" ") || undefined
                }
                aria-invalid={!!errors.email}
                autoComplete="email"
                placeholder="example@email.com"
              />
              <div id="email-hint" className="text-xs text-foreground/60 mt-1">
                返信用のメールアドレスを入力してください
              </div>
              {errors.email && (
                <div
                  id="email-error"
                  data-testid="email-error"
                  className="error-message"
                  role="alert"
                  aria-live="polite"
                >
                  {errors.email}
                </div>
              )}
            </div>

            {/* Subject Field */}
            <div className="form-field">
              <label
                htmlFor="subject"
                className="block text-sm font-medium mb-2"
              >
                Subject{" "}
                <span className="text-red-500" aria-label="必須項目">
                  *
                </span>
              </label>
              <input
                type="text"
                id="subject"
                name="subject"
                value={formData.subject}
                onChange={handleInputChange}
                className={`w-full p-3 border-2 bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent transition-colors min-h-[44px] ${
                  errors.subject
                    ? "border-red-500 focus:ring-red-500"
                    : "border-foreground"
                }`}
                required
                aria-describedby={
                  ["subject-hint", errors.subject ? "subject-error" : null]
                    .filter(Boolean)
                    .join(" ") || undefined
                }
                aria-invalid={!!errors.subject}
                placeholder="お問い合わせの件名を入力してください"
              />
              <div
                id="subject-hint"
                className="text-xs text-foreground/60 mt-1"
              >
                {config.validation.subjectMinLength}文字以上
                {config.validation.subjectMaxLength}文字以内で入力してください
              </div>
              {errors.subject && (
                <div
                  id="subject-error"
                  data-testid="subject-error"
                  className="error-message"
                  role="alert"
                  aria-live="polite"
                >
                  {errors.subject}
                </div>
              )}
            </div>

            {/* Message Field */}
            <div className="form-field">
              <label
                htmlFor="message"
                className="block text-sm font-medium mb-2"
              >
                Message{" "}
                <span className="text-red-500" aria-label="必須項目">
                  *
                </span>
              </label>
              <textarea
                id="message"
                name="message"
                value={formData.message}
                onChange={handleInputChange}
                rows={6}
                className={`w-full p-3 border-2 bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent transition-colors resize-vertical ${
                  errors.message
                    ? "border-red-500 focus:ring-red-500"
                    : "border-foreground"
                }`}
                required
                aria-describedby={
                  [
                    "message-hint",
                    "message-count",
                    errors.message ? "message-error" : null,
                  ]
                    .filter(Boolean)
                    .join(" ") || undefined
                }
                aria-invalid={!!errors.message}
                placeholder="お問い合わせ内容を詳しく入力してください"
              />
              <div
                id="message-hint"
                className="text-xs text-foreground/60 mt-1"
              >
                {config.validation.messageMinLength}文字以上
                {config.validation.messageMaxLength}文字以内で入力してください
              </div>
              <div
                id="message-count"
                className="text-xs text-foreground/50 mt-1"
                aria-live="polite"
              >
                {formData.message.length}/{config.validation.messageMaxLength}{" "}
                文字
              </div>
              {errors.message && (
                <div
                  id="message-error"
                  data-testid="message-error"
                  className="error-message"
                  role="alert"
                  aria-live="polite"
                >
                  {errors.message}
                </div>
              )}
            </div>

            {/* General Error */}
            {errors.general && (
              <div
                className="text-red-500 text-sm p-3 bg-red-50 border border-red-200 rounded"
                role="alert"
              >
                {errors.general}
              </div>
            )}

            {/* Submit Status */}
            {submitStatus !== "idle" && (
              <div
                className={`p-4 rounded-lg flex items-center space-x-2 ${
                  submitStatus === "success"
                    ? "bg-green-50 text-green-800 border border-green-200"
                    : "bg-red-50 text-red-800 border border-red-200"
                }`}
                role="alert"
              >
                {submitStatus === "success" ? (
                  <CheckCircle className="h-5 w-5" />
                ) : (
                  <AlertCircle className="h-5 w-5" />
                )}
                <span>{submitMessage}</span>
              </div>
            )}

            {/* Form Actions */}
            <div className="flex flex-wrap gap-4">
              <button
                ref={submitButtonRef}
                type="submit"
                data-testid="submit-button"
                disabled={isSubmitting}
                className="bg-accent text-background px-6 py-3 border border-accent hover:bg-background hover:text-accent transition-colors focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>
                      {language === "en" ? "Sending..." : "送信中..."}
                    </span>
                  </>
                ) : (
                  <span>
                    {language === "en" ? "Send Message" : "メッセージを送信"}
                  </span>
                )}
              </button>

              {(isDirty || submitStatus === "success") && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-6 py-3 border border-foreground text-foreground hover:bg-foreground hover:text-background transition-colors focus:outline-none focus:ring-2 focus:ring-foreground focus:ring-offset-2 flex items-center space-x-2"
                >
                  <RefreshCw className="h-4 w-4" />
                  <span>
                    {language === "en" ? "Reset Form" : "フォームをリセット"}
                  </span>
                </button>
              )}

              {isDirty && (
                <button
                  type="button"
                  onClick={saveFormData}
                  className="px-4 py-3 border border-foreground/30 text-foreground/70 hover:border-foreground hover:text-foreground transition-colors focus:outline-none focus:ring-2 focus:ring-foreground focus:ring-offset-2 flex items-center space-x-2"
                >
                  <Save className="h-4 w-4" />
                  <span>{language === "en" ? "Save Draft" : "下書き保存"}</span>
                </button>
              )}
            </div>

            {/* reCAPTCHA Notice */}
            <div className="text-xs text-foreground/50">
              This form is protected by reCAPTCHA and the Google{" "}
              <a
                href="https://policies.google.com/privacy"
                className="underline hover:text-foreground"
                target="_blank"
                rel="noopener noreferrer"
              >
                Privacy Policy
              </a>{" "}
              and{" "}
              <a
                href="https://policies.google.com/terms"
                className="underline hover:text-foreground"
                target="_blank"
                rel="noopener noreferrer"
              >
                Terms of Service
              </a>{" "}
              apply.
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}

// Extend Window interface for reCAPTCHA
declare global {
  interface Window {
    grecaptcha: {
      ready: (callback: () => void) => void;
      execute: (
        siteKey: string,
        options: { action: string },
      ) => Promise<string>;
    };
  }
}
