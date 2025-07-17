import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { POST, GET } from './route';
import { validateContactForm } from '@/lib/utils/validation';
import { EmailService } from '@/lib/email/email-service';
import { RecaptchaService } from '@/lib/security/recaptcha-service';

// Mock dependencies
vi.mock('@/lib/utils/validation', () => ({
  validateContactForm: vi.fn(),
}));

vi.mock('@/lib/email/email-service', () => {
  return {
    EmailService: vi.fn().mockImplementation(() => ({
      processContactForm: vi.fn().mockResolvedValue({
        success: true,
        notificationResult: { success: true, messageId: 'mock-notification-id' },
        autoReplyResult: { success: true, messageId: 'mock-autoreply-id' },
      }),
    })),
  };
});

vi.mock('@/lib/security/recaptcha-service', () => {
  return {
    RecaptchaService: vi.fn().mockImplementation(() => ({
      verifyToken: vi.fn().mockResolvedValue({
        success: true,
        score: 0.9,
      }),
    })),
  };
});

// Mock fetch for reCAPTCHA verification
global.fetch = vi.fn();

describe('Contact API', () => {
  beforeEach(() => {
    vi.resetAllMocks();

    // Default mock implementations
    (validateContactForm as ReturnType<typeof vi.fn>).mockReturnValue({
      isValid: true,
      errors: {},
    });
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
      json: () => Promise.resolve({ success: true }),
    });

    // Mock environment variables
    vi.stubEnv('RECAPTCHA_SECRET_KEY', 'test-secret-key');
    vi.stubEnv('RESEND_API_KEY', 'test-resend-key');
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  describe('POST', () => {
    it('should process a valid contact form submission', async () => {
      const formData = {
        name: 'Test User',
        email: 'test@example.com',
        subject: 'Test Subject',
        message: 'This is a test message',
        inquiryType: 'development',
        recaptchaToken: 'valid-token',
      };

      const request = new NextRequest('http://localhost/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.message).toContain('sent successfully');
      expect(data.data.name).toBe('Test User');
      expect(data.data.inquiryType).toBe('development');

      // Verify email service was used
      expect(EmailService).toHaveBeenCalledWith('test-resend-key');
      const emailServiceInstance = (EmailService as ReturnType<typeof vi.fn>).mock.results[0].value;
      expect(emailServiceInstance.processContactForm).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'Test User',
          email: 'test@example.com',
          subject: 'Test Subject',
          message: 'This is a test message',
          inquiryType: 'development',
        })
      );
    });

    it('should route emails based on inquiry type', async () => {
      // Mock EmailService to verify routing
      const mockProcessContactForm = vi.fn().mockResolvedValue({ success: true });
      (EmailService as ReturnType<typeof vi.fn>).mockImplementation(() => ({
        processContactForm: mockProcessContactForm,
      }));

      // Test development inquiry
      const devFormData = {
        name: 'Dev User',
        email: 'dev@example.com',
        subject: 'Development Inquiry',
        message: 'Development question',
        inquiryType: 'development',
        recaptchaToken: 'valid-token',
      };

      const devRequest = new NextRequest('http://localhost/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(devFormData),
      });

      await POST(devRequest);

      // Test design inquiry
      const designFormData = {
        name: 'Design User',
        email: 'design@example.com',
        subject: 'Design Inquiry',
        message: 'Design question',
        inquiryType: 'design',
        recaptchaToken: 'valid-token',
      };

      const designRequest = new NextRequest('http://localhost/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(designFormData),
      });

      await POST(designRequest);

      // Verify emails were processed with correct inquiry types
      expect(mockProcessContactForm).toHaveBeenCalledTimes(2);

      // First call should be for development inquiry
      expect(mockProcessContactForm.mock.calls[0][0]).toEqual(
        expect.objectContaining({
          name: 'Dev User',
          email: 'dev@example.com',
          inquiryType: 'development',
        })
      );

      // Second call should be for design inquiry
      expect(mockProcessContactForm.mock.calls[1][0]).toEqual(
        expect.objectContaining({
          name: 'Design User',
          email: 'design@example.com',
          inquiryType: 'design',
        })
      );
    });

    it('should validate form data', async () => {
      (validateContactForm as ReturnType<typeof vi.fn>).mockReturnValue({
        isValid: false,
        errors: { name: ['Name is required'] },
      });

      const formData = {
        email: 'test@example.com',
        subject: 'Test Subject',
        message: 'This is a test message',
        recaptchaToken: 'valid-token',
      };

      const request = new NextRequest('http://localhost/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toContain('validation failed');
      expect(data.validationErrors).toBeDefined();
    });

    it('should require reCAPTCHA token', async () => {
      const formData = {
        name: 'Test User',
        email: 'test@example.com',
        subject: 'Test Subject',
        message: 'This is a test message',
        // No recaptchaToken
      };

      const request = new NextRequest('http://localhost/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toContain('reCAPTCHA verification is required');
    });

    it('should verify reCAPTCHA token', async () => {
      // Mock reCAPTCHA verification failure
      (RecaptchaService as ReturnType<typeof vi.fn>).mockImplementation(() => ({
        verifyToken: vi.fn().mockResolvedValue({
          success: false,
          error: 'Invalid token',
          errorCodes: ['invalid-input-response'],
        }),
      }));

      const formData = {
        name: 'Test User',
        email: 'test@example.com',
        subject: 'Test Subject',
        message: 'This is a test message',
        recaptchaToken: 'invalid-token',
      };

      const request = new NextRequest('http://localhost/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toContain('reCAPTCHA verification failed');
      expect(data.details).toEqual(['invalid-input-response']);

      // Verify RecaptchaService was used
      expect(RecaptchaService).toHaveBeenCalledWith('test-secret-key');
      const recaptchaServiceInstance = (RecaptchaService as ReturnType<typeof vi.fn>).mock
        .results[0].value;
      expect(recaptchaServiceInstance.verifyToken).toHaveBeenCalledWith(
        'invalid-token',
        expect.any(String)
      );
    });

    it('should handle email sending failure', async () => {
      // Mock email service to fail
      (EmailService as ReturnType<typeof vi.fn>).mockImplementation(() => ({
        processContactForm: vi.fn().mockResolvedValue({
          success: false,
          error: 'Failed to send email',
        }),
      }));

      const formData = {
        name: 'Test User',
        email: 'test@example.com',
        subject: 'Test Subject',
        message: 'This is a test message',
        recaptchaToken: 'valid-token',
      };

      const request = new NextRequest('http://localhost/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.success).toBe(false);
      expect(data.error).toContain('Failed to send email');
    });

    it('should handle missing Resend API key', async () => {
      // Remove Resend API key
      vi.stubEnv('RESEND_API_KEY', '');

      const formData = {
        name: 'Test User',
        email: 'test@example.com',
        subject: 'Test Subject',
        message: 'This is a test message',
        recaptchaToken: 'valid-token',
      };

      const request = new NextRequest('http://localhost/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.success).toBe(false);
      expect(data.error).toContain('Email service is not configured');
    });
  });

  describe('GET', () => {
    it('should not allow GET requests', async () => {
      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(405);
      expect(data.success).toBe(false);
      expect(data.error).toContain('Method not allowed');
    });
  });
});
