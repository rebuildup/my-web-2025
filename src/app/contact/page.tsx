import React from 'react';
import { Metadata } from 'next';
import ContactForm from '@/app/00_global/components/ContactForm';
import { Mail, Phone, MapPin } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Contact | samuido',
  description: 'Get in touch with samuido for development, design, or general inquiries',
};

export default function ContactPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mb-12 text-center">
        <h1 className="neue-haas-grotesk-display text-foreground mb-2 text-4xl font-bold">
          Contact Us
        </h1>
        <p className="noto-sans-jp text-foreground/70 text-lg">お問い合わせ</p>
      </div>

      <div className="grid grid-cols-1 gap-12 lg:grid-cols-3">
        {/* Contact Information */}
        <div className="space-y-8 lg:col-span-1">
          <div>
            <h2 className="text-foreground mb-4 text-xl font-medium">Contact Information</h2>
            <p className="text-foreground/70 mb-6">
              Have a question or want to work together? Fill out the form and we&apos;ll get back to
              you as soon as possible.
            </p>
          </div>

          <div className="space-y-4">
            <div className="flex items-start">
              <div className="bg-primary/10 mr-4 rounded-none p-3">
                <Mail className="text-primary h-5 w-5" />
              </div>
              <div>
                <h3 className="text-foreground text-sm font-medium">Email</h3>
                <p className="text-foreground/70">info@samuido.com</p>
              </div>
            </div>

            <div className="flex items-start">
              <div className="bg-primary/10 mr-4 rounded-none p-3">
                <Phone className="text-primary h-5 w-5" />
              </div>
              <div>
                <h3 className="text-foreground text-sm font-medium">Phone</h3>
                <p className="text-foreground/70">+81 (0) 123-456-789</p>
              </div>
            </div>

            <div className="flex items-start">
              <div className="bg-primary/10 mr-4 rounded-none p-3">
                <MapPin className="text-primary h-5 w-5" />
              </div>
              <div>
                <h3 className="text-foreground text-sm font-medium">Location</h3>
                <p className="text-foreground/70">Tokyo, Japan</p>
              </div>
            </div>
          </div>

          <div className="border-foreground/10 border-t pt-6">
            <h3 className="text-foreground mb-2 text-sm font-medium">Business Hours</h3>
            <p className="text-foreground/70 text-sm">Monday - Friday: 9:00 AM - 6:00 PM JST</p>
            <p className="text-foreground/70 text-sm">Saturday - Sunday: Closed</p>
          </div>
        </div>

        {/* Contact Form */}
        <div className="lg:col-span-2">
          <div className="border-foreground/10 bg-gray/50 border p-6">
            <h2 className="text-foreground mb-6 text-xl font-medium">Send a Message</h2>
            <ContactForm recaptchaSiteKey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY} />
          </div>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="border-foreground/10 mt-16 border-t pt-8">
        <h2 className="text-foreground mb-6 text-center text-2xl font-medium">
          Frequently Asked Questions
        </h2>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
          <div className="border-foreground/10 border p-6">
            <h3 className="text-foreground mb-2 text-lg font-medium">
              What services do you offer?
            </h3>
            <p className="text-foreground/70">
              We offer a range of services including web development, design, video production, and
              more. Please specify your needs in the contact form for a tailored response.
            </p>
          </div>

          <div className="border-foreground/10 border p-6">
            <h3 className="text-foreground mb-2 text-lg font-medium">
              How quickly will I receive a response?
            </h3>
            <p className="text-foreground/70">
              We aim to respond to all inquiries within 24-48 business hours. For urgent matters,
              please indicate this in your message.
            </p>
          </div>

          <div className="border-foreground/10 border p-6">
            <h3 className="text-foreground mb-2 text-lg font-medium">
              Do you work with international clients?
            </h3>
            <p className="text-foreground/70">
              Yes, we work with clients globally. We communicate in both English and Japanese and
              can accommodate different time zones.
            </p>
          </div>

          <div className="border-foreground/10 border p-6">
            <h3 className="text-foreground mb-2 text-lg font-medium">
              What information should I include in my inquiry?
            </h3>
            <p className="text-foreground/70">
              Please include details about your project, timeline, budget considerations, and any
              specific requirements to help us provide the most accurate response.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
