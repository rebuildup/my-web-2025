/**
 * Admin Audit API Route
 * Handles audit log requests
 */

import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = searchParams.get("limit") || "10";

    // Mock implementation for testing
    return NextResponse.json({
      success: true,
      data: [],
      total: 0,
      limit: parseInt(limit),
    });
  } catch {
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch audit logs",
      },
      { status: 500 },
    );
  }
}
