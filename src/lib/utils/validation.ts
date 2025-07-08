// Validation utilities for forms and data
export const validators = {
  email: (value: string): boolean => {
    // RFC5322に近い厳密なメールアドレスバリデーション
    const emailRegex =
      /^[A-Za-z0-9.!#$%&'*+/=?^_`{|}~-]+@[A-Za-z0-9-]+(?:\.[A-Za-z0-9-]+)*\.[A-Za-z]{2,}$/;
    // 連続したドットをチェック
    if (emailRegex.test(value)) {
      // 全体で連続したドットがないかチェック
      return !value.includes('..');
    }
    return false;
  },

  required: (value: unknown): boolean => {
    return value !== null && value !== undefined && value !== '';
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
    // 国際番号、数字のみ、日本の携帯番号（ハイフン・スペース含む）を許容
    const cleaned = value.replace(/[-\s\(\)]/g, '');
    const international = /^\+?\d{10,15}$/;
    const japaneseMobile = /^(070|080|090)\d{8}$/;
    const japaneseLandline = /^0\d{1,4}\d{1,4}\d{4}$/;
    return (
      international.test(cleaned) || japaneseMobile.test(cleaned) || japaneseLandline.test(cleaned)
    );
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
  value: unknown,
  rules: Array<{
    type: keyof typeof validators | 'custom';
    value?: unknown;
    message: string;
    validator?: (value: unknown) => boolean;
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
        isValid = validators.email(value as string);
        break;
      case 'minLength':
        isValid = validators.minLength(value as string, rule.value as number);
        break;
      case 'maxLength':
        isValid = validators.maxLength(value as string, rule.value as number);
        break;
      case 'url':
        isValid = validators.url(value as string);
        break;
      case 'fileType':
        isValid = validators.fileType(value as File, rule.value as string[]);
        break;
      case 'fileSize':
        isValid = validators.fileSize(value as File, rule.value as number);
        break;
      case 'pattern':
        isValid = validators.pattern(value as string, rule.value as RegExp);
        break;
      case 'phoneNumber':
        isValid = validators.phoneNumber(value as string);
        break;
      case 'japaneseText':
        isValid = validators.japaneseText(value as string);
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
  data: Record<string, unknown>,
  schema: Record<
    string,
    Array<{
      type: keyof typeof validators | 'custom';
      value?: unknown;
      message: string;
      validator?: (value: unknown) => boolean;
    }>
  >
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
    { type: 'required' as const, message: 'Name is required' },
    { type: 'minLength' as const, value: 2, message: 'Name must be at least 2 characters' },
    { type: 'maxLength' as const, value: 50, message: 'Name must be 50 characters or less' },
  ],
  email: [
    { type: 'required' as const, message: 'Email is required' },
    { type: 'email' as const, message: 'Invalid email format' },
  ],
  subject: [
    { type: 'required' as const, message: 'Subject is required' },
    { type: 'minLength' as const, value: 5, message: 'Subject must be at least 5 characters' },
    { type: 'maxLength' as const, value: 100, message: 'Subject must be 100 characters or less' },
  ],
  content: [
    { type: 'required' as const, message: 'Content is required' },
    { type: 'minLength' as const, value: 10, message: 'Content must be at least 10 characters' },
    { type: 'maxLength' as const, value: 2000, message: 'Content must be 2000 characters or less' },
  ],
};

export const validateContactForm = (data: Record<string, unknown>) => {
  return validateForm(data, contactFormSchema);
};
