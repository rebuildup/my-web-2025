import { renderHook, act } from "@testing-library/react";
import { useNotifications } from "../hooks/useNotifications";

// Mock Notification API
const mockNotification = {
  close: jest.fn(),
};

const NotificationMock = jest.fn().mockImplementation(() => mockNotification);

Object.defineProperty(window, "Notification", {
  value: NotificationMock,
  configurable: true,
});

Object.defineProperty(Notification, "permission", {
  value: "default",
  writable: true,
});

Object.defineProperty(Notification, "requestPermission", {
  value: jest.fn(),
});

describe("useNotifications", () => {
  beforeEach(() => {
    NotificationMock.mockClear();
    mockNotification.close.mockClear();
    (Notification.requestPermission as jest.Mock).mockClear();

    // Reset permission
    Object.defineProperty(Notification, "permission", {
      value: "default",
      writable: true,
    });
  });

  it("initializes with default permission state", () => {
    const { result } = renderHook(() => useNotifications());

    expect(result.current.permission).toBe("default");
    expect(result.current.isSupported).toBe(true);
  });

  it("requests permission successfully", async () => {
    (Notification.requestPermission as jest.Mock).mockResolvedValue("granted");

    const { result } = renderHook(() => useNotifications());

    let permissionResult;
    await act(async () => {
      permissionResult = await result.current.requestPermission();
    });

    expect(permissionResult).toBe(true);
    expect(Notification.requestPermission).toHaveBeenCalled();
  });

  it("handles permission denial", async () => {
    (Notification.requestPermission as jest.Mock).mockResolvedValue("denied");

    const { result } = renderHook(() => useNotifications());

    let permissionResult;
    await act(async () => {
      permissionResult = await result.current.requestPermission();
    });

    expect(permissionResult).toBe(false);
  });

  it("returns true if permission already granted", async () => {
    Object.defineProperty(Notification, "permission", {
      value: "granted",
      writable: true,
    });

    const { result } = renderHook(() => useNotifications());

    let permissionResult;
    await act(async () => {
      permissionResult = await result.current.requestPermission();
    });

    expect(permissionResult).toBe(true);
    expect(Notification.requestPermission).not.toHaveBeenCalled();
  });

  it("shows notification when permission is granted", () => {
    Object.defineProperty(Notification, "permission", {
      value: "granted",
      writable: true,
    });

    const { result } = renderHook(() => useNotifications());

    act(() => {
      result.current.showNotification({
        title: "Test Title",
        body: "Test Body",
      });
    });

    expect(NotificationMock).toHaveBeenCalledWith("Test Title", {
      body: "Test Body",
      icon: "/favicon.ico",
      requireInteraction: false,
      tag: "pomodoro-timer",
    });
  });

  it("does not show notification when permission is denied", () => {
    Object.defineProperty(Notification, "permission", {
      value: "denied",
      writable: true,
    });

    const consoleSpy = jest.spyOn(console, "warn").mockImplementation();

    const { result } = renderHook(() => useNotifications());

    act(() => {
      result.current.showNotification({
        title: "Test Title",
        body: "Test Body",
      });
    });

    expect(NotificationMock).not.toHaveBeenCalled();
    expect(consoleSpy).toHaveBeenCalledWith(
      "Notification permission not granted",
    );

    consoleSpy.mockRestore();
  });

  it("handles browsers without notification support", () => {
    // Remove Notification from window
    const originalNotification = window.Notification;
    delete (window as unknown as { Notification: unknown }).Notification;

    const alertSpy = jest.spyOn(window, "alert").mockImplementation();

    const { result } = renderHook(() => useNotifications());

    expect(result.current.isSupported).toBe(false);

    act(() => {
      result.current.showNotification({
        title: "Test Title",
        body: "Test Body",
      });
    });

    expect(alertSpy).toHaveBeenCalledWith("Test Title\nTest Body");

    // Restore Notification
    (window as unknown as { Notification: unknown }).Notification =
      originalNotification;
    alertSpy.mockRestore();
  });

  it("handles notification creation errors", () => {
    Object.defineProperty(Notification, "permission", {
      value: "granted",
      writable: true,
    });

    NotificationMock.mockImplementation(() => {
      throw new Error("Notification creation failed");
    });

    const consoleSpy = jest.spyOn(console, "error").mockImplementation();
    const alertSpy = jest.spyOn(window, "alert").mockImplementation();

    const { result } = renderHook(() => useNotifications());

    act(() => {
      result.current.showNotification({
        title: "Test Title",
        body: "Test Body",
      });
    });

    expect(consoleSpy).toHaveBeenCalledWith(
      "Error showing notification:",
      expect.any(Error),
    );
    expect(alertSpy).toHaveBeenCalledWith("Test Title\nTest Body");

    consoleSpy.mockRestore();
    alertSpy.mockRestore();
  });
});
