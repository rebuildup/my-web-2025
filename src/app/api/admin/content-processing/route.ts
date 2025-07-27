/**
 * Content Processing API Route
 * Handles content processing pipeline operations
 * Task 9.3.1 - Content processing pipeline API
 */

import { NextRequest } from "next/server";
import { contentProcessor } from "@/lib/admin/content-processor";
import { adminUtils, adminErrorHandler } from "@/lib/admin/utils";
import type { ContentType } from "@/types";

/**
 * Process content item
 * POST /api/admin/content-processing
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

    const body = await request.json();
    const { type, content, options } = body;

    // Validate required fields
    if (!type || !content) {
      return adminUtils.createAdminResponse(
        { error: "Type and content are required" },
        400,
      ) as Response;
    }

    // Validate content type
    const validTypes: ContentType[] = [
      "portfolio",
      "blog",
      "plugin",
      "download",
      "tool",
      "profile",
      "page",
      "asset",
    ];

    if (!validTypes.includes(type)) {
      return adminUtils.createAdminResponse(
        {
          error: `Invalid content type. Valid types: ${validTypes.join(", ")}`,
        },
        400,
      ) as Response;
    }

    // Process content
    const result = await contentProcessor.processContent(
      type,
      content,
      options,
    );

    return adminUtils.createAdminResponse({
      success: result.success,
      contentId: result.contentId,
      markdownPath: result.markdownPath,
      backupPath: result.backupPath,
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
 * Batch process content items
 * PUT /api/admin/content-processing
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
    const { type, contentItems, options } = body;

    // Validate required fields
    if (!type || !Array.isArray(contentItems)) {
      return adminUtils.createAdminResponse(
        { error: "Type and contentItems array are required" },
        400,
      ) as Response;
    }

    // Process content items
    const results = await contentProcessor.batchProcessContent(
      type,
      contentItems,
      options,
    );

    const summary = {
      total: results.length,
      successful: results.filter((r) => r.success).length,
      failed: results.filter((r) => !r.success).length,
      results,
    };

    return adminUtils.createAdminResponse(summary) as Response;
  } catch (error) {
    const errorResponse = adminErrorHandler.handle(error);
    return adminUtils.createAdminResponse(
      errorResponse,
      errorResponse.statusCode,
    ) as Response;
  }
}

/**
 * Delete content and cleanup
 * DELETE /api/admin/content-processing
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
    const type = searchParams.get("type") as ContentType;
    const contentId = searchParams.get("contentId");

    if (!type || !contentId) {
      return adminUtils.createAdminResponse(
        { error: "Type and contentId are required" },
        400,
      ) as Response;
    }

    // Delete content
    const result = await contentProcessor.deleteContent(type, contentId);

    return adminUtils.createAdminResponse({
      success: result.success,
      contentId: result.contentId,
      backupPath: result.backupPath,
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
