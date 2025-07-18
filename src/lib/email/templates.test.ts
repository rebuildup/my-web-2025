import { describe, it, expect } from 'vitest';
import {
  EmailTemplateData,
  generateNotificationEmailHtml,
  generateNotificationEmailText,
  generateAutoReplyEmailHtml,
  generateAutoReplyEmailText,
} from './templates';

describe('Email Templates', () => {
  const testData: EmailTemplateData = {
    name: 'Test User',
    email: 'test@example.com',
    subject: 'Test Subject',
    message: 'This is a test message.\nWith multiple lines.',
    inquiryType: 'development',
    timestamp: new Date('2025-01-01T12:00:00Z'),
  };

  describe('Notification Email Templates', () => {
    it('should generate HTML notification email with development inquiry content', () => {
      const html = generateNotificationEmailHtml(testData);

      // Check for common elements
      expect(html).toContain('<h1>New Contact Form Submission</h1>');
      expect(html).toContain('Test User');
      expect(html).toContain('test@example.com');
      expect(html).toContain('Test Subject');

      // Check for development-specific content
      expect(html).toContain('development inquiry');
      expect(html).toContain('development services');

      // Check for message with line breaks converted to <br>
      expect(html).toContain('This is a test message.<br>With multiple lines.');

      // Check for timestamp
      expect(html).toContain('Jan 1, 2025');
    });

    it('should generate HTML notification email with design inquiry content', () => {
      const designData = { ...testData, inquiryType: 'design' as const };
      const html = generateNotificationEmailHtml(designData);

      // Check for design-specific content
      expect(html).toContain('design/video inquiry');
      expect(html).toContain('design/video services');
    });

    it('should generate HTML notification email with general inquiry content', () => {
      const generalData = { ...testData, inquiryType: 'general' as const };
      const html = generateNotificationEmailHtml(generalData);

      // Check for general-specific content
      expect(html).toContain('general inquiry');
      expect(html).toContain('appropriate department');
    });

    it('should generate plain text notification email', () => {
      const text = generateNotificationEmailText(testData);

      // Check for common elements
      expect(text).toContain('NEW CONTACT FORM SUBMISSION');
      expect(text).toContain('Test User');
      expect(text).toContain('test@example.com');
      expect(text).toContain('Test Subject');

      // Check for development-specific content
      expect(text).toContain('development inquiry');

      // Check for message with preserved line breaks
      expect(text).toContain('This is a test message.\nWith multiple lines.');

      // Check for timestamp
      expect(text).toContain('Jan 1, 2025');
    });
  });

  describe('Auto-Reply Email Templates', () => {
    it('should generate HTML auto-reply email with development inquiry content', () => {
      const html = generateAutoReplyEmailHtml(testData);

      // Check for common elements
      expect(html).toContain('<h1>Thank you for contacting samuido</h1>');
      expect(html).toContain('Dear Test User');
      expect(html).toContain('Test Subject');

      // Check for development-specific content
      expect(html).toContain('development inquiry');
      expect(html).toContain('within 1-2 business days');

      // Check for message with line breaks converted to <br>
      expect(html).toContain('This is a test message.<br>With multiple lines.');
    });

    it('should generate HTML auto-reply email with design inquiry content', () => {
      const designData = { ...testData, inquiryType: 'design' as const };
      const html = generateAutoReplyEmailHtml(designData);

      // Check for design-specific content
      expect(html).toContain('design/video inquiry');
      expect(html).toContain('within 1-2 business days');
    });

    it('should generate HTML auto-reply email with general inquiry content', () => {
      const generalData = { ...testData, inquiryType: 'general' as const };
      const html = generateAutoReplyEmailHtml(generalData);

      // Check for general-specific content
      expect(html).toContain('received your inquiry');
      expect(html).toContain('as soon as possible');
    });

    it('should generate plain text auto-reply email', () => {
      const text = generateAutoReplyEmailText(testData);

      // Check for common elements
      expect(text).toContain('THANK YOU FOR CONTACTING SAMUIDO');
      expect(text).toContain('Dear Test User');
      expect(text).toContain('Test Subject');

      // Check for development-specific content
      expect(text).toContain('development inquiry');
      expect(text).toContain('within 1-2 business days');

      // Check for message with preserved line breaks
      expect(text).toContain('This is a test message.\nWith multiple lines.');
    });
  });
});
