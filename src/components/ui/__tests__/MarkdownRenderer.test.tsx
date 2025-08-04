/**
 * MarkdownRenderer Component Tests
 * Tests for markdown rendering with embed resolution
 */

import { render, screen, waitFor } from "@testing-library/react";
import React from "react";
import type { MediaData } from "../../../types/content";
import { MarkdownFileError, MarkdownRenderer } from "../MarkdownRenderer";

// Mock fetch globally
const mockFetch = jest.fn();
global.fetch = mockFetch;

// Mock DOMPurify
jest.mock("isomorphic-dompurify", () => ({
  sanitize: jest.fn((html) => html),
}));

// Mock marked
jest.mock("marked", () => ({
  marked: {
    parse: jest.fn((content) => Promise.resolve(`<p>${content}</p>`)),
    setOptions: jest.fn(),
    use: jest.fn(),
    Renderer: jest.fn().mockImplementation(() => ({
      image: jest.fn(),
      link: jest.fn(),
      code: jest.fn(),
      blockquote: jest.fn(),
    })),
  },
}));

describe("MarkdownRenderer", () => {
  const mockMediaData: MediaData = {
    images: ["/image1.jpg", "/image2.png"],
    videos: [
      {
        type: "youtube",
        url: "https://youtu.be/dQw4w9WgXcQ",
        title: "Test Video",
      },
    ],
    externalLinks: [
      {
        type: "github",
        url: "https://github.com/test/repo",
        title: "GitHub Repo",
      },
    ],
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Loading State", () => {
    it("should show loading state initially", () => {
      mockFetch.mockImplementation(() => new Promise(() => {})); // Never resolves

      render(
        <MarkdownRenderer filePath="/test.md" mediaData={mockMediaData} />,
      );

      expect(screen.getByText("Loading content...")).toBeInTheDocument();
    });

    it("should apply custom className during loading", () => {
      mockFetch.mockImplementation(() => new Promise(() => {}));

      const { container } = render(
        <MarkdownRenderer
          filePath="/test.md"
          mediaData={mockMediaData}
          className="custom-class"
        />,
      );

      expect(container.firstChild).toHaveClass("custom-class");
    });
  });

  describe("Successful Content Loading", () => {
    it("should fetch and render markdown content", async () => {
      const mockContent = "# Test Heading\n\nThis is test content.";
      mockFetch.mockResolvedValueOnce({
        ok: true,
        text: () => Promise.resolve(mockContent),
      });

      render(
        <MarkdownRenderer filePath="/test.md" mediaData={mockMediaData} />,
      );

      await waitFor(() => {
        expect(
          screen.getByText("# Test Heading", { exact: false }),
        ).toBeInTheDocument();
      });

      expect(mockFetch).toHaveBeenCalledWith("/test.md", { cache: "no-store" });
    });

    it("should process embed references in content", async () => {
      const mockContent =
        "Image: ![image:0]\nVideo: ![video:0]\nLink: [link:0]";
      mockFetch.mockResolvedValueOnce({
        ok: true,
        text: () => Promise.resolve(mockContent),
      });

      render(
        <MarkdownRenderer filePath="/test.md" mediaData={mockMediaData} />,
      );

      await waitFor(() => {
        expect(
          screen.getByText("GitHub Repo", { exact: false }),
        ).toBeInTheDocument();
      });

      // The content should be processed through the content parser
      expect(mockFetch).toHaveBeenCalledWith("/test.md", { cache: "no-store" });
    });

    it("should apply custom className to rendered content", async () => {
      const mockContent = "Test content";
      mockFetch.mockResolvedValueOnce({
        ok: true,
        text: () => Promise.resolve(mockContent),
      });

      const { container } = render(
        <MarkdownRenderer
          filePath="/test.md"
          mediaData={mockMediaData}
          className="custom-renderer-class"
        />,
      );

      await waitFor(() => {
        expect(container.firstChild).toHaveClass("custom-renderer-class");
      });
    });
  });

  describe("Error Handling", () => {
    it("should handle file not found error", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: "Not Found",
      });

      const mockOnError = jest.fn();

      render(
        <MarkdownRenderer
          filePath="/nonexistent.md"
          mediaData={mockMediaData}
          onError={mockOnError}
        />,
      );

      await waitFor(() => {
        expect(screen.getByText("Content not available")).toBeInTheDocument();
      });

      expect(mockOnError).toHaveBeenCalledWith(expect.any(MarkdownFileError));
    });

    it("should handle network errors", async () => {
      mockFetch.mockRejectedValueOnce(new Error("Network error"));

      const mockOnError = jest.fn();

      render(
        <MarkdownRenderer
          filePath="/test.md"
          mediaData={mockMediaData}
          onError={mockOnError}
        />,
      );

      await waitFor(() => {
        expect(screen.getByText("Content not available")).toBeInTheDocument();
      });

      expect(mockOnError).toHaveBeenCalledWith(expect.any(MarkdownFileError));
    });

    it("should show fallback content on error", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: "Internal Server Error",
      });

      const fallbackContent = "Custom fallback message";

      render(
        <MarkdownRenderer
          filePath="/test.md"
          mediaData={mockMediaData}
          fallbackContent={fallbackContent}
        />,
      );

      await waitFor(() => {
        expect(screen.getByText(fallbackContent)).toBeInTheDocument();
      });
    });

    it("should handle empty file path", async () => {
      const mockOnError = jest.fn();

      render(
        <MarkdownRenderer
          filePath=""
          mediaData={mockMediaData}
          onError={mockOnError}
        />,
      );

      await waitFor(() => {
        expect(screen.getByText("Content not available")).toBeInTheDocument();
      });

      expect(mockOnError).toHaveBeenCalledWith(expect.any(MarkdownFileError));
    });
  });

  describe("Custom Renderer", () => {
    it("should use custom renderer when provided", async () => {
      const mockContent = "# Test Content";
      const customRenderer = jest.fn(
        (content) => `<div class="custom">${content}</div>`,
      );

      mockFetch.mockResolvedValueOnce({
        ok: true,
        text: () => Promise.resolve(mockContent),
      });

      render(
        <MarkdownRenderer
          filePath="/test.md"
          mediaData={mockMediaData}
          customRenderer={customRenderer}
        />,
      );

      await waitFor(() => {
        expect(customRenderer).toHaveBeenCalled();
      });
    });
  });

  describe("Sanitization", () => {
    it("should sanitize content by default", async () => {
      const mockContent = "<script>alert('xss')</script><p>Safe content</p>";
      mockFetch.mockResolvedValueOnce({
        ok: true,
        text: () => Promise.resolve(mockContent),
      });

      // Use the mocked DOMPurify
      const { sanitize } = jest.requireMock("isomorphic-dompurify");

      render(
        <MarkdownRenderer filePath="/test.md" mediaData={mockMediaData} />,
      );

      await waitFor(() => {
        expect(sanitize).toHaveBeenCalled();
      });
    });

    it("should skip sanitization when disabled", async () => {
      const mockContent = "<p>Test content</p>";
      mockFetch.mockResolvedValueOnce({
        ok: true,
        text: () => Promise.resolve(mockContent),
      });

      const { sanitize } = jest.requireMock("isomorphic-dompurify");
      sanitize.mockClear();

      render(
        <MarkdownRenderer
          filePath="/test.md"
          mediaData={mockMediaData}
          enableSanitization={false}
        />,
      );

      await waitFor(() => {
        expect(screen.getByText("Test content")).toBeInTheDocument();
      });

      expect(sanitize).not.toHaveBeenCalled();
    });
  });

  describe("Media Data Updates", () => {
    it("should reload content when mediaData changes", async () => {
      const mockContent = "![image:0]";
      mockFetch.mockResolvedValue({
        ok: true,
        text: () => Promise.resolve(mockContent),
      });

      const { rerender } = render(
        <MarkdownRenderer filePath="/test.md" mediaData={mockMediaData} />,
      );

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledTimes(1);
      });

      const newMediaData = {
        ...mockMediaData,
        images: ["/new-image.jpg"],
      };

      rerender(
        <MarkdownRenderer filePath="/test.md" mediaData={newMediaData} />,
      );

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledTimes(2);
      });
    });

    it("should reload content when filePath changes", async () => {
      const mockContent = "Test content";
      mockFetch.mockResolvedValue({
        ok: true,
        text: () => Promise.resolve(mockContent),
      });

      const { rerender } = render(
        <MarkdownRenderer filePath="/test1.md" mediaData={mockMediaData} />,
      );

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith("/test1.md", {
          cache: "no-store",
        });
      });

      rerender(
        <MarkdownRenderer filePath="/test2.md" mediaData={mockMediaData} />,
      );

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith("/test2.md", {
          cache: "no-store",
        });
      });
    });
  });
});

describe("MarkdownFileError", () => {
  it("should create error with correct properties", () => {
    const error = new MarkdownFileError(
      "Test error message",
      "FILE_NOT_FOUND",
      "/test.md",
    );

    expect(error.message).toBe("Test error message");
    expect(error.code).toBe("FILE_NOT_FOUND");
    expect(error.filePath).toBe("/test.md");
    expect(error.name).toBe("MarkdownFileError");
  });

  it("should be instance of Error", () => {
    const error = new MarkdownFileError(
      "Test error",
      "PARSE_ERROR",
      "/test.md",
    );

    expect(error).toBeInstanceOf(Error);
    expect(error).toBeInstanceOf(MarkdownFileError);
  });
});
