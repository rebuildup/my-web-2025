// Global type definitions

declare global {
  interface Window {
    gtag?: (
      command: "config" | "event" | "js" | "set",
      targetId: string | Date,
      config?: Record<string, unknown>,
    ) => void;
  }

  // Service Worker Background Sync API
  interface ServiceWorkerRegistration {
    sync?: {
      register: (tag: string) => Promise<void>;
    };
  }

  // Performance Observer types
  interface PerformanceEntry {
    processingStart?: number;
    startTime: number;
    duration: number;
    name: string;
    entryType: string;
    value?: number;
    hadRecentInput?: boolean;
    interactionId?: number;
    transferSize?: number;
  }

  // Memory API
  interface Performance {
    memory?: {
      usedJSHeapSize: number;
      totalJSHeapSize: number;
      jsHeapSizeLimit: number;
    };
  }

  // Connection API
  interface Navigator {
    connection?: {
      effectiveType: string;
      addEventListener: (event: string, callback: () => void) => void;
    };
  }

  // Scheduler API
  interface Window {
    scheduler?: {
      postTask: (fn: () => void, options: { priority: string }) => void;
    };
  }

  // Next.js specific types
  namespace NodeJS {
    interface ProcessEnv {
      NODE_ENV: "development" | "production" | "test";
      NEXT_PUBLIC_APP_URL: string;
      NEXT_PUBLIC_VERCEL_URL?: string;
      VERCEL_URL?: string;
    }
  }

  // React 19 improvements
  namespace React {
    interface HTMLAttributes<T> {
      // React 19 form actions
      action?: string | ((formData: FormData) => void | Promise<void>);
    }
  }
}

export {};
