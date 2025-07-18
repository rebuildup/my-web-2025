import { describe, it, expect, vi, beforeEach } from 'vitest';
import { EmailService } from './email-service';
import { EmailTemplateData } from './templates';

// Mock Resend
const mockSend = vi.fn().mockResolvedValue({ data: { id: 'mock-email-id' }, error: null });

vi.mock('resend', () => {
  const MockResend = vi.fn().mockImplementation(() => ({
    emails: {
      send: mockSend,
    },
  }));

  return {
    Resend: MockResend,
  };
});

// Mock console.error to prevent noise in tests
const originalConsoleError = console.error;
beforeEach(() => {
  console.error = vi.fn();
});

afterEach(() => {
  console.error = originalConsoleError;
});

describe('EmailService', () => {
  let emailService: EmailService;
  const mockApiKey = 'mock-api-key';

  const testData: EmailTemplateData = {
    name: 'Test User',
    email: 'test@example.com',
    subject: 'Test Subject',
    message: 'This is a test message.',
    inquiryType: 'development',
  };

  beforeEach(() => {
    vi.resetAllMocks();
    emailService = new EmailService(mockApiKey);
  });

  describe('sendContactNotification', () => {
    it('should send notification email successfully', async () => {
      const result = await emailService.sendContactNotification(testData);

      expect(result.success).toBe(true);
      expect(result.messageId).toBe('mock-email-id');

      // Check that Resend was called with correct parameters
      expect(mockSend).toHaveBeenCalledWith(
        expect.objectContaining({
          from: expect.any(String),
          to: expect.arrayContaining(['rebuild.up.up@gmail.com']), // Development email
          subject: expect.stringContaining('Test Subject'),
          text: expect.any(String),
          html: expect.any(String),
          replyTo: 'test@example.com',
        })
      );
    });

    it('should route design inquiries to the correct email', async () => {
      const designData = { ...testData, inquiryType: 'design' as const };
      await emailService.sendContactNotification(designData);

      // Check that Resend was called with correct parameters
      expect(mockSend).toHaveBeenCalledWith(
        expect.objectContaining({
          to: expect.arrayContaining(['361do.sleep@gmail.com']), // Design email
        })
      );
    });

    it('should route general inquiries to the fallback email', async () => {
      const generalData = { ...testData, inquiryType: 'general' as const };
      await emailService.sendContactNotification(generalData);

      // Check that Resend was called with correct parameters
      expect(mockSend).toHaveBeenCalledWith(
        expect.objectContaining({
          to: expect.arrayContaining(['info@samuido.com']), // General email
        })
      );
    });

    it('should handle email sending errors', async () => {
      // Mock Resend to return an error
      mockSend.mockResolvedValue({
        data: null,
        error: { message: 'Failed to send email' },
      });

      const result = await emailService.sendContactNotification(testData);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Failed to send email');
    });
  });

  describe('sendAutoReply', () => {
    it('should send auto-reply email successfully', async () => {
      const result = await emailService.sendAutoReply(testData);

      expect(result.success).toBe(true);
      expect(result.messageId).toBe('mock-email-id');

      // Check that Resend was called with correct parameters
      expect(mockSend).toHaveBeenCalledWith(
        expect.objectContaining({
          from: expect.any(String),
          to: expect.arrayContaining(['test@example.com']),
          subject: expect.stringContaining('Thank you'),
          text: expect.any(String),
          html: expect.any(String),
        })
      );
    });

    it('should handle email sending errors', async () => {
      // Mock Resend to return an error
      mockSend.mockResolvedValue({
        data: null,
        error: { message: 'Failed to send email' },
      });

      const result = await emailService.sendAutoReply(testData);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Failed to send email');
    });
  });

  describe('processContactForm', () => {
    it('should process contact form successfully', async () => {
      const result = await emailService.processContactForm(testData);

      expect(result.success).toBe(true);
      expect(result.notificationResult?.success).toBe(true);
      expect(result.autoReplyResult?.success).toBe(true);
    });

    it('should handle notification email failure', async () => {
      // Mock sendContactNotification to fail
      vi.spyOn(emailService, 'sendContactNotification').mockResolvedValue({
        success: false,
        error: 'Failed to send notification',
      });

      const result = await emailService.processContactForm(testData);

      // Should still be successful if at least one email is sent
      expect(result.success).toBe(true);
      expect(result.notificationResult?.success).toBe(false);
      expect(result.autoReplyResult?.success).toBe(true);
    });

    it('should handle auto-reply email failure', async () => {
      // Mock sendAutoReply to fail
      vi.spyOn(emailService, 'sendAutoReply').mockResolvedValue({
        success: false,
        error: 'Failed to send auto-reply',
      });

      const result = await emailService.processContactForm(testData);

      // Should still be successful if at least one email is sent
      expect(result.success).toBe(true);
      expect(result.notificationResult?.success).toBe(true);
      expect(result.autoReplyResult?.success).toBe(false);
    });

    it('should handle both emails failing', async () => {
      // Mock both methods to fail
      vi.spyOn(emailService, 'sendContactNotification').mockResolvedValue({
        success: false,
        error: 'Failed to send notification',
      });
      vi.spyOn(emailService, 'sendAutoReply').mockResolvedValue({
        success: false,
        error: 'Failed to send auto-reply',
      });

      const result = await emailService.processContactForm(testData);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Failed to send one or more emails');
    });
  });
});
