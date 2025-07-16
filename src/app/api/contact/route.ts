// API route for contact form
import { NextRequest } from 'next/server';
import { Resend } from 'resend';
import { validateContactForm } from '@/lib/utils/validation';

interface ContactFormData {
  name: string;
  email: string;
  message: string;
  recaptchaToken?: string;
}

async function sendContactEmail(_formData: ContactFormData, _resend: Resend) {
  // 実装は省略されていますが、パラメータは将来的に使用される予定
  return true;
}

async function verifyRecaptcha(token: string) {
  // ... implementation
  return true;
}

export async function POST(request: NextRequest): Promise<Response> {
  const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;
  if (!resend) {
    return Response.json(
      { success: false, error: 'Resend API key is not configured' },
      { status: 500 }
    );
  }

  try {
    const formData: ContactFormData = await request.json();

    const validationErrors = validateContactForm(formData);
    if (Object.keys(validationErrors).length > 0) {
      throw new Error('Validation failed');
    }

    if (formData.recaptchaToken) {
      const recaptchaValid = await verifyRecaptcha(formData.recaptchaToken);
      if (!recaptchaValid) {
        return Response.json(
          { success: false, error: 'reCAPTCHA verification failed' },
          { status: 400 }
        );
      }
    }

    await sendContactEmail(formData, resend);

    return Response.json({ success: true, message: 'Message sent successfully' });
  } catch (err) {
    return Response.json({ success: false, error: 'Failed to send message' }, { status: 500 });
  }
}

export async function GET(): Promise<Response> {
  // ... implementation
  return Response.json({ message: 'GET method not supported' }, { status: 405 });
}
