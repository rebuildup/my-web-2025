// API route for contact form
import { NextRequest } from 'next/server';
import { Resend } from 'resend';
import { validateContactForm } from '@/lib/utils/validation';
import { AppErrorHandler } from '@/lib/utils/error-handling';
import { EmailService } from '@/lib/email/email-service';
import { EmailTemplateData } from '@/lib/email/templates';
import { RecaptchaService } from '@/lib/security/recaptcha-service';

interface ContactFormData {
  name: string;
  email: string;
  subject: string;
  message: string;
  inquiryType?: 'development' | 'design' | 'general';
  recaptchaToken?: string;
}

/**
 * Process contact form submission and send emails
 * @param formData Form data to process
 * @param emailService Email service instance
 * @returns Whether the processing was successful
 */
async function processContactForm(
  formData: ContactFormData,
  emailService: EmailService
): Promise<{ success: boolean; error?: string }> {
  try {
    // Prepare email template data
    const emailData: EmailTemplateData = {
      name: formData.name,
      email: formData.email,
      subject: formData.subject,
      message: formData.message,
      inquiryType: formData.inquiryType || 'general',
      timestamp: new Date(),
    };

    // Process contact form (send notification and auto-reply)
    const result = await emailService.processContactForm(emailData);

    if (!result.success) {
      console.error('Failed to process contact form:', result.error);
      return { success: false, error: result.error || 'Failed to send emails' };
    }

    // Log successful email sending
    console.log(`Contact form processed successfully for ${formData.email}`, {
      inquiryType: formData.inquiryType,
      notificationId: result.notificationResult?.messageId,
      autoReplyId: result.autoReplyResult?.messageId,
    });

    return { success: true };
  } catch (error) {
    console.error('Error processing contact form:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error processing contact form',
    };
  }
}

export async function POST(request: NextRequest): Promise<Response> {
  try {
    // Initialize Resend client
    const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;
    if (!resend) {
      return Response.json(
        { success: false, error: 'Email service is not configured' },
        { status: 500 }
      );
    }

    // Parse request body
    const formData: ContactFormData = await request.json();

    // Convert to Record for validation
    const formDataRecord: Record<string, unknown> = {
      name: formData.name,
      email: formData.email,
      subject: formData.subject,
      message: formData.message,
      ...(formData.inquiryType && { inquiryType: formData.inquiryType }),
      ...(formData.recaptchaToken && { recaptchaToken: formData.recaptchaToken }),
    };

    // Validate form data
    const validation = validateContactForm(formDataRecord);
    if (!validation.isValid) {
      return Response.json(
        {
          success: false,
          error: 'Form validation failed',
          validationErrors: validation.errors,
        },
        { status: 400 }
      );
    }

    // Verify reCAPTCHA
    if (!formData.recaptchaToken) {
      return Response.json(
        { success: false, error: 'reCAPTCHA verification is required' },
        { status: 400 }
      );
    }

    // Initialize reCAPTCHA service
    const recaptchaSecretKey = process.env.RECAPTCHA_SECRET_KEY;
    if (!recaptchaSecretKey) {
      console.error('reCAPTCHA secret key is not configured');
      return Response.json(
        { success: false, error: 'reCAPTCHA service is not configured' },
        { status: 500 }
      );
    }

    // Get client IP for additional verification
    const clientIp =
      request.headers.get('x-forwarded-for')?.split(',')[0] ||
      request.headers.get('x-real-ip') ||
      '127.0.0.1';

    // Verify reCAPTCHA token
    const recaptchaService = new RecaptchaService(recaptchaSecretKey);
    const verificationResult = await recaptchaService.verifyToken(
      formData.recaptchaToken,
      clientIp
    );

    if (!verificationResult.success) {
      console.error('reCAPTCHA verification failed:', verificationResult.error || 'Unknown error');
      return Response.json(
        {
          success: false,
          error: 'reCAPTCHA verification failed. Please try again.',
          details: verificationResult.errorCodes || [],
        },
        { status: 400 }
      );
    }

    // Initialize email service and process form
    const emailService = new EmailService(process.env.RESEND_API_KEY!);
    const result = await processContactForm(formData, emailService);

    if (!result.success) {
      return Response.json(
        {
          success: false,
          error: result.error || 'Failed to send email',
        },
        { status: 500 }
      );
    }

    // Return success response
    return Response.json({
      success: true,
      message: 'Message sent successfully',
      data: {
        name: formData.name,
        email: formData.email,
        inquiryType: formData.inquiryType || 'general',
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    const appError = AppErrorHandler.handleApiError(error);
    AppErrorHandler.logError(appError, 'Contact Form API');

    return Response.json(
      {
        success: false,
        error: 'Failed to process contact form submission',
        code: appError.code,
      },
      { status: 500 }
    );
  }
}

export async function GET(): Promise<Response> {
  return Response.json(
    { success: false, error: 'Method not allowed', message: 'Use POST to submit contact form' },
    { status: 405 }
  );
}
