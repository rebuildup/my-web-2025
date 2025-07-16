import { describe, it, expect } from 'vitest';
import { validators, validateForm as validate, ValidationResult } from './validation';

describe('Validation Utils', () => {
  describe('validators', () => {
    it('should handle null and undefined for required', () => {
      expect(validators.required(null)).toBe(false);
      expect(validators.required(undefined)).toBe(false);
    });

    it('should handle string and array for minLength', () => {
      expect(validators.minLength('abc', 3)).toBe(true);
    });
  });

  describe('validate', () => {
    it('should return no errors for valid data', () => {
      const data = { name: 'John', email: 'john@doe.com' };
      const rules = {
        name: [{ type: 'required' as const, message: 'Name is required' }],
        email: [
          { type: 'required' as const, message: 'Email is required' },
          { type: 'email' as const, message: 'Email is invalid' },
        ],
      };
      const { isValid, errors } = validate(data, rules);
      expect(isValid).toBe(true);
      expect(Object.keys(errors)).toHaveLength(0);
    });

    it('should return errors for invalid data', () => {
      const data = { name: '', email: 'invalid' };
      const rules = {
        name: [{ type: 'required' as const, message: 'Name is required' }],
        email: [{ type: 'email' as const, message: 'Email is invalid' }],
      };
      const { errors } = validate(data, rules);
      expect(errors.name[0]).toBe('Name is required');
      expect(errors.email[0]).toBe('Email is invalid');
    });

    it('should handle validation with params', () => {
      const data = { password: '123' };
      const rules = {
        password: [{ type: 'minLength' as const, value: 4, message: 'Too short' }],
      };
      const { errors } = validate(data, rules);
      expect(errors.password[0]).toBe('Too short');
    });
  });
});
