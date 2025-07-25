"use client";

import { useCallback, useEffect, useState } from "react";
import { NotificationOptions } from "../types";

export function useNotifications() {
  const [permission, setPermission] =
    useState<NotificationPermission>("default");

  useEffect(() => {
    if (typeof window !== "undefined" && "Notification" in window) {
      setPermission(Notification.permission);
    }
  }, []);

  const requestPermission = useCallback(async () => {
    if (typeof window === "undefined" || !("Notification" in window)) {
      console.warn("This browser does not support notifications");
      return false;
    }

    if (permission === "granted") {
      return true;
    }

    if (permission === "denied") {
      return false;
    }

    try {
      const result = await Notification.requestPermission();
      setPermission(result);
      return result === "granted";
    } catch (error) {
      console.error("Error requesting notification permission:", error);
      return false;
    }
  }, [permission]);

  const showNotification = useCallback(
    (options: NotificationOptions) => {
      if (typeof window === "undefined" || !("Notification" in window)) {
        // Fallback to alert for browsers without notification support
        alert(`${options.title}\n${options.body}`);
        return;
      }

      if (permission !== "granted") {
        console.warn("Notification permission not granted");
        return;
      }

      try {
        const notification = new Notification(options.title, {
          body: options.body,
          icon: options.icon || "/favicon.ico",
          requireInteraction: options.requireInteraction || false,
          tag: "pomodoro-timer",
        });

        // Auto-close notification after 5 seconds
        setTimeout(() => {
          notification.close();
        }, 5000);

        return notification;
      } catch (error) {
        console.error("Error showing notification:", error);
        // Fallback to alert
        alert(`${options.title}\n${options.body}`);
      }
    },
    [permission]
  );

  return {
    permission,
    requestPermission,
    showNotification,
    isSupported: typeof window !== "undefined" && "Notification" in window,
  };
}
