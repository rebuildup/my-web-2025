import { NextRequest, NextResponse } from "next/server";
import {
  processContactForm,
  validateContactFormData,
  type ContactFormData,
} from "@/lib/utils/email";

// Rate limiting storage (in production, use Redis or similar)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT = 3; // 3 contact form submissions per 15 minutes
const RATE_LIMIT_WINDOW = 15 * 60 * 1000; // 15 minutes in milliseconds

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const userLimit = rateLimitMap.get(ip);

  if (!userLimit || now > userLimit.resetTime) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    return true;
  }

  if (userLimit.count >= RATE_LIMIT) {
    return false;
  }

  userLimit.count++;
  return true;
}

export async function POST(request: NextRequest) {
  try {
    // Get client IP for rate limiting
    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0] ||
      request.headers.get("x-real-ip") ||
      "unknown";

    // Check rate limit
    if (!checkRateLimit(ip)) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Too many contact form submissions. Please wait 15 minutes before trying again.",
          retryAfter: Math.ceil(RATE_LIMIT_WINDOW / 1000 / 60), // minutes
        },
        { status: 429 }
      );
    }

    // Parse request body
    const body = await request.json();
    const contactData: ContactFormData = {
      name: body.name,
      email: body.email,
      subject: body.subject,
      message: body.message,
      type: body.type,
      recaptchaToken: body.recaptchaToken,
    };

    // Validate form data
    const validation = validateContactFormData(contactData);
    if (!validation.isValid) {
      return NextResponse.json(
        {
          success: false,
          message: "Please correct the following errors:",
          errors: validation.errors,
        },
        { status: 400 }
      );
    }

    // Process contact form (send email)
    const result = await processContactForm(contactData);

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          message: result.message,
          errors: result.errors,
        },
        { status: 500 }
      );
    }

    // Log successful contact form submission (for analytics)
    // console.log(
    //   `Contact form submitted: ${contactData.email} - ${contactData.subject}`
    // );

    return NextResponse.json({
      success: true,
      message: result.message,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Contact form API error:", error);

    // Don't expose internal errors to client
    return NextResponse.json(
      {
        success: false,
        message: "An unexpected error occurred. Please try again later.",
      },
      { status: 500 }
    );
  }
}

// GET method to retrieve contact form configuration (optional)
export async function GET() {
  try {
    return NextResponse.json({
      config: {
        recaptchaSiteKey: "6LdZ3XgrAAAAAJhdhTA25XgqZBebMW_reZiIPreG",
        emailRouting: {
          technical: {
            email: "rebuild.up.up(at)gmail.com",
            handle: "@361do_sleep",
            description: "Technical and development inquiries",
          },
          design: {
            email: "361do.sleep(at)gmail.com",
            handle: "@361do_design",
            description: "Video and design inquiries",
          },
        },
        validation: {
          nameMinLength: 2,
          nameMaxLength: 100,
          subjectMinLength: 5,
          subjectMaxLength: 200,
          messageMinLength: 10,
          messageMaxLength: 5000,
        },
        rateLimit: {
          maxSubmissions: RATE_LIMIT,
          windowMinutes: RATE_LIMIT_WINDOW / 1000 / 60,
        },
      },
    });
  } catch (error) {
    console.error("Contact config API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
