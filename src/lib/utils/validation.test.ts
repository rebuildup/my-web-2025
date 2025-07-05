// Tests for validation utilities
import { describe, it, expect } from 'vitest';
import { validators, validateField, validateForm, validateContactForm } from './validation';

describe('validators', () => {
  describe('email', () => {
    it('should validate correct email addresses', () => {
      expect(validators.email('test@example.com')).toBe(true);
      expect(validators.email('user.name@domain.co.jp')).toBe(true);
      expect(validators.email('test+tag@example.org')).toBe(true);
      expect(validators.email('user_name@example-domain.com')).toBe(true);
    });

    it('should reject invalid email addresses', () => {
      expect(validators.email('invalid-email')).toBe(false);
      expect(validators.email('test@')).toBe(false);
      expect(validators.email('@example.com')).toBe(false);
      expect(validators.email('test..email@example.com')).toBe(false);
      expect(validators.email('')).toBe(false);
    });
  });

  describe('required', () => {
    it('should validate required fields', () => {
      expect(validators.required('test')).toBe(true);
      expect(validators.required(0)).toBe(true);
      expect(validators.required(false)).toBe(true);
      expect(validators.required([])).toBe(true);
      expect(validators.required({})).toBe(true);
    });

    it('should reject empty values', () => {
      expect(validators.required('')).toBe(false);
      expect(validators.required(null)).toBe(false);
      expect(validators.required(undefined)).toBe(false);
    });
  });

  describe('minLength', () => {
    it('should validate minimum length', () => {
      expect(validators.minLength('test', 3)).toBe(true);
      expect(validators.minLength('test', 4)).toBe(true);
      expect(validators.minLength('hello world', 5)).toBe(true);
    });

    it('should reject strings shorter than minimum', () => {
      expect(validators.minLength('te', 3)).toBe(false);
      expect(validators.minLength('', 1)).toBe(false);
      expect(validators.minLength('a', 5)).toBe(false);
    });
  });

  describe('maxLength', () => {
    it('should validate maximum length', () => {
      expect(validators.maxLength('test', 5)).toBe(true);
      expect(validators.maxLength('test', 4)).toBe(true);
      expect(validators.maxLength('hi', 10)).toBe(true);
    });

    it('should reject strings longer than maximum', () => {
      expect(validators.maxLength('testing', 5)).toBe(false);
      expect(validators.maxLength('hello world', 5)).toBe(false);
    });
  });

  describe('url', () => {
    it('should validate correct URLs', () => {
      expect(validators.url('https://example.com')).toBe(true);
      expect(validators.url('http://example.com')).toBe(true);
      expect(validators.url('https://subdomain.example.com/path')).toBe(true);
      expect(validators.url('https://example.com:8080')).toBe(true);
    });

    it('should reject invalid URLs', () => {
      expect(validators.url('not-a-url')).toBe(false);
      expect(validators.url('example.com')).toBe(false);
      expect(validators.url('')).toBe(false);
      expect(validators.url('ftp://example.com')).toBe(true); // Valid URL, just not HTTP(S)
    });
  });

  describe('fileType', () => {
    it('should validate correct file types', () => {
      const pngFile = new File([''], 'test.png', { type: 'image/png' });
      const jpgFile = new File([''], 'test.jpg', { type: 'image/jpeg' });
      
      expect(validators.fileType(pngFile, ['image/png', 'image/jpeg'])).toBe(true);
      expect(validators.fileType(jpgFile, ['image/png', 'image/jpeg'])).toBe(true);
    });

    it('should reject incorrect file types', () => {
      const txtFile = new File([''], 'test.txt', { type: 'text/plain' });
      
      expect(validators.fileType(txtFile, ['image/png', 'image/jpeg'])).toBe(false);
    });
  });

  describe('fileSize', () => {
    it('should validate correct file sizes', () => {
      const smallFile = new File(['hello'], 'small.txt', { type: 'text/plain' });
      
      expect(validators.fileSize(smallFile, 1024)).toBe(true);
      expect(validators.fileSize(smallFile, 5)).toBe(true);
    });

    it('should reject files that are too large', () => {
      const largeContent = 'x'.repeat(1000);
      const largeFile = new File([largeContent], 'large.txt', { type: 'text/plain' });
      
      expect(validators.fileSize(largeFile, 100)).toBe(false);
    });
  });

  describe('pattern', () => {
    it('should validate correct patterns', () => {
      expect(validators.pattern('123', /^\d+$/)).toBe(true);
      expect(validators.pattern('abc', /^[a-z]+$/)).toBe(true);
      expect(validators.pattern('test@example.com', /\S+@\S+\.\S+/)).toBe(true);
    });

    it('should reject incorrect patterns', () => {
      expect(validators.pattern('abc', /^\d+$/)).toBe(false);
      expect(validators.pattern('123', /^[a-z]+$/)).toBe(false);
    });
  });

  describe('phoneNumber', () => {
    it('should validate correct phone numbers', () => {
      expect(validators.phoneNumber('+1234567890')).toBe(true);
      expect(validators.phoneNumber('1234567890')).toBe(true);
      expect(validators.phoneNumber('+81-90-1234-5678')).toBe(true);
      expect(validators.phoneNumber('090 1234 5678')).toBe(true);
    });

    it('should reject invalid phone numbers', () => {
      expect(validators.phoneNumber('')).toBe(false);
      expect(validators.phoneNumber('abc')).toBe(false);
      expect(validators.phoneNumber('123')).toBe(false);
    });
  });

  describe('japaneseText', () => {
    it('should validate text containing Japanese characters', () => {
      expect(validators.japaneseText('こんにちは')).toBe(true);
      expect(validators.japaneseText('カタカナ')).toBe(true);
      expect(validators.japaneseText('漢字')).toBe(true);
      expect(validators.japaneseText('Hello こんにちは')).toBe(true);
    });

    it('should reject text without Japanese characters', () => {
      expect(validators.japaneseText('Hello World')).toBe(false);
      expect(validators.japaneseText('123456')).toBe(false);
      expect(validators.japaneseText('')).toBe(false);
    });
  });
});

describe('validateField', () => {
  it('should validate a field with multiple rules', () => {
    const result = validateField('test@example.com', [
      { type: 'required', message: 'Email is required' },
      { type: 'email', message: 'Invalid email format' },
    ]);

    expect(result.isValid).toBe(true);
    expect(result.errors).toEqual([]);
  });

  it('should return errors for invalid field', () => {
    const result = validateField('', [
      { type: 'required', message: 'Email is required' },
      { type: 'email', message: 'Invalid email format' },
    ]);

    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('Email is required');
  });

  it('should handle custom validators', () => {
    const result = validateField('test', [
      {
        type: 'custom',
        message: 'Must contain numbers',
        validator: (value) => /\d/.test(value),
      },
    ]);

    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('Must contain numbers');
  });
});

describe('validateForm', () => {
  it('should validate entire form', () => {
    const formData = {
      name: 'John Doe',
      email: 'john@example.com',
    };

    const schema = {
      name: [
        { type: 'required' as const, message: 'Name is required' },
        { type: 'minLength' as const, value: 2, message: 'Name too short' },
      ],
      email: [
        { type: 'required' as const, message: 'Email is required' },
        { type: 'email' as const, message: 'Invalid email' },
      ],
    };

    const result = validateForm(formData, schema);

    expect(result.isValid).toBe(true);
    expect(Object.keys(result.errors)).toHaveLength(0);
  });

  it('should return field-specific errors', () => {
    const formData = {
      name: '',
      email: 'invalid-email',
    };

    const schema = {
      name: [{ type: 'required' as const, message: 'Name is required' }],
      email: [{ type: 'email' as const, message: 'Invalid email' }],
    };

    const result = validateForm(formData, schema);

    expect(result.isValid).toBe(false);
    expect(result.errors.name).toContain('Name is required');
    expect(result.errors.email).toContain('Invalid email');
  });
});

describe('validateContactForm', () => {
  it('should validate correct contact form data', () => {
    const formData = {
      name: 'John Doe',
      email: 'john@example.com',
      subject: 'Test Subject',
      content: 'This is a test message with sufficient content.',
    };

    const result = validateContactForm(formData);

    expect(result.isValid).toBe(true);
    expect(Object.keys(result.errors)).toHaveLength(0);
  });

  it('should validate Japanese contact form data', () => {
    const formData = {
      name: '田中太郎',
      email: 'tanaka@example.com',
      subject: 'お問い合わせ件名',
      content: 'こちらはテストメッセージです。十分な文字数があります。',
    };

    const result = validateContactForm(formData);

    expect(result.isValid).toBe(true);
    expect(Object.keys(result.errors)).toHaveLength(0);
  });

  it('should reject invalid contact form data', () => {
    const formData = {
      name: 'A', // Too short
      email: 'invalid-email',
      subject: 'Hi', // Too short
      content: 'Short', // Too short
    };

    const result = validateContactForm(formData);

    expect(result.isValid).toBe(false);
    expect(result.errors.name).toBeDefined();
    expect(result.errors.email).toBeDefined();
    expect(result.errors.subject).toBeDefined();
    expect(result.errors.content).toBeDefined();
  });
});