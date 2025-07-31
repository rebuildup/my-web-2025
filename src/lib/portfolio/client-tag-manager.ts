/**
 * Client-side Tag Manager
 * Uses API endpoints instead of direct file system access
 */

import type { TagInfo, TagManagementSystem } from "@/types/enhanced-content";

export class ClientTagManager implements TagManagementSystem {
  async getAllTags(): Promise<TagInfo[]> {
    try {
      const response = await fetch("/api/admin/tags");
      const data = await response.json();
      return data.success ? data.data : [];
    } catch (error) {
      console.error("Failed to fetch tags:", error);
      return [];
    }
  }

  async createTag(name: string): Promise<TagInfo> {
    const response = await fetch("/api/admin/tags", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });
    const data = await response.json();
    if (!data.success) {
      throw new Error(data.message || "Failed to create tag");
    }
    return data.data;
  }

  async updateTagUsage(name: string): Promise<void> {
    const response = await fetch(
      `/api/admin/tags/${encodeURIComponent(name)}`,
      {
        method: "PUT",
      },
    );
    const data = await response.json();
    if (!data.success) {
      throw new Error(data.message || "Failed to update tag usage");
    }
  }

  async deleteTag(name: string): Promise<boolean> {
    try {
      const response = await fetch(
        `/api/admin/tags/${encodeURIComponent(name)}`,
        {
          method: "DELETE",
        },
      );
      const data = await response.json();
      return data.success;
    } catch (error) {
      console.error("Failed to delete tag:", error);
      return false;
    }
  }

  async searchTags(query: string): Promise<TagInfo[]> {
    try {
      const response = await fetch(
        `/api/admin/tags?q=${encodeURIComponent(query)}`,
      );
      const data = await response.json();
      return data.success ? data.data : [];
    } catch (error) {
      console.error("Failed to search tags:", error);
      return [];
    }
  }
}

// Export singleton instance
export const clientTagManager = new ClientTagManager();
