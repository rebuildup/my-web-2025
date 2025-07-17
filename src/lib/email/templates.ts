/**
 * Email templates for different types of messages
 */

import { format } from 'date-fns';

export interface EmailTemplateData {
  name: string;
  email: string;
  subject: string;
  message: string;
  inquiryType: 'development' | 'design' | 'general';
  timestamp?: Date;
}

/**
 * Generate HTML content for notification email
 */
export function generateNotificationEmailHtml(data: EmailTemplateData): string {
  const timestamp = data.timestamp ? format(data.timestamp, 'PPpp') : format(new Date(), 'PPpp');

  // Common header and footer
  const header = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Contact Form Submission</title>
  <style>
    body { 
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      padding: 20px;
      max-width: 600px;
      margin: 0 auto;
    }
    .header {
      border-bottom: 1px solid #eee;
      padding-bottom: 10px;
      margin-bottom: 20px;
    }
    .footer {
      border-top: 1px solid #eee;
      padding-top: 10px;
      margin-top: 20px;
      font-size: 12px;
      color: #666;
    }
    .message-box {
      background-color: #f9f9f9;
      border-left: 4px solid #3b82f6;
      padding: 15px;
      margin: 20px 0;
    }
    .label {
      font-weight: bold;
      margin-right: 5px;
    }
    .inquiry-type {
      display: inline-block;
      padding: 3px 8px;
      border-radius: 3px;
      font-size: 12px;
      font-weight: bold;
      text-transform: uppercase;
      margin-bottom: 10px;
    }
    .development {
      background-color: #dbeafe;
      color: #1e40af;
    }
    .design {
      background-color: #fef3c7;
      color: #92400e;
    }
    .general {
      background-color: #e5e7eb;
      color: #374151;
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>New Contact Form Submission</h1>
    <p>A new message has been submitted through the contact form.</p>
  </div>
  `;

  const footer = `
  <div class="footer">
    <p>This email was sent automatically from the samuido website contact form at ${timestamp}.</p>
  </div>
</body>
</html>
  `;

  // Inquiry type specific content
  let inquiryTypeContent = '';

  switch (data.inquiryType) {
    case 'development':
      inquiryTypeContent = `
      <p>This is a <strong>development inquiry</strong> that may involve web development, programming, or technical services.</p>
      <p>Please review the details and respond with information about your development services, availability, and any questions about the project requirements.</p>
      `;
      break;
    case 'design':
      inquiryTypeContent = `
      <p>This is a <strong>design/video inquiry</strong> that may involve graphic design, video production, or creative services.</p>
      <p>Please review the details and respond with information about your design/video services, portfolio examples, and any questions about the creative requirements.</p>
      `;
      break;
    default:
      inquiryTypeContent = `
      <p>This is a <strong>general inquiry</strong> that may require routing to the appropriate department.</p>
      <p>Please review the details and respond with the relevant information or forward to the appropriate team member.</p>
      `;
  }

  // Main content
  const mainContent = `
  <div>
    <span class="inquiry-type ${data.inquiryType}">${data.inquiryType}</span>
    
    <h2>${data.subject}</h2>
    
    <p><span class="label">From:</span> ${data.name} (${data.email})</p>
    
    ${inquiryTypeContent}
    
    <div class="message-box">
      <h3>Message:</h3>
      <p>${data.message.replace(/\n/g, '<br>')}</p>
    </div>
    
    <p>You can reply directly to this email to respond to the sender.</p>
  </div>
  `;

  return header + mainContent + footer;
}

/**
 * Generate plain text content for notification email
 */
export function generateNotificationEmailText(data: EmailTemplateData): string {
  const timestamp = data.timestamp ? format(data.timestamp, 'PPpp') : format(new Date(), 'PPpp');

  let inquiryTypeInfo = '';

  switch (data.inquiryType) {
    case 'development':
      inquiryTypeInfo =
        'This is a development inquiry that may involve web development, programming, or technical services.';
      break;
    case 'design':
      inquiryTypeInfo =
        'This is a design/video inquiry that may involve graphic design, video production, or creative services.';
      break;
    default:
      inquiryTypeInfo =
        'This is a general inquiry that may require routing to the appropriate department.';
  }

  return `
NEW CONTACT FORM SUBMISSION

Subject: ${data.subject}
From: ${data.name} (${data.email})
Inquiry Type: ${data.inquiryType.toUpperCase()}
Time: ${timestamp}

${inquiryTypeInfo}

MESSAGE:
${data.message}

---
This email was sent automatically from the samuido website contact form.
  `.trim();
}

/**
 * Generate HTML content for auto-reply email
 */
export function generateAutoReplyEmailHtml(data: EmailTemplateData): string {
  // Common header and footer
  const header = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Thank you for contacting samuido</title>
  <style>
    body { 
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      padding: 20px;
      max-width: 600px;
      margin: 0 auto;
    }
    .header {
      border-bottom: 1px solid #eee;
      padding-bottom: 10px;
      margin-bottom: 20px;
    }
    .footer {
      border-top: 1px solid #eee;
      padding-top: 10px;
      margin-top: 20px;
      font-size: 12px;
      color: #666;
    }
    .message-box {
      background-color: #f9f9f9;
      border-left: 4px solid #3b82f6;
      padding: 15px;
      margin: 20px 0;
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>Thank you for contacting samuido</h1>
  </div>
  `;

  const footer = `
  <div class="footer">
    <p>This is an automated response. Please do not reply to this email.</p>
    <p>&copy; ${new Date().getFullYear()} samuido. All rights reserved.</p>
  </div>
</body>
</html>
  `;

  // Inquiry type specific content
  let inquiryTypeContent = '';
  let expectedResponse = '';

  switch (data.inquiryType) {
    case 'development':
      inquiryTypeContent = `
      <p>We have received your development inquiry and will review your project requirements.</p>
      `;
      expectedResponse = 'within 1-2 business days';
      break;
    case 'design':
      inquiryTypeContent = `
      <p>We have received your design/video inquiry and will review your creative requirements.</p>
      `;
      expectedResponse = 'within 1-2 business days';
      break;
    default:
      inquiryTypeContent = `
      <p>We have received your inquiry and will get back to you soon.</p>
      `;
      expectedResponse = 'as soon as possible';
  }

  // Main content
  const mainContent = `
  <div>
    <p>Dear ${data.name},</p>
    
    ${inquiryTypeContent}
    
    <p>We will respond to your message ${expectedResponse}.</p>
    
    <div class="message-box">
      <h3>Your message:</h3>
      <p><strong>Subject:</strong> ${data.subject}</p>
      <p>${data.message.replace(/\n/g, '<br>')}</p>
    </div>
    
    <p>Thank you for your interest in samuido.</p>
    
    <p>Best regards,<br>samuido Team</p>
  </div>
  `;

  return header + mainContent + footer;
}

/**
 * Generate plain text content for auto-reply email
 */
export function generateAutoReplyEmailText(data: EmailTemplateData): string {
  let inquiryTypeInfo = '';
  let expectedResponse = '';

  switch (data.inquiryType) {
    case 'development':
      inquiryTypeInfo =
        'We have received your development inquiry and will review your project requirements.';
      expectedResponse = 'within 1-2 business days';
      break;
    case 'design':
      inquiryTypeInfo =
        'We have received your design/video inquiry and will review your creative requirements.';
      expectedResponse = 'within 1-2 business days';
      break;
    default:
      inquiryTypeInfo = 'We have received your inquiry and will get back to you soon.';
      expectedResponse = 'as soon as possible';
  }

  return `
THANK YOU FOR CONTACTING SAMUIDO

Dear ${data.name},

${inquiryTypeInfo}

We will respond to your message ${expectedResponse}.

YOUR MESSAGE:
Subject: ${data.subject}
${data.message}

Thank you for your interest in samuido.

Best regards,
samuido Team

---
This is an automated response. Please do not reply to this email.
© ${new Date().getFullYear()} samuido. All rights reserved.
  `.trim();
}
