/**
 * Security Utilities
 * Comprehensive security functions for the samuido website
 */

export interface CSPDirectives {
  [key: string]: string[];
}

export interface SecurityHeaders {
  [key: string]: string;
}

export interface RateLimitEntry {
  count: number;
  resetTime: number;
}

export interface SessionData {
  userId: string;
  createdAt: number;
  lastAccessed: number;
}

export interface EnvironmentValidation {
  isValid: boolean;
  missing: string[];
}

// Security utilities
export const securityUtils = {
  /**
   * Sanitize HTML content to prevent XSS
   */
  sanitizeHtml: (html: string): string => {
    // Basic HTML sanitization (in production, use DOMPurify)
    return html
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
      .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, "")
      .replace(/<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi, "")
      .replace(/<embed\b[^<]*(?:(?!<\/embed>)<[^<]*)*<\/embed>/gi, "")
      .replace(/javascript:/gi, "")
      .replace(/on\w+\s*=/gi, "")
      .replace(/data:text\/html/gi, "");
  },

  /**
   * Sanitize URLs to prevent malicious redirects
   */
  sanitizeUrl: (url: string): string => {
    try {
      const parsedUrl = new URL(url);
      // Only allow http and https protocols
      if (!["http:", "https:"].includes(parsedUrl.protocol)) {
        return "";
      }
      return parsedUrl.toString();
    } catch {
      return "";
    }
  },

  /**
   * Escape HTML special characters
   */
  escapeHtml: (text: string): string => {
    const map: Record<string, string> = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#x27;",
    };
    return text.replace(/[&<>"']/g, (char) => map[char]);
  },

  /**
   * Validate file type against allowed types
   */
  validateFileType: (fileType: string, allowedTypes: string[]): boolean => {
    return allowedTypes.includes(fileType);
  },

  /**
   * Validate file size
   */
  validateFileSize: (fileSize: number, maxSize: number): boolean => {
    return fileSize <= maxSize;
  },

  /**
   * Generate CSRF token
   */
  generateCSRFToken: (): string => {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    return Array.from(array, (byte) => byte.toString(16).padStart(2, "0")).join(
      "",
    );
  },

  /**
   * Store CSRF token in session
   */
  storeCSRFToken: (token: string): void => {
    if (typeof window !== "undefined") {
      sessionStorage.setItem("csrf-token", token);
    }
  },

  /**
   * Validate CSRF token
   */
  validateCSRFToken: (token: string): boolean => {
    if (typeof window !== "undefined") {
      const storedToken = sessionStorage.getItem("csrf-token");
      return storedToken === token;
    }
    return false;
  },

  /**
   * Rate limiting check
   */
  checkRateLimit: (
    identifier: string,
    limit: number,
    windowMs: number,
  ): boolean => {
    if (typeof window === "undefined") return true;

    const key = `rate-limit-${identifier}`;
    const now = Date.now();
    const stored = localStorage.getItem(key);

    let entry: RateLimitEntry;

    if (stored) {
      entry = JSON.parse(stored);

      // Reset if window has expired
      if (now > entry.resetTime) {
        entry = { count: 0, resetTime: now + windowMs };
      }
    } else {
      entry = { count: 0, resetTime: now + windowMs };
    }

    if (entry.count >= limit) {
      return false;
    }

    entry.count++;
    localStorage.setItem(key, JSON.stringify(entry));
    return true;
  },

  /**
   * Generate Content Security Policy header
   */
  generateCSP: (directives: CSPDirectives): string => {
    return Object.entries(directives)
      .map(([directive, sources]) => `${directive} ${sources.join(" ")}`)
      .join("; ");
  },

  /**
   * Get security headers
   */
  getSecurityHeaders: (isHttps: boolean = false): SecurityHeaders => {
    const headers: SecurityHeaders = {
      "X-Content-Type-Options": "nosniff",
      "X-Frame-Options": "DENY",
      "X-XSS-Protection": "1; mode=block",
      "Referrer-Policy": "strict-origin-when-cross-origin",
      "Permissions-Policy": "camera=(), microphone=(), geolocation=()",
    };

    if (isHttps) {
      headers["Strict-Transport-Security"] =
        "max-age=31536000; includeSubDomains; preload";
    }

    return headers;
  },

  /**
   * Validate password strength
   */
  validatePasswordStrength: (password: string): boolean => {
    const minLength = 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    return (
      password.length >= minLength &&
      hasUpperCase &&
      hasLowerCase &&
      hasNumbers &&
      hasSpecialChar
    );
  },

  /**
   * Hash password (mock implementation)
   */
  hashPassword: async (password: string): Promise<string> => {
    // In production, use bcrypt or similar
    const encoder = new TextEncoder();
    const data = encoder.encode(password + "salt");
    const hashBuffer = await crypto.subtle.digest("SHA-256", data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
  },

  /**
   * Verify password hash (mock implementation)
   */
  verifyPassword: async (password: string, hash: string): Promise<boolean> => {
    const computedHash = await securityUtils.hashPassword(password);
    return computedHash === hash;
  },

  /**
   * Generate JWT token (mock implementation)
   */
  generateJWT: (
    payload: Record<string, unknown>,
    secret: string,
    expiresIn: string,
  ): string => {
    // Mock JWT implementation - in production use jsonwebtoken library
    const header = { alg: "HS256", typ: "JWT" };
    const now = Math.floor(Date.now() / 1000);
    const exp = expiresIn.includes("-") ? now - 3600 : now + 3600; // Simple expiry logic

    const fullPayload = { ...payload, iat: now, exp };

    const encodedHeader = btoa(JSON.stringify(header));
    const encodedPayload = btoa(JSON.stringify(fullPayload));
    const signature = btoa(`${encodedHeader}.${encodedPayload}.${secret}`);

    return `${encodedHeader}.${encodedPayload}.${signature}`;
  },

  /**
   * Verify JWT token (mock implementation)
   */
  verifyJWT: (
    token: string,
    secret: string,
  ): Record<string, unknown> | null => {
    try {
      const [encodedHeader, encodedPayload, signature] = token.split(".");
      const expectedSignature = btoa(
        `${encodedHeader}.${encodedPayload}.${secret}`,
      );

      if (signature !== expectedSignature) {
        return null;
      }

      const payload = JSON.parse(atob(encodedPayload));
      const now = Math.floor(Date.now() / 1000);

      if (payload.exp && payload.exp < now) {
        return null;
      }

      return payload;
    } catch {
      return null;
    }
  },

  /**
   * Generate secure session ID
   */
  generateSessionId: (): string => {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    return Array.from(array, (byte) => byte.toString(16).padStart(2, "0")).join(
      "",
    );
  },

  /**
   * Create session
   */
  createSession: (sessionId: string, userId: string): void => {
    if (typeof window !== "undefined") {
      const sessionData: SessionData = {
        userId,
        createdAt: Date.now(),
        lastAccessed: Date.now(),
      };
      sessionStorage.setItem(
        `session-${sessionId}`,
        JSON.stringify(sessionData),
      );
    }
  },

  /**
   * Validate session
   */
  validateSession: (sessionId: string): boolean => {
    if (typeof window !== "undefined") {
      const stored = sessionStorage.getItem(`session-${sessionId}`);
      if (stored) {
        const sessionData: SessionData = JSON.parse(stored);
        const now = Date.now();
        const maxAge = 24 * 60 * 60 * 1000; // 24 hours

        return now - sessionData.lastAccessed < maxAge;
      }
    }
    return false;
  },

  /**
   * Get session user ID
   */
  getSessionUserId: (sessionId: string): string | null => {
    if (typeof window !== "undefined") {
      const stored = sessionStorage.getItem(`session-${sessionId}`);
      if (stored) {
        const sessionData: SessionData = JSON.parse(stored);
        return sessionData.userId;
      }
    }
    return null;
  },

  /**
   * Invalidate session
   */
  invalidateSession: (sessionId: string): void => {
    if (typeof window !== "undefined") {
      sessionStorage.removeItem(`session-${sessionId}`);
    }
  },

  /**
   * Validate API key
   */
  validateApiKey: (apiKey: string, validKeys: string[]): boolean => {
    return validKeys.includes(apiKey);
  },

  /**
   * Generate API key
   */
  generateApiKey: (): string => {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    return (
      "sk_" +
      Array.from(array, (byte) => byte.toString(16).padStart(2, "0")).join("")
    );
  },

  /**
   * Generate request signature
   */
  generateSignature: (payload: string, secret: string): string => {
    // Mock HMAC implementation
    return btoa(`${payload}.${secret}`);
  },

  /**
   * Validate request signature
   */
  validateSignature: (
    payload: string,
    signature: string,
    secret: string,
  ): boolean => {
    const expectedSignature = securityUtils.generateSignature(payload, secret);
    return signature === expectedSignature;
  },

  /**
   * Validate file extension
   */
  validateFileExtension: (
    filename: string,
    allowedExtensions: string[],
  ): boolean => {
    const extension = filename
      .toLowerCase()
      .substring(filename.lastIndexOf("."));
    return allowedExtensions.includes(extension);
  },

  /**
   * Scan file content for malware signatures
   */
  scanFileContent: (content: string): boolean => {
    const malwareSignatures = [
      "<?php",
      "eval(",
      "exec(",
      "system(",
      "shell_exec(",
      "<script>",
      "javascript:",
      "vbscript:",
    ];

    const lowerContent = content.toLowerCase();
    return !malwareSignatures.some((signature) =>
      lowerContent.includes(signature),
    );
  },

  /**
   * Generate safe filename
   */
  generateSafeFilename: (filename: string): string => {
    return filename
      .replace(/[^a-zA-Z0-9.-]/g, "_")
      .replace(/_{2,}/g, "_")
      .replace(/^_|_$/g, "")
      .substring(0, 255);
  },

  /**
   * Check if running in development
   */
  isDevelopment: (): boolean => {
    return process.env.NODE_ENV === "development";
  },

  /**
   * Validate environment variables
   */
  validateEnvironment: (requiredVars: string[]): EnvironmentValidation => {
    const missing = requiredVars.filter((varName) => !process.env[varName]);
    return {
      isValid: missing.length === 0,
      missing,
    };
  },

  /**
   * Sanitize log data to remove sensitive information
   */
  sanitizeLogData: (data: Record<string, unknown>): Record<string, unknown> => {
    const sensitiveKeys = [
      "password",
      "token",
      "secret",
      "key",
      "creditcard",
      "ssn",
    ];
    const sanitized = { ...data };

    Object.keys(sanitized).forEach((key) => {
      if (
        sensitiveKeys.some((sensitive) => key.toLowerCase().includes(sensitive))
      ) {
        sanitized[key] = "[REDACTED]";
      }
    });

    return sanitized;
  },

  /**
   * Check if string contains sensitive information
   */
  containsSensitiveInfo: (text: string): boolean => {
    const sensitivePatterns = [
      /password\s*[:=]\s*\S+/i,
      /token\s*[:=]\s*\S+/i,
      /secret\s*[:=]\s*\S+/i,
      /key\s*[:=]\s*\S+/i,
      /\d{4}[-\s]?\d{4}[-\s]?\d{4}[-\s]?\d{4}/, // Credit card pattern
    ];

    return sensitivePatterns.some((pattern) => pattern.test(text));
  },
};
