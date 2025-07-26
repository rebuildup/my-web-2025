/**
 * Admin utility functions for development environment
 */

// Environment checks
export const adminUtils = {
  /**
   * Check if running in development environment
   */
  isDevelopment(): boolean {
    return process.env.NODE_ENV === "development";
  },

  /**
   * Check if admin access is allowed
   */
  isAdminAccessAllowed(): boolean {
    return this.isDevelopment();
  },

  /**
   * Get system information
   */
  getSystemInfo() {
    if (typeof window !== "undefined") {
      // Client-side system info
      return {
        userAgent: navigator.userAgent,
        language: navigator.language,
        platform: navigator.platform,
        cookieEnabled: navigator.cookieEnabled,
        onLine: navigator.onLine,
        timestamp: new Date().toISOString(),
      };
    } else {
      // Server-side system info
      return {
        nodeVersion: process.version,
        platform: process.platform,
        arch: process.arch,
        uptime: process.uptime(),
        memoryUsage: process.memoryUsage(),
        timestamp: new Date().toISOString(),
      };
    }
  },

  /**
   * Format uptime in human readable format
   */
  formatUptime(seconds: number): string {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);

    if (hours > 0) {
      return `${hours}h ${minutes}m ${secs}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${secs}s`;
    } else {
      return `${secs}s`;
    }
  },

  /**
   * Format memory usage in human readable format
   */
  formatMemoryUsage(bytes: number): string {
    const mb = bytes / 1024 / 1024;
    return `${mb.toFixed(2)} MB`;
  },

  /**
   * Log admin action (development only)
   */
  logAdminAction(action: string, details?: unknown): void {
    if (this.isDevelopment()) {
      console.log(`[ADMIN] ${action}`, details ? details : "");
    }
  },

  /**
   * Validate admin request
   */
  validateAdminRequest(request?: Request): { valid: boolean; error?: string } {
    if (!this.isDevelopment()) {
      return {
        valid: false,
        error:
          "Admin functionality is only available in development environment",
      };
    }

    if (request) {
      const url = new URL(request.url);
      const isLocalhost =
        url.hostname === "localhost" ||
        url.hostname === "127.0.0.1" ||
        url.hostname === "::1";

      if (!isLocalhost) {
        return {
          valid: false,
          error: "Admin functionality is only accessible from localhost",
        };
      }
    }

    return { valid: true };
  },

  /**
   * Create admin response with security headers
   */
  createAdminResponse(data: unknown, status: number = 200): unknown {
    // In test environment, return a mock response object
    if (typeof Response === "undefined") {
      const headers = new Map([
        ["Content-Type", "application/json"],
        ["Cache-Control", "no-store, no-cache, must-revalidate"],
        ["X-Robots-Tag", "noindex, nofollow"],
        ["X-Frame-Options", "DENY"],
        ["X-Content-Type-Options", "nosniff"],
      ]);

      return {
        status,
        headers,
        json: () => Promise.resolve(data),
        text: () => Promise.resolve(JSON.stringify(data)),
        get(key: string) {
          return headers.get(key);
        },
      };
    }

    const response = new Response(JSON.stringify(data), {
      status,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-store, no-cache, must-revalidate",
        "X-Robots-Tag": "noindex, nofollow",
        "X-Frame-Options": "DENY",
        "X-Content-Type-Options": "nosniff",
      },
    });

    return response;
  },
};

// Admin error types
export class AdminError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 500,
  ) {
    super(message);
    this.name = "AdminError";
  }
}

// Admin error handler
export const adminErrorHandler = {
  handle(error: unknown): { error: string; code: string; statusCode: number } {
    if (error instanceof AdminError) {
      return {
        error: error.message,
        code: error.code,
        statusCode: error.statusCode,
      };
    }

    // Generic error handling
    return {
      error: "An unexpected admin error occurred",
      code: "ADMIN_ERROR",
      statusCode: 500,
    };
  },
};

// Admin constants
export const ADMIN_CONSTANTS = {
  PATHS: {
    ADMIN_ROOT: "/admin",
    DATA_MANAGER: "/admin/data-manager",
    API_ROOT: "/api/admin",
    STATUS_API: "/api/admin/status",
  },
  DIRECTORIES: {
    PUBLIC_DATA: "public/data",
    PUBLIC_IMAGES: "public/images",
    PUBLIC_VIDEOS: "public/videos",
    PUBLIC_DOWNLOADS: "public/downloads",
    OG_IMAGES: "public/images/og-images",
    FAVICONS: "public/favicons",
  },
  FILE_LIMITS: {
    MAX_IMAGE_SIZE: 10 * 1024 * 1024, // 10MB
    MAX_VIDEO_SIZE: 100 * 1024 * 1024, // 100MB
    MAX_FILE_SIZE: 50 * 1024 * 1024, // 50MB
  },
  ALLOWED_TYPES: {
    IMAGES: [
      "image/jpeg",
      "image/png",
      "image/webp",
      "image/gif",
      "image/svg+xml",
    ],
    VIDEOS: ["video/mp4", "video/webm", "video/ogg"],
    DOCUMENTS: ["application/pdf", "text/plain", "text/markdown"],
  },
} as const;
