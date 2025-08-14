/**
 * Content All API Route
 * Handles requests for all content items
 */

import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    // Mock implementation for testing
    return NextResponse.json({
      success: true,
      data: [],
      total: 0,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch content",
      },
      { status: 500 },
    );
  }
}
