"use client";

import { useState, useEffect } from "react";
import { Loader2, CheckCircle, AlertCircle, Mail, User } from "lucide-react";

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

  // Real-time validation
  const validateField = (
    name: keyof ContactFormData,
    value: string,
  ): string => {
    if (!config) return "";

    switch (name) {
      case "name":
        if (!value.trim()) return "Name is required";
        if (value.length < config.validation.nameMinLength)
          return `Name must be at least ${config.validation.nameMinLength} characters`;
        if (value.length > config.validation.nameMaxLength)
          return `Name must be less than ${config.validation.nameMaxLength} characters`;
        break;

      case "email":
        if (!value.trim()) return "Email is required";
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value))
          return "Please enter a valid email address";
        break;

      case "subject":
        if (!value.trim()) return "Subject is required";
        if (value.length < config.validation.subjectMinLength)
          return `Subject must be at least ${config.validation.subjectMinLength} characters`;
        if (value.length > config.validation.subjectMaxLength)
          return `Subject must be less than ${config.validation.subjectMaxLength} characters`;
        break;

      case "message":
        if (!value.trim()) return "Message is required";
        if (value.length < config.validation.messageMinLength)
          return `Message must be at least ${config.validation.messageMinLength} characters`;
        if (value.length > config.validation.messageMaxLength)
          return `Message must be less than ${config.validation.messageMaxLength} characters`;
        break;
    }

    return "";
  };

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value } = e.target;
    const fieldName = name as keyof ContactFormData;

    setFormData((prev) => ({ ...prev, [fieldName]: value }));

    // Real-time validation
    const error = validateField(fieldName, value);
    setErrors((prev) => ({ ...prev, [fieldName]: error || undefined }));

    // Clear submit status when user starts typing
    if (submitStatus !== "idle") {
      setSubmitStatus("idle");
      setSubmitMessage("");
    }
  };

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
      return;
    }

    setIsSubmitting(true);
    setErrors({});

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
        setSubmitMessage(result.message);
        // Reset form
        setFormData({
          name: "",
          email: "",
          subject: "",
          message: "",
          type: "technical",
        });
      } else {
        setSubmitStatus("error");
        setSubmitMessage(result.message);

        if (result.errors) {
          const newErrors: FormErrors = {};
          result.errors.forEach((error: string) => {
            if (error.includes("Name")) newErrors.name = error;
            else if (error.includes("Email")) newErrors.email = error;
            else if (error.includes("Subject")) newErrors.subject = error;
            else if (error.includes("Message")) newErrors.message = error;
            else newErrors.general = error;
          });
          setErrors(newErrors);
        }
      }
    } catch (error) {
      console.error("Form submission error:", error);
      setSubmitStatus("error");
      setSubmitMessage(
        "Network error. Please check your connection and try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
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
  };

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
      <main id="main-content" role="main" className="py-10">
        <div className="container-system">
          <h1 className="neue-haas-grotesk-display text-4xl text-primary mb-8">
            Contact
          </h1>

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

          {/* Contact Form */}
          <form
            data-testid="contact-form"
            onSubmit={handleSubmit}
            className="space-y-6 max-w-2xl"
            noValidate
          >
            {/* Name Field */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium mb-2">
                Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className={`w-full p-3 border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-accent transition-colors ${
                  errors.name
                    ? "border-red-500 focus:ring-red-500"
                    : "border-foreground"
                }`}
                required
                aria-describedby={errors.name ? "name-error" : undefined}
                aria-invalid={!!errors.name}
              />
              {errors.name && (
                <div
                  id="name-error"
                  data-testid="name-error"
                  className="text-red-500 text-sm mt-1"
                  role="alert"
                >
                  {errors.name}
                </div>
              )}
            </div>

            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-2">
                Email <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className={`w-full p-3 border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-accent transition-colors ${
                  errors.email
                    ? "border-red-500 focus:ring-red-500"
                    : "border-foreground"
                }`}
                required
                aria-describedby={errors.email ? "email-error" : undefined}
                aria-invalid={!!errors.email}
              />
              {errors.email && (
                <div
                  id="email-error"
                  data-testid="email-error"
                  className="text-red-500 text-sm mt-1"
                  role="alert"
                >
                  {errors.email}
                </div>
              )}
            </div>

            {/* Subject Field */}
            <div>
              <label
                htmlFor="subject"
                className="block text-sm font-medium mb-2"
              >
                Subject <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="subject"
                name="subject"
                value={formData.subject}
                onChange={handleInputChange}
                className={`w-full p-3 border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-accent transition-colors ${
                  errors.subject
                    ? "border-red-500 focus:ring-red-500"
                    : "border-foreground"
                }`}
                required
                aria-describedby={errors.subject ? "subject-error" : undefined}
                aria-invalid={!!errors.subject}
              />
              {errors.subject && (
                <div
                  id="subject-error"
                  data-testid="subject-error"
                  className="text-red-500 text-sm mt-1"
                  role="alert"
                >
                  {errors.subject}
                </div>
              )}
            </div>

            {/* Message Field */}
            <div>
              <label
                htmlFor="message"
                className="block text-sm font-medium mb-2"
              >
                Message <span className="text-red-500">*</span>
              </label>
              <textarea
                id="message"
                name="message"
                value={formData.message}
                onChange={handleInputChange}
                rows={6}
                className={`w-full p-3 border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-accent transition-colors resize-vertical ${
                  errors.message
                    ? "border-red-500 focus:ring-red-500"
                    : "border-foreground"
                }`}
                required
                aria-describedby={errors.message ? "message-error" : undefined}
                aria-invalid={!!errors.message}
              />
              {errors.message && (
                <div
                  id="message-error"
                  data-testid="message-error"
                  className="text-red-500 text-sm mt-1"
                  role="alert"
                >
                  {errors.message}
                </div>
              )}
              <div className="text-xs text-foreground/50 mt-1">
                {formData.message.length}/{config.validation.messageMaxLength}{" "}
                characters
              </div>
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
            <div className="flex space-x-4">
              <button
                type="submit"
                data-testid="submit-button"
                disabled={isSubmitting}
                className="bg-accent text-background px-6 py-3 border border-accent hover:bg-background hover:text-accent transition-colors focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Sending...</span>
                  </>
                ) : (
                  <span>Send Message</span>
                )}
              </button>

              {submitStatus === "success" && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-6 py-3 border border-foreground text-foreground hover:bg-foreground hover:text-background transition-colors focus:outline-none focus:ring-2 focus:ring-foreground focus:ring-offset-2"
                >
                  Send Another Message
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
