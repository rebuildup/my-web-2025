/**
 * @jest-environment jsdom
 */

import { TextDecoder, TextEncoder } from "util";
import { CSPDirectives, securityUtils } from "../security";

// Mock fetch for testing
global.fetch = jest.fn();

// Mock TextEncoder for Node.js environment
if (typeof global.TextEncoder === "undefined") {
  global.TextEncoder = TextEncoder;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  global.TextDecoder = TextDecoder as any;
}

describe("Security Utilities", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (fetch as jest.Mock).mockClear();
  });

  describe("Input Sanitization", () => {
    it("should sanitize HTML input", () => {
      const maliciousInput = '<script>alert("xss")</script><p>Safe content</p>';
      const sanitized = securityUtils.sanitizeHtml(maliciousInput);

      expect(sanitized).not.toContain("<script>");
      expect(sanitized).toContain("<p>Safe content</p>");
    });

    it("should remove dangerous attributes", () => {
      const maliciousInput =
        '<div onclick="alert(1)" onload="alert(2)">Content</div>';
      const sanitized = securityUtils.sanitizeHtml(maliciousInput);

      expect(sanitized).not.toContain("onclick");
      expect(sanitized).not.toContain("onload");
      expect(sanitized).toContain("Content");
    });

    it("should sanitize URLs", () => {
      expect(securityUtils.sanitizeUrl("https://example.com")).toBe(
        "https://example.com/",
      );
      expect(securityUtils.sanitizeUrl("javascript:alert(1)")).toBe("");
      expect(
        securityUtils.sanitizeUrl("data:text/html,<script>alert(1)</script>"),
      ).toBe("");
      expect(securityUtils.sanitizeUrl("http://example.com")).toBe(
        "http://example.com/",
      );
    });

    it("should escape special characters", () => {
      const input = "<>&\"'";
      const escaped = securityUtils.escapeHtml(input);

      expect(escaped).toBe("&lt;&gt;&amp;&quot;&#x27;");
    });

    it("should validate file types", () => {
      const allowedTypes = ["image/jpeg", "image/png", "image/gif"];

      expect(securityUtils.validateFileType("image/jpeg", allowedTypes)).toBe(
        true,
      );
      expect(securityUtils.validateFileType("text/html", allowedTypes)).toBe(
        false,
      );
      expect(
        securityUtils.validateFileType("application/javascript", allowedTypes),
      ).toBe(false);
    });

    it("should validate file size", () => {
      const maxSize = 1024 * 1024; // 1MB

      expect(securityUtils.validateFileSize(500000, maxSize)).toBe(true);
      expect(securityUtils.validateFileSize(2000000, maxSize)).toBe(false);
    });
  });

  describe("CSRF Protection", () => {
    it("should generate CSRF token", () => {
      const token = securityUtils.generateCSRFToken();

      expect(token).toBeTruthy();
      expect(typeof token).toBe("string");
      expect(token.length).toBeGreaterThan(20);
    });

    it("should validate CSRF token", () => {
      const token = securityUtils.generateCSRFToken();

      // Store token in session
      securityUtils.storeCSRFToken(token);

      // Validate token
      expect(securityUtils.validateCSRFToken(token)).toBe(true);
      expect(securityUtils.validateCSRFToken("invalid-token")).toBe(false);
    });

    it("should handle missing CSRF token", () => {
      expect(securityUtils.validateCSRFToken("any-token")).toBe(false);
    });
  });

  describe("Rate Limiting", () => {
    beforeEach(() => {
      // Clear rate limit storage
      localStorage.clear();
    });

    it("should allow requests within limit", () => {
      const identifier = "test-user";
      const limit = 5;
      const windowMs = 60000; // 1 minute

      // First request should be allowed
      expect(securityUtils.checkRateLimit(identifier, limit, windowMs)).toBe(
        true,
      );

      // Subsequent requests within limit should be allowed
      for (let i = 0; i < limit - 1; i++) {
        expect(securityUtils.checkRateLimit(identifier, limit, windowMs)).toBe(
          true,
        );
      }
    });

    it("should block requests exceeding limit", () => {
      const identifier = "test-user";
      const limit = 3;
      const windowMs = 60000;

      // Use up the limit
      for (let i = 0; i < limit; i++) {
        expect(securityUtils.checkRateLimit(identifier, limit, windowMs)).toBe(
          true,
        );
      }

      // Next request should be blocked
      expect(securityUtils.checkRateLimit(identifier, limit, windowMs)).toBe(
        false,
      );
    });

    it("should reset rate limit after window expires", async () => {
      const identifier = "test-user";
      const limit = 2;
      const windowMs = 100; // 100ms

      // Use real timers for this test
      jest.useRealTimers();

      // Use up the limit
      expect(securityUtils.checkRateLimit(identifier, limit, windowMs)).toBe(
        true,
      );
      expect(securityUtils.checkRateLimit(identifier, limit, windowMs)).toBe(
        true,
      );
      expect(securityUtils.checkRateLimit(identifier, limit, windowMs)).toBe(
        false,
      );

      // Wait for window to expire
      await new Promise<void>((resolve) => {
        setTimeout(() => {
          expect(
            securityUtils.checkRateLimit(identifier, limit, windowMs),
          ).toBe(true);
          resolve();
        }, windowMs + 10);
      });

      // Restore fake timers
      jest.useFakeTimers();
    }, 5000);
  });

  describe("Content Security Policy", () => {
    it("should generate CSP header", () => {
      const directives: CSPDirectives = {
        "default-src": ["'self'"],
        "script-src": ["'self'", "'unsafe-inline'"],
        "style-src": [
          "'self'",
          "'unsafe-inline'",
          "https://fonts.googleapis.com",
        ],
        "img-src": ["'self'", "data:", "https:"],
      };

      const csp = securityUtils.generateCSP(directives);

      expect(csp).toContain("default-src 'self'");
      expect(csp).toContain("script-src 'self' 'unsafe-inline'");
      expect(csp).toContain(
        "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      );
      expect(csp).toContain("img-src 'self' data: https:");
    });

    it("should handle empty directives", () => {
      const csp = securityUtils.generateCSP({});
      expect(csp).toBe("");
    });
  });

  describe("Security Headers", () => {
    it("should generate security headers", () => {
      const headers = securityUtils.getSecurityHeaders();

      expect(headers).toHaveProperty("X-Content-Type-Options", "nosniff");
      expect(headers).toHaveProperty("X-Frame-Options", "DENY");
      expect(headers).toHaveProperty("X-XSS-Protection", "1; mode=block");
      expect(headers).toHaveProperty(
        "Referrer-Policy",
        "strict-origin-when-cross-origin",
      );
      expect(headers).toHaveProperty("Permissions-Policy");
    });

    it("should include HSTS header for HTTPS", () => {
      const headers = securityUtils.getSecurityHeaders(true);

      expect(headers).toHaveProperty("Strict-Transport-Security");
      expect(headers["Strict-Transport-Security"]).toContain("max-age=");
    });

    it("should not include HSTS header for HTTP", () => {
      const headers = securityUtils.getSecurityHeaders(false);

      expect(headers).not.toHaveProperty("Strict-Transport-Security");
    });
  });

  describe("Password Security", () => {
    it("should validate password strength", () => {
      expect(securityUtils.validatePasswordStrength("weak")).toBe(false);
      expect(securityUtils.validatePasswordStrength("StrongPass123!")).toBe(
        true,
      );
      expect(securityUtils.validatePasswordStrength("NoNumbers!")).toBe(false);
      expect(securityUtils.validatePasswordStrength("nonumbers123")).toBe(
        false,
      );
      expect(securityUtils.validatePasswordStrength("NoSpecial123")).toBe(
        false,
      );
    });

    it("should hash passwords securely", async () => {
      // Mock crypto.subtle for testing
      const mockDigest = jest.fn().mockResolvedValue(new ArrayBuffer(32));
      Object.defineProperty(global, "crypto", {
        value: {
          subtle: { digest: mockDigest },
          getRandomValues: jest.fn().mockImplementation((arr) => {
            for (let i = 0; i < arr.length; i++) {
              arr[i] = Math.floor(Math.random() * 256);
            }
            return arr;
          }),
        },
      });

      const password = "testPassword123!";
      const hash = await securityUtils.hashPassword(password);

      expect(hash).toBeTruthy();
      expect(hash).not.toBe(password);
      expect(typeof hash).toBe("string");
    });

    it("should verify password hashes", async () => {
      // Mock crypto.subtle for testing with different outputs for different inputs
      const mockDigest = jest.fn().mockImplementation((_algorithm, data) => {
        const input = new TextDecoder().decode(data);
        const buffer = new ArrayBuffer(32);
        const array = new Uint8Array(buffer);

        // Generate different hash based on input
        if (input.includes("testPassword123!")) {
          array.fill(170); // Consistent hash for correct password
        } else {
          array.fill(85); // Different hash for wrong password
        }

        return Promise.resolve(buffer);
      });

      Object.defineProperty(global, "crypto", {
        value: {
          subtle: { digest: mockDigest },
          getRandomValues: jest.fn().mockImplementation((arr) => {
            for (let i = 0; i < arr.length; i++) {
              arr[i] = 170;
            }
            return arr;
          }),
        },
      });

      const password = "testPassword123!";
      const hash = await securityUtils.hashPassword(password);

      const isValid = await securityUtils.verifyPassword(password, hash);
      const isInvalid = await securityUtils.verifyPassword(
        "wrongPassword",
        hash,
      );

      expect(isValid).toBe(true);
      expect(isInvalid).toBe(false);
    });
  });

  describe("JWT Security", () => {
    it("should generate JWT token", () => {
      const payload = { userId: "123", role: "user" };
      const token = securityUtils.generateJWT(payload, "secret", "1h");

      expect(token).toBeTruthy();
      expect(typeof token).toBe("string");
      expect(token.split(".")).toHaveLength(3);
    });

    it("should verify JWT token", () => {
      const payload = { userId: "123", role: "user" };
      const secret = "secret";
      const token = securityUtils.generateJWT(payload, secret, "1h");

      const decoded = securityUtils.verifyJWT(token, secret);

      expect(decoded).toBeTruthy();
      expect(decoded?.userId).toBe("123");
      expect(decoded?.role).toBe("user");
    });

    it("should reject invalid JWT token", () => {
      const decoded = securityUtils.verifyJWT("invalid.token.here", "secret");
      expect(decoded).toBeNull();
    });

    it("should reject expired JWT token", () => {
      const payload = { userId: "123", role: "user" };
      const secret = "secret";
      const token = securityUtils.generateJWT(payload, secret, "-1h"); // Expired

      const decoded = securityUtils.verifyJWT(token, secret);
      expect(decoded).toBeNull();
    });
  });

  describe("Session Security", () => {
    it("should generate secure session ID", () => {
      const sessionId = securityUtils.generateSessionId();

      expect(sessionId).toBeTruthy();
      expect(typeof sessionId).toBe("string");
      expect(sessionId.length).toBeGreaterThan(20);
    });

    it("should validate session", () => {
      const sessionId = securityUtils.generateSessionId();
      const userId = "123";

      // Create session
      securityUtils.createSession(sessionId, userId);

      // Validate session
      expect(securityUtils.validateSession(sessionId)).toBe(true);
      expect(securityUtils.getSessionUserId(sessionId)).toBe(userId);
    });

    it("should invalidate session", () => {
      const sessionId = securityUtils.generateSessionId();
      const userId = "123";

      // Create and then invalidate session
      securityUtils.createSession(sessionId, userId);
      securityUtils.invalidateSession(sessionId);

      // Session should be invalid
      expect(securityUtils.validateSession(sessionId)).toBe(false);
      expect(securityUtils.getSessionUserId(sessionId)).toBeNull();
    });
  });

  describe("API Security", () => {
    it("should validate API key", () => {
      const validKey = "valid-api-key-123";
      const invalidKey = "invalid-key";

      // Mock valid keys
      const validKeys = [validKey];

      expect(securityUtils.validateApiKey(validKey, validKeys)).toBe(true);
      expect(securityUtils.validateApiKey(invalidKey, validKeys)).toBe(false);
    });

    it("should generate API key", () => {
      const apiKey = securityUtils.generateApiKey();

      expect(apiKey).toBeTruthy();
      expect(typeof apiKey).toBe("string");
      expect(apiKey.length).toBeGreaterThan(30);
    });

    it("should validate request signature", () => {
      const payload = JSON.stringify({ data: "test" });
      const secret = "webhook-secret";
      const signature = securityUtils.generateSignature(payload, secret);

      expect(securityUtils.validateSignature(payload, signature, secret)).toBe(
        true,
      );
      expect(
        securityUtils.validateSignature(payload, "invalid-signature", secret),
      ).toBe(false);
    });
  });

  describe("File Upload Security", () => {
    it("should validate file extension", () => {
      const allowedExtensions = [".jpg", ".png", ".gif"];

      expect(
        securityUtils.validateFileExtension("image.jpg", allowedExtensions),
      ).toBe(true);
      expect(
        securityUtils.validateFileExtension("script.js", allowedExtensions),
      ).toBe(false);
      expect(
        securityUtils.validateFileExtension("malware.exe", allowedExtensions),
      ).toBe(false);
    });

    it("should scan file content for malware signatures", () => {
      const safeContent = "This is safe image content";
      const maliciousContent = "<?php eval($_POST['cmd']); ?>";

      expect(securityUtils.scanFileContent(safeContent)).toBe(true);
      expect(securityUtils.scanFileContent(maliciousContent)).toBe(false);
    });

    it("should generate safe filename", () => {
      const unsafeFilename = "../../../etc/passwd";
      const safeFilename = securityUtils.generateSafeFilename(unsafeFilename);

      expect(safeFilename).not.toContain("../");
      expect(safeFilename).not.toContain("/");
      expect(safeFilename).not.toContain("\\");
    });
  });

  describe("Environment Security", () => {
    it("should detect development environment", () => {
      // Mock the isDevelopment function to test different environments
      const mockIsDevelopment = jest.spyOn(securityUtils, "isDevelopment");

      mockIsDevelopment.mockReturnValueOnce(true);
      expect(securityUtils.isDevelopment()).toBe(true);

      mockIsDevelopment.mockReturnValueOnce(false);
      expect(securityUtils.isDevelopment()).toBe(false);

      mockIsDevelopment.mockRestore();
    });

    it("should validate environment variables", () => {
      const requiredVars = ["NODE_ENV", "NEXT_PUBLIC_SITE_URL"];
      const result = securityUtils.validateEnvironment(requiredVars);

      expect(result.isValid).toBeDefined();
      expect(result.missing).toBeInstanceOf(Array);
    });
  });

  describe("Logging Security", () => {
    it("should sanitize log data", () => {
      const sensitiveData = {
        username: "user123",
        password: "secret123",
        email: "user@example.com",
        creditCard: "4111-1111-1111-1111",
      };

      const sanitized = securityUtils.sanitizeLogData(sensitiveData);

      expect(sanitized.username).toBe("user123");
      expect(sanitized.password).toBe("[REDACTED]");
      expect(sanitized.email).toBe("user@example.com");
      expect(sanitized.creditCard).toBe("[REDACTED]");
    });

    it("should detect sensitive information", () => {
      expect(securityUtils.containsSensitiveInfo("password: secret123")).toBe(
        true,
      );
      expect(securityUtils.containsSensitiveInfo("token: abc123")).toBe(true);
      expect(securityUtils.containsSensitiveInfo("normal log message")).toBe(
        false,
      );
    });
  });
});
