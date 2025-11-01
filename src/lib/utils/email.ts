/**
 * Email and Contact Utilities
 * Based on documents/06_deploy.md and documents/app/00_global/03_contact/page.md
 */

export interface ContactFormData {
	name: string;
	email: string;
	subject: string;
	message: string;
	type?: "technical" | "design";
	recaptchaToken?: string;
}

export interface EmailTemplate {
	to: string;
	subject: string;
	html: string;
	text: string;
}

export interface EmailConfig {
	apiKey: string;
	fromEmail: string;
	fromName: string;
}

// Email routing configuration
export const emailRouting = {
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
};

// reCAPTCHA configuration
export const recaptchaConfig = {
	siteKey: "6LdZ3XgrAAAAAJhdhTA25XgqZBebMW_reZiIPreG",
	secretKey: process.env.RECAPTCHA_SECRET_KEY,
};

/**
 * Verify reCAPTCHA token
 */
export async function verifyRecaptcha(token: string): Promise<boolean> {
	if (!recaptchaConfig.secretKey) {
		console.warn("reCAPTCHA secret key not configured");
		return false;
	}

	try {
		const response = await fetch(
			"https://www.google.com/recaptcha/api/siteverify",
			{
				method: "POST",
				headers: {
					"Content-Type": "application/x-www-form-urlencoded",
				},
				body: new URLSearchParams({
					secret: recaptchaConfig.secretKey,
					response: token,
				}),
			},
		);

		const data = await response.json();
		return data.success === true;
	} catch (error) {
		console.error("reCAPTCHA verification failed:", error);
		return false;
	}
}

/**
 * Route email based on inquiry type
 */
export function routeEmail(type?: "technical" | "design"): string {
	switch (type) {
		case "technical":
			return emailRouting.technical.email;
		case "design":
			return emailRouting.design.email;
		default:
			// Default to technical for general inquiries
			return emailRouting.technical.email;
	}
}

/**
 * Create email template for contact form
 */
export function createContactEmailTemplate(
	data: ContactFormData,
): EmailTemplate {
	const { name, email, subject, message, type } = data;
	const routedEmail = routeEmail(type);

	const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Contact Form Submission</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #0000ff; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background: #f9f9f9; }
        .field { margin-bottom: 15px; }
        .label { font-weight: bold; color: #555; }
        .value { margin-top: 5px; padding: 10px; background: white; border-left: 3px solid #0000ff; }
        .footer { padding: 20px; text-align: center; color: #666; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>New Contact Form Submission</h1>
        </div>
        <div class="content">
          <div class="field">
            <div class="label">Name:</div>
            <div class="value">${escapeHtml(name)}</div>
          </div>
          <div class="field">
            <div class="label">Email:</div>
            <div class="value">${escapeHtml(email)}</div>
          </div>
          <div class="field">
            <div class="label">Subject:</div>
            <div class="value">${escapeHtml(subject)}</div>
          </div>
          <div class="field">
            <div class="label">Inquiry Type:</div>
            <div class="value">${type ? escapeHtml(type) : "General"}</div>
          </div>
          <div class="field">
            <div class="label">Message:</div>
            <div class="value">${escapeHtml(message).replace(/\n/g, "<br>")}</div>
          </div>
        </div>
        <div class="footer">
          <p>This message was sent from the samuido website contact form.</p>
          <p>Timestamp: ${new Date().toISOString()}</p>
        </div>
      </div>
    </body>
    </html>
  `;

	const text = `
New Contact Form Submission

Name: ${name}
Email: ${email}
Subject: ${subject}
Inquiry Type: ${type || "General"}

Message:
${message}

---
This message was sent from the samuido website contact form.
Timestamp: ${new Date().toISOString()}
  `.trim();

	return {
		to: routedEmail,
		subject: `Contact Form: ${subject}`,
		html,
		text,
	};
}

/**
 * Send email using Resend API
 */
export async function sendEmail(template: EmailTemplate): Promise<boolean> {
	const apiKey = process.env.RESEND_API_KEY;

	if (!apiKey) {
		console.error("Resend API key not configured");
		return false;
	}

	try {
		const response = await fetch("https://api.resend.com/emails", {
			method: "POST",
			headers: {
				Authorization: `Bearer ${apiKey}`,
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				from: "contact@samuido.com", // This should be configured in Resend
				to: template.to,
				subject: template.subject,
				html: template.html,
				text: template.text,
			}),
		});

		if (!response.ok) {
			const errorData = await response.json();
			console.error("Failed to send email:", errorData);
			return false;
		}

		const result = await response.json();
		console.log("Email sent successfully:", result.id);
		return true;
	} catch (error) {
		console.error("Email sending failed:", error);
		return false;
	}
}

/**
 * Process contact form submission
 */
export async function processContactForm(data: ContactFormData): Promise<{
	success: boolean;
	message: string;
	errors?: string[];
}> {
	try {
		// Verify reCAPTCHA
		if (data.recaptchaToken) {
			const recaptchaValid = await verifyRecaptcha(data.recaptchaToken);
			if (!recaptchaValid) {
				return {
					success: false,
					message: "reCAPTCHA verification failed. Please try again.",
				};
			}
		}

		// Create and send email
		const template = createContactEmailTemplate(data);
		const emailSent = await sendEmail(template);

		if (!emailSent) {
			return {
				success: false,
				message: "Failed to send email. Please try again later.",
			};
		}

		return {
			success: true,
			message:
				"Your message has been sent successfully. We'll get back to you soon!",
		};
	} catch (error) {
		console.error("Contact form processing failed:", error);
		return {
			success: false,
			message: "An unexpected error occurred. Please try again later.",
		};
	}
}

/**
 * Validate contact form data with Japanese spam protection
 */
export function validateContactFormData(data: ContactFormData): {
	isValid: boolean;
	errors: string[];
} {
	const errors: string[] = [];

	// Basic validation
	if (!data.name || data.name.trim().length < 2) {
		errors.push("Name must be at least 2 characters long");
	}

	if (!data.email || !isValidEmail(data.email)) {
		errors.push("Please provide a valid email address");
	}

	if (!data.subject || data.subject.trim().length < 5) {
		errors.push("Subject must be at least 5 characters long");
	}

	if (!data.message || data.message.trim().length < 10) {
		errors.push("Message must be at least 10 characters long");
	}

	// Length limits
	if (data.name.length > 100) {
		errors.push("Name must be less than 100 characters");
	}

	if (data.subject.length > 200) {
		errors.push("Subject must be less than 200 characters");
	}

	if (data.message.length > 5000) {
		errors.push("Message must be less than 5000 characters");
	}

	// Type validation
	if (data.type && !["technical", "design"].includes(data.type)) {
		errors.push("Invalid inquiry type");
	}

	// Japanese spam protection
	const spamIndicators = [
		// Common spam patterns
		/viagra|cialis|pharmacy|casino|poker|loan|mortgage/i,
		// Excessive links
		/(https?:\/\/[^\s]+.*){3,}/i,
		// Excessive repetition
		/(.)\1{10,}/i,
		// All caps (more than 50% of message)
		/^[A-Z\s]{20,}$/,
	];

	const fullText = `${data.name} ${data.subject} ${data.message}`;
	for (const pattern of spamIndicators) {
		if (pattern.test(fullText)) {
			errors.push("Message appears to be spam and cannot be sent");
			break;
		}
	}

	return {
		isValid: errors.length === 0,
		errors,
	};
}

/**
 * Helper function to validate email format
 */
function isValidEmail(email: string): boolean {
	const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
	return emailRegex.test(email);
}

/**
 * Helper function to escape HTML (server-side safe)
 */
function escapeHtml(text: string): string {
	return text
		.replace(/&/g, "&amp;")
		.replace(/</g, "&lt;")
		.replace(/>/g, "&gt;")
		.replace(/"/g, "&quot;")
		.replace(/'/g, "&#x27;");
}
