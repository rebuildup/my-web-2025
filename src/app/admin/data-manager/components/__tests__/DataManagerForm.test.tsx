/**
 * Basic integration tests for DataManagerForm with TagManagementUI
 */

import type { ContentItem } from "@/types/content";
import { render, screen } from "@testing-library/react";
import React from "react";

// Mock all dependencies to avoid complex setup
jest.mock("@/lib/portfolio/client-tag-manager", () => ({
  clientTagManager: {
    getAllTags: jest.fn().mockResolvedValue([]),
    createTag: jest.fn(),
    updateTagUsage: jest.fn(),
    deleteTag: jest.fn(),
    searchTags: jest.fn(),
  },
}));

jest.mock("@/components/ui/TagManagementUI", () => ({
  TagManagementUI: ({
    selectedTags,
    placeholder,
  }: {
    selectedTags: string[];
    placeholder: string;
  }) => (
    <div data-testid="tag-management-ui">
      <input placeholder={placeholder} data-testid="tag-input" />
      <div data-testid="selected-tags">
        {selectedTags?.map((tag: string) => (
          <span key={tag} data-testid={`tag-${tag}`}>
            {tag}
          </span>
        ))}
      </div>
    </div>
  ),
}));

jest.mock("../FileUploadSection", () => ({
  FileUploadSection: () => <div data-testid="file-upload-section" />,
}));

jest.mock("../MediaEmbedSection", () => ({
  MediaEmbedSection: () => <div data-testid="media-embed-section" />,
}));

jest.mock("../ExternalLinksSection", () => ({
  ExternalLinksSection: () => <div data-testid="external-links-section" />,
}));

jest.mock("../DownloadInfoSection", () => ({
  DownloadInfoSection: () => <div data-testid="download-info-section" />,
}));

jest.mock("../SEOSection", () => ({
  SEOSection: () => <div data-testid="seo-section" />,
}));

jest.mock("lucide-react", () => ({
  X: () => <div data-testid="x-icon" />,
  Plus: () => <div data-testid="plus-icon" />,
  Search: () => <div data-testid="search-icon" />,
  Tag: () => <div data-testid="tag-icon" />,
}));

// Import after mocks
import { DataManagerForm } from "../DataManagerForm";

const mockItem: ContentItem = {
  id: "test-1",
  title: "Test Item",
  description: "Test description",
  type: "portfolio",
  category: "develop",
  status: "published",
  tags: ["react", "typescript"],
  images: [],
  videos: [],
  priority: 50,
  createdAt: "2023-01-01T00:00:00.000Z",
  updatedAt: "2023-01-01T00:00:00.000Z",
};

describe("DataManagerForm TagManagementUI Integration", () => {
  const defaultProps = {
    item: mockItem,
    onSave: jest.fn(),
    onCancel: jest.fn(),
    isLoading: false,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should render TagManagementUI component", () => {
    render(<DataManagerForm {...defaultProps} />);

    expect(screen.getByTestId("tag-management-ui")).toBeInTheDocument();
    expect(screen.getByTestId("tag-input")).toBeInTheDocument();
  });

  it("should display selected tags", () => {
    render(<DataManagerForm {...defaultProps} />);

    expect(screen.getByTestId("tag-react")).toBeInTheDocument();
    expect(screen.getByTestId("tag-typescript")).toBeInTheDocument();
  });

  it("should have proper placeholder text", () => {
    render(<DataManagerForm {...defaultProps} />);

    expect(
      screen.getByPlaceholderText("Search or add tags..."),
    ).toBeInTheDocument();
  });

  it("should have Tags label", () => {
    render(<DataManagerForm {...defaultProps} />);

    expect(screen.getByText("Tags")).toBeInTheDocument();
  });

  it("should handle empty tags array", () => {
    const itemWithoutTags = { ...mockItem, tags: [] };

    render(<DataManagerForm {...defaultProps} item={itemWithoutTags} />);

    expect(screen.getByTestId("tag-management-ui")).toBeInTheDocument();
    expect(screen.getByTestId("selected-tags")).toBeInTheDocument();
  });

  it("should handle undefined tags", () => {
    const itemWithUndefinedTags = { ...mockItem };
    delete (itemWithUndefinedTags as Partial<ContentItem>).tags;

    render(<DataManagerForm {...defaultProps} item={itemWithUndefinedTags} />);

    expect(screen.getByTestId("tag-management-ui")).toBeInTheDocument();
  });
});
