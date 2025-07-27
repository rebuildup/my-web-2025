/**
 * OGP Manager Tests
 * Task 9.3.1 - OGP image management tests
 */

import { ogpManager } from "../ogp-manager";
import { adminUtils } from "../utils";

// Mock dependencies
jest.mock("../utils", () => ({
  adminUtils: {
    validateAdminRequest: jest.fn(),
    logAdminAction: jest.fn(),
  },
  AdminError: class AdminError extends Error {
    constructor(
      message: string,
      public code: string,
      public statusCode: number = 500,
    ) {
      super(message);
      this.name = "AdminError";
    }
  },
  ADMIN_CONSTANTS: {
    DIRECTORIES: {
      OG_IMAGES: "public/images/og-images",
    },
  },
}));

jest.mock("fs", () => ({
  promises: {
    writeFile: jest.fn(),
    mkdir: jest.fn(),
    readFile: jest.fn(),
    unlink: jest.fn(),
    access: jest.fn(),
  },
}));

// Mock File constructor for Node.js environment
global.File = class File {
  constructor(
    public content: string[],
    public name: string,
    public options: { type: string },
  ) {}
  get size() {
    return this.content.join("").length;
  }
  get type() {
    return this.options.type;
  }
  arrayBuffer() {
    return Promise.resolve(new ArrayBuffer(this.size));
  }
} as unknown as typeof File;

describe("OGPManager", () => {
  const mockFile = new File(["test content"], "test-image.png", {
    type: "image/png",
  });

  beforeEach(() => {
    jest.clearAllMocks();
    (adminUtils.validateAdminRequest as jest.Mock).mockReturnValue({
      valid: true,
    });
  });

  describe("uploadOGPImage", () => {
    it("should upload OGP image successfully", async () => {
      const fs = jest.requireMock("fs").promises;
      fs.mkdir.mockResolvedValue(undefined);
      fs.writeFile.mockResolvedValue(undefined);
      fs.readFile.mockResolvedValue("[]");

      const result = await ogpManager.uploadOGPImage(
        mockFile,
        "test-image.png",
      );

      expect(result.success).toBe(true);
      expect(result.imageInfo).toBeDefined();
      expect(result.imageInfo?.fileName).toContain("test-image");
      expect(result.errors).toHaveLength(0);
      expect(adminUtils.logAdminAction).toHaveBeenCalledWith(
        "OGP image uploaded",
        expect.any(Object),
      );
    });

    it("should fail when admin access is denied", async () => {
      (adminUtils.validateAdminRequest as jest.Mock).mockReturnValue({
        valid: false,
        error: "Access denied",
      });

      const result = await ogpManager.uploadOGPImage(
        mockFile,
        "test-image.png",
      );

      expect(result.success).toBe(false);
      expect(result.errors).toContain("Access denied");
    });

    it("should validate file format", async () => {
      const invalidFile = new File(["test"], "test.txt", {
        type: "text/plain",
      });

      const result = await ogpManager.uploadOGPImage(invalidFile, "test.txt");

      expect(result.success).toBe(false);
      expect(
        result.errors.some((error) =>
          error.includes("Unsupported file format"),
        ),
      ).toBe(true);
    });

    it("should validate file size", async () => {
      // Create a mock file that's too large
      const largeContent = new Array(6 * 1024 * 1024).fill("a").join(""); // 6MB
      const largeFile = new File([largeContent], "large-image.png", {
        type: "image/png",
      });

      const result = await ogpManager.uploadOGPImage(
        largeFile,
        "large-image.png",
      );

      expect(result.success).toBe(false);
      expect(
        result.errors.some((error) => error.includes("File size too large")),
      ).toBe(true);
    });
  });

  describe("associateImageWithContent", () => {
    it("should associate image with content successfully", async () => {
      const fs = jest.requireMock("fs").promises;
      const mockImageInfo = {
        id: "ogp_123",
        fileName: "test.png",
        associatedContent: [],
      };
      fs.readFile.mockResolvedValue(JSON.stringify([mockImageInfo]));
      fs.writeFile.mockResolvedValue(undefined);

      const result = await ogpManager.associateImageWithContent(
        "ogp_123",
        "content_456",
      );

      expect(result).toBe(true);
      expect(adminUtils.logAdminAction).toHaveBeenCalledWith(
        "OGP image associated",
        expect.any(Object),
      );
    });

    it("should fail when image not found", async () => {
      const fs = jest.requireMock("fs").promises;
      fs.readFile.mockResolvedValue("[]");

      const result = await ogpManager.associateImageWithContent(
        "nonexistent",
        "content_456",
      );

      expect(result).toBe(false);
    });
  });

  describe("listOGPImages", () => {
    it("should list OGP images successfully", async () => {
      const fs = jest.requireMock("fs").promises;
      const mockImages = [
        { id: "ogp_1", fileName: "image1.png" },
        { id: "ogp_2", fileName: "image2.png" },
      ];
      fs.readFile.mockResolvedValue(JSON.stringify(mockImages));

      const result = await ogpManager.listOGPImages();

      expect(result).toEqual(mockImages);
    });

    it("should return empty array when no images exist", async () => {
      const fs = jest.requireMock("fs").promises;
      fs.readFile.mockRejectedValue(new Error("File not found"));

      const result = await ogpManager.listOGPImages();

      expect(result).toEqual([]);
    });
  });

  describe("deleteOGPImage", () => {
    it("should delete OGP image successfully", async () => {
      const fs = jest.requireMock("fs").promises;
      const mockImageInfo = {
        id: "ogp_123",
        fileName: "test.png",
        filePath: "/path/to/test.png",
      };
      fs.readFile.mockResolvedValue(JSON.stringify([mockImageInfo]));
      fs.unlink.mockResolvedValue(undefined);
      fs.writeFile.mockResolvedValue(undefined);

      const result = await ogpManager.deleteOGPImage("ogp_123");

      expect(result).toBe(true);
      expect(fs.unlink).toHaveBeenCalledWith(mockImageInfo.filePath);
      expect(adminUtils.logAdminAction).toHaveBeenCalledWith(
        "OGP image deleted",
        expect.any(Object),
      );
    });

    it("should fail when image not found", async () => {
      const fs = jest.requireMock("fs").promises;
      fs.readFile.mockResolvedValue("[]");

      const result = await ogpManager.deleteOGPImage("nonexistent");

      expect(result).toBe(false);
    });
  });

  describe("getOGPImage", () => {
    it("should get OGP image by ID", async () => {
      const fs = jest.requireMock("fs").promises;
      const mockImageInfo = {
        id: "ogp_123",
        fileName: "test.png",
      };
      fs.readFile.mockResolvedValue(JSON.stringify([mockImageInfo]));

      const result = await ogpManager.getOGPImage("ogp_123");

      expect(result).toEqual(mockImageInfo);
    });

    it("should return null when image not found", async () => {
      const fs = jest.requireMock("fs").promises;
      fs.readFile.mockResolvedValue("[]");

      const result = await ogpManager.getOGPImage("nonexistent");

      expect(result).toBeNull();
    });
  });
});
