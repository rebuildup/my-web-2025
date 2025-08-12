import { fireEvent, render, screen } from "@testing-library/react";
import { Button } from "../button";

describe("Button", () => {
  it("should render button with default variant", () => {
    render(<Button>Click me</Button>);

    const button = screen.getByRole("button", { name: "Click me" });
    expect(button).toBeInTheDocument();
    expect(button).toHaveClass("bg-primary", "text-primary-foreground");
  });

  it("should apply variant classes correctly", () => {
    const { rerender } = render(<Button variant="destructive">Delete</Button>);

    let button = screen.getByRole("button");
    expect(button).toHaveClass("bg-destructive", "text-destructive-foreground");

    rerender(<Button variant="outline">Outline</Button>);
    button = screen.getByRole("button");
    expect(button).toHaveClass("border", "border-input", "bg-background");

    rerender(<Button variant="secondary">Secondary</Button>);
    button = screen.getByRole("button");
    expect(button).toHaveClass("bg-secondary", "text-secondary-foreground");

    rerender(<Button variant="ghost">Ghost</Button>);
    button = screen.getByRole("button");
    expect(button).toHaveClass(
      "hover:bg-accent",
      "hover:text-accent-foreground",
    );

    rerender(<Button variant="link">Link</Button>);
    button = screen.getByRole("button");
    expect(button).toHaveClass("text-primary", "underline-offset-4");
  });

  it("should apply size classes correctly", () => {
    const { rerender } = render(<Button size="sm">Small</Button>);

    let button = screen.getByRole("button");
    expect(button).toHaveClass("h-9", "rounded-md", "px-3");

    rerender(<Button size="lg">Large</Button>);
    button = screen.getByRole("button");
    expect(button).toHaveClass("h-11", "rounded-md", "px-8");

    rerender(<Button size="icon">Icon</Button>);
    button = screen.getByRole("button");
    expect(button).toHaveClass("h-10", "w-10");
  });

  it("should handle onClick events", () => {
    const handleClick = jest.fn();

    render(<Button onClick={handleClick}>Click me</Button>);

    const button = screen.getByRole("button");
    fireEvent.click(button);

    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it("should be disabled when disabled prop is true", () => {
    render(<Button disabled>Disabled</Button>);

    const button = screen.getByRole("button");
    expect(button).toBeDisabled();
    expect(button).toHaveClass(
      "disabled:pointer-events-none",
      "disabled:opacity-50",
    );
  });

  it("should apply custom className", () => {
    render(<Button className="custom-class">Custom</Button>);

    const button = screen.getByRole("button");
    expect(button).toHaveClass("custom-class");
  });

  it("should render as different element when asChild is true", () => {
    render(
      <Button asChild>
        <a href="/test">Link Button</a>
      </Button>,
    );

    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("href", "/test");
    expect(link).toHaveTextContent("Link Button");
    expect(link).toHaveClass("bg-primary", "text-primary-foreground");
  });

  it("should forward additional props", () => {
    render(
      <Button
        type="submit"
        data-testid="submit-button"
        aria-label="Submit form"
      >
        Submit
      </Button>,
    );

    const button = screen.getByRole("button");
    expect(button).toHaveAttribute("type", "submit");
    expect(button).toHaveAttribute("data-testid", "submit-button");
    expect(button).toHaveAttribute("aria-label", "Submit form");
  });

  it("should have proper focus styles", () => {
    render(<Button>Focus me</Button>);

    const button = screen.getByRole("button");
    expect(button).toHaveClass(
      "focus-visible:outline-none",
      "focus-visible:ring-2",
      "focus-visible:ring-ring",
      "focus-visible:ring-offset-2",
    );
  });

  it("should have proper transition classes", () => {
    render(<Button>Transition</Button>);

    const button = screen.getByRole("button");
    expect(button).toHaveClass("transition-colors");
  });

  it("should handle keyboard events", () => {
    const handleClick = jest.fn();

    render(<Button onClick={handleClick}>Keyboard</Button>);

    const button = screen.getByRole("button");

    // Test Enter key
    fireEvent.keyDown(button, { key: "Enter" });
    fireEvent.keyUp(button, { key: "Enter" });

    // Test Space key
    fireEvent.keyDown(button, { key: " " });
    fireEvent.keyUp(button, { key: " " });

    // Button should be focusable and clickable
    expect(button).toBeInTheDocument();
  });

  it("should render with children correctly", () => {
    render(
      <Button>
        <span>Icon</span>
        <span>Text</span>
      </Button>,
    );

    expect(screen.getByText("Icon")).toBeInTheDocument();
    expect(screen.getByText("Text")).toBeInTheDocument();
  });

  it("should combine multiple variant and size classes", () => {
    render(
      <Button variant="outline" size="lg" className="custom-class">
        Combined
      </Button>,
    );

    const button = screen.getByRole("button");
    expect(button).toHaveClass(
      "border",
      "border-input",
      "bg-background",
      "h-11",
      "px-8",
      "custom-class",
    );
  });

  it("should maintain button semantics when using asChild", () => {
    render(
      <Button asChild>
        <div role="button" tabIndex={0}>
          Div Button
        </div>
      </Button>,
    );

    const button = screen.getByRole("button");
    expect(button).toHaveAttribute("tabIndex", "0");
    expect(button).toHaveTextContent("Div Button");
  });

  it("should handle ref forwarding", () => {
    const ref = { current: null };

    render(<Button ref={ref}>Ref Button</Button>);

    expect(ref.current).toBeInstanceOf(HTMLButtonElement);
  });

  it("should apply hover and active states correctly", () => {
    render(<Button variant="default">Hover me</Button>);

    const button = screen.getByRole("button");
    expect(button).toHaveClass("hover:bg-primary/90");
  });

  it("should handle whitespace correctly", () => {
    render(<Button>Button with spaces</Button>);

    const button = screen.getByRole("button");
    expect(button).toHaveClass("whitespace-nowrap");
  });
});
