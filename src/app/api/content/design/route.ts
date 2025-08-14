/**
 * Design Content API Route
 * Handles design category content requests
 */

import { NextResponse } from "next/server";

export async function GET() {
  try {
    // Mock implementation for testing
    return NextResponse.json({
      success: true,
      data: [],
      category: "design",
    });
  } catch {
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch design content",
      },
      { status: 500 },
    );
  }
}
