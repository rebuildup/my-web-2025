/**
 * Admin Authentication API Route
 * Handles admin authentication requests
 */

import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Mock implementation for testing
    return NextResponse.json(
      {
        success: true,
        token: "mock-admin-token",
        user: {
          id: "admin",
          role: "admin",
        },
      },
      { status: 201 },
    );
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: "Authentication failed",
      },
      { status: 401 },
    );
  }
}
