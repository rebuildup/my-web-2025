import { fireEvent, render, screen } from "@testing-library/react";
import React from "react";
import { PreviewPanel } from "../PreviewPanel";

interface PreviewItem {
  id: string;
  type: string;
  title: string;
  description: string;
  status: string;
  category: string;
  priority: number;
  createdAt: string;
  updatedAt: string;
  tags: string[];
  images: string[];
  videos: Array<{
    type: string;
    url: string;
    title: string;
  }>;
  externalLinks: unknown[];
  content: string;
}

const makeItem = (overrides: Partial<PreviewItem> = {}): PreviewItem => ({
  id: "id-1",
  type: "portfolio",
  title: "Sample Item",
  description: "Item description",
  status: "published",
  category: "video",
  priority: 50,
  createdAt: "2024-01-01T00:00:00Z",
  updatedAt: "2024-01-01T00:00:00Z",
  tags: ["a", "b"],
  images: ["/images/one.jpg"],
  videos: [
    {
      type: "youtube",
      url: "https://www.youtube.com/watch?v=abc123",
      title: "YT",
    },
  ],
  externalLinks: [],
  content: "hello",
  ...overrides,
});

describe("PreviewPanel", () => {
  it("switches preview modes and fires edit callback; toggles video embed visibility", () => {
    const onEdit = jest.fn();
    render(<PreviewPanel item={makeItem()} onEdit={onEdit} />);

    // Default desktop mode
    expect(screen.getByText(/Preview Mode: desktop/i)).toBeInTheDocument();

    // Tablet
    fireEvent.click(screen.getByRole("button", { name: /Tablet/i }));
    expect(screen.getByText(/Preview Mode: tablet/i)).toBeInTheDocument();

    // Mobile
    fireEvent.click(screen.getByRole("button", { name: /Mobile/i }));
    expect(screen.getByText(/Preview Mode: mobile/i)).toBeInTheDocument();

    // Edit
    fireEvent.click(screen.getByRole("button", { name: /Edit/i }));
    expect(onEdit).toHaveBeenCalled();

    // Toggle all embeds hidden -> shows thumbnail placeholder overlay
    fireEvent.click(screen.getByRole("button", { name: /Hide Embeds/i }));
    expect(screen.getByText(/Click to load embed/i)).toBeInTheDocument();

    // Click overlay text to show embed (no need to assert iframe here)
    fireEvent.click(screen.getByText(/Click to load embed/i));
  });
});
