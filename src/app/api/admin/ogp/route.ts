/**
 * OGP Image Management API Route
 * Handles OGP image upload, management, and generation
 * Task 9.3.1 - OGP image management API
 */

import { NextRequest } from "next/server";
import { ogpManager } from "@/lib/admin/ogp-manager";
import { adminUtils, adminErrorHandler } from "@/lib/admin/utils";

/**
 * Upload OGP image
 * POST /api/admin/ogp
 */
export async function POST(request: NextRequest): Promise<Response> {
  try {
    // Validate admin access
    const validation = adminUtils.validateAdminRequest(request);
    if (!validation.valid) {
      return adminUtils.createAdminResponse(
        { error: validation.error },
        403,
      ) as Response;
    }

    const formData = await request.formData();
    const file = formData.get("file") as File;
    const contentId = formData.get("contentId") as string;

    if (!file) {
      return adminUtils.createAdminResponse(
        { error: "File is required" },
        400,
      ) as Response;
    }

    // Upload and process OGP image
    const result = await ogpManager.uploadOGPImage(file, file.name, contentId);

    return adminUtils.createAdminResponse({
      success: result.success,
      imageInfo: result.imageInfo,
      errors: result.errors,
      warnings: result.warnings,
    }) as Response;
  } catch (error) {
    const errorResponse = adminErrorHandler.handle(error);
    return adminUtils.createAdminResponse(
      errorResponse,
      errorResponse.statusCode,
    ) as Response;
  }
}

/**
 * List OGP images
 * GET /api/admin/ogp
 */
export async function GET(request: NextRequest): Promise<Response> {
  try {
    // Validate admin access
    const validation = adminUtils.validateAdminRequest(request);
    if (!validation.valid) {
      return adminUtils.createAdminResponse(
        { error: validation.error },
        403,
      ) as Response;
    }

    const { searchParams } = new URL(request.url);
    const imageId = searchParams.get("imageId");

    if (imageId) {
      // Get specific image
      const imageInfo = await ogpManager.getOGPImage(imageId);
      if (!imageInfo) {
        return adminUtils.createAdminResponse(
          { error: "OGP image not found" },
          404,
        ) as Response;
      }
      return adminUtils.createAdminResponse({ imageInfo }) as Response;
    } else {
      // List all images
      const images = await ogpManager.listOGPImages();
      return adminUtils.createAdminResponse({ images }) as Response;
    }
  } catch (error) {
    const errorResponse = adminErrorHandler.handle(error);
    return adminUtils.createAdminResponse(
      errorResponse,
      errorResponse.statusCode,
    ) as Response;
  }
}

/**
 * Associate OGP image with content
 * PUT /api/admin/ogp
 */
export async function PUT(request: NextRequest): Promise<Response> {
  try {
    // Validate admin access
    const validation = adminUtils.validateAdminRequest(request);
    if (!validation.valid) {
      return adminUtils.createAdminResponse(
        { error: validation.error },
        403,
      ) as Response;
    }

    const body = await request.json();
    const { imageId, contentId } = body;

    if (!imageId || !contentId) {
      return adminUtils.createAdminResponse(
        { error: "ImageId and contentId are required" },
        400,
      ) as Response;
    }

    const success = await ogpManager.associateImageWithContent(
      imageId,
      contentId,
    );

    return adminUtils.createAdminResponse({
      success,
      message: success
        ? "Image associated successfully"
        : "Failed to associate image",
    }) as Response;
  } catch (error) {
    const errorResponse = adminErrorHandler.handle(error);
    return adminUtils.createAdminResponse(
      errorResponse,
      errorResponse.statusCode,
    ) as Response;
  }
}

/**
 * Delete OGP image
 * DELETE /api/admin/ogp
 */
export async function DELETE(request: NextRequest): Promise<Response> {
  try {
    // Validate admin access
    const validation = adminUtils.validateAdminRequest(request);
    if (!validation.valid) {
      return adminUtils.createAdminResponse(
        { error: validation.error },
        403,
      ) as Response;
    }

    const { searchParams } = new URL(request.url);
    const imageId = searchParams.get("imageId");

    if (!imageId) {
      return adminUtils.createAdminResponse(
        { error: "ImageId is required" },
        400,
      ) as Response;
    }

    const success = await ogpManager.deleteOGPImage(imageId);

    return adminUtils.createAdminResponse({
      success,
      message: success
        ? "OGP image deleted successfully"
        : "Failed to delete OGP image",
    }) as Response;
  } catch (error) {
    const errorResponse = adminErrorHandler.handle(error);
    return adminUtils.createAdminResponse(
      errorResponse,
      errorResponse.statusCode,
    ) as Response;
  }
}
