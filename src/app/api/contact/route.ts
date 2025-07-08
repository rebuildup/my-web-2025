// API route for contact form
import { NextRequest } from 'next/server';
import { Resend } from 'resend';
import { validateContactForm } from '@/lib/utils/validation';
import { AppErrorHandler } from '@/lib/utils/error-handling';

// Initialize Resend only if API key is available
const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

interface ContactFormData {
  name: string;
  email: string;
  subject?: string;
  content?: string;
  message?: string;
  recaptchaToken?: string;
  [key: string]: string | undefined; // Add index signature
}

async function verifyRecaptcha(token: string): Promise<boolean> {
  if (!process.env.RECAPTCHA_SECRET_KEY) {
    console.warn('reCAPTCHA secret key not configured');
    return true; // Allow submission in development
  }

  try {
    const response = await fetch('https://www.google.com/recaptcha/api/siteverify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        secret: process.env.RECAPTCHA_SECRET_KEY,
        response: token,
      }),
    });

    const data = await response.json();
    return data.success;
  } catch (error) {
    console.error('reCAPTCHA verification failed:', error);
    return false;
  }
}

async function sendContactEmail(formData: ContactFormData): Promise<void> {
  // Normalize field names for backward compatibility
  const subject =
    formData.subject || formData.message || formData.content || 'Contact Form Submission';
  const content = formData.content || formData.message || '';

  if (!process.env.RESEND_API_KEY || !resend) {
    console.log('Email service not configured, logging message instead:');
    console.log({
      name: formData.name,
      email: formData.email,
      subject,
      content,
      timestamp: new Date().toISOString(),
    });
    return; // Skip email sending in development
  }

  const recipientEmail = process.env.CONTACT_EMAIL || 'contact@example.com';
  const fromEmail = process.env.FROM_EMAIL || 'noreply@example.com';

  // Email to site owner
  await resend.emails.send({
    from: fromEmail,
    to: recipientEmail,
    subject: `Contact Form: ${subject}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #0000ff;">New Contact Form Submission</h2>
        
        <div style="background: #f5f5f5; padding: 20px; margin: 20px 0; border-radius: 5px;">
          <p><strong>Name:</strong> ${formData.name}</p>
          <p><strong>Email:</strong> ${formData.email}</p>
          <p><strong>Subject:</strong> ${subject}</p>
        </div>
        
        <div style="background: #ffffff; padding: 20px; border: 1px solid #ddd; border-radius: 5px;">
          <h3>Message:</h3>
          <p style="white-space: pre-line;">${content}</p>
        </div>
        
        <hr style="margin: 30px 0;" />
        <p style="color: #666; font-size: 12px;">
          This email was sent from the contact form on your website.<br>
          Sent at: ${new Date().toLocaleString()}
        </p>
      </div>
    `,
  });

  // Auto-reply to sender
  await resend.emails.send({
    from: fromEmail,
    to: formData.email,
    subject: 'Thank you for contacting us',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #0000ff;">Thank you for your message!</h2>
        
        <p>Hello ${formData.name},</p>
        
        <p>Thank you for reaching out to us. We have received your message and will get back to you as soon as possible.</p>
        
        <div style="background: #f5f5f5; padding: 20px; margin: 20px 0; border-radius: 5px;">
          <h3>Your message:</h3>
          <p><strong>Subject:</strong> ${subject}</p>
          <p style="white-space: pre-line;">${content}</p>
        </div>
        
        <p>We typically respond within 24-48 hours during business days.</p>
        
        <p>Best regards,<br>The Team</p>
        
        <hr style="margin: 30px 0;" />
        <p style="color: #666; font-size: 12px;">
          This is an automated response. Please do not reply to this email.
        </p>
      </div>
    `,
  });
}

export async function POST(request: NextRequest): Promise<Response> {
  try {
    let formData: ContactFormData;

    try {
      formData = await request.json();
    } catch (error) {
      return Response.json(
        {
          success: false,
          error: 'Invalid JSON format',
        },
        { status: 400 }
      );
    }

    // Check for required fields (support both 'message' and 'content' for backward compatibility)
    const requiredFields = ['name', 'email'];
    const missingFields = requiredFields.filter(field => !formData[field]);

    // Check for either 'subject' or 'message'/'content'
    const hasSubject = formData.subject || formData.message || formData.content;
    if (!hasSubject) {
      missingFields.push('subject');
    }

    if (missingFields.length > 0) {
      return Response.json(
        {
          success: false,
          error: 'Missing required fields',
        },
        { status: 400 }
      );
    }

    // Validate form data with normalized fields
    const normalizedFormData = {
      ...formData,
      subject: formData.subject || formData.message || formData.content || '',
      content: formData.content || formData.message || '',
    };

    const validation = validateContactForm(normalizedFormData);
    if (!validation.isValid) {
      const firstError = Object.values(validation.errors)[0]?.[0] || 'Validation failed';
      return Response.json(
        {
          success: false,
          error: firstError,
        },
        { status: 400 }
      );
    }

    // Rate limiting check (simple implementation)
    const clientIP =
      request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';

    // In a production environment, you'd use a proper rate limiting service
    // For now, we'll just log the IP
    console.log(`Contact form submission from IP: ${clientIP}`);

    // Verify reCAPTCHA if token provided
    if (formData.recaptchaToken) {
      const recaptchaValid = await verifyRecaptcha(formData.recaptchaToken);
      if (!recaptchaValid) {
        return Response.json(
          {
            success: false,
            error: 'reCAPTCHA verification failed',
            code: 'RECAPTCHA_FAILED',
          },
          { status: 400 }
        );
      }
    }

    // Send email
    await sendContactEmail(formData);

    return Response.json({
      success: true,
      message: 'Message sent successfully',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    const appError = AppErrorHandler.handleApiError(error);
    AppErrorHandler.logError(appError, 'Contact Form API');

    // Don't expose internal errors to users
    if (appError.code === 'VALIDATION_ERROR') {
      return Response.json(
        {
          success: false,
          error: appError.message,
          code: appError.code,
        },
        { status: 400 }
      );
    }

    return Response.json(
      {
        success: false,
        error: 'Failed to send message. Please try again later.',
        code: 'INTERNAL_ERROR',
      },
      { status: 500 }
    );
  }
}

export async function GET(): Promise<Response> {
  // Return contact form configuration
  return Response.json({
    success: true,
    data: {
      recaptchaEnabled: !!process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY,
      emailServiceEnabled: !!process.env.RESEND_API_KEY,
      fields: [
        {
          name: 'name',
          type: 'text',
          required: true,
          minLength: 2,
          maxLength: 50,
        },
        {
          name: 'email',
          type: 'email',
          required: true,
        },
        {
          name: 'subject',
          type: 'text',
          required: true,
          minLength: 5,
          maxLength: 100,
        },
        {
          name: 'content',
          type: 'textarea',
          required: true,
          minLength: 20,
          maxLength: 2000,
        },
      ],
    },
  });
}
