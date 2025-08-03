/**
 * Markdown System Initialization
 * Sets up the directory structure and validates the system
 */

import {
  initializeDirectoryStructure,
  validateDirectoryStructure,
} from "./directory-utils";
import { DEFAULT_MARKDOWN_CONFIG, type MarkdownSystemConfig } from "./index";

export async function initializeMarkdownSystem(
  config: Partial<MarkdownSystemConfig> = {},
): Promise<{
  success: boolean;
  message: string;
  details?: Record<string, unknown>;
}> {
  const finalConfig = { ...DEFAULT_MARKDOWN_CONFIG, ...config };

  try {
    // Initialize directory structure
    await initializeDirectoryStructure();

    // Validate the structure
    const validation = await validateDirectoryStructure();

    if (!validation.isValid) {
      return {
        success: false,
        message: "Directory structure validation failed",
        details: {
          missingDirectories: validation.missingDirectories,
        },
      };
    }

    return {
      success: true,
      message: "Markdown system initialized successfully",
      details: {
        config: finalConfig,
        validation,
      },
    };
  } catch (error) {
    return {
      success: false,
      message: `Failed to initialize markdown system: ${error}`,
      details: { error },
    };
  }
}

// Auto-initialize on import in development
if (process.env.NODE_ENV === "development") {
  initializeMarkdownSystem()
    .then((result) => {
      if (result.success) {
        console.log("✅ Markdown system initialized");
      } else {
        console.warn(
          "⚠️ Markdown system initialization failed:",
          result.message,
        );
      }
    })
    .catch((error) => {
      console.error("❌ Markdown system initialization error:", error);
    });
}
