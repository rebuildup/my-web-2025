/**
 * Video Gallery Redesign Test
 * Tests for Task 5: Redesign video gallery card layout
 *
 * Requirements tested:
 * - 5.1: 2-line description truncation for video cards
 * - 5.2: Tags above the date in video card layout
 * - 5.3: "+N" format for tag overflow in video cards
 * - 5.4: Remove thumbnail overlay icons from video cards
 */

import { ContentItem } from "@/types";
import { render, screen } from "@testing-library/react";
import VideoGallery from "../VideoGallery";

// Mock the VideoDetailPanel component
jest.mock("../VideoDetailPanel", () => {
  return function MockVideoDetailPanel() {
    return <div data-testid="video-detail-panel">Video Detail Panel</div>;
  };
});

// Mock the YouTubeThumbnail component
jest.mock("../YouTubeThumbnail", () => {
  return function MockYouTubeThumbnail({ alt }: { alt: string }) {
    return <div data-testid="youtube-thumbnail">{alt}</div>;
  };
});

const mockVideoItems: ContentItem[] = [
  {
    id: "video-1",
    type: "portfolio",
    title: "Test Video Project",
    description:
      "This is a long description that should be truncated to exactly two lines when displayed in the video gallery card layout.",
    category: "video",
    tags: ["tag1", "tag2", "tag3", "tag4", "tag5"], // More than 3 tags to test overflow
    status: "published",
    priority: 90,
    createdAt: "2024-01-15T00:00:00Z",
    updatedAt: "2024-01-20T00:00:00Z",
    thumbnail: "/test-video-thumb.jpg",
    videos: [
      {
        type: "youtube",
        url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
        thumbnail: "/youtube-thumb.jpg",
      },
    ],
    isOtherCategory: false,
    useManualDate: false,
    originalImages: [],
    processedImages: [],
  },
];

describe("VideoGallery Redesign", () => {
  it("should apply 2-line description truncation (Requirement 5.1)", () => {
    render(<VideoGallery items={mockVideoItems} />);

    const description = screen.getByText(/This is a long description/);
    expect(description).toHaveClass("text-truncate-2-lines");
  });

  it("should display tags above the date (Requirement 5.2)", () => {
    render(<VideoGallery items={mockVideoItems} />);

    // Get the video info container
    const videoInfo = screen
      .getByText("Test Video Project")
      .closest(".space-y-3");
    expect(videoInfo).toBeInTheDocument();

    // Check that tags container exists
    const tagsContainer = videoInfo?.querySelector(".tags-container");
    expect(tagsContainer).toBeInTheDocument();

    // Check that tags are displayed
    expect(screen.getByText("tag1")).toBeInTheDocument();

    // Find the meta info section (contains date and category)
    const metaInfoSection = videoInfo?.querySelector(
      ".flex.items-center.justify-between",
    );
    expect(metaInfoSection).toBeInTheDocument();

    // Compare DOM positions - tags should come before meta info (which contains date)
    const videoInfoElement = videoInfo as HTMLElement;
    const tagsPosition = Array.from(videoInfoElement.children).indexOf(
      tagsContainer as Element,
    );
    const metaInfoPosition = Array.from(videoInfoElement.children).indexOf(
      metaInfoSection as Element,
    );

    expect(tagsPosition).toBeLessThan(metaInfoPosition);
  });

  it('should implement "+N" format for tag overflow (Requirement 5.3)', () => {
    render(<VideoGallery items={mockVideoItems} />);

    // Should show first 3 tags
    expect(screen.getByText("tag1")).toBeInTheDocument();
    expect(screen.getByText("tag2")).toBeInTheDocument();
    expect(screen.getByText("tag3")).toBeInTheDocument();

    // Should show "+2" for remaining tags (5 total - 3 shown = 2 remaining)
    const overflowIndicator = screen.getByText("+2");
    expect(overflowIndicator).toBeInTheDocument();
    expect(overflowIndicator).toHaveClass("tag-overflow-indicator");

    // Should not show tag4 and tag5 directly
    expect(screen.queryByText("tag4")).not.toBeInTheDocument();
    expect(screen.queryByText("tag5")).not.toBeInTheDocument();
  });

  it("should not display thumbnail overlay icons (Requirement 5.4)", () => {
    render(<VideoGallery items={mockVideoItems} />);

    // Should not find any video source indicator elements
    const videoSourceIndicators = screen
      .queryAllByText(/video/i)
      .filter((element) => element.closest(".absolute.top-2.right-2"));
    expect(videoSourceIndicators).toHaveLength(0);

    // Should not find any overlay icons in the top-right corner
    const overlayIcons = document.querySelectorAll(".absolute.top-2.right-2");
    expect(overlayIcons).toHaveLength(0);
  });

  it("should maintain proper CSS class structure", () => {
    render(<VideoGallery items={mockVideoItems} />);

    // Check description uses correct truncation class
    const description = screen.getByText(/This is a long description/);
    expect(description).toHaveClass("text-truncate-2-lines");

    // Check tags container uses correct class
    const tagsContainer = document.querySelector(".tags-container");
    expect(tagsContainer).toBeInTheDocument();

    // Check overflow indicator uses correct class
    const overflowIndicator = screen.getByText("+2");
    expect(overflowIndicator).toHaveClass("tag-overflow-indicator");
  });

  it("should handle items without tags gracefully", () => {
    const itemWithoutTags: ContentItem[] = [
      {
        ...mockVideoItems[0],
        id: "video-no-tags",
        tags: undefined,
      },
    ];

    render(<VideoGallery items={itemWithoutTags} />);

    // Should not render tags container when no tags exist
    const tagsContainer = document.querySelector(".tags-container");
    expect(tagsContainer).not.toBeInTheDocument();

    // Should still render other elements
    expect(screen.getByText("Test Video Project")).toBeInTheDocument();
    expect(screen.getByText("2024/1/20")).toBeInTheDocument();
  });

  it("should handle items with few tags (no overflow)", () => {
    const itemWithFewTags: ContentItem[] = [
      {
        ...mockVideoItems[0],
        id: "video-few-tags",
        tags: ["tag1", "tag2"], // Only 2 tags, no overflow
      },
    ];

    render(<VideoGallery items={itemWithFewTags} />);

    // Should show both tags
    expect(screen.getByText("tag1")).toBeInTheDocument();
    expect(screen.getByText("tag2")).toBeInTheDocument();

    // Should not show overflow indicator
    expect(screen.queryByText(/^\+\d+$/)).not.toBeInTheDocument();
  });
});
