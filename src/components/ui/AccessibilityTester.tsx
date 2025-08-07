"use client";

import {
  autoFixAccessibilityIssues,
  logAccessibilityReport,
  runAccessibilityAudit,
  type AccessibilityReport,
} from "@/lib/utils/accessibility-testing";
import { AlertTriangle, CheckCircle, Eye, EyeOff, Info, X } from "lucide-react";
import React, { useEffect, useState } from "react";

interface AccessibilityTesterProps {
  enabled?: boolean;
  autoRun?: boolean;
  showFloatingButton?: boolean;
}

export const AccessibilityTester: React.FC<AccessibilityTesterProps> = ({
  enabled = process.env.NODE_ENV === "development",
  autoRun = true,
  showFloatingButton = true,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [report, setReport] = useState<AccessibilityReport | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [autoFixCount, setAutoFixCount] = useState(0);

  // Run accessibility audit
  const runAudit = async () => {
    setIsRunning(true);
    try {
      const newReport = runAccessibilityAudit();
      setReport(newReport);
      logAccessibilityReport(newReport);
    } catch (error) {
      console.error("Accessibility audit failed:", error);
    } finally {
      setIsRunning(false);
    }
  };

  // Auto-fix issues
  const runAutoFix = () => {
    const fixedCount = autoFixAccessibilityIssues();
    setAutoFixCount(fixedCount);

    // Re-run audit after fixes
    setTimeout(() => {
      runAudit();
    }, 500);
  };

  // Auto-run on mount and DOM changes
  useEffect(() => {
    if (!enabled || !autoRun) return;

    let timeoutId: NodeJS.Timeout;

    const runDelayedAudit = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(runAudit, 1000);
    };

    // Initial audit
    runDelayedAudit();

    // Monitor DOM changes
    const observer = new MutationObserver(runDelayedAudit);
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: [
        "class",
        "style",
        "aria-label",
        "aria-labelledby",
        "alt",
      ],
    });

    return () => {
      clearTimeout(timeoutId);
      observer.disconnect();
    };
  }, [enabled, autoRun]);

  if (!enabled) return null;

  const getIssueIcon = (type: string) => {
    switch (type) {
      case "error":
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case "warning":
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case "info":
        return <Info className="h-4 w-4 text-blue-500" />;
      default:
        return <Info className="h-4 w-4" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical":
        return "text-red-600 bg-red-50 border-red-200";
      case "serious":
        return "text-red-500 bg-red-50 border-red-200";
      case "moderate":
        return "text-yellow-600 bg-yellow-50 border-yellow-200";
      case "minor":
        return "text-blue-600 bg-blue-50 border-blue-200";
      default:
        return "text-gray-600 bg-gray-50 border-gray-200";
    }
  };

  return (
    <>
      {/* Floating Button */}
      {showFloatingButton && (
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="fixed bottom-4 right-4 z-50 bg-accent text-background p-3 rounded-full shadow-lg hover:bg-accent/90 focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2"
          aria-label="アクセシビリティテスターを開く"
          title="Accessibility Tester"
        >
          {isOpen ? (
            <EyeOff className="h-5 w-5" />
          ) : (
            <Eye className="h-5 w-5" />
          )}
          {report && report.summary.total > 0 && (
            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-6 w-6 flex items-center justify-center">
              {report.summary.total}
            </span>
          )}
        </button>
      )}

      {/* Accessibility Panel */}
      {isOpen && (
        <div className="fixed bottom-20 right-4 z-50 bg-background border-2 border-foreground shadow-xl rounded-lg w-96 max-h-96 overflow-hidden">
          <div className="flex items-center justify-between p-4 border-b border-foreground">
            <h3 className="font-semibold text-foreground">
              Accessibility Tester
            </h3>
            <div className="flex items-center space-x-2">
              <button
                onClick={runAudit}
                disabled={isRunning}
                className="px-3 py-1 text-sm bg-accent text-background rounded hover:bg-accent/90 disabled:opacity-50"
              >
                {isRunning ? "Running..." : "Run Audit"}
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="text-foreground hover:text-accent"
                aria-label="閉じる"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="p-4 overflow-y-auto max-h-80">
            {!report ? (
              <div className="text-center text-foreground/60">
                <p>Click &quot;Run Audit&quot; to check accessibility</p>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Summary */}
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="bg-red-50 border border-red-200 p-2 rounded">
                    <div className="text-red-600 font-medium">Errors</div>
                    <div className="text-red-800 text-lg">
                      {report.summary.errors}
                    </div>
                  </div>
                  <div className="bg-yellow-50 border border-yellow-200 p-2 rounded">
                    <div className="text-yellow-600 font-medium">Warnings</div>
                    <div className="text-yellow-800 text-lg">
                      {report.summary.warnings}
                    </div>
                  </div>
                </div>

                {/* Auto-fix button */}
                {report.summary.total > 0 && (
                  <div className="flex items-center justify-between">
                    <button
                      onClick={runAutoFix}
                      className="px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700"
                    >
                      Auto-fix Issues
                    </button>
                    {autoFixCount > 0 && (
                      <span className="text-sm text-green-600">
                        Fixed {autoFixCount} issues
                      </span>
                    )}
                  </div>
                )}

                {/* Passed Checks */}
                {report.passedChecks.length > 0 && (
                  <div className="bg-green-50 border border-green-200 p-3 rounded">
                    <div className="flex items-center space-x-2 mb-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="text-green-700 font-medium">
                        Passed Checks
                      </span>
                    </div>
                    <div className="text-sm text-green-600">
                      {report.passedChecks.join(", ")}
                    </div>
                  </div>
                )}

                {/* Issues */}
                {report.issues.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="font-medium text-foreground">
                      Issues Found:
                    </h4>
                    {report.issues.slice(0, 10).map((issue, index) => (
                      <div
                        key={index}
                        className={`p-3 rounded border text-sm ${getSeverityColor(issue.severity)}`}
                      >
                        <div className="flex items-start space-x-2">
                          {getIssueIcon(issue.type)}
                          <div className="flex-1">
                            <div className="font-medium">{issue.rule}</div>
                            <div className="mt-1">{issue.message}</div>
                            <div className="mt-1 text-xs opacity-75">
                              Severity: {issue.severity}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                    {report.issues.length > 10 && (
                      <div className="text-sm text-foreground/60 text-center">
                        ... and {report.issues.length - 10} more issues
                      </div>
                    )}
                  </div>
                )}

                {report.issues.length === 0 && (
                  <div className="bg-green-50 border border-green-200 p-4 rounded text-center">
                    <CheckCircle className="h-8 w-8 text-green-500 mx-auto mb-2" />
                    <div className="text-green-700 font-medium">
                      No accessibility issues found!
                    </div>
                    <div className="text-green-600 text-sm mt-1">
                      Your page meets WCAG 2.1 AA standards
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default AccessibilityTester;
