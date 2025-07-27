/**
 * OGP Image Management System
 * Handles Open Graph Protocol image management and generation
 * Task 9.3.1 - OGP image management and generation
 */

import { promises as fs } from "fs";
import path from "path";
import type { ContentItem } from "@/types";
import { adminUtils, AdminError, ADMIN_CONSTANTS } from "./utils";

// OGP configuration
const OGP_CONFIG = {
  IMAGES_DIR: path.join(process.cwd(), ADMIN_CONSTANTS.DIRECTORIES.OG_IMAGES),
  DEFAULT_WIDTH: 1200,
  DEFAULT_HEIGHT: 630,
  SUPPORTED_FORMATS: [".jpg", ".jpeg", ".png", ".webp"],
  MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
} as const;

export interface OGPImageInfo {
  id: string;
  fileName: string;
  filePath: string;
  url: string;
  width: number;
  height: number;
  fileSize: number;
  contentType: string;
  createdAt: string;
  associatedContent?: string[];
}

export interface OGPProcessingResult {
  success: boolean;
  imageInfo?: OGPImageInfo;
  errors: string[];
  warnings: string[];
}

/**
 * OGP Image Manager
 */
export class OGPManager {
  private static instance: OGPManager;

  private constructor() {}

  public static getInstance(): OGPManager {
    if (!OGPManager.instance) {
      OGPManager.instance = new OGPManager();
    }
    return OGPManager.instance;
  }

  /**
   * Upload and process OGP image
   */
  async uploadOGPImage(
    file: File | Buffer,
    fileName: string,
    contentId?: string,
  ): Promise<OGPProcessingResult> {
    const result: OGPProcessingResult = {
      success: false,
      errors: [],
      warnings: [],
    };

    try {
      // Validate admin access
      const validation = adminUtils.validateAdminRequest();
      if (!validation.valid) {
        throw new AdminError(
          validation.error || "Admin access denied",
          "ACCESS_DENIED",
          403,
        );
      }

      // Validate file
      await this.validateOGPImage(file, fileName);

      // Ensure OGP directory exists
      await fs.mkdir(OGP_CONFIG.IMAGES_DIR, { recursive: true });

      // Generate unique filename
      const uniqueFileName = await this.generateUniqueFileName(fileName);
      const filePath = path.join(OGP_CONFIG.IMAGES_DIR, uniqueFileName);

      // Save file
      let fileBuffer: Buffer;
      if (file instanceof Buffer) {
        fileBuffer = file;
      } else {
        fileBuffer = Buffer.from(await (file as File).arrayBuffer());
      }

      await fs.writeFile(filePath, fileBuffer);

      // Get image dimensions (placeholder - would use image processing library in real implementation)
      const dimensions = await this.getImageDimensions(filePath);

      // Create image info
      const imageInfo: OGPImageInfo = {
        id: this.generateImageId(),
        fileName: uniqueFileName,
        filePath,
        url: `/images/og-images/${uniqueFileName}`,
        width: dimensions.width,
        height: dimensions.height,
        fileSize: fileBuffer.length,
        contentType: this.getContentType(fileName),
        createdAt: new Date().toISOString(),
        associatedContent: contentId ? [contentId] : [],
      };

      // Update image registry
      await this.updateImageRegistry(imageInfo);

      result.success = true;
      result.imageInfo = imageInfo;

      adminUtils.logAdminAction("OGP image uploaded", {
        fileName: uniqueFileName,
        contentId,
        fileSize: fileBuffer.length,
      });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      result.errors.push(errorMessage);
      adminUtils.logAdminAction("OGP image upload failed", {
        fileName,
        error: errorMessage,
      });
    }

    return result;
  }

  /**
   * Associate OGP image with content
   */
  async associateImageWithContent(
    imageId: string,
    contentId: string,
  ): Promise<boolean> {
    try {
      const validation = adminUtils.validateAdminRequest();
      if (!validation.valid) {
        throw new AdminError(
          validation.error || "Admin access denied",
          "ACCESS_DENIED",
          403,
        );
      }

      const registry = await this.loadImageRegistry();
      const imageInfo = registry.find((img) => img.id === imageId);

      if (!imageInfo) {
        throw new AdminError("OGP image not found", "NOT_FOUND", 404);
      }

      if (!imageInfo.associatedContent) {
        imageInfo.associatedContent = [];
      }

      if (!imageInfo.associatedContent.includes(contentId)) {
        imageInfo.associatedContent.push(contentId);
        await this.updateImageRegistry(imageInfo);
      }

      adminUtils.logAdminAction("OGP image associated", { imageId, contentId });
      return true;
    } catch (error) {
      adminUtils.logAdminAction("OGP image association failed", {
        imageId,
        contentId,
        error: error instanceof Error ? error.message : "Unknown error",
      });
      return false;
    }
  }

  /**
   * Generate OGP image for content (placeholder for future implementation)
   */
  async generateOGPImage(content: ContentItem): Promise<OGPProcessingResult> {
    const result: OGPProcessingResult = {
      success: false,
      errors: [],
      warnings: [],
    };

    try {
      const validation = adminUtils.validateAdminRequest();
      if (!validation.valid) {
        throw new AdminError(
          validation.error || "Admin access denied",
          "ACCESS_DENIED",
          403,
        );
      }

      // This is a placeholder for automatic OGP image generation
      // In a real implementation, this would use a library like Canvas or Puppeteer
      // to generate images with content title, description, and branding

      result.warnings.push(
        "Automatic OGP image generation not yet implemented",
      );

      adminUtils.logAdminAction("OGP image generation requested", {
        contentId: content.id,
        contentType: content.type,
      });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      result.errors.push(errorMessage);
    }

    return result;
  }

  /**
   * List all OGP images
   */
  async listOGPImages(): Promise<OGPImageInfo[]> {
    try {
      const validation = adminUtils.validateAdminRequest();
      if (!validation.valid) {
        return [];
      }

      return await this.loadImageRegistry();
    } catch (error) {
      adminUtils.logAdminAction("OGP image listing failed", {
        error: error instanceof Error ? error.message : "Unknown error",
      });
      return [];
    }
  }

  /**
   * Delete OGP image
   */
  async deleteOGPImage(imageId: string): Promise<boolean> {
    try {
      const validation = adminUtils.validateAdminRequest();
      if (!validation.valid) {
        throw new AdminError(
          validation.error || "Admin access denied",
          "ACCESS_DENIED",
          403,
        );
      }

      const registry = await this.loadImageRegistry();
      const imageIndex = registry.findIndex((img) => img.id === imageId);

      if (imageIndex === -1) {
        throw new AdminError("OGP image not found", "NOT_FOUND", 404);
      }

      const imageInfo = registry[imageIndex];

      // Delete physical file
      try {
        await fs.unlink(imageInfo.filePath);
      } catch (error) {
        // File might already be deleted, log but continue
        adminUtils.logAdminAction("OGP image file deletion warning", {
          imageId,
          error: error instanceof Error ? error.message : "Unknown error",
        });
      }

      // Remove from registry
      registry.splice(imageIndex, 1);
      await this.saveImageRegistry(registry);

      adminUtils.logAdminAction("OGP image deleted", {
        imageId,
        fileName: imageInfo.fileName,
      });
      return true;
    } catch (error) {
      adminUtils.logAdminAction("OGP image deletion failed", {
        imageId,
        error: error instanceof Error ? error.message : "Unknown error",
      });
      return false;
    }
  }

  /**
   * Get OGP image by ID
   */
  async getOGPImage(imageId: string): Promise<OGPImageInfo | null> {
    try {
      const validation = adminUtils.validateAdminRequest();
      if (!validation.valid) {
        return null;
      }

      const registry = await this.loadImageRegistry();
      return registry.find((img) => img.id === imageId) || null;
    } catch {
      return null;
    }
  }

  /**
   * Validate OGP image file
   */
  private async validateOGPImage(
    file: File | Buffer,
    fileName: string,
  ): Promise<void> {
    const fileExtension = path.extname(fileName).toLowerCase();

    if (
      !OGP_CONFIG.SUPPORTED_FORMATS.includes(
        fileExtension as ".jpg" | ".jpeg" | ".png" | ".webp",
      )
    ) {
      throw new AdminError(
        `Unsupported file format. Supported formats: ${OGP_CONFIG.SUPPORTED_FORMATS.join(", ")}`,
        "INVALID_FORMAT",
        400,
      );
    }

    const fileSize = file instanceof Buffer ? file.length : (file as File).size;
    if (fileSize > OGP_CONFIG.MAX_FILE_SIZE) {
      throw new AdminError(
        `File size too large. Maximum size: ${OGP_CONFIG.MAX_FILE_SIZE / 1024 / 1024}MB`,
        "FILE_TOO_LARGE",
        400,
      );
    }
  }

  /**
   * Generate unique filename
   */
  private async generateUniqueFileName(
    originalFileName: string,
  ): Promise<string> {
    const extension = path.extname(originalFileName);
    const baseName = path.basename(originalFileName, extension);
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8);

    return `${baseName}_${timestamp}_${random}${extension}`;
  }

  /**
   * Get image dimensions (placeholder implementation)
   */
  private async getImageDimensions(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _filePath: string,
  ): Promise<{ width: number; height: number }> {
    // This is a placeholder - in a real implementation, you would use an image processing library
    // like sharp or jimp to get actual image dimensions
    return {
      width: OGP_CONFIG.DEFAULT_WIDTH,
      height: OGP_CONFIG.DEFAULT_HEIGHT,
    };
  }

  /**
   * Get content type from filename
   */
  private getContentType(fileName: string): string {
    const extension = path.extname(fileName).toLowerCase();
    const contentTypes: Record<string, string> = {
      ".jpg": "image/jpeg",
      ".jpeg": "image/jpeg",
      ".png": "image/png",
      ".webp": "image/webp",
    };
    return contentTypes[extension] || "application/octet-stream";
  }

  /**
   * Generate unique image ID
   */
  private generateImageId(): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8);
    return `ogp_${timestamp}_${random}`;
  }

  /**
   * Load image registry
   */
  private async loadImageRegistry(): Promise<OGPImageInfo[]> {
    try {
      const registryPath = path.join(OGP_CONFIG.IMAGES_DIR, "registry.json");
      const data = await fs.readFile(registryPath, "utf-8");
      return JSON.parse(data);
    } catch {
      return [];
    }
  }

  /**
   * Save image registry
   */
  private async saveImageRegistry(registry: OGPImageInfo[]): Promise<void> {
    const registryPath = path.join(OGP_CONFIG.IMAGES_DIR, "registry.json");
    await fs.writeFile(
      registryPath,
      JSON.stringify(registry, null, 2),
      "utf-8",
    );
  }

  /**
   * Update image registry with new or updated image info
   */
  private async updateImageRegistry(imageInfo: OGPImageInfo): Promise<void> {
    const registry = await this.loadImageRegistry();
    const existingIndex = registry.findIndex((img) => img.id === imageInfo.id);

    if (existingIndex >= 0) {
      registry[existingIndex] = imageInfo;
    } else {
      registry.push(imageInfo);
    }

    await this.saveImageRegistry(registry);
  }
}

// Export singleton instance
export const ogpManager = OGPManager.getInstance();
