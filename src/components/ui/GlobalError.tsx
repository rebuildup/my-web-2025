// src/components/ui/GlobalError.tsx
import React, { useEffect, useRef } from "react";
import Head from "next/head";
import { gsap } from "gsap";
import Button from "@/components/ui/Button";

interface GlobalErrorProps {
  statusCode?: number;
  title?: string;
  message?: string;
  error?: Error;
}

const GlobalError: React.FC<GlobalErrorProps> = ({
  statusCode = 500,
  title = "Something went wrong",
  message = "We're sorry, but we encountered an unexpected error. Our team has been notified and is working on fixing the issue.",
  error,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current) {
      gsap.fromTo(
        containerRef.current,
        { opacity: 0 },
        { opacity: 1, duration: 0.5, ease: "power2.out" }
      );
    }

    if (contentRef.current) {
      gsap.fromTo(
        contentRef.current.children,
        { y: 20, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          stagger: 0.1,
          delay: 0.2,
          duration: 0.5,
          ease: "power2.out",
        }
      );
    }
  }, []);

  // Log the error to console (in production you would send to error tracking service)
  useEffect(() => {
    if (error) {
      console.error("Global error encountered:", error);
    }
  }, [error]);

  return (
    <>
      <Head>
        <title>Error {statusCode} | Something went wrong</title>
      </Head>
      <div
        ref={containerRef}
        className="min-h-screen bg-gray-100 flex items-center justify-center p-4"
      >
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="p-2 bg-red-500"></div>
          <div ref={contentRef} className="p-8 space-y-6">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 text-red-500 mb-4">
                <svg
                  className="w-8 h-8"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-gray-800 mb-2">{title}</h1>
              <p className="text-gray-600">{message}</p>
            </div>

            {statusCode && (
              <div className="bg-gray-50 p-4 rounded-md text-center">
                <div className="text-4xl font-bold text-gray-300 mb-1">
                  {statusCode}
                </div>
                <p className="text-sm text-gray-500">
                  {statusCode === 500
                    ? "Internal Server Error"
                    : statusCode === 503
                    ? "Service Unavailable"
                    : "Error Code"}
                </p>
              </div>
            )}

            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <Button
                  onClick={() => window.location.reload()}
                  variant="primary"
                >
                  Reload Page
                </Button>
                <Button href="/" variant="outline">
                  Return to Home
                </Button>
              </div>

              <div className="text-center">
                <p className="text-sm text-gray-500">
                  If the problem persists, please contact our support team.
                </p>
              </div>
            </div>

            {process.env.NODE_ENV === "development" && error && (
              <div className="mt-6 border-t border-gray-200 pt-6">
                <h3 className="text-sm font-medium text-gray-500 mb-2">
                  Error Details (Development Only)
                </h3>
                <div className="bg-gray-800 text-white p-4 rounded-md overflow-auto max-h-40 text-xs font-mono">
                  <p>
                    {error.name}: {error.message}
                  </p>
                  <pre>{error.stack}</pre>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default GlobalError;
