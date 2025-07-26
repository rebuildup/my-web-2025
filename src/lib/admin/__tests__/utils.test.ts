import { AdminError, adminErrorHandler, ADMIN_CONSTANTS } from "../utils";

describe("Admin Utils", () => {
  describe("Utility Functions", () => {
    it("should format uptime correctly", async () => {
      const { adminUtils } = await import("../utils");
      expect(adminUtils.formatUptime(30)).toBe("30s");
      expect(adminUtils.formatUptime(90)).toBe("1m 30s");
      expect(adminUtils.formatUptime(3661)).toBe("1h 1m 1s");
    });

    it("should format memory usage correctly", async () => {
      const { adminUtils } = await import("../utils");
      expect(adminUtils.formatMemoryUsage(1024 * 1024)).toBe("1.00 MB");
      expect(adminUtils.formatMemoryUsage(1024 * 1024 * 2.5)).toBe("2.50 MB");
    });
  });
});

describe("AdminError", () => {
  it("should create admin error with message and code", () => {
    const error = new AdminError("Test error", "TEST_ERROR");

    expect(error.message).toBe("Test error");
    expect(error.code).toBe("TEST_ERROR");
    expect(error.statusCode).toBe(500);
    expect(error.name).toBe("AdminError");
  });

  it("should create admin error with custom status code", () => {
    const error = new AdminError("Test error", "TEST_ERROR", 400);

    expect(error.statusCode).toBe(400);
  });
});

describe("Admin Error Handler", () => {
  it("should handle AdminError correctly", () => {
    const adminError = new AdminError("Test admin error", "ADMIN_TEST", 400);
    const result = adminErrorHandler.handle(adminError);

    expect(result.error).toBe("Test admin error");
    expect(result.code).toBe("ADMIN_TEST");
    expect(result.statusCode).toBe(400);
  });

  it("should handle generic errors", () => {
    const genericError = new Error("Generic error");
    const result = adminErrorHandler.handle(genericError);

    expect(result.error).toBe("An unexpected admin error occurred");
    expect(result.code).toBe("ADMIN_ERROR");
    expect(result.statusCode).toBe(500);
  });
});

describe("Admin Constants", () => {
  it("should have correct admin paths", () => {
    expect(ADMIN_CONSTANTS.PATHS.ADMIN_ROOT).toBe("/admin");
    expect(ADMIN_CONSTANTS.PATHS.DATA_MANAGER).toBe("/admin/data-manager");
    expect(ADMIN_CONSTANTS.PATHS.API_ROOT).toBe("/api/admin");
    expect(ADMIN_CONSTANTS.PATHS.STATUS_API).toBe("/api/admin/status");
  });

  it("should have correct directory paths", () => {
    expect(ADMIN_CONSTANTS.DIRECTORIES.PUBLIC_DATA).toBe("public/data");
    expect(ADMIN_CONSTANTS.DIRECTORIES.PUBLIC_IMAGES).toBe("public/images");
    expect(ADMIN_CONSTANTS.DIRECTORIES.OG_IMAGES).toBe(
      "public/images/og-images",
    );
    expect(ADMIN_CONSTANTS.DIRECTORIES.FAVICONS).toBe("public/favicons");
  });

  it("should have reasonable file size limits", () => {
    expect(ADMIN_CONSTANTS.FILE_LIMITS.MAX_IMAGE_SIZE).toBe(10 * 1024 * 1024);
    expect(ADMIN_CONSTANTS.FILE_LIMITS.MAX_VIDEO_SIZE).toBe(100 * 1024 * 1024);
    expect(ADMIN_CONSTANTS.FILE_LIMITS.MAX_FILE_SIZE).toBe(50 * 1024 * 1024);
  });

  it("should have correct allowed file types", () => {
    expect(ADMIN_CONSTANTS.ALLOWED_TYPES.IMAGES).toContain("image/jpeg");
    expect(ADMIN_CONSTANTS.ALLOWED_TYPES.IMAGES).toContain("image/png");
    expect(ADMIN_CONSTANTS.ALLOWED_TYPES.VIDEOS).toContain("video/mp4");
    expect(ADMIN_CONSTANTS.ALLOWED_TYPES.DOCUMENTS).toContain(
      "application/pdf",
    );
  });
});
