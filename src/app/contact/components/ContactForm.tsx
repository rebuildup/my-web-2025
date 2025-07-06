import React, { useState } from 'react';

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
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      setSubmitted(true);
      setFormData({ name: '', email: '', subject: '', message: '' });
    } catch (error) {
      console.error('Failed to submit form:', error);
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

  if (submitted) {
    return (
      <div className="rounded-none bg-gray-800 p-6 text-white">
        <div className="rounded-none border border-green-700 bg-green-900 p-6 text-center">
          <h3 className="mb-2 text-xl font-bold text-green-400">Thank You!</h3>
          <p className="text-green-300">
            Your message has been sent successfully. We&apos;ll get back to you soon.
          </p>
          <button
            onClick={() => setSubmitted(false)}
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
