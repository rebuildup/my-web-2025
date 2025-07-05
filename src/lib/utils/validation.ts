// Validation utilities for forms and data
export const validators = {
  email: (value: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(value);
  },

  required: (value: any): boolean => {
    return value !== null && value !== undefined && value !== "";
  },

  minLength: (value: string, min: number): boolean => {
    return value.length >= min;
  },

  maxLength: (value: string, max: number): boolean => {
    return value.length <= max;
  },

  url: (value: string): boolean => {
    try {
      new URL(value);
      return true;
    } catch {
      return false;
    }
  },

  fileType: (file: File, allowedTypes: string[]): boolean => {
    return allowedTypes.includes(file.type);
  },

  fileSize: (file: File, maxSize: number): boolean => {
    return file.size <= maxSize;
  },

  pattern: (value: string, pattern: RegExp): boolean => {
    return pattern.test(value);
  },

  phoneNumber: (value: string): boolean => {
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
    return phoneRegex.test(value.replace(/[\s\-\(\)]/g, ''));
  },

  japaneseText: (value: string): boolean => {
    const japaneseRegex = /[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]/;
    return japaneseRegex.test(value);
  },
};

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

export const validateField = (
  value: any,
  rules: Array<{
    type: keyof typeof validators | 'custom';
    value?: any;
    message: string;
    validator?: (value: any) => boolean;
  }>
): ValidationResult => {
  const errors: string[] = [];

  for (const rule of rules) {
    let isValid = true;

    switch (rule.type) {
      case 'required':
        isValid = validators.required(value);
        break;
      case 'email':
        isValid = validators.email(value);
        break;
      case 'minLength':
        isValid = validators.minLength(value, rule.value);
        break;
      case 'maxLength':
        isValid = validators.maxLength(value, rule.value);
        break;
      case 'url':
        isValid = validators.url(value);
        break;
      case 'fileType':
        isValid = validators.fileType(value, rule.value);
        break;
      case 'fileSize':
        isValid = validators.fileSize(value, rule.value);
        break;
      case 'pattern':
        isValid = validators.pattern(value, rule.value);
        break;
      case 'phoneNumber':
        isValid = validators.phoneNumber(value);
        break;
      case 'japaneseText':
        isValid = validators.japaneseText(value);
        break;
      case 'custom':
        if (rule.validator) {
          isValid = rule.validator(value);
        }
        break;
      default:
        break;
    }

    if (!isValid) {
      errors.push(rule.message);
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

export const validateForm = (
  data: Record<string, any>,
  schema: Record<string, Array<{
    type: keyof typeof validators | 'custom';
    value?: any;
    message: string;
    validator?: (value: any) => boolean;
  }>>
): { isValid: boolean; errors: Record<string, string[]> } => {
  const errors: Record<string, string[]> = {};
  let isValid = true;

  for (const [fieldName, rules] of Object.entries(schema)) {
    const fieldResult = validateField(data[fieldName], rules);
    if (!fieldResult.isValid) {
      errors[fieldName] = fieldResult.errors;
      isValid = false;
    }
  }

  return { isValid, errors };
};

// Contact form validation schema
export const contactFormSchema = {
  name: [
    { type: 'required' as const, message: '名前は必須です' },
    { type: 'minLength' as const, value: 2, message: '名前は2文字以上で入力してください' },
    { type: 'maxLength' as const, value: 50, message: '名前は50文字以内で入力してください' },
  ],
  email: [
    { type: 'required' as const, message: 'メールアドレスは必須です' },
    { type: 'email' as const, message: '有効なメールアドレスを入力してください' },
  ],
  subject: [
    { type: 'required' as const, message: '件名は必須です' },
    { type: 'minLength' as const, value: 5, message: '件名は5文字以上で入力してください' },
    { type: 'maxLength' as const, value: 100, message: '件名は100文字以内で入力してください' },
  ],
  content: [
    { type: 'required' as const, message: '内容は必須です' },
    { type: 'minLength' as const, value: 20, message: '内容は20文字以上で入力してください' },
    { type: 'maxLength' as const, value: 2000, message: '内容は2000文字以内で入力してください' },
  ],
};

export const validateContactForm = (data: Record<string, any>) => {
  return validateForm(data, contactFormSchema);
};