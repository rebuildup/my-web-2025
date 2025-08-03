import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MarkdownEditor } from "../MarkdownEditor";

const mockMediaData = {
  images: ["/images/test1.jpg", "/images/test2.png"],
  videos: [
    {
      type: "youtube",
      url: "https://youtu.be/test123",
      title: "Test Video",
      description: "A test video",
    },
  ],
  externalLinks: [
    {
      type: "website",
      url: "https://example.com",
      title: "Example Link",
      description: "An example link",
    },
  ],
};

describe("MarkdownEditor", () => {
  const defaultProps = {
    content: "",
    onChange: jest.fn(),
    preview: true,
    toolbar: true,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders basic markdown editor", () => {
    render(<MarkdownEditor {...defaultProps} />);

    expect(
      screen.getByPlaceholderText("Enter your markdown content here..."),
    ).toBeInTheDocument();
    expect(screen.getByTitle("Toggle Preview")).toBeInTheDocument();
  });

  it("shows embed helpers when embedSupport is enabled", () => {
    render(
      <MarkdownEditor
        {...defaultProps}
        embedSupport={true}
        mediaData={mockMediaData}
      />,
    );

    // Should show embed helper buttons
    expect(screen.getByTitle("Insert Image Embed")).toBeInTheDocument();
    expect(screen.getByTitle("Insert Video Embed")).toBeInTheDocument();
    expect(screen.getByTitle("Insert Link Embed")).toBeInTheDocument();
  });

  it("validates embed syntax and shows errors", async () => {
    const onValidationErrors = jest.fn();

    render(
      <MarkdownEditor
        {...defaultProps}
        embedSupport={true}
        mediaData={mockMediaData}
        onValidationErrors={onValidationErrors}
      />,
    );

    const textarea = screen.getByPlaceholderText(
      "Enter your markdown content here...",
    );

    // Enter invalid embed syntax
    fireEvent.change(textarea, { target: { value: "![image:999]" } });

    await waitFor(() => {
      expect(onValidationErrors).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            type: "INVALID_INDEX",
            message: expect.stringContaining("Image index 999 is out of range"),
          }),
        ]),
      );
    });
  });

  it("resolves embed references in preview mode", async () => {
    render(
      <MarkdownEditor
        {...defaultProps}
        content="![image:0] and [link:0]"
        embedSupport={true}
        mediaData={mockMediaData}
      />,
    );

    // Switch to preview mode
    fireEvent.click(screen.getByTitle("Toggle Preview"));

    await waitFor(() => {
      // Should resolve image embed
      expect(screen.getByRole("img")).toHaveAttribute(
        "src",
        "/images/test1.jpg",
      );
      // Should resolve link embed
      expect(screen.getByRole("link")).toHaveAttribute(
        "href",
        "https://example.com",
      );
    });
  });

  it("shows embed helper panel when toggled", () => {
    render(
      <MarkdownEditor
        {...defaultProps}
        embedSupport={true}
        mediaData={mockMediaData}
      />,
    );

    // Click embed helper toggle
    fireEvent.click(screen.getByTitle("Show Embed Helper"));

    expect(screen.getByText("Embed Reference Guide")).toBeInTheDocument();
    expect(screen.getByText("Images (2)")).toBeInTheDocument();
    expect(screen.getByText("Videos (1)")).toBeInTheDocument();
    expect(screen.getByText("Links (1)")).toBeInTheDocument();
  });

  it("inserts embed syntax when using toolbar helpers", () => {
    // Mock window.prompt
    const originalPrompt = window.prompt;
    window.prompt = jest
      .fn()
      .mockReturnValueOnce("0") // For index
      .mockReturnValueOnce(""); // For alt text (empty)

    const onChange = jest.fn();

    render(
      <MarkdownEditor
        {...defaultProps}
        onChange={onChange}
        embedSupport={true}
        mediaData={mockMediaData}
      />,
    );

    // Click image embed button
    fireEvent.click(screen.getByTitle("Insert Image Embed"));

    expect(onChange).toHaveBeenCalledWith("![image:0]");

    // Restore original prompt
    window.prompt = originalPrompt;
  });

  it("shows validation status in status bar", () => {
    render(
      <MarkdownEditor
        {...defaultProps}
        content="![image:0]"
        embedSupport={true}
        mediaData={mockMediaData}
      />,
    );

    expect(screen.getByText("Embeds: Valid")).toBeInTheDocument();
  });

  it("handles video embeds correctly in preview", async () => {
    render(
      <MarkdownEditor
        {...defaultProps}
        content="![video:0]"
        embedSupport={true}
        mediaData={mockMediaData}
      />,
    );

    // Switch to preview mode
    fireEvent.click(screen.getByTitle("Toggle Preview"));

    await waitFor(() => {
      // Should create YouTube iframe embed
      expect(screen.getByTitle("Test Video")).toBeInTheDocument();
    });
  });
});
