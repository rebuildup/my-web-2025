/**
 * Card Component Tests
 * Tests for card components, refs, styling, and accessibility
 */

import { fireEvent, render, screen } from "@testing-library/react";
import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../card";

// Mock the cn utility function
jest.mock("@/lib/utils", () => ({
  cn: (...classes: (string | undefined | null | boolean)[]) =>
    classes.filter(Boolean).join(" "),
}));

describe("Card", () => {
  describe("Basic rendering", () => {
    it("should render with default props", () => {
      render(<Card>Card Content</Card>);

      const card = screen.getByText("Card Content");
      expect(card).toBeInTheDocument();
      expect(card.tagName).toBe("DIV");
    });

    it("should render children content", () => {
      render(<Card>Test Card Content</Card>);

      expect(screen.getByText("Test Card Content")).toBeInTheDocument();
    });

    it("should render with complex children", () => {
      render(
        <Card>
          <div>Complex</div>
          <span>Content</span>
        </Card>,
      );

      expect(screen.getByText("Complex")).toBeInTheDocument();
      expect(screen.getByText("Content")).toBeInTheDocument();
    });

    it("should render empty card", () => {
      render(<Card />);

      const card = document.querySelector("div");
      expect(card).toBeInTheDocument();
    });
  });

  describe("Styling", () => {
    it("should apply default classes", () => {
      render(<Card>Default Card</Card>);

      const card = screen.getByText("Default Card");
      expect(card).toHaveClass(
        "rounded-lg",
        "border",
        "bg-card",
        "text-card-foreground",
        "shadow-sm",
      );
    });

    it("should apply custom className", () => {
      render(<Card className="custom-class">Custom Card</Card>);

      const card = screen.getByText("Custom Card");
      expect(card).toHaveClass("custom-class", "rounded-lg", "border");
    });

    it("should merge multiple custom classes", () => {
      render(<Card className="class1 class2">Multiple Classes</Card>);

      const card = screen.getByText("Multiple Classes");
      expect(card).toHaveClass("class1", "class2");
    });
  });

  describe("HTML attributes", () => {
    it("should pass through HTML attributes", () => {
      render(
        <Card id="test-card" data-testid="card-element" role="article">
          Attributes
        </Card>,
      );

      const card = screen.getByText("Attributes");
      expect(card).toHaveAttribute("id", "test-card");
      expect(card).toHaveAttribute("data-testid", "card-element");
      expect(card).toHaveAttribute("role", "article");
    });

    it("should handle event handlers", () => {
      const handleClick = jest.fn();

      render(<Card onClick={handleClick}>Clickable Card</Card>);

      const card = screen.getByText("Clickable Card");
      card.click();

      expect(handleClick).toHaveBeenCalledTimes(1);
    });
  });

  describe("Ref forwarding", () => {
    it("should forward ref correctly", () => {
      const ref = React.createRef<HTMLDivElement>();

      render(<Card ref={ref}>Ref Card</Card>);

      expect(ref.current).toBeInstanceOf(HTMLDivElement);
      expect(ref.current?.textContent).toBe("Ref Card");
    });

    it("should work with callback refs", () => {
      let refElement: HTMLDivElement | null = null;
      const callbackRef = (element: HTMLDivElement | null) => {
        refElement = element;
      };

      render(<Card ref={callbackRef}>Callback Ref Card</Card>);

      expect(refElement).toBeInstanceOf(HTMLDivElement);
      expect(refElement?.textContent).toBe("Callback Ref Card");
    });
  });
});

describe("CardHeader", () => {
  describe("Basic rendering", () => {
    it("should render with default props", () => {
      render(<CardHeader>Header Content</CardHeader>);

      const header = screen.getByText("Header Content");
      expect(header).toBeInTheDocument();
      expect(header.tagName).toBe("DIV");
    });

    it("should apply default classes", () => {
      render(<CardHeader>Header</CardHeader>);

      const header = screen.getByText("Header");
      expect(header).toHaveClass("flex", "flex-col", "space-y-1.5", "p-6");
    });

    it("should apply custom className", () => {
      render(<CardHeader className="custom-header">Custom Header</CardHeader>);

      const header = screen.getByText("Custom Header");
      expect(header).toHaveClass("custom-header", "flex", "flex-col");
    });
  });

  describe("Ref forwarding", () => {
    it("should forward ref correctly", () => {
      const ref = React.createRef<HTMLDivElement>();

      render(<CardHeader ref={ref}>Ref Header</CardHeader>);

      expect(ref.current).toBeInstanceOf(HTMLDivElement);
      expect(ref.current?.textContent).toBe("Ref Header");
    });
  });
});

describe("CardTitle", () => {
  describe("Basic rendering", () => {
    it("should render as h3 element", () => {
      render(<CardTitle>Title Content</CardTitle>);

      const title = screen.getByText("Title Content");
      expect(title).toBeInTheDocument();
      expect(title.tagName).toBe("H3");
    });

    it("should apply default classes", () => {
      render(<CardTitle>Title</CardTitle>);

      const title = screen.getByText("Title");
      expect(title).toHaveClass(
        "text-2xl",
        "font-semibold",
        "leading-none",
        "tracking-tight",
      );
    });

    it("should apply custom className", () => {
      render(<CardTitle className="custom-title">Custom Title</CardTitle>);

      const title = screen.getByText("Custom Title");
      expect(title).toHaveClass("custom-title", "text-2xl", "font-semibold");
    });
  });

  describe("Accessibility", () => {
    it("should be a proper heading element", () => {
      render(<CardTitle>Accessible Title</CardTitle>);

      const title = screen.getByRole("heading", { level: 3 });
      expect(title).toBeInTheDocument();
      expect(title).toHaveTextContent("Accessible Title");
    });

    it("should support ARIA attributes", () => {
      render(
        <CardTitle id="card-title" aria-describedby="card-desc">
          ARIA Title
        </CardTitle>,
      );

      const title = screen.getByText("ARIA Title");
      expect(title).toHaveAttribute("id", "card-title");
      expect(title).toHaveAttribute("aria-describedby", "card-desc");
    });
  });

  describe("Ref forwarding", () => {
    it("should forward ref correctly", () => {
      const ref = React.createRef<HTMLHeadingElement>();

      render(<CardTitle ref={ref}>Ref Title</CardTitle>);

      expect(ref.current).toBeInstanceOf(HTMLHeadingElement);
      expect(ref.current?.textContent).toBe("Ref Title");
    });
  });
});

describe("CardDescription", () => {
  describe("Basic rendering", () => {
    it("should render as p element", () => {
      render(<CardDescription>Description Content</CardDescription>);

      const description = screen.getByText("Description Content");
      expect(description).toBeInTheDocument();
      expect(description.tagName).toBe("P");
    });

    it("should apply default classes", () => {
      render(<CardDescription>Description</CardDescription>);

      const description = screen.getByText("Description");
      expect(description).toHaveClass("text-sm", "text-muted-foreground");
    });

    it("should apply custom className", () => {
      render(
        <CardDescription className="custom-desc">
          Custom Description
        </CardDescription>,
      );

      const description = screen.getByText("Custom Description");
      expect(description).toHaveClass("custom-desc", "text-sm");
    });
  });

  describe("Ref forwarding", () => {
    it("should forward ref correctly", () => {
      const ref = React.createRef<HTMLParagraphElement>();

      render(<CardDescription ref={ref}>Ref Description</CardDescription>);

      expect(ref.current).toBeInstanceOf(HTMLParagraphElement);
      expect(ref.current?.textContent).toBe("Ref Description");
    });
  });
});

describe("CardContent", () => {
  describe("Basic rendering", () => {
    it("should render with default props", () => {
      render(<CardContent>Content</CardContent>);

      const content = screen.getByText("Content");
      expect(content).toBeInTheDocument();
      expect(content.tagName).toBe("DIV");
    });

    it("should apply default classes", () => {
      render(<CardContent>Content</CardContent>);

      const content = screen.getByText("Content");
      expect(content).toHaveClass("p-6", "pt-0");
    });

    it("should apply custom className", () => {
      render(
        <CardContent className="custom-content">Custom Content</CardContent>,
      );

      const content = screen.getByText("Custom Content");
      expect(content).toHaveClass("custom-content", "p-6", "pt-0");
    });
  });

  describe("Ref forwarding", () => {
    it("should forward ref correctly", () => {
      const ref = React.createRef<HTMLDivElement>();

      render(<CardContent ref={ref}>Ref Content</CardContent>);

      expect(ref.current).toBeInstanceOf(HTMLDivElement);
      expect(ref.current?.textContent).toBe("Ref Content");
    });
  });
});

describe("CardFooter", () => {
  describe("Basic rendering", () => {
    it("should render with default props", () => {
      render(<CardFooter>Footer</CardFooter>);

      const footer = screen.getByText("Footer");
      expect(footer).toBeInTheDocument();
      expect(footer.tagName).toBe("DIV");
    });

    it("should apply default classes", () => {
      render(<CardFooter>Footer</CardFooter>);

      const footer = screen.getByText("Footer");
      expect(footer).toHaveClass("flex", "items-center", "p-6", "pt-0");
    });

    it("should apply custom className", () => {
      render(<CardFooter className="custom-footer">Custom Footer</CardFooter>);

      const footer = screen.getByText("Custom Footer");
      expect(footer).toHaveClass("custom-footer", "flex", "items-center");
    });
  });

  describe("Ref forwarding", () => {
    it("should forward ref correctly", () => {
      const ref = React.createRef<HTMLDivElement>();

      render(<CardFooter ref={ref}>Ref Footer</CardFooter>);

      expect(ref.current).toBeInstanceOf(HTMLDivElement);
      expect(ref.current?.textContent).toBe("Ref Footer");
    });
  });
});

describe("Card composition", () => {
  it("should work together as a complete card", () => {
    render(
      <Card>
        <CardHeader>
          <CardTitle>Card Title</CardTitle>
          <CardDescription>Card Description</CardDescription>
        </CardHeader>
        <CardContent>
          <p>This is the card content.</p>
        </CardContent>
        <CardFooter>
          <button>Action</button>
        </CardFooter>
      </Card>,
    );

    expect(screen.getByText("Card Title")).toBeInTheDocument();
    expect(screen.getByText("Card Description")).toBeInTheDocument();
    expect(screen.getByText("This is the card content.")).toBeInTheDocument();
    expect(screen.getByText("Action")).toBeInTheDocument();

    // Check structure
    const title = screen.getByRole("heading", { level: 3 });
    expect(title).toHaveTextContent("Card Title");

    const button = screen.getByRole("button");
    expect(button).toHaveTextContent("Action");
  });

  it("should maintain proper semantic structure", () => {
    render(
      <Card role="article">
        <CardHeader>
          <CardTitle>Semantic Card</CardTitle>
          <CardDescription>With proper structure</CardDescription>
        </CardHeader>
        <CardContent>Content goes here</CardContent>
      </Card>,
    );

    const article = screen.getByRole("article");
    expect(article).toBeInTheDocument();

    const heading = screen.getByRole("heading");
    expect(heading).toBeInTheDocument();
  });

  it("should handle nested components correctly", () => {
    render(
      <Card>
        <CardHeader>
          <CardTitle>
            <span>Nested</span> Title
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div>
            <p>Nested paragraph</p>
            <ul>
              <li>List item</li>
            </ul>
          </div>
        </CardContent>
      </Card>,
    );

    expect(screen.getByText("Nested")).toBeInTheDocument();
    expect(screen.getByText("Title")).toBeInTheDocument();
    expect(screen.getByText("Nested paragraph")).toBeInTheDocument();
    expect(screen.getByText("List item")).toBeInTheDocument();
  });
});

describe("Edge cases", () => {
  it("should handle empty content gracefully", () => {
    render(
      <Card>
        <CardHeader />
        <CardTitle />
        <CardDescription />
        <CardContent />
        <CardFooter />
      </Card>,
    );

    // Should not crash
    expect(document.querySelector('[class*="rounded-lg"]')).toBeInTheDocument();
  });

  it("should handle null children", () => {
    render(
      <Card>
        <CardHeader>{null}</CardHeader>
        <CardContent>{null}</CardContent>
      </Card>,
    );

    expect(document.querySelector('[class*="rounded-lg"]')).toBeInTheDocument();
  });

  it("should handle very long content", () => {
    const longText = "A".repeat(1000);

    render(
      <Card>
        <CardTitle>{longText}</CardTitle>
        <CardContent>{longText}</CardContent>
      </Card>,
    );

    expect(screen.getAllByText(longText)).toHaveLength(2);
  });

  it("should handle special characters", () => {
    const specialText = "!@#$%^&*()_+-=[]{}|;:,.<>?";

    render(
      <Card>
        <CardTitle>{specialText}</CardTitle>
        <CardDescription>{specialText}</CardDescription>
      </Card>,
    );

    expect(screen.getAllByText(specialText)).toHaveLength(2);
  });
});

describe("Display names", () => {
  it("should have correct display names for debugging", () => {
    expect(Card.displayName).toBe("Card");
    expect(CardHeader.displayName).toBe("CardHeader");
    expect(CardTitle.displayName).toBe("CardTitle");
    expect(CardDescription.displayName).toBe("CardDescription");
    expect(CardContent.displayName).toBe("CardContent");
    expect(CardFooter.displayName).toBe("CardFooter");
  });
});

describe("Accessibility", () => {
  it("should support ARIA attributes on all components", () => {
    render(
      <Card aria-labelledby="card-title" role="region">
        <CardHeader aria-label="Card header">
          <CardTitle id="card-title">Accessible Card</CardTitle>
          <CardDescription aria-describedby="extra-info">
            Description
          </CardDescription>
        </CardHeader>
        <CardContent role="main">Content</CardContent>
        <CardFooter role="contentinfo">Footer</CardFooter>
      </Card>,
    );

    const card = screen.getByRole("region");
    expect(card).toHaveAttribute("aria-labelledby", "card-title");

    const header = screen.getByLabelText("Card header");
    expect(header).toBeInTheDocument();

    const title = screen.getByRole("heading");
    expect(title).toHaveAttribute("id", "card-title");

    const content = screen.getByRole("main");
    expect(content).toBeInTheDocument();

    const footer = screen.getByRole("contentinfo");
    expect(footer).toBeInTheDocument();
  });

  it("should be keyboard navigable when interactive", () => {
    const handleKeyDown = jest.fn();

    render(
      <Card tabIndex={0} onKeyDown={handleKeyDown}>
        <CardContent>Keyboard navigable card</CardContent>
      </Card>,
    );

    const card = screen
      .getByText("Keyboard navigable card")
      .closest('[tabindex="0"]') as HTMLElement;
    card.focus();

    expect(document.activeElement).toBe(card);

    fireEvent.keyDown(card, { key: "Enter" });
    expect(handleKeyDown).toHaveBeenCalledTimes(1);
  });
});
