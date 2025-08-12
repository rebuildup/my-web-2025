import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import React from "react";
import { FileManagerPanel } from "../FileManagerPanel";

describe("FileManagerPanel", () => {
  const filesResponse = {
    files: [
      {
        id: "f1",
        name: "image-1.jpg",
        type: "image/jpeg",
        size: 12345,
        url: "/images/test-1.jpg",
        createdAt: "2024-01-01T00:00:00Z",
        category: "portfolio",
      },
    ],
  };

  beforeEach(() => {
    // @ts-expect-error - Mocking global fetch for testing
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(filesResponse),
    });
  });

  it("loads, toggles view, filters, selects and deletes a file", async () => {
    const onFileSelect = jest.fn();
    const origConfirm = window.confirm;
    // Confirm deletion
    // @ts-expect-error - Mocking window.confirm for testing
    window.confirm = jest.fn(() => true);

    render(<FileManagerPanel onFileSelect={onFileSelect} />);

    // Loading spinner appears first
    expect(document.querySelector(".animate-spin")).toBeTruthy();

    // Wait for files to render
    await waitFor(() => {
      expect(screen.getByText("image-1.jpg")).toBeInTheDocument();
    });

    // Toggle view mode (Grid -> List)
    fireEvent.click(screen.getByRole("button", { name: /list/i }));
    expect(screen.getByText(/image-1.jpg/i)).toBeInTheDocument();

    // Filter to show empty state
    const search = screen.getByPlaceholderText(/search files/i);
    fireEvent.change(search, { target: { value: "__no_match__" } });
    await waitFor(() => {
      expect(screen.getByText(/no files found/i)).toBeInTheDocument();
    });

    // Clear filter and select file
    fireEvent.change(search, { target: { value: "image" } });
    fireEvent.click(screen.getByText("image-1.jpg"));
    expect(onFileSelect).toHaveBeenCalledWith(
      expect.objectContaining({ id: "f1" }),
    );

    // Delete file via context action
    // Next fetch for DELETE
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({}),
    });
    const deleteBtn = screen.getByTitle(/delete/i);
    fireEvent.click(deleteBtn);

    await waitFor(() => {
      // After deletion, the tile should no longer be present or show empty
      expect(screen.queryByText("image-1.jpg")).not.toBeInTheDocument();
    });

    window.confirm = origConfirm;
  });
});
