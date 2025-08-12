import { fireEvent, render, screen } from "@testing-library/react";
import React from "react";
import { DetailModal } from "../../components/DetailModal";

jest.mock("next/image", () => {
  const MockImage = (props: {
    src: string;
    alt: string;
    width?: number;
    height?: number;
    [key: string]: unknown;
  }) => {
    // Simple div shim for testing
    return <div data-testid="mock-image" {...props} />;
  };
  MockImage.displayName = "MockImage";
  return MockImage;
});

// Mock IntersectionObserver used by next/image
beforeAll(() => {
  class IO {
    observe() {}
    unobserve() {}
    disconnect() {}
    takeRecords() {
      return [];
    }
    root = null;
    rootMargin = "";
    thresholds = [] as number[];
  }
  // @ts-expect-error - Mocking IntersectionObserver for testing
  global.IntersectionObserver = IO as unknown;
});

describe("DetailModal", () => {
  const item = {
    id: "p-1",
    title: "Portfolio Item",
    description: "Desc",
    thumbnail: "/thumb.jpg",
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z",
    category: "video",
    tags: ["t1"],
  } as {
    id: string;
    title: string;
    description: string;
    thumbnail: string;
    createdAt: string;
    updatedAt: string;
    category: string;
    tags: string[];
  };

  it("renders and closes via button and backdrop", () => {
    const onClose = jest.fn();
    render(<DetailModal item={item} onClose={onClose} />);

    // Close button
    fireEvent.click(screen.getByRole("button", { name: /close modal/i }));
    expect(onClose).toHaveBeenCalled();

    // Backdrop
    onClose.mockClear();
    const { container } = render(<DetailModal item={item} onClose={onClose} />);
    fireEvent.click(container.firstChild as HTMLElement); // backdrop click
    expect(onClose).toHaveBeenCalled();
  });
});
