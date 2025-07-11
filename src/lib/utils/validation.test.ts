import { describe, it, expect } from 'vitest';
import {
  validators,
  validateField,
  validateForm,
  contactFormSchema,
  validateContactForm,
} from './validation';

describe('Validation Utilities', () => {
  describe('validators', () => {
    describe('email', () => {
      it('should validate correct email addresses', () => {
        expect(validators.email('user@example.com')).toBe(true);
        expect(validators.email('test.email+tag@example.co.jp')).toBe(true);
      });

      it('should reject invalid email addresses', () => {
        expect(validators.email('invalid-email')).toBe(false);
        expect(validators.email('user@')).toBe(false);
        expect(validators.email('@example.com')).toBe(false);
        expect(validators.email('')).toBe(false);
        expect(validators.email('test..email@example.com')).toBe(false);
      });
    });

    describe('required', () => {
      it('should validate non-empty values', () => {
        expect(validators.required('test')).toBe(true);
        expect(validators.required(123)).toBe(true);
        expect(validators.required(0)).toBe(true);
        expect(validators.required(false)).toBe(true);
      });

      it('should reject empty values', () => {
        expect(validators.required('')).toBe(false);
        expect(validators.required(null)).toBe(false);
        expect(validators.required(undefined)).toBe(false);
      });
    });

    describe('minLength', () => {
      it('should validate strings with sufficient length', () => {
        expect(validators.minLength('hello', 5)).toBe(true);
        expect(validators.minLength('hello world', 5)).toBe(true);
      });

      it('should reject strings that are too short', () => {
        expect(validators.minLength('hi', 5)).toBe(false);
        expect(validators.minLength('', 1)).toBe(false);
      });
    });

    describe('maxLength', () => {
      it('should validate strings within length limit', () => {
        expect(validators.maxLength('hello', 10)).toBe(true);
        expect(validators.maxLength('1234567890', 10)).toBe(true);
      });

      it('should reject strings that are too long', () => {
        expect(validators.maxLength('hello world!', 10)).toBe(false);
      });
    });

    describe('pattern', () => {
      it('should validate strings matching pattern', () => {
        expect(validators.pattern('090-1234-5678', /^\d{3}-\d{4}-\d{4}$/)).toBe(true);
      });

      it('should reject strings not matching pattern', () => {
        expect(validators.pattern('invalid-phone', /^\d{3}-\d{4}-\d{4}$/)).toBe(false);
        expect(validators.pattern('09012345678', /^\d{3}-\d{4}-\d{4}$/)).toBe(false);
      });
    });

    describe('url', () => {
      it('should validate correct URLs', () => {
        expect(validators.url('https://example.com')).toBe(true);
        expect(validators.url('http://example.com')).toBe(true);
      });

      it('should reject invalid URLs', () => {
        expect(validators.url('not-a-url')).toBe(false);
        expect(validators.url('example.com')).toBe(false);
      });
    });

    describe('phoneNumber', () => {
      it('should validate correct phone numbers', () => {
        expect(validators.phoneNumber('090-1234-5678')).toBe(true);
        expect(validators.phoneNumber('08012345678')).toBe(true);
        expect(validators.phoneNumber('+819012345678')).toBe(true);
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
      });

      it('should reject text without Japanese characters', () => {
        expect(validators.japaneseText('Hello World')).toBe(false);
        expect(validators.japaneseText('123456')).toBe(false);
      });
    });
  });

  describe('validateField', () => {
    it('should return valid result for correct input', () => {
      const result = validateField('user@example.com', [
        { type: 'required', message: 'Required' },
        { type: 'email', message: 'Invalid email' },
      ]);

      expect(result.isValid).toBe(true);
      expect(result.errors).toEqual([]);
    });

    it('should return validation errors for invalid input', () => {
      const result = validateField('', [
        { type: 'required', message: 'Email is required' },
        { type: 'email', message: 'Invalid email format' },
      ]);

      expect(result.isValid).toBe(false);
      expect(result.errors).toEqual(['Email is required', 'Invalid email format']);
    });

    it('should validate multiple rules and collect all errors', () => {
      const result = validateField('x', [
        { type: 'required', message: 'Required' },
        { type: 'minLength', value: 5, message: 'Too short' },
        { type: 'maxLength', value: 2, message: 'Too long' },
      ]);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Too short');
      // maxLength should not be triggered for single character since minLength fails first
    });
  });

  describe('validateForm', () => {
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

    it('should validate entire form and return field results', () => {
      const data = {
        name: 'John',
        email: 'john@example.com',
      };

      const result = validateForm(data, schema);

      expect(result.isValid).toBe(true);
      expect(result.errors).toEqual({});
    });

    it('should collect errors for all invalid fields', () => {
      const data = {
        name: 'J',
        email: 'invalid-email',
      };

      const result = validateForm(data, schema);

      expect(result.isValid).toBe(false);
      expect(result.errors.name).toContain('Name too short');
      expect(result.errors.email).toContain('Invalid email');
    });
  });

  describe('contactFormSchema', () => {
    it('should have proper validation rules for all fields', () => {
      expect(contactFormSchema.name).toBeDefined();
      expect(contactFormSchema.email).toBeDefined();
      expect(contactFormSchema.subject).toBeDefined();
      expect(contactFormSchema.content).toBeDefined();
    });
  });

  describe('validateContactForm', () => {
    it('should validate complete contact form data', () => {
      const validData = {
        name: 'John Doe',
        email: 'john@example.com',
        subject: 'Test Subject',
        content: 'This is a test message with enough content',
      };

      const result = validateContactForm(validData);
      expect(result.isValid).toBe(true);
    });

    it('should reject incomplete contact form data', () => {
      const invalidData = {
        name: '',
        email: 'invalid-email',
        subject: '',
        content: '',
      };

      const result = validateContactForm(invalidData);
      expect(result.isValid).toBe(false);
      expect(Object.keys(result.errors).length).toBeGreaterThan(0);
    });
  });
});
