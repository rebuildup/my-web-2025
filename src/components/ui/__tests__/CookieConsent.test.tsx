import { fireEvent, render, screen } from "@testing-library/react";
import { CookieConsent, CookieSettings } from "../CookieConsent";

// Mock the AnalyticsProvider
const mockSetConsent = jest.fn();
const mockUseAnalytics = {
  consentGiven: false,
  setConsent: mockSetConsent,
};

jest.mock("@/components/providers/AnalyticsProvider", () => ({
  useAnalytics: () => mockUseAnalytics,
}));

// Mock localStorage
const mockLocalStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
};

Object.defineProperty(window, "localStorage", {
  value: mockLocalStorage,
});

// Mock process.env
const originalEnv = process.env;

describe("CookieConsent", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockLocalStorage.getItem.mockReturnValue(null);
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it("should not render in test environment", () => {
    process.env.NODE_ENV = "test";

    const { container } = render(<CookieConsent />);

    expect(container.firstChild).toBeNull();
  });

  it("should render banner when no consent has been given", () => {
    mockLocalStorage.getItem.mockReturnValue(null);
    process.env.NODE_ENV = "development";

    render(<CookieConsent />);

    expect(screen.getByText(/we use cookies/i)).toBeInTheDocument();
  });

  it("should call setConsent when Accept All is clicked", () => {
    mockLocalStorage.getItem.mockReturnValue(null);
    process.env.NODE_ENV = "development";

    render(<CookieConsent />);

    const acceptButton = screen.getByText("Accept All");
    fireEvent.click(acceptButton);

    expect(mockSetConsent).toHaveBeenCalledWith(true);
  });
});

describe("CookieSettings", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseAnalytics.consentGiven = false;
  });

  it("should render cookie settings", () => {
    render(<CookieSettings />);

    expect(screen.getByText(/cookie settings/i)).toBeInTheDocument();
  });

  it("should save settings when Save button is clicked", () => {
    render(<CookieSettings />);

    const saveButton = screen.getByText("Save Preferences");
    fireEvent.click(saveButton);

    expect(mockSetConsent).toHaveBeenCalled();
  });
});
