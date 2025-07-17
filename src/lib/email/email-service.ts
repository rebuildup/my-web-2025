/**
 * Email service for sending emails with routing logic
 */

import { Resend } from 'resend';
import {
  EmailTemplateData,
  generateNotificationEmailHtml,
  generateNotificationEmailText,
  generateAutoReplyEmailHtml,
  generateAutoReplyEmailText,
} from './templates';

// Email addresses for different inquiry types
const EMAIL_ADDRESSES = {
  development: 'rebuild.up.up@gmail.com',
  design: '361do.sleep@gmail.com',
  general: 'info@samuido.com', // Fallback email
};

// Email configuration
const EMAIL_CONFIG = {
  fromNotification: 'Contact Form <contact@samuido.com>',
  fromAutoReply: 'samuido <no-reply@samuido.com>',
  bcc: process.env.NODE_ENV === 'production' ? ['admin@samuido.com'] : [], // BCC admin in production
};

/**
 * Result of sending an email
 */
export interface EmailResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

/**
 * Email service for sending emails with routing logic
 */
export class EmailService {
  private resend: Resend;

  /**
   * Create a new email service
   * @param resendApiKey Resend API key
   */
  constructor(resendApiKey: string) {
    this.resend = new Resend(resendApiKey);
  }

  /**
   * Send a contact form notification email
   * @param data Email template data
   * @returns Email sending result
   */
  async sendContactNotification(data: EmailTemplateData): Promise<EmailResult> {
    try {
      // Determine recipient email based on inquiry type
      const toEmail = EMAIL_ADDRESSES[data.inquiryType] || EMAIL_ADDRESSES.general;

      // Generate email content
      const html = generateNotificationEmailHtml(data);
      const text = generateNotificationEmailText(data);
      const subject = `Contact Form: ${data.subject}`;

      // Send email
      const { data: responseData, error } = await this.resend.emails.send({
        from: EMAIL_CONFIG.fromNotification,
        to: [toEmail],
        subject,
        text,
        html,
        replyTo: data.email,
        bcc: EMAIL_CONFIG.bcc,
      });

      if (error) {
        console.error('Failed to send notification email:', error);
        return { success: false, error: error.message };
      }

      return {
        success: true,
        messageId: responseData?.id,
      };
    } catch (error) {
      console.error('Error sending notification email:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Send an auto-reply email to the user
   * @param data Email template data
   * @returns Email sending result
   */
  async sendAutoReply(data: EmailTemplateData): Promise<EmailResult> {
    try {
      // Generate email content
      const html = generateAutoReplyEmailHtml(data);
      const text = generateAutoReplyEmailText(data);
      const subject = 'Thank you for contacting samuido';

      // Send email
      const { data: responseData, error } = await this.resend.emails.send({
        from: EMAIL_CONFIG.fromAutoReply,
        to: [data.email],
        subject,
        text,
        html,
      });

      if (error) {
        console.error('Failed to send auto-reply email:', error);
        return { success: false, error: error.message };
      }

      return {
        success: true,
        messageId: responseData?.id,
      };
    } catch (error) {
      console.error('Error sending auto-reply email:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Process a contact form submission by sending notification and auto-reply emails
   * @param data Email template data
   * @returns Processing result
   */
  async processContactForm(data: EmailTemplateData): Promise<{
    success: boolean;
    notificationResult?: EmailResult;
    autoReplyResult?: EmailResult;
    error?: string;
  }> {
    try {
      // Add timestamp if not provided
      const emailData = {
        ...data,
        timestamp: data.timestamp || new Date(),
      };

      // Send notification email
      const notificationResult = await this.sendContactNotification(emailData);

      // Send auto-reply email
      const autoReplyResult = await this.sendAutoReply(emailData);

      // Check if both emails were sent successfully
      const success = notificationResult.success || autoReplyResult.success;

      return {
        success,
        notificationResult,
        autoReplyResult,
        error: success ? undefined : 'Failed to send one or more emails',
      };
    } catch (error) {
      console.error('Error processing contact form:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }
}
