/**
 * Sentry Error Monitoring Configuration
 * Production error tracking and performance monitoring
 */

import { getProductionConfig } from "@/lib/config/production";

export interface SentryConfig {
  dsn: string;
  environment: string;
  tracesSampleRate: number;
  beforeSend?: (event: unknown) => unknown;
  beforeSendTransaction?: (event: unknown) => unknown;
}

/**
 * Initialize Sentry for error monitoring
 */
export function initSentry(): void {
  const config = getProductionConfig();

  if (!config.monitoring.sentry.enabled || !config.monitoring.sentry.dsn) {
    console.log("Sentry monitoring disabled or DSN not configured");
    return;
  }

  // Dynamic import to avoid bundling Sentry in development
  if (typeof window !== "undefined") {
    import("@sentry/nextjs").then(({ init, getCurrentScope }) => {
      init({
        dsn: config.monitoring.sentry.dsn,
        environment: config.monitoring.sentry.environment,
        tracesSampleRate: config.monitoring.sentry.tracesSampleRate,
        beforeSend(event) {
          // Filter out sensitive information
          const eventObj = event as unknown as Record<string, unknown>;
          if (eventObj.exception) {
            const exception = eventObj.exception as { values?: unknown[] };
            exception.values?.forEach((exceptionValue: unknown) => {
              const exc = exceptionValue as Record<string, unknown>;
              if (exc.stacktrace) {
                const stacktrace = exc.stacktrace as { frames?: unknown[] };
                if (stacktrace.frames) {
                  stacktrace.frames = stacktrace.frames.map(
                    (frame: unknown) => ({
                      ...(frame as Record<string, unknown>),
                      vars: undefined, // Remove local variables
                    }),
                  );
                }
              }
            });
          }
          return event;
        },
        beforeSendTransaction(event) {
          // Filter performance data
          const eventObj = event as unknown as { transaction?: string };
          if (eventObj.transaction?.includes("admin")) {
            return null; // Don't send admin transactions
          }
          return event;
        },
      });

      // Configure scope with additional context
      const scope = getCurrentScope();
      if (scope) {
        scope.setTag("component", "portfolio");
        scope.setContext("build", {
          version: process.env.npm_package_version || "unknown",
          buildTime: process.env.NEXT_BUILD_TIME || "unknown",
        });
      }
    });
  }
}

/**
 * Capture error with context
 */
export function captureError(
  error: Error,
  context?: Record<string, unknown>,
): void {
  const config = getProductionConfig();

  if (!config.monitoring.sentry.enabled) {
    console.error("Error:", error, context);
    return;
  }

  if (typeof window !== "undefined") {
    import("@sentry/nextjs").then(({ captureException, withScope }) => {
      withScope(
        (scope: { setExtra: (key: string, value: unknown) => void }) => {
          if (context) {
            Object.entries(context).forEach(([key, value]) => {
              scope.setExtra(key, value);
            });
          }
          captureException(error);
        },
      );
    });
  }
}

/**
 * Capture performance metric
 */
export function capturePerformance(
  name: string,
  value: number,
  unit: string = "ms",
): void {
  const config = getProductionConfig();

  if (!config.monitoring.sentry.enabled) {
    console.log(`Performance: ${name} = ${value}${unit}`);
    return;
  }

  if (typeof window !== "undefined") {
    import("@sentry/nextjs").then(({ addBreadcrumb }) => {
      addBreadcrumb({
        category: "performance",
        message: `${name}: ${value}${unit}`,
        level: "info",
        data: {
          metric: name,
          value,
          unit,
        },
      });
    });
  }
}

/**
 * Capture user interaction
 */
export function captureUserInteraction(
  action: string,
  target: string,
  data?: Record<string, unknown>,
): void {
  const config = getProductionConfig();

  if (!config.monitoring.sentry.enabled) {
    return;
  }

  if (typeof window !== "undefined") {
    import("@sentry/nextjs").then(({ addBreadcrumb }) => {
      addBreadcrumb({
        category: "user",
        message: `${action} on ${target}`,
        level: "info",
        data: {
          action,
          target,
          ...data,
        },
      });
    });
  }
}

/**
 * Set user context
 */
export function setUserContext(userId: string, email?: string): void {
  const config = getProductionConfig();

  if (!config.monitoring.sentry.enabled) {
    return;
  }

  if (typeof window !== "undefined") {
    import("@sentry/nextjs").then(({ getCurrentScope }) => {
      const scope = getCurrentScope();
      if (scope) {
        scope.setUser({
          id: userId,
          email,
        });
      }
    });
  }
}
