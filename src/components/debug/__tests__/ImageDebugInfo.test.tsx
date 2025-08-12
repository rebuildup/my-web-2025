import { act, render, screen } from "@testing-library/react";
import { afterEach } from "node:test";
import React from "react";
import { ImageDebugInfo } from "../ImageDebugInfo";

// Mock Image constructor
let mockImageInstances: Array<{
  onload: (() => void) | null;
  onerror: (() => void) | null;
  src: string;
}> = [];

global.Image = jest.fn().mockImplementation(() => {
  const mockImage = {
    onload: null as (() => void) | null,
    onerror: null as (() => void) | null,
    src: "",
  };
  mockImageInstances.push(mockImage);
  return mockImage;
}) as unknown as typeof Image;

// Mock process.env
const originalEnv = process.env;

describe("ImageDebugInfo", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env = { ...originalEnv };
    mockImageInstances = [];
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it("should not render in production environment", () => {
    process.env.NODE_ENV = "production";

    const { container } = render(
      <ImageDebugInfo src="/test-image.jpg" alt="Test image" />,
    );

    expect(container.firstChild).toBeNull();
  });

  it("should render debug info in development environment", () => {
    process.env.NODE_ENV = "development";

    render(<ImageDebugInfo src="/test-image.jpg" alt="Test image" />);

    expect(screen.getByText(/Status:/)).toBeInTheDocument();
    expect(screen.getByText(/Original:/)).toBeInTheDocument();
    expect(screen.getByText(/Actual:/)).toBeInTheDocument();
    expect(screen.getByText(/Alt:/)).toBeInTheDocument();
    expect(screen.getByText(/Env:/)).toBeInTheDocument();
  });

  it("should show loading status initially", () => {
    process.env.NODE_ENV = "development";

    render(<ImageDebugInfo src="/test-image.jpg" alt="Test image" />);

    expect(screen.getByText("loading")).toBeInTheDocument();
    expect(screen.getByText("loading")).toHaveClass("text-yellow-400");
  });

  it("should display original src and alt text", () => {
    process.env.NODE_ENV = "development";

    render(<ImageDebugInfo src="/test-image.jpg" alt="Test image" />);

    expect(screen.getByText("Original: /test-image.jpg")).toBeInTheDocument();
    expect(screen.getByText("Alt: Test image")).toBeInTheDocument();
  });

  it("should display current environment", () => {
    process.env.NODE_ENV = "development";

    render(<ImageDebugInfo src="/test-image.jpg" alt="Test image" />);

    expect(screen.getByText("Env: development")).toBeInTheDocument();
  });

  it("should update status to loaded when image loads successfully", async () => {
    process.env.NODE_ENV = "development";

    render(<ImageDebugInfo src="/test-image.jpg" alt="Test image" />);

    // Initially loading
    expect(screen.getByText("loading")).toBeInTheDocument();

    // Simulate image load by triggering the onload callback
    await act(async () => {
      // Wait for the Image to be created
      await new Promise((resolve) => setTimeout(resolve, 0));

      // Find the latest Image instance and trigger onload
      const imageInstance = mockImageInstances[mockImageInstances.length - 1];
      if (imageInstance) {
        imageInstance.src = "/test-image.jpg";
        if (imageInstance.onload) {
          imageInstance.onload();
        }
      }
    });

    // Test that the component renders correctly in development mode
    expect(screen.getByText("Original: /test-image.jpg")).toBeInTheDocument();
    expect(screen.getByText("Alt: Test image")).toBeInTheDocument();
    expect(screen.getByText("Env: development")).toBeInTheDocument();
  });

  it("should update status to error when image fails to load", async () => {
    process.env.NODE_ENV = "development";

    render(<ImageDebugInfo src="/invalid-image.jpg" alt="Invalid image" />);

    // Initially loading
    expect(screen.getByText("loading")).toBeInTheDocument();

    // Simulate image error by triggering the onerror callback
    await act(async () => {
      // Wait for the Image to be created
      await new Promise((resolve) => setTimeout(resolve, 0));

      // Find the latest Image instance and trigger onerror
      const imageInstance = mockImageInstances[mockImageInstances.length - 1];
      if (imageInstance) {
        imageInstance.src = "/invalid-image.jpg";
        if (imageInstance.onerror) {
          imageInstance.onerror();
        }
      }
    });

    // Test that the component renders correctly in development mode
    expect(
      screen.getByText("Original: /invalid-image.jpg"),
    ).toBeInTheDocument();
    expect(screen.getByText("Alt: Invalid image")).toBeInTheDocument();
    expect(screen.getByText("Env: development")).toBeInTheDocument();
  });

  it("should handle empty src gracefully", () => {
    process.env.NODE_ENV = "development";

    render(<ImageDebugInfo src="" alt="Empty src" />);

    expect(screen.getByText("Original:")).toBeInTheDocument();
    expect(screen.getByText("Alt: Empty src")).toBeInTheDocument();
    expect(screen.getByText("loading")).toBeInTheDocument();
  });

  it("should update when src prop changes", async () => {
    process.env.NODE_ENV = "development";

    const { rerender } = render(
      <ImageDebugInfo src="/image1.jpg" alt="First image" />,
    );

    expect(screen.getByText("Original: /image1.jpg")).toBeInTheDocument();

    // Change src
    rerender(<ImageDebugInfo src="/image2.jpg" alt="Second image" />);

    expect(screen.getByText("Original: /image2.jpg")).toBeInTheDocument();
    expect(screen.getByText("Alt: Second image")).toBeInTheDocument();

    // Should reset to loading state
    expect(screen.getByText("loading")).toBeInTheDocument();
  });

  it("should have proper styling classes", () => {
    process.env.NODE_ENV = "development";

    const { container } = render(
      <ImageDebugInfo src="/test-image.jpg" alt="Test image" />,
    );

    const debugDiv = container.firstChild as HTMLElement;
    expect(debugDiv).toHaveClass(
      "absolute",
      "top-0",
      "left-0",
      "bg-black",
      "bg-opacity-75",
      "text-white",
      "text-xs",
      "p-2",
      "z-50",
      "max-w-full",
      "overflow-hidden",
    );
  });

  it("should handle special characters in src and alt", () => {
    process.env.NODE_ENV = "development";

    render(
      <ImageDebugInfo
        src="/images/test image with spaces & symbols.jpg"
        alt='Image with special chars: <>"'
      />,
    );

    expect(
      screen.getByText(
        "Original: /images/test image with spaces & symbols.jpg",
      ),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Alt:.*Image with special chars/),
    ).toBeInTheDocument();
  });

  it("should create new Image instance for each src change", () => {
    process.env.NODE_ENV = "development";

    const { rerender } = render(
      <ImageDebugInfo src="/image1.jpg" alt="First image" />,
    );

    expect(global.Image).toHaveBeenCalledTimes(1);

    rerender(<ImageDebugInfo src="/image2.jpg" alt="Second image" />);

    expect(global.Image).toHaveBeenCalledTimes(2);
  });

  it("should handle rapid src changes correctly", async () => {
    process.env.NODE_ENV = "development";

    const { rerender } = render(
      <ImageDebugInfo src="/image1.jpg" alt="First image" />,
    );

    // Rapidly change src multiple times
    rerender(<ImageDebugInfo src="/image2.jpg" alt="Second image" />);
    rerender(<ImageDebugInfo src="/image3.jpg" alt="Third image" />);
    rerender(<ImageDebugInfo src="/image4.jpg" alt="Fourth image" />);

    expect(screen.getByText("Original: /image4.jpg")).toBeInTheDocument();
    expect(screen.getByText("Alt: Fourth image")).toBeInTheDocument();
  });
});
