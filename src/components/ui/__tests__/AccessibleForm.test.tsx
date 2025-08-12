import { fireEvent, render, screen } from "@testing-library/react";
import { AccessibilityProvider } from "../AccessibilityProvider";
import {
  AccessibleButton,
  AccessibleFormField,
  AccessibleInput,
  AccessibleSelect,
  AccessibleTextarea,
} from "../AccessibleForm";

const renderWithProvider = (component: React.ReactElement) => {
  return render(<AccessibilityProvider>{component}</AccessibilityProvider>);
};

describe("AccessibleFormField", () => {
  it("should render label and input correctly", () => {
    renderWithProvider(
      <AccessibleFormField label="Test Label">
        <input type="text" />
      </AccessibleFormField>,
    );

    expect(screen.getByText("Test Label")).toBeInTheDocument();
    expect(screen.getByRole("textbox")).toBeInTheDocument();
  });

  it("should show required indicator when required", () => {
    renderWithProvider(
      <AccessibleFormField label="Required Field" required>
        <input type="text" />
      </AccessibleFormField>,
    );

    expect(screen.getByText("*")).toBeInTheDocument();
    expect(screen.getByText("Required Field")).toBeInTheDocument();
  });

  it("should display error message when provided", () => {
    renderWithProvider(
      <AccessibleFormField label="Test Field" error="This field is required">
        <input type="text" />
      </AccessibleFormField>,
    );

    expect(screen.getByText("This field is required")).toBeInTheDocument();
    expect(screen.getByText("This field is required")).toHaveClass(
      "text-red-600",
    );
  });

  it("should display hint when provided", () => {
    renderWithProvider(
      <AccessibleFormField label="Test Field" hint="Enter your full name">
        <input type="text" />
      </AccessibleFormField>,
    );

    expect(screen.getByText("Enter your full name")).toBeInTheDocument();
    expect(screen.getByText("Enter your full name")).toHaveClass(
      "text-gray-600",
    );
  });

  it("should apply custom className", () => {
    const { container } = renderWithProvider(
      <AccessibleFormField label="Test Field" className="custom-class">
        <input type="text" />
      </AccessibleFormField>,
    );

    expect(container.firstChild).toHaveClass("custom-class");
  });
});

describe("AccessibleInput", () => {
  it("should render input with proper attributes", () => {
    renderWithProvider(
      <AccessibleInput placeholder="Enter text" aria-label="Test input" />,
    );

    const input = screen.getByRole("textbox");
    expect(input).toHaveAttribute("placeholder", "Enter text");
    expect(input).toHaveAttribute("aria-label", "Test input");
  });

  it("should handle onChange events", () => {
    const handleChange = jest.fn();

    renderWithProvider(<AccessibleInput onChange={handleChange} />);

    const input = screen.getByRole("textbox");
    fireEvent.change(input, { target: { value: "test value" } });

    expect(handleChange).toHaveBeenCalledWith(
      expect.objectContaining({
        target: expect.objectContaining({ value: "test value" }),
      }),
    );
  });

  it("should apply error styling when error prop is provided", () => {
    renderWithProvider(<AccessibleInput error="Invalid input" />);

    const input = screen.getByRole("textbox");
    expect(input).toHaveClass("border-red-500");
  });

  it("should be disabled when disabled prop is true", () => {
    renderWithProvider(<AccessibleInput disabled />);

    const input = screen.getByRole("textbox");
    expect(input).toBeDisabled();
    expect(input).toHaveClass("opacity-50");
  });

  it("should forward ref correctly", () => {
    const ref = { current: null };

    renderWithProvider(<AccessibleInput ref={ref} />);

    expect(ref.current).toBeInstanceOf(HTMLInputElement);
  });
});

describe("AccessibleTextarea", () => {
  it("should render textarea with proper attributes", () => {
    renderWithProvider(
      <AccessibleTextarea placeholder="Enter description" rows={5} />,
    );

    const textarea = screen.getByRole("textbox");
    expect(textarea).toHaveAttribute("placeholder", "Enter description");
    expect(textarea).toHaveAttribute("rows", "5");
  });

  it("should handle onChange events", () => {
    const handleChange = jest.fn();

    renderWithProvider(<AccessibleTextarea onChange={handleChange} />);

    const textarea = screen.getByRole("textbox");
    fireEvent.change(textarea, { target: { value: "test content" } });

    expect(handleChange).toHaveBeenCalledWith(
      expect.objectContaining({
        target: expect.objectContaining({ value: "test content" }),
      }),
    );
  });

  it("should apply error styling when error prop is provided", () => {
    renderWithProvider(<AccessibleTextarea error="Content too long" />);

    const textarea = screen.getByRole("textbox");
    expect(textarea).toHaveClass("border-red-500");
  });

  it("should be resizable by default", () => {
    renderWithProvider(<AccessibleTextarea />);

    const textarea = screen.getByRole("textbox");
    expect(textarea).toHaveClass("resize-y");
  });
});

describe("AccessibleSelect", () => {
  const options = [
    { value: "option1", label: "Option 1" },
    { value: "option2", label: "Option 2" },
    { value: "option3", label: "Option 3" },
  ];

  it("should render select with options", () => {
    renderWithProvider(<AccessibleSelect options={options} />);

    const select = screen.getByRole("combobox");
    expect(select).toBeInTheDocument();

    expect(
      screen.getByRole("option", { name: "Option 1" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("option", { name: "Option 2" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("option", { name: "Option 3" }),
    ).toBeInTheDocument();
  });

  it("should handle onChange events", () => {
    const handleChange = jest.fn();

    renderWithProvider(
      <AccessibleSelect options={options} onChange={handleChange} />,
    );

    const select = screen.getByRole("combobox");
    fireEvent.change(select, { target: { value: "option2" } });

    expect(handleChange).toHaveBeenCalledWith(
      expect.objectContaining({
        target: expect.objectContaining({ value: "option2" }),
      }),
    );
  });

  it("should show placeholder when provided", () => {
    renderWithProvider(
      <AccessibleSelect options={options} placeholder="Choose an option" />,
    );

    expect(screen.getByText("Choose an option")).toBeInTheDocument();
  });

  it("should apply error styling when error prop is provided", () => {
    renderWithProvider(
      <AccessibleSelect options={options} error="Please select an option" />,
    );

    const select = screen.getByRole("combobox");
    expect(select).toHaveClass("border-red-500");
  });

  it("should handle disabled options", () => {
    const optionsWithDisabled = [
      { value: "option1", label: "Option 1" },
      { value: "option2", label: "Option 2", disabled: true },
      { value: "option3", label: "Option 3" },
    ];

    renderWithProvider(<AccessibleSelect options={optionsWithDisabled} />);

    const disabledOption = screen.getByRole("option", { name: "Option 2" });
    expect(disabledOption).toBeDisabled();
  });
});

describe("AccessibleButton", () => {
  it("should render button with correct text", () => {
    renderWithProvider(<AccessibleButton>Click me</AccessibleButton>);

    expect(
      screen.getByRole("button", { name: "Click me" }),
    ).toBeInTheDocument();
  });

  it("should handle onClick events", () => {
    const handleClick = jest.fn();

    renderWithProvider(
      <AccessibleButton onClick={handleClick}>Click me</AccessibleButton>,
    );

    const button = screen.getByRole("button");
    fireEvent.click(button);

    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it("should apply variant styling", () => {
    renderWithProvider(
      <AccessibleButton variant="primary">Primary Button</AccessibleButton>,
    );

    const button = screen.getByRole("button");
    expect(button).toHaveClass("bg-blue-600");
  });

  it("should apply size styling", () => {
    renderWithProvider(
      <AccessibleButton size="lg">Large Button</AccessibleButton>,
    );

    const button = screen.getByRole("button");
    expect(button).toHaveClass("px-6", "py-3", "text-lg");
  });

  it("should be disabled when disabled prop is true", () => {
    renderWithProvider(
      <AccessibleButton disabled>Disabled Button</AccessibleButton>,
    );

    const button = screen.getByRole("button");
    expect(button).toBeDisabled();
    expect(button).toHaveClass("opacity-50");
  });

  it("should show loading state", () => {
    renderWithProvider(
      <AccessibleButton loading>Loading Button</AccessibleButton>,
    );

    const button = screen.getByRole("button");
    expect(button).toBeDisabled();
    expect(screen.getByText("読み込み中...")).toBeInTheDocument();
  });

  it("should render as different element when as prop is provided", () => {
    renderWithProvider(
      <AccessibleButton as="a" href="/test">
        Link Button
      </AccessibleButton>,
    );

    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("href", "/test");
    expect(link).toHaveTextContent("Link Button");
  });

  it("should handle keyboard navigation", () => {
    const handleClick = jest.fn();

    renderWithProvider(
      <AccessibleButton onClick={handleClick}>
        Keyboard Button
      </AccessibleButton>,
    );

    const button = screen.getByRole("button");

    // Test Enter key
    fireEvent.keyDown(button, { key: "Enter" });
    expect(handleClick).toHaveBeenCalledTimes(1);

    // Test Space key
    fireEvent.keyDown(button, { key: " " });
    expect(handleClick).toHaveBeenCalledTimes(2);
  });

  it("should forward ref correctly", () => {
    const ref = { current: null };

    renderWithProvider(
      <AccessibleButton ref={ref}>Ref Button</AccessibleButton>,
    );

    expect(ref.current).toBeInstanceOf(HTMLButtonElement);
  });
});
