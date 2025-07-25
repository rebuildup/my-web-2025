"use client";

import { useEffect } from "react";
import Link from "next/link";

interface ToolWrapperProps {
  children: React.ReactNode;
  toolName: string;
  description: string;
  category: string;
  keyboardShortcuts?: Array<{
    key: string;
    description: string;
  }>;
}

export default function ToolWrapper({
  children,
  toolName,
  description,
  category,
  keyboardShortcuts = [],
}: ToolWrapperProps) {
  // Track tool usage
  useEffect(() => {
    const trackToolUsage = async () => {
      try {
        await fetch("/api/stats/view", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            contentId: `tool-${toolName.toLowerCase().replace(/\s+/g, "-")}`,
          }),
        });
      } catch (error) {
        console.error("Error tracking tool usage:", error);
      }
    };

    // Track usage after a short delay to ensure user is actually using the tool
    const timer = setTimeout(trackToolUsage, 3000);
    return () => clearTimeout(timer);
  }, [toolName]);

  // Keyboard shortcuts handler
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      // Only handle shortcuts when not in input fields
      if (
        event.target instanceof HTMLInputElement ||
        event.target instanceof HTMLTextAreaElement ||
        event.target instanceof HTMLSelectElement
      ) {
        return;
      }

      keyboardShortcuts.forEach((shortcut) => {
        if (event.key.toLowerCase() === shortcut.key.toLowerCase()) {
          event.preventDefault();
          // Trigger custom event for tool-specific shortcuts
          const customEvent = new CustomEvent("toolShortcut", {
            detail: { key: shortcut.key, description: shortcut.description },
          });
          document.dispatchEvent(customEvent);
        }
      });

      // Global shortcuts
      if (event.key === "Escape") {
        // Focus back to main content
        const mainContent = document.querySelector("main");
        if (mainContent) {
          (mainContent as HTMLElement).focus();
        }
      }
    };

    document.addEventListener("keydown", handleKeyPress);
    return () => document.removeEventListener("keydown", handleKeyPress);
  }, [keyboardShortcuts]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <main className="py-10" tabIndex={-1}>
        <div className="container-system">
          <div className="space-y-10">
            {/* Header */}
            <header className="space-y-6">
              <nav aria-label="Breadcrumb">
                <ol className="flex items-center space-x-2 text-sm">
                  <li>
                    <Link
                      href="/tools"
                      className="noto-sans-jp-light text-accent hover:text-primary focus:outline-none focus:ring-2 focus:ring-foreground focus:ring-offset-2 focus:ring-offset-background"
                    >
                      Tools
                    </Link>
                  </li>
                  <li className="text-foreground">/</li>
                  <li className="text-foreground">{toolName}</li>
                </ol>
              </nav>

              <div className="space-y-4">
                <h1 className="neue-haas-grotesk-display text-4xl text-primary">
                  {toolName}
                </h1>
                <p className="noto-sans-jp-light text-sm max-w leading-loose">
                  {description}
                </p>

                <div className="flex flex-wrap gap-4 items-center">
                  <span className="text-xs text-accent uppercase bg-base border border-foreground px-3 py-1">
                    {category}
                  </span>
                  <span className="text-xs text-accent">
                    オフライン対応・アクセシビリティ準拠
                  </span>
                </div>
              </div>
            </header>

            {/* Keyboard Shortcuts Help */}
            {keyboardShortcuts.length > 0 && (
              <section
                aria-labelledby="shortcuts-heading"
                className="bg-base border border-foreground p-4"
              >
                <h2
                  id="shortcuts-heading"
                  className="neue-haas-grotesk-display text-lg text-primary mb-3"
                >
                  Keyboard Shortcuts
                </h2>
                <div className="grid-system grid-1 xs:grid-2 sm:grid-3 gap-3">
                  {keyboardShortcuts.map((shortcut, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <kbd className="text-xs bg-background border border-foreground px-2 py-1">
                        {shortcut.key}
                      </kbd>
                      <span className="noto-sans-jp-light text-xs">
                        {shortcut.description}
                      </span>
                    </div>
                  ))}
                  <div className="flex items-center space-x-2">
                    <kbd className="text-xs bg-background border border-foreground px-2 py-1">
                      Esc
                    </kbd>
                    <span className="noto-sans-jp-light text-xs">
                      メインコンテンツにフォーカス
                    </span>
                  </div>
                </div>
              </section>
            )}

            {/* Tool Content */}
            <div
              role="application"
              aria-label={`${toolName} tool`}
              className="focus-within:ring-2 focus-within:ring-accent focus-within:ring-offset-2 focus-within:ring-offset-background"
            >
              <h2 className="sr-only">{toolName} Tool Interface</h2>
              {children}
            </div>

            {/* Navigation */}
            <nav aria-label="Site navigation">
              <div className="grid-system grid-1 xs:grid-2 sm:grid-2 gap-6">
                <Link
                  href="/tools"
                  className="border border-foreground text-center p-4 flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-foreground focus:ring-offset-2 focus:ring-offset-background"
                >
                  <span className="noto-sans-jp-regular text-base leading-snug">
                    ← Tools
                  </span>
                </Link>
                <Link
                  href="/"
                  className="border border-foreground text-center p-4 flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-foreground focus:ring-offset-2 focus:ring-offset-background"
                >
                  <span className="noto-sans-jp-regular text-base leading-snug">
                    ← Home
                  </span>
                </Link>
              </div>
            </nav>
          </div>
        </div>
      </main>
    </div>
  );
}
