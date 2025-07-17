/**
 * Service for handling reCAPTCHA verification
 */

// reCAPTCHA verification response
export interface RecaptchaVerificationResult {
  success: boolean;
  score?: number; // Score is only available for v3
  error?: string;
  errorCodes?: string[];
  challengeTimestamp?: string;
  hostname?: string;
  action?: string;
}

/**
 * Service for handling reCAPTCHA verification
 */
export class RecaptchaService {
  private secretKey: string;
  private verifyUrl: string = 'https://www.google.com/recaptcha/api/siteverify';
  private isDevelopment: boolean;

  /**
   * Create a new reCAPTCHA service
   * @param secretKey reCAPTCHA secret key
   * @param isDevelopment Whether the application is running in development mode
   */
  constructor(secretKey: string, isDevelopment: boolean = process.env.NODE_ENV === 'development') {
    this.secretKey = secretKey;
    this.isDevelopment = isDevelopment;
  }

  /**
   * Verify a reCAPTCHA token
   * @param token reCAPTCHA token to verify
   * @param remoteIp Optional remote IP address for additional verification
   * @returns Verification result
   */
  async verifyToken(token: string, remoteIp?: string): Promise<RecaptchaVerificationResult> {
    try {
      // Skip verification in development mode if configured to do so
      if (this.isDevelopment && process.env.SKIP_RECAPTCHA_IN_DEV === 'true') {
        console.warn('reCAPTCHA verification skipped in development mode');
        return { success: true, score: 1.0 };
      }

      if (!this.secretKey) {
        throw new Error('reCAPTCHA secret key is not configured');
      }

      // Build request body
      const body = new URLSearchParams();
      body.append('secret', this.secretKey);
      body.append('response', token);
      if (remoteIp) {
        body.append('remoteip', remoteIp);
      }

      // Send verification request
      const response = await fetch(this.verifyUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: body.toString(),
      });

      if (!response.ok) {
        throw new Error(`reCAPTCHA verification failed with status: ${response.status}`);
      }

      // Parse response
      const data = await response.json();

      // Return verification result
      return {
        success: data.success === true,
        score: data.score,
        errorCodes: data['error-codes'],
        challengeTimestamp: data.challenge_ts,
        hostname: data.hostname,
        action: data.action,
      };
    } catch (error) {
      console.error('reCAPTCHA verification error:', error);
      return {
        success: false,
        error:
          error instanceof Error ? error.message : 'Unknown error during reCAPTCHA verification',
      };
    }
  }

  /**
   * Verify a reCAPTCHA token with a minimum score threshold (for v3)
   * @param token reCAPTCHA token to verify
   * @param minScore Minimum score threshold (0.0 to 1.0)
   * @param remoteIp Optional remote IP address for additional verification
   * @returns Whether the token is valid and meets the score threshold
   */
  async verifyTokenWithScore(
    token: string,
    minScore: number = 0.5,
    remoteIp?: string
  ): Promise<RecaptchaVerificationResult> {
    const result = await this.verifyToken(token, remoteIp);

    // Check if verification was successful and score meets threshold
    if (result.success && result.score !== undefined) {
      const passesThreshold = result.score >= minScore;

      if (!passesThreshold) {
        return {
          ...result,
          success: false,
          error: `reCAPTCHA score (${result.score}) is below threshold (${minScore})`,
        };
      }
    }

    return result;
  }
}
