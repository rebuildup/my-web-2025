import { render, screen } from "@testing-library/react";
import React from "react";
import { TestWrapper } from "../test-wrapper";

describe("TestWrapper", () => {
  it("should render children correctly", () => {
    const testContent = "Test content";

    render(
      <TestWrapper>
        <div>{testContent}</div>
      </TestWrapper>,
    );

    expect(screen.getByText(testContent)).toBeInTheDocument();
  });

  it("should have test-wrapper data-testid", () => {
    render(
      <TestWrapper>
        <div>Content</div>
      </TestWrapper>,
    );

    expect(screen.getByTestId("test-wrapper")).toBeInTheDocument();
  });

  it("should render multiple children", () => {
    render(
      <TestWrapper>
        <div>First child</div>
        <div>Second child</div>
        <span>Third child</span>
      </TestWrapper>,
    );

    expect(screen.getByText("First child")).toBeInTheDocument();
    expect(screen.getByText("Second child")).toBeInTheDocument();
    expect(screen.getByText("Third child")).toBeInTheDocument();
  });

  it("should render nested components", () => {
    const NestedComponent = () => (
      <div>
        <h1>Title</h1>
        <p>Description</p>
      </div>
    );

    render(
      <TestWrapper>
        <NestedComponent />
      </TestWrapper>,
    );

    expect(screen.getByText("Title")).toBeInTheDocument();
    expect(screen.getByText("Description")).toBeInTheDocument();
  });

  it("should handle empty children", () => {
    render(<TestWrapper>{null}</TestWrapper>);

    const wrapper = screen.getByTestId("test-wrapper");
    expect(wrapper).toBeInTheDocument();
    expect(wrapper).toBeEmptyDOMElement();
  });

  it("should handle string children", () => {
    const textContent = "Simple text content";

    render(<TestWrapper>{textContent}</TestWrapper>);

    expect(screen.getByText(textContent)).toBeInTheDocument();
  });

  it("should handle React fragments", () => {
    render(
      <TestWrapper>
        <>
          <div>Fragment child 1</div>
          <div>Fragment child 2</div>
        </>
      </TestWrapper>,
    );

    expect(screen.getByText("Fragment child 1")).toBeInTheDocument();
    expect(screen.getByText("Fragment child 2")).toBeInTheDocument();
  });

  it("should maintain proper DOM structure", () => {
    render(
      <TestWrapper>
        <div className="test-class">
          <button>Click me</button>
        </div>
      </TestWrapper>,
    );

    const wrapper = screen.getByTestId("test-wrapper");
    const childDiv = screen.getByRole("button").parentElement;

    expect(wrapper).toContainElement(childDiv);
    expect(childDiv).toHaveClass("test-class");
  });

  it("should be accessible", () => {
    render(
      <TestWrapper>
        <button aria-label="Test button">Click</button>
      </TestWrapper>,
    );

    const button = screen.getByLabelText("Test button");
    expect(button).toBeInTheDocument();
  });

  it("should work with conditional rendering", () => {
    const showContent = true;

    render(
      <TestWrapper>
        {showContent && <div>Conditional content</div>}
        {!showContent && <div>Alternative content</div>}
      </TestWrapper>,
    );

    expect(screen.getByText("Conditional content")).toBeInTheDocument();
    expect(screen.queryByText("Alternative content")).not.toBeInTheDocument();
  });
});
