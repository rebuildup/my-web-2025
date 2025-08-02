"use client";

import { MarkdownEditorProps } from "@/types/enhanced-content";
import { useCallback, useEffect, useRef, useState } from "react";

/**
 * MarkdownEditor Component
 * A comprehensive markdown editor with real-time preview, toolbar, and file management
 */
export function MarkdownEditor({
  content,
  filePath,
  onChange,
  onSave,
  preview = true,
  toolbar = true,
}: MarkdownEditorProps) {
  const [editorContent, setEditorContent] = useState(content);
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<
    "idle" | "saving" | "success" | "error"
  >("idle");
  const [error, setError] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Update editor content when prop changes
  useEffect(() => {
    setEditorContent(content);
  }, [content]);

  // Handle content change
  const handleContentChange = useCallback(
    (newContent: string) => {
      setEditorContent(newContent);
      onChange(newContent);
      setError(null);
    },
    [onChange],
  );

  // Handle save operation
  const handleSave = useCallback(async () => {
    if (!filePath || !onSave) return;

    setIsSaving(true);
    setSaveStatus("saving");
    setError(null);

    try {
      await onSave(editorContent, filePath);
      setSaveStatus("success");
      setTimeout(() => setSaveStatus("idle"), 2000);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to save file";
      setError(errorMessage);
      setSaveStatus("error");
      setTimeout(() => setSaveStatus("idle"), 3000);
    } finally {
      setIsSaving(false);
    }
  }, [editorContent, filePath, onSave]);

  // Insert markdown syntax at cursor position
  const insertMarkdown = useCallback(
    (before: string, after: string = "") => {
      const textarea = textareaRef.current;
      if (!textarea) return;

      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const selectedText = editorContent.substring(start, end);
      const newContent =
        editorContent.substring(0, start) +
        before +
        selectedText +
        after +
        editorContent.substring(end);

      handleContentChange(newContent);

      // Restore cursor position
      setTimeout(() => {
        textarea.focus();
        const newCursorPos = start + before.length + selectedText.length;
        textarea.setSelectionRange(newCursorPos, newCursorPos);
      }, 0);
    },
    [editorContent, handleContentChange],
  );

  // Toolbar actions
  const toolbarActions = [
    {
      label: "Bold",
      icon: "B",
      action: () => insertMarkdown("**", "**"),
      shortcut: "Ctrl+B",
    },
    {
      label: "Italic",
      icon: "I",
      action: () => insertMarkdown("*", "*"),
      shortcut: "Ctrl+I",
    },
    {
      label: "Heading 1",
      icon: "H1",
      action: () => insertMarkdown("# "),
    },
    {
      label: "Heading 2",
      icon: "H2",
      action: () => insertMarkdown("## "),
    },
    {
      label: "Heading 3",
      icon: "H3",
      action: () => insertMarkdown("### "),
    },
    {
      label: "Link",
      icon: "🔗",
      action: () => insertMarkdown("[", "](url)"),
    },
    {
      label: "Image",
      icon: "🖼️",
      action: () => insertMarkdown("![alt text](", ")"),
    },
    {
      label: "Code",
      icon: "</>",
      action: () => insertMarkdown("`", "`"),
    },
    {
      label: "Code Block",
      icon: "{ }",
      action: () => insertMarkdown("```\n", "\n```"),
    },
    {
      label: "Quote",
      icon: "❝",
      action: () => insertMarkdown("> "),
    },
    {
      label: "List",
      icon: "•",
      action: () => insertMarkdown("- "),
    },
    {
      label: "Numbered List",
      icon: "1.",
      action: () => insertMarkdown("1. "),
    },
  ];

  // Handle keyboard shortcuts
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case "b":
            e.preventDefault();
            insertMarkdown("**", "**");
            break;
          case "i":
            e.preventDefault();
            insertMarkdown("*", "*");
            break;
          case "s":
            e.preventDefault();
            handleSave();
            break;
        }
      }
    },
    [insertMarkdown, handleSave],
  );

  // Render markdown preview
  const renderPreview = useCallback(() => {
    // Simple markdown to HTML conversion for preview
    // In a real implementation, you might want to use a library like marked or remark
    const lines = editorContent.split("\n");
    let html = "";

    for (let i = 0; i < lines.length; i++) {
      let line = lines[i];

      // Headers
      if (line.startsWith("### ")) {
        html += `<h3>${line.substring(4)}</h3>`;
      } else if (line.startsWith("## ")) {
        html += `<h2>${line.substring(3)}</h2>`;
      } else if (line.startsWith("# ")) {
        html += `<h1>${line.substring(2)}</h1>`;
      } else if (line.trim() === "") {
        html += "<br>";
      } else {
        // Process inline formatting
        line = line
          .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
          .replace(/\*(.*?)\*/g, "<em>$1</em>")
          .replace(/`(.*?)`/g, "<code>$1</code>")
          .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>')
          .replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img alt="$1" src="$2" />');

        html += `<p>${line}</p>`;
      }
    }

    return { __html: html };
  }, [editorContent]);

  const buttonStyle =
    "px-3 py-1 text-sm border border-foreground rounded hover:bg-foreground hover:text-background transition-colors focus:outline-none focus:ring-2 focus:ring-foreground focus:ring-offset-2 focus:ring-offset-background";
  const activeButtonStyle =
    "px-3 py-1 text-sm border border-foreground bg-foreground text-background rounded focus:outline-none focus:ring-2 focus:ring-foreground focus:ring-offset-2 focus:ring-offset-background";

  return (
    <div className="border border-foreground rounded-lg overflow-hidden bg-background shadow-sm">
      {/* Toolbar */}
      {toolbar && (
        <div className="bg-base border-b border-foreground p-2">
          <div className="flex flex-wrap gap-1 items-center">
            {/* Format buttons */}
            {toolbarActions.map((action, index) => (
              <button
                key={index}
                type="button"
                onClick={action.action}
                className={buttonStyle}
                title={`${action.label}${action.shortcut ? ` (${action.shortcut})` : ""}`}
              >
                <span className="font-mono text-xs">{action.icon}</span>
              </button>
            ))}

            {/* Separator */}
            <div className="w-px h-6 bg-foreground mx-2" />

            {/* Preview toggle */}
            {preview && (
              <button
                type="button"
                onClick={() => setIsPreviewMode(!isPreviewMode)}
                className={isPreviewMode ? activeButtonStyle : buttonStyle}
                title="Toggle Preview"
              >
                {isPreviewMode ? "Edit" : "Preview"}
              </button>
            )}

            {/* Save button */}
            {typeof onSave === "function" && filePath && (
              <>
                <div className="w-px h-6 bg-foreground mx-2" />
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={isSaving}
                  className={`${buttonStyle} ${
                    saveStatus === "success"
                      ? "border-green-500 bg-green-50 text-green-700"
                      : saveStatus === "error"
                        ? "border-red-500 bg-red-50 text-red-700"
                        : ""
                  }`}
                  title="Save File (Ctrl+S)"
                >
                  {saveStatus === "saving" && "Saving..."}
                  {saveStatus === "success" && "✓ Saved"}
                  {saveStatus === "error" && "✗ Error"}
                  {saveStatus === "idle" && "Save"}
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {/* Editor/Preview Area */}
      <div className="relative">
        {isPreviewMode && preview ? (
          /* Preview Mode */
          <div className="p-4 min-h-[300px] prose prose-sm max-w-none bg-background text-foreground">
            <div dangerouslySetInnerHTML={renderPreview()} />
          </div>
        ) : (
          /* Editor Mode */
          <div className="relative">
            <textarea
              ref={textareaRef}
              value={editorContent}
              onChange={(e) => handleContentChange(e.target.value)}
              onKeyDown={handleKeyDown}
              className="w-full min-h-[300px] p-4 pl-12 font-mono text-sm resize-none focus:outline-none focus:ring-2 focus:ring-foreground focus:ring-inset leading-5 bg-background text-foreground"
              placeholder="Enter your markdown content here..."
              spellCheck={false}
            />

            {/* Line numbers */}
            <div className="absolute left-0 top-0 p-4 pr-2 text-gray-400 text-sm font-mono pointer-events-none select-none bg-base border-r border-foreground">
              {editorContent.split("\n").map((_, index) => (
                <div key={index} className="leading-5 text-right">
                  {index + 1}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Status Bar */}
      <div className="bg-base border-t border-foreground px-4 py-2 text-xs text-gray-400 flex justify-between items-center">
        <div className="flex gap-4">
          <span>Lines: {editorContent.split("\n").length}</span>
          <span>Characters: {editorContent.length}</span>
          <span>
            Words:{" "}
            {
              editorContent.split(/\s+/).filter((word) => word.length > 0)
                .length
            }
          </span>
        </div>

        {error && (
          <div className="text-red-600 font-medium">Error: {error}</div>
        )}

        {filePath && (
          <div className="text-gray-500">File: {filePath.split("/").pop()}</div>
        )}
      </div>
    </div>
  );
}
