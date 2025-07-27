/**
 * Build-safe fetch utility
 * Prevents fetch errors during build time when external APIs are not available
 */

export function shouldSkipFetchDuringBuild(): boolean {
  return (
    process.env.NODE_ENV === "production" && !process.env.NEXT_PUBLIC_BASE_URL
  );
}

export async function buildSafeFetch(
  url: string,
  options?: RequestInit,
): Promise<Response | null> {
  if (shouldSkipFetchDuringBuild()) {
    console.log(`Skipping fetch during build: ${url}`);
    return null;
  }

  try {
    return await fetch(url, options);
  } catch (error) {
    console.warn(`Fetch failed for ${url}:`, error);
    return null;
  }
}

export function getApiUrl(path: string): string {
  return `${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}${path}`;
}
