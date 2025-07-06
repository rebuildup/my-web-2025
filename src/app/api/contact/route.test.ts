import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST } from './route';
import { NextRequest } from 'next/server';

// Mock the required modules
vi.mock('next/headers', () => ({
  headers: vi.fn(() => ({
    get: vi.fn((key: string) => {
      if (key === 'x-forwarded-for') return '127.0.0.1';
      if (key === 'x-real-ip') return '127.0.0.1';
      return null;
    }),
  })),
}));

vi.mock('@/lib/utils/error-handling', () => ({
  AppErrorHandler: {
    handleApiError: vi.fn((error: Error) => ({
      code: 'APPLICATION_ERROR',
      message: error.message || 'An error occurred',
      details: error.stack || 'No details available',
      timestamp: new Date().toISOString(),
    })),
    logError: vi.fn(),
  },
}));

// Mock console methods
const mockConsole = {
  error: vi.fn(),
  warn: vi.fn(),
  log: vi.fn(),
};

describe('Contact API Route', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    console.error = mockConsole.error;
    console.warn = mockConsole.warn;
    console.log = mockConsole.log;

    // Reset environment variables
    delete process.env.RECAPTCHA_SECRET_KEY;
    delete process.env.RESEND_API_KEY;
    delete process.env.CONTACT_EMAIL;
  });

  it('should handle missing request body', async () => {
    const request = new NextRequest('http://localhost:3000/api/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.success).toBe(false);
    expect(data.error).toBe('Missing required fields');
  });

  it('should handle invalid JSON in request body', async () => {
    const request = new NextRequest('http://localhost:3000/api/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: 'invalid json',
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.success).toBe(false);
    expect(data.error).toBe('Invalid JSON format');
  });

  it('should handle missing required fields', async () => {
    const request = new NextRequest('http://localhost:3000/api/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Test User',
        // missing email and message
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.success).toBe(false);
    expect(data.error).toBe('Missing required fields');
  });

  it('should handle invalid email format', async () => {
    const request = new NextRequest('http://localhost:3000/api/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Test User',
        email: 'invalid-email',
        message: 'Test message',
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.success).toBe(false);
    expect(data.error).toBe('Invalid email format');
  });

  it('should handle missing reCAPTCHA when recaptchaToken is provided', async () => {
    process.env.RECAPTCHA_SECRET_KEY = 'test-secret';

    const request = new NextRequest('http://localhost:3000/api/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Test User',
        email: 'test@example.com',
        message: 'Test message',
        recaptchaToken: 'invalid-token',
      }),
    });

    // Mock fetch to simulate reCAPTCHA failure
    global.fetch = vi.fn().mockResolvedValue({
      json: () => Promise.resolve({ success: false }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.success).toBe(false);
    expect(data.error).toBe('reCAPTCHA verification failed');
  });

  it('should handle reCAPTCHA verification error', async () => {
    process.env.RECAPTCHA_SECRET_KEY = 'test-secret';

    const request = new NextRequest('http://localhost:3000/api/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Test User',
        email: 'test@example.com',
        message: 'Test message',
        recaptchaToken: 'test-token',
      }),
    });

    // Mock fetch to throw error
    global.fetch = vi.fn().mockRejectedValue(new Error('Network error'));

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.success).toBe(false);
    expect(data.error).toBe('reCAPTCHA verification failed');
  });

  it('should log contact form when email service is not configured', async () => {
    const request = new NextRequest('http://localhost:3000/api/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Test User',
        email: 'test@example.com',
        message: 'Test message',
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.message).toBe('Message sent successfully');
    expect(mockConsole.log).toHaveBeenCalledWith(
      'Email service not configured, logging message instead:'
    );
  });

  it('should handle successful form submission without reCAPTCHA', async () => {
    const request = new NextRequest('http://localhost:3000/api/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Test User',
        email: 'test@example.com',
        message: 'Test message',
        subject: 'Test Subject',
        company: 'Test Company',
        phone: '123-456-7890',
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.message).toBe('Message sent successfully');
  });

  it('should warn when reCAPTCHA secret key is not configured', async () => {
    const request = new NextRequest('http://localhost:3000/api/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Test User',
        email: 'test@example.com',
        message: 'Test message',
        recaptchaToken: 'test-token',
      }),
    });

    const response = await POST(request);
    await response.json();

    expect(mockConsole.warn).toHaveBeenCalledWith('reCAPTCHA secret key not configured');
  });

  it('should handle successful reCAPTCHA verification', async () => {
    process.env.RECAPTCHA_SECRET_KEY = 'test-secret';

    const request = new NextRequest('http://localhost:3000/api/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Test User',
        email: 'test@example.com',
        message: 'Test message',
        recaptchaToken: 'valid-token',
      }),
    });

    // Mock fetch to simulate successful reCAPTCHA
    global.fetch = vi.fn().mockResolvedValue({
      json: () => Promise.resolve({ success: true }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.message).toBe('Message sent successfully');
  });
});
