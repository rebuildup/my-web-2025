/**
 * @jest-environment jsdom
 */

import {
  errorHandler,
  AppError,
  ContentError,
  ValidationError,
  errorBoundaryUtils,
  fallbackStrategies,
  recoveryOptions,
  errorReporting,
} from "../error-handling";

describe("Error Handling Utilities", () => {
  beforeEach(() => {
    jest
      .spyOn(Date.prototype, "toISOString")
      .mockReturnValue("2023-12-25T10:30:00.000Z");
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe("Custom Error Classes", () => {
    it("should create ContentError", () => {
      const error = new ContentError("Content not found", "CONTENT_NOT_FOUND", {
        id: "123",
      });
      expect(error.message).toBe("Content not found");
      expect(error.code).toBe("CONTENT_NOT_FOUND");
      expect(error.details).toEqual({ id: "123" });
      expect(error.name).toBe("ContentError");
    });

    it("should create ValidationError", () => {
      const error = new ValidationError("Invalid email", "email", "invalid@");
      expect(error.message).toBe("Invalid email");
      expect(error.field).toBe("email");
      expect(error.value).toBe("invalid@");
      expect(error.name).toBe("ValidationError");
    });
  });

  describe("errorHandler", () => {
    describe("handleApiError", () => {
      it("should handle ContentError", () => {
        const contentError = new ContentError(
          "Content not found",
          "CONTENT_NOT_FOUND",
          { id: "123" },
        );
        const result = errorHandler.handleApiError(contentError);

        expect(result.code).toBe("CONTENT_NOT_FOUND");
        expect(result.message).toBe("Content not found");
        expect(result.details).toEqual({ id: "123" });
        expect(result.timestamp).toBe("2023-12-25T10:30:00.000Z");
      });

      it("should handle generic Error", () => {
        const genericError = new Error("Generic error message");
        const result = errorHandler.handleApiError(genericError);

        expect(result.code).toBe("UNKNOWN_ERROR");
        expect(result.message).toBe("Generic error message");
        expect(result.timestamp).toBe("2023-12-25T10:30:00.000Z");
      });
    });

    describe("createUserFriendlyMessage", () => {
      it("should return user-friendly messages for known error codes", () => {
        const error: AppError = {
          code: "CONTENT_NOT_FOUND",
          message: "Content not found",
          timestamp: "2023-12-25T10:30:00.000Z",
        };

        const message = errorHandler.createUserFriendlyMessage(error);
        expect(message).toBe("The requested content could not be found.");
      });

      it("should return generic message for unknown error codes", () => {
        const error: AppError = {
          code: "UNKNOWN_CODE",
          message: "Unknown error",
          timestamp: "2023-12-25T10:30:00.000Z",
        };

        const message = errorHandler.createUserFriendlyMessage(error);
        expect(message).toBe("An unexpected error occurred. Please try again.");
      });
    });

    describe("safeAsync", () => {
      it("should return data on success", async () => {
        const operation = jest.fn().mockResolvedValue("success");
        const result = await errorHandler.safeAsync(operation);

        expect(result.data).toBe("success");
        expect(result.error).toBeUndefined();
      });

      it("should return error on failure", async () => {
        const operation = jest.fn().mockRejectedValue(new Error("Failed"));
        const result = await errorHandler.safeAsync(operation);

        expect(result.data).toBeUndefined();
        expect(result.error).toBeDefined();
        expect(result.error?.code).toBe("UNKNOWN_ERROR");
      });
    });
  });

  describe("Error Boundary Utils", () => {
    it("should create initial error boundary state", () => {
      const state = errorBoundaryUtils.createErrorBoundaryState();
      expect(state.hasError).toBe(false);
    });

    it("should handle error boundary error", () => {
      const error = new Error("Component error");
      const errorInfo = { componentStack: "test" };

      const state = errorBoundaryUtils.handleErrorBoundaryError(
        error,
        errorInfo,
      );

      expect(state.hasError).toBe(true);
      expect(state.error).toBe(error);
      expect(state.errorInfo).toBe(errorInfo);
    });
  });

  describe("Fallback Strategies", () => {
    it("should provide content loading fallback", () => {
      const fallback = fallbackStrategies.contentLoadingFallback;
      expect(fallback.title).toBe("Content Unavailable");
      expect(fallback.tags).toEqual([]);
    });

    it("should provide search fallback", () => {
      const fallback = fallbackStrategies.searchFallback("test query");
      expect(fallback.results).toEqual([]);
      expect(fallback.message).toContain("test query");
      expect(fallback.suggestions).toBeInstanceOf(Array);
    });
  });

  describe("Recovery Options", () => {
    it("should provide recovery actions for different error types", () => {
      const networkError: AppError = {
        code: "NETWORK_ERROR",
        message: "Network failed",
        timestamp: "2023-12-25T10:30:00.000Z",
      };

      const actions = recoveryOptions.getRecoveryActions(networkError);
      expect(actions).toHaveLength(1);
      expect(actions[0].label).toBe("Retry");
    });
  });

  describe("Error Reporting", () => {
    it("should collect error context", () => {
      const context = errorReporting.collectErrorContext();

      expect(context.timestamp).toBeDefined();
      expect(context.environment).toBeDefined();
      expect(context.userAgent).toBeDefined();
      expect(context.url).toBeDefined();
    });
  });
});
