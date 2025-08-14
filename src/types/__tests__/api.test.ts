import type {
  AdminContentRequest,
  AdminUploadResponse,
  ApiResponse,
  AppError,
  ContactFormData,
  ContentApiParams,
  PaginationInfo,
  SearchApiRequest,
  SearchApiResponse,
  StatsUpdateRequest,
} from "../api";
import { ContentError } from "../api";

describe("types/api", () => {
  describe("ContentError", () => {
    it("should create error with message and code", () => {
      const error = new ContentError("Test error message", "TEST_ERROR");

      expect(error.message).toBe("Test error message");
      expect(error.code).toBe("TEST_ERROR");
      expect(error.name).toBe("ContentError");
      expect(error instanceof Error).toBe(true);
    });

    it("should create error with details", () => {
      const details = { field: "test", value: 123 };
      const error = new ContentError("Test error", "TEST_ERROR", details);

      expect(error.details).toEqual(details);
    });

    it("should create error without details", () => {
      const error = new ContentError("Test error", "TEST_ERROR");

      expect(error.details).toBeUndefined();
    });

    it("should be throwable", () => {
      expect(() => {
        throw new ContentError("Test error", "TEST_ERROR");
      }).toThrow("Test error");
    });

    it("should be catchable as ContentError", () => {
      try {
        throw new ContentError("Test error", "TEST_ERROR");
      } catch (error) {
        expect(error instanceof ContentError).toBe(true);
        expect((error as ContentError).code).toBe("TEST_ERROR");
      }
    });
  });

  describe("ApiResponse interface", () => {
    it("should accept success response", () => {
      const response: ApiResponse<string> = {
        success: true,
        data: "test data",
      };

      expect(response.success).toBe(true);
      expect(response.data).toBe("test data");
    });

    it("should accept error response", () => {
      const response: ApiResponse = {
        success: false,
        error: "Something went wrong",
      };

      expect(response.success).toBe(false);
      expect(response.error).toBe("Something went wrong");
    });

    it("should accept response with validation errors", () => {
      const response: ApiResponse = {
        success: false,
        errors: {
          email: "Invalid email format",
          password: "Password too short",
        },
      };

      expect(response.success).toBe(false);
      expect(response.errors).toEqual({
        email: "Invalid email format",
        password: "Password too short",
      });
    });

    it("should accept response with pagination", () => {
      const pagination: PaginationInfo = {
        limit: 10,
        offset: 0,
        total: 100,
        hasNext: true,
        hasPrev: false,
      };

      const response: ApiResponse<string[]> = {
        success: true,
        data: ["item1", "item2"],
        pagination,
      };

      expect(response.pagination).toEqual(pagination);
    });

    it("should accept response with query and filters", () => {
      const response: ApiResponse = {
        success: true,
        query: "search term",
        filters: {
          category: "portfolio",
          status: "published",
          limit: 20,
        },
      };

      expect(response.query).toBe("search term");
      expect(response.filters).toEqual({
        category: "portfolio",
        status: "published",
        limit: 20,
      });
    });
  });

  describe("ContentApiParams interface", () => {
    it("should accept all optional parameters", () => {
      const params: ContentApiParams = {
        type: "portfolio",
        category: "develop",
        limit: 10,
        offset: 0,
        status: "published",
      };

      expect(params.type).toBe("portfolio");
      expect(params.category).toBe("develop");
      expect(params.limit).toBe(10);
      expect(params.offset).toBe(0);
      expect(params.status).toBe("published");
    });

    it("should accept empty parameters", () => {
      const params: ContentApiParams = {};

      expect(Object.keys(params)).toHaveLength(0);
    });

    it("should accept partial parameters", () => {
      const params: ContentApiParams = {
        type: "blog",
        limit: 5,
      };

      expect(params.type).toBe("blog");
      expect(params.limit).toBe(5);
      expect(params.category).toBeUndefined();
    });
  });

  describe("SearchApiRequest interface", () => {
    it("should require query parameter", () => {
      const request: SearchApiRequest = {
        query: "test search",
      };

      expect(request.query).toBe("test search");
    });

    it("should accept all optional parameters", () => {
      const request: SearchApiRequest = {
        query: "test search",
        type: "portfolio",
        category: "develop",
        limit: 20,
        includeContent: true,
      };

      expect(request.type).toBe("portfolio");
      expect(request.category).toBe("develop");
      expect(request.limit).toBe(20);
      expect(request.includeContent).toBe(true);
    });
  });

  describe("SearchApiResponse interface", () => {
    it("should extend ApiResponse with search-specific fields", () => {
      const response: SearchApiResponse = {
        success: true,
        data: [
          {
            id: "1",
            type: "portfolio",
            title: "Test Item",
            description: "Test Description",
            url: "/portfolio/test",
            score: 0.95,
            highlights: ["Test <mark>search</mark> result"],
          },
        ],
        query: "search",
        filters: {
          type: "portfolio",
        },
      };

      expect(response.query).toBe("search");
      expect(response.filters.type).toBe("portfolio");
      expect(response.data).toHaveLength(1);
    });
  });

  describe("StatsUpdateRequest interface", () => {
    it("should require id parameter", () => {
      const request: StatsUpdateRequest = {
        id: "test-id",
      };

      expect(request.id).toBe("test-id");
    });

    it("should accept type parameter", () => {
      const request: StatsUpdateRequest = {
        id: "test-id",
        type: "download",
      };

      expect(request.type).toBe("download");
    });
  });

  describe("ContactFormData interface", () => {
    it("should require all fields", () => {
      const formData: ContactFormData = {
        name: "John Doe",
        email: "john@example.com",
        subject: "Test Subject",
        message: "Test message content",
        type: "technical",
        recaptchaToken: "recaptcha-token",
      };

      expect(formData.name).toBe("John Doe");
      expect(formData.email).toBe("john@example.com");
      expect(formData.subject).toBe("Test Subject");
      expect(formData.message).toBe("Test message content");
      expect(formData.type).toBe("technical");
      expect(formData.recaptchaToken).toBe("recaptcha-token");
    });

    it("should accept different contact types", () => {
      const technicalForm: ContactFormData = {
        name: "John",
        email: "john@example.com",
        subject: "Technical Issue",
        message: "Message",
        type: "technical",
        recaptchaToken: "token",
      };

      const designForm: ContactFormData = {
        name: "Jane",
        email: "jane@example.com",
        subject: "Design Question",
        message: "Message",
        type: "design",
        recaptchaToken: "token",
      };

      const generalForm: ContactFormData = {
        name: "Bob",
        email: "bob@example.com",
        subject: "General Inquiry",
        message: "Message",
        type: "general",
        recaptchaToken: "token",
      };

      expect(technicalForm.type).toBe("technical");
      expect(designForm.type).toBe("design");
      expect(generalForm.type).toBe("general");
    });
  });

  describe("AdminContentRequest interface", () => {
    it("should accept create action", () => {
      const request: AdminContentRequest = {
        action: "create",
        data: {
          title: "New Content",
          description: "New content description",
          type: "portfolio",
        },
      };

      expect(request.action).toBe("create");
      expect(request.data.title).toBe("New Content");
    });

    it("should accept update action", () => {
      const request: AdminContentRequest = {
        action: "update",
        data: {
          id: "existing-id",
          title: "Updated Title",
        },
      };

      expect(request.action).toBe("update");
      expect(request.data.id).toBe("existing-id");
    });

    it("should accept delete action", () => {
      const request: AdminContentRequest = {
        action: "delete",
        data: {
          id: "delete-id",
        },
      };

      expect(request.action).toBe("delete");
      expect(request.data.id).toBe("delete-id");
    });
  });

  describe("AdminUploadResponse interface", () => {
    it("should extend ApiResponse with file data", () => {
      const response: AdminUploadResponse = {
        success: true,
        data: {
          filePath: "/uploads/image.jpg",
          fileName: "image.jpg",
          fileSize: 1024000,
          fileType: "image/jpeg",
        },
      };

      expect(response.success).toBe(true);
      expect(response.data?.filePath).toBe("/uploads/image.jpg");
      expect(response.data?.fileName).toBe("image.jpg");
      expect(response.data?.fileSize).toBe(1024000);
      expect(response.data?.fileType).toBe("image/jpeg");
    });

    it("should accept error response", () => {
      const response: AdminUploadResponse = {
        success: false,
        error: "File upload failed",
      };

      expect(response.success).toBe(false);
      expect(response.error).toBe("File upload failed");
      expect(response.data).toBeUndefined();
    });
  });

  describe("AppError interface", () => {
    it("should require all fields", () => {
      const error: AppError = {
        code: "VALIDATION_ERROR",
        message: "Validation failed",
        details: { field: "email", reason: "invalid format" },
        timestamp: "2023-01-01T00:00:00Z",
      };

      expect(error.code).toBe("VALIDATION_ERROR");
      expect(error.message).toBe("Validation failed");
      expect(error.details).toEqual({
        field: "email",
        reason: "invalid format",
      });
      expect(error.timestamp).toBe("2023-01-01T00:00:00Z");
    });

    it("should accept error without details", () => {
      const error: AppError = {
        code: "GENERIC_ERROR",
        message: "Something went wrong",
        timestamp: "2023-01-01T00:00:00Z",
      };

      expect(error.details).toBeUndefined();
    });
  });
});
