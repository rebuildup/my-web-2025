import { fireEvent, render, screen } from "@testing-library/react";
import React from "react";

// Mock heavy/ESM-only utilities to avoid importing @ffmpeg/* in tests
jest.mock("@/lib/utils/file-processing", () => ({
  validateFile: jest.fn(() => ({ valid: true })),
  extractFileMetadata: jest.fn(async () => ({
    name: "mock",
    size: 100,
    type: "image/jpeg",
    lastModified: Date.now(),
    hash: "hash",
  })),
  compressFileIfNeeded: jest.fn(async (f: File) => f),
}));

import { FileUploadSection } from "../FileUploadSection";

// Helper function for creating test files
// function createFile(name: string, size = 1024, type = "image/jpeg") {
//   const file = new File([new ArrayBuffer(size)], name, { type });
//   Object.defineProperty(file, "lastModified", { value: Date.now() });
//   return file;
// }

describe("FileUploadSection", () => {
  beforeEach(() => {
    // Mock extract/compress utilities through fetch-only path (server handles)
    // Mock fetch for /api/admin/upload
    // @ts-expect-error - Mocking global fetch for testing
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve({ files: [{ url: "/images/uploaded-1.jpg" }] }),
    });
  });

  it("supports manual URL add (upload path mocked separately)", async () => {
    const onImagesChange = jest.fn();
    const onThumbnailChange = jest.fn();

    render(
      <FileUploadSection
        images={[]}
        onImagesChange={onImagesChange}
        onThumbnailChange={onThumbnailChange}
      />,
    );

    // Manual URL add
    const urlInput = screen.getByPlaceholderText(
      /https:\/\/example.com\/image.jpg/i,
    ) as HTMLInputElement;
    fireEvent.change(urlInput, {
      target: { value: "https://example.com/image.jpg" },
    });
    fireEvent.keyDown(urlInput, { key: "Enter" });
    expect(onImagesChange).toHaveBeenCalled();
  });
});
