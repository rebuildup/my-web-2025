/**
 * @jest-environment jsdom
 */

import {
  validators,
  formValidation,
  contentValidation,
  contactFormValidation,
  sanitization,
} from "../validation";

describe("Validation Utilities", () => {
  describe("validators", () => {
    describe("email", () => {
      it("should validate correct emails", () => {
        expect(validators.email("test@example.com")).toBe(true);
        expect(validators.email("user.name@domain.co.jp")).toBe(true);
        expect(validators.email("test+tag@example.org")).toBe(true);
      });

      it("should reject invalid emails", () => {
        expect(validators.email("invalid")).toBe(false);
        expect(validators.email("@example.com")).toBe(false);
        expect(validators.email("test@")).toBe(false);
        expect(validators.email("test.example.com")).toBe(false);
        expect(validators.email("")).toBe(false);
      });
    });

    describe("required", () => {
      it("should validate required values", () => {
        expect(validators.required("test")).toBe(true);
        expect(validators.required(0)).toBe(true);
        expect(validators.required(false)).toBe(true);
        expect(validators.required([])).toBe(true);
      });

      it("should reject empty values", () => {
        expect(validators.required("")).toBe(false);
        expect(validators.required(null)).toBe(false);
        expect(validators.required(undefined)).toBe(false);
      });
    });

    describe("minLength", () => {
      it("should validate minimum length", () => {
        expect(validators.minLength("hello", 3)).toBe(true);
        expect(validators.minLength("hello", 5)).toBe(true);
        expect(validators.minLength("hi", 3)).toBe(false);
      });
    });

    describe("maxLength", () => {
      it("should validate maximum length", () => {
        expect(validators.maxLength("hello", 10)).toBe(true);
        expect(validators.maxLength("hello", 5)).toBe(true);
        expect(validators.maxLength("hello world", 5)).toBe(false);
      });
    });

    describe("url", () => {
      it("should validate correct URLs", () => {
        expect(validators.url("https://example.com")).toBe(true);
        expect(validators.url("http://localhost:3000")).toBe(true);
        expect(validators.url("ftp://files.example.com")).toBe(true);
      });

      it("should reject invalid URLs", () => {
        expect(validators.url("not-a-url")).toBe(false);
        expect(validators.url("")).toBe(false);
        expect(validators.url("example.com")).toBe(false);
      });
    });

    describe("fileType", () => {
      it("should validate file types", () => {
        const file = new File(["content"], "test.jpg", { type: "image/jpeg" });
        expect(validators.fileType(file, ["image/jpeg", "image/png"])).toBe(
          true,
        );
        expect(validators.fileType(file, ["image/png"])).toBe(false);
      });
    });

    describe("fileSize", () => {
      it("should validate file size", () => {
        const smallFile = new File(["small"], "small.txt", {
          type: "text/plain",
        });
        const largeContent = "x".repeat(1000);
        const largeFile = new File([largeContent], "large.txt", {
          type: "text/plain",
        });

        expect(validators.fileSize(smallFile, 1000)).toBe(true);
        expect(validators.fileSize(largeFile, 500)).toBe(false);
      });
    });

    describe("pattern", () => {
      it("should validate patterns", () => {
        expect(validators.pattern("abc123", /^[a-z0-9]+$/)).toBe(true);
        expect(validators.pattern("ABC123", /^[a-z0-9]+$/)).toBe(false);
      });
    });

    describe("number", () => {
      it("should validate numbers", () => {
        expect(validators.number(123)).toBe(true);
        expect(validators.number("123")).toBe(true);
        expect(validators.number(12.34)).toBe(true);
        expect(validators.number("abc")).toBe(false);
        expect(validators.number(Infinity)).toBe(false);
        expect(validators.number(NaN)).toBe(false);
      });
    });

    describe("integer", () => {
      it("should validate integers", () => {
        expect(validators.integer(123)).toBe(true);
        expect(validators.integer("123")).toBe(true);
        expect(validators.integer(12.34)).toBe(false);
        expect(validators.integer("12.34")).toBe(false);
      });
    });

    describe("range", () => {
      it("should validate ranges", () => {
        expect(validators.range(5, 0, 10)).toBe(true);
        expect(validators.range(0, 0, 10)).toBe(true);
        expect(validators.range(10, 0, 10)).toBe(true);
        expect(validators.range(-1, 0, 10)).toBe(false);
        expect(validators.range(11, 0, 10)).toBe(false);
      });
    });

    describe("japanese", () => {
      it("should validate Japanese text", () => {
        expect(validators.japanese("こんにちは")).toBe(true); // Hiragana
        expect(validators.japanese("コンニチハ")).toBe(true); // Katakana
        expect(validators.japanese("日本語")).toBe(true); // Kanji
        expect(validators.japanese("Hello")).toBe(false); // English
        expect(validators.japanese("123")).toBe(false); // Numbers
      });
    });

    describe("phone", () => {
      it("should validate phone numbers", () => {
        expect(validators.phone("1234567890")).toBe(true);
        expect(validators.phone("+1234567890")).toBe(true);
        expect(validators.phone("123-456-7890")).toBe(true);
        expect(validators.phone("(123) 456-7890")).toBe(true);
        expect(validators.phone("abc")).toBe(false);
        expect(validators.phone("")).toBe(false);
      });
    });

    describe("date", () => {
      it("should validate dates", () => {
        expect(validators.date("2023-12-25")).toBe(true);
        expect(validators.date("2023-12-25T10:30:00Z")).toBe(true);
        expect(validators.date("invalid-date")).toBe(false);
        expect(validators.date("")).toBe(false);
      });
    });

    describe("hexColor", () => {
      it("should validate hex colors", () => {
        expect(validators.hexColor("#ff0000")).toBe(true);
        expect(validators.hexColor("#FF0000")).toBe(true);
        expect(validators.hexColor("#f00")).toBe(true);
        expect(validators.hexColor("ff0000")).toBe(false);
        expect(validators.hexColor("#gg0000")).toBe(false);
      });
    });

    describe("slug", () => {
      it("should validate slugs", () => {
        expect(validators.slug("hello-world")).toBe(true);
        expect(validators.slug("test123")).toBe(true);
        expect(validators.slug("Hello-World")).toBe(false);
        expect(validators.slug("hello_world")).toBe(false);
        expect(validators.slug("hello world")).toBe(false);
      });
    });
  });

  describe("formValidation", () => {
    describe("validateField", () => {
      it("should validate single field with multiple rules", () => {
        const rules = [
          { type: "required" as const, message: "Field is required" },
          {
            type: "minLength" as const,
            value: 3,
            message: "Minimum 3 characters",
          },
        ];

        const validResult = formValidation.validateField("hello", rules);
        expect(validResult.isValid).toBe(true);

        const invalidResult = formValidation.validateField("hi", rules);
        expect(invalidResult.isValid).toBe(false);
        expect(invalidResult.error).toBe("Minimum 3 characters");
      });

      it("should handle custom validators", () => {
        const rules = [
          {
            type: "custom" as const,
            message: "Must be even",
            customValidator: (value: unknown) => Number(value) % 2 === 0,
          },
        ];

        expect(formValidation.validateField(4, rules).isValid).toBe(true);
        expect(formValidation.validateField(3, rules).isValid).toBe(false);
      });
    });

    describe("validateForm", () => {
      it("should validate entire form", () => {
        const data = {
          name: "John",
          email: "john@example.com",
          age: 25,
        };

        const schema = {
          name: [{ type: "required" as const, message: "Name required" }],
          email: [
            { type: "required" as const, message: "Email required" },
            { type: "email" as const, message: "Invalid email" },
          ],
          age: [
            { type: "required" as const, message: "Age required" },
            { type: "number" as const, message: "Must be number" },
          ],
        };

        const result = formValidation.validateForm(data, schema);
        expect(result.isValid).toBe(true);
        expect(result.errors).toHaveLength(0);
      });

      it("should return errors for invalid form", () => {
        const data = {
          name: "",
          email: "invalid-email",
          age: "not-a-number",
        };

        const schema = {
          name: [{ type: "required" as const, message: "Name required" }],
          email: [{ type: "email" as const, message: "Invalid email" }],
          age: [{ type: "number" as const, message: "Must be number" }],
        };

        const result = formValidation.validateForm(data, schema);
        expect(result.isValid).toBe(false);
        expect(result.errors).toHaveLength(3);
      });
    });
  });

  describe("contentValidation", () => {
    describe("validateContentItem", () => {
      it("should validate valid content item", () => {
        const validItem = {
          id: "test-id",
          type: "blog",
          title: "Test Title",
          description: "Test Description",
          category: "test",
          tags: ["tag1", "tag2"],
          status: "published",
          priority: 50,
          createdAt: "2023-12-25T10:30:00Z",
        };

        const result = contentValidation.validateContentItem(validItem);
        expect(result.isValid).toBe(true);
        expect(result.errors).toHaveLength(0);
      });

      it("should return errors for invalid content item", () => {
        const invalidItem = {
          id: "",
          type: "",
          title: "",
          description: "",
          category: "",
          tags: "not-an-array",
          status: "invalid-status",
          priority: 150,
          createdAt: "invalid-date",
        };

        const result = contentValidation.validateContentItem(invalidItem);
        expect(result.isValid).toBe(false);
        expect(result.errors.length).toBeGreaterThan(0);
      });
    });

    describe("validateFileUpload", () => {
      it("should validate valid file upload", () => {
        const file = new File(["content"], "test.jpg", { type: "image/jpeg" });
        const result = contentValidation.validateFileUpload(file);
        expect(result.isValid).toBe(true);
      });

      it("should reject invalid file type", () => {
        const file = new File(["content"], "test.txt", { type: "text/plain" });
        const result = contentValidation.validateFileUpload(file);
        expect(result.isValid).toBe(false);
        expect(result.errors[0]).toContain("not allowed");
      });

      it("should reject oversized file", () => {
        const largeContent = "x".repeat(11 * 1024 * 1024); // 11MB
        const file = new File([largeContent], "large.jpg", {
          type: "image/jpeg",
        });
        const result = contentValidation.validateFileUpload(file);
        expect(result.isValid).toBe(false);
        expect(result.errors[0]).toContain("exceeds maximum");
      });
    });
  });

  describe("contactFormValidation", () => {
    describe("validateContactForm", () => {
      it("should validate valid contact form", () => {
        const validData = {
          name: "John Doe",
          email: "john@example.com",
          subject: "Test Subject",
          message: "This is a test message with sufficient length.",
          type: "technical" as const,
          recaptchaToken: "valid-token",
        };

        const result = contactFormValidation.validateContactForm(validData);
        expect(result.isValid).toBe(true);
        expect(result.errors).toHaveLength(0);
      });

      it("should reject form with missing required fields", () => {
        const invalidData = {
          name: "",
          email: "",
          subject: "",
          message: "",
        };

        const result = contactFormValidation.validateContactForm(invalidData);
        expect(result.isValid).toBe(false);
        expect(result.errors.length).toBeGreaterThan(0);
      });

      it("should detect spam patterns", () => {
        const spamData = {
          name: "Spammer",
          email: "spam@example.com",
          subject: "Buy viagra now!",
          message: "Get cheap viagra and cialis from our pharmacy!",
          recaptchaToken: "token",
        };

        const result = contactFormValidation.validateContactForm(spamData);
        expect(result.isValid).toBe(false);
        expect(result.errors).toContain("Message appears to be spam");
      });

      it("should require reCAPTCHA token", () => {
        const dataWithoutRecaptcha = {
          name: "John Doe",
          email: "john@example.com",
          subject: "Test Subject",
          message: "This is a test message.",
        };

        const result =
          contactFormValidation.validateContactForm(dataWithoutRecaptcha);
        expect(result.isValid).toBe(false);
        expect(result.errors).toContain("reCAPTCHA verification is required");
      });
    });
  });

  describe("sanitization", () => {
    describe("sanitizeHtml", () => {
      it("should remove script tags", () => {
        const html = '<p>Safe content</p><script>alert("xss")</script>';
        const sanitized = sanitization.sanitizeHtml(html);
        expect(sanitized).not.toContain("<script>");
        expect(sanitized).toContain("<p>Safe content</p>");
      });

      it("should remove iframe tags", () => {
        const html = '<p>Content</p><iframe src="evil.com"></iframe>';
        const sanitized = sanitization.sanitizeHtml(html);
        expect(sanitized).not.toContain("<iframe>");
        expect(sanitized).toContain("<p>Content</p>");
      });

      it("should remove javascript: URLs", () => {
        const html = '<a href="javascript:alert(1)">Link</a>';
        const sanitized = sanitization.sanitizeHtml(html);
        expect(sanitized).not.toContain("javascript:");
      });
    });

    describe("sanitizeText", () => {
      it("should escape HTML entities", () => {
        const text = '<script>alert("xss")</script>';
        const sanitized = sanitization.sanitizeText(text);
        expect(sanitized).not.toContain("<script>");
        expect(sanitized).not.toContain(">");
      });

      it("should trim whitespace", () => {
        const text = "  test  ";
        const sanitized = sanitization.sanitizeText(text);
        expect(sanitized).toBe("test");
      });
    });

    describe("sanitizeFilename", () => {
      it("should replace invalid characters", () => {
        const filename = "test<>file|name?.txt";
        const sanitized = sanitization.sanitizeFilename(filename);
        expect(sanitized).toBe("test_file_name_.txt");
      });

      it("should remove leading/trailing underscores", () => {
        const filename = "_test_file_";
        const sanitized = sanitization.sanitizeFilename(filename);
        expect(sanitized).toBe("test_file");
      });
    });

    describe("sanitizeUrl", () => {
      it("should allow valid HTTP/HTTPS URLs", () => {
        expect(sanitization.sanitizeUrl("https://example.com")).toBe(
          "https://example.com/",
        );
        expect(sanitization.sanitizeUrl("http://example.com")).toBe(
          "http://example.com/",
        );
      });

      it("should reject non-HTTP protocols", () => {
        expect(sanitization.sanitizeUrl("javascript:alert(1)")).toBe("");
        expect(sanitization.sanitizeUrl("ftp://example.com")).toBe("");
      });

      it("should handle invalid URLs", () => {
        expect(sanitization.sanitizeUrl("not-a-url")).toBe("");
        expect(sanitization.sanitizeUrl("")).toBe("");
      });
    });
  });
});
