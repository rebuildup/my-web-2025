/**
 * @jest-environment node
 */

import { GET, POST } from "../contact/route";
import { NextRequest } from "next/server";

// Mock the email utilities
jest.mock("@/lib/utils/email", () => ({
  validateContactFormData: jest.fn().mockReturnValue({
    isValid: true,
    errors: [],
  }),
  processContactForm: jest.fn().mockResolvedValue({
    success: true,
    message: "Message sent successfully",
  }),
}));

describe("/api/contact", () => {
  beforeEach(() => {
    // Clear rate limiting between tests
    jest.clearAllMocks();
  });

  it("should return contact form configuration", async () => {
    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toHaveProperty("config");
    expect(data.config).toHaveProperty("recaptchaSiteKey");
    expect(data.config).toHaveProperty("emailRouting");
    expect(data.config).toHaveProperty("validation");
    expect(data.config).toHaveProperty("rateLimit");
  });

  it("should process valid contact form submission", async () => {
    const contactData = {
      name: "Test User",
      email: "test@example.com",
      subject: "Test Subject",
      message: "This is a test message that is long enough to pass validation.",
      type: "technical",
    };

    const request = new NextRequest("http://localhost:3000/api/contact", {
      method: "POST",
      body: JSON.stringify(contactData),
      headers: {
        "Content-Type": "application/json",
      },
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data).toHaveProperty("message");
    expect(data).toHaveProperty("timestamp");
  });

  it("should handle missing required fields", async () => {
    const invalidData = {
      name: "",
      email: "invalid-email",
      subject: "",
      message: "",
    };

    const request = new NextRequest("http://localhost:3000/api/contact", {
      method: "POST",
      body: JSON.stringify(invalidData),
      headers: {
        "Content-Type": "application/json",
      },
    });

    // Mock validation to return errors
    const emailUtils = await import("@/lib/utils/email");
    (emailUtils.validateContactFormData as jest.Mock).mockReturnValueOnce({
      isValid: false,
      errors: [
        "Name is required",
        "Invalid email",
        "Subject is required",
        "Message is required",
      ],
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.success).toBe(false);
    expect(data).toHaveProperty("errors");
    expect(Array.isArray(data.errors)).toBe(true);
  });
});
