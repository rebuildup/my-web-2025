"use client";

import { useCallback, useEffect, useRef, useState } from "react";

// Types for media data and embed resolution
interface MediaData {
  images: string[];
  videos: Array<{
    type: string;
    url: string;
    title: string;
    description?: string;
    thumbnail?: string;
  }>;
  externalLinks: Array<{
    type: string;
    url: string;
    title: string;
    description?: string;
  }>;
}

interface EmbedValidationError {
  line: number;
  column: number;
  type: "INVALID_INDEX" | "MISSING_MEDIA" | "MALFORMED_SYNTAX";
  message: string;
  suggestion?: string;
}

interface EnhancedMarkdownEditorProps {
  content: string;
  filePath?: string;
  onChange: (content: string) => void;
  onSave?: (content: string, filePath: string) => Promise<void>;
  preview?: boolean;
  toolbar?: boolean;
  mediaData?: MediaData;
  embedSupport?: boolean;
}

/**
 * Enhanced MarkdownEditor Component
 * A comprehensive markdown editor with embed syntax support, real-time preview,
 * toolbar with embed helpers, and syntax validation
 */
export function MarkdownEditor({
  content,
  filePath,
  onChange,
  onSave,
  preview = true,
  toolbar = true,
  mediaData,
  embedSupport = true,
}: EnhancedMarkdownEditorProps) {
  const [editorContent, setEditorContent] = useState(content);
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<
    "idle" | "saving" | "success" | "error"
  >("idle");
  const [error, setError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<
    EmbedValidationError[]
  >([]);

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Update editor content when prop changes
  useEffect(() => {
    console.log(
      "MarkdownEditor: content prop changed:",
      content?.length || 0,
      "characters",
    );
    console.log(
      "MarkdownEditor: content preview:",
      content?.substring(0, 100) || "empty",
    );
    setEditorContent(content);
  }, [content]);

  // Validate embed syntax
  const validateEmbedSyntax = useCallback(
    (content: string): EmbedValidationError[] => {
      if (!embedSupport || !mediaData) return [];

      const errors: EmbedValidationError[] = [];
      const lines = content.split("\n");

      // Regex patterns for embed syntax
      const imagePattern = /!\[image:(\d+)(?:\s+"([^"]*)")?\]/g;
      const videoPattern = /!\[video:(\d+)(?:\s+"([^"]*)")?\]/g;
      const linkPattern = /\[link:(\d+)(?:\s+"([^"]*)")?\]/g;

      lines.forEach((line, lineIndex) => {
        // Validate image embeds
        let match;
        while ((match = imagePattern.exec(line)) !== null) {
          const index = parseInt(match[1]);
          if (index >= mediaData.images.length) {
            errors.push({
              line: lineIndex + 1,
              column: match.index + 1,
              type: "INVALID_INDEX",
              message: `Image index ${index} is out of range. Available images: 0-${mediaData.images.length - 1}`,
              suggestion: `Use an index between 0 and ${mediaData.images.length - 1}`,
            });
          }
        }

        // Validate video embeds
        while ((match = videoPattern.exec(line)) !== null) {
          const index = parseInt(match[1]);
          if (index >= mediaData.videos.length) {
            errors.push({
              line: lineIndex + 1,
              column: match.index + 1,
              type: "INVALID_INDEX",
              message: `Video index ${index} is out of range. Available videos: 0-${mediaData.videos.length - 1}`,
              suggestion: `Use an index between 0 and ${mediaData.videos.length - 1}`,
            });
          }
        }

        // Validate link embeds
        while ((match = linkPattern.exec(line)) !== null) {
          const index = parseInt(match[1]);
          if (index >= mediaData.externalLinks.length) {
            errors.push({
              line: lineIndex + 1,
              column: match.index + 1,
              type: "INVALID_INDEX",
              message: `Link index ${index} is out of range. Available links: 0-${mediaData.externalLinks.length - 1}`,
              suggestion: `Use an index between 0 and ${mediaData.externalLinks.length - 1}`,
            });
          }
        }

        // Check for malformed syntax
        const malformedPatterns = [
          /!\[image:\D/g, // Non-numeric image index
          /!\[video:\D/g, // Non-numeric video index
          /\[link:\D/g, // Non-numeric link index
        ];

        malformedPatterns.forEach((pattern) => {
          while ((match = pattern.exec(line)) !== null) {
            errors.push({
              line: lineIndex + 1,
              column: match.index + 1,
              type: "MALFORMED_SYNTAX",
              message: "Embed syntax requires a numeric index",
              suggestion: "Use format like ![image:0] or [link:1]",
            });
          }
        });
      });

      return errors;
    },
    [embedSupport, mediaData],
  );

  // Resolve embed references for preview
  const resolveEmbedReferences = useCallback(
    (content: string): string => {
      if (!embedSupport || !mediaData) return content;

      let resolvedContent = content;

      // Resolve image embeds
      resolvedContent = resolvedContent.replace(
        /!\[image:(\d+)(?:\s+"([^"]*)")?\]/g,
        (match, indexStr, altText) => {
          const index = parseInt(indexStr);
          if (index < mediaData.images.length) {
            const imageUrl = mediaData.images[index];
            const alt = altText || `Image ${index}`;
            return `![${alt}](${imageUrl})`;
          }
          return `**[Invalid image reference: ${match}]**`;
        },
      );

      // Resolve video embeds
      resolvedContent = resolvedContent.replace(
        /!\[video:(\d+)(?:\s+"([^"]*)")?\]/g,
        (match, indexStr, title) => {
          const index = parseInt(indexStr);
          if (index < mediaData.videos.length) {
            const video = mediaData.videos[index];
            const videoTitle = title || video.title || `Video ${index}`;

            // Create video embed based on type
            if (video.type === "youtube") {
              const videoId = video.url.match(
                /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/,
              )?.[1];
              if (videoId) {
                return `<div class="video-embed"><iframe width="560" height="315" src="https://www.youtube.com/embed/${videoId}" title="${videoTitle}" frameborder="0" allowfullscreen></iframe></div>`;
              }
            }

            // Fallback to link
            return `[${videoTitle}](${video.url})`;
          }
          return `**[Invalid video reference: ${match}]**`;
        },
      );

      // Resolve link embeds
      resolvedContent = resolvedContent.replace(
        /\[link:(\d+)(?:\s+"([^"]*)")?\]/g,
        (match, indexStr, customText) => {
          const index = parseInt(indexStr);
          if (index < mediaData.externalLinks.length) {
            const link = mediaData.externalLinks[index];
            const linkText = customText || link.title || `Link ${index}`;
            return `[${linkText}](${link.url})`;
          }
          return `**[Invalid link reference: ${match}]**`;
        },
      );

      return resolvedContent;
    },
    [embedSupport, mediaData],
  );

  // Handle content change
  const handleContentChange = useCallback(
    (newContent: string) => {
      setEditorContent(newContent);
      onChange(newContent);
      setError(null);

      // Validate embed syntax if enabled
      if (embedSupport) {
        const errors = validateEmbedSyntax(newContent);
        setValidationErrors(errors);
      }
    },
    [onChange, embedSupport, validateEmbedSyntax],
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

  // Insert markdown syntax at cursor position (currently unused but kept for future use)
  // const insertMarkdown = useCallback(
  //   (before: string, after: string = "") => {
  //     const textarea = textareaRef.current;
  //     if (!textarea) return;

  //     const start = textarea.selectionStart;
  //     const end = textarea.selectionEnd;
  //     const selectedText = editorContent.substring(start, end);
  //     const newContent =
  //       editorContent.substring(0, start) +
  //       before +
  //       selectedText +
  //       after +
  //       editorContent.substring(end);

  //     handleContentChange(newContent);

  //     // Restore cursor position
  //     setTimeout(() => {
  //       textarea.focus();
  //       const newCursorPos = start + before.length + selectedText.length;
  //       textarea.setSelectionRange(newCursorPos, newCursorPos);
  //     }, 0);
  //   },
  //   [editorContent, handleContentChange],
  // );

  // Toolbar actions and embed actions removed for simplified interface

  // Handle keyboard shortcuts - simplified to only save
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case "s":
            e.preventDefault();
            handleSave();
            break;
        }
      }
    },
    [handleSave],
  );

  // Render markdown preview
  const renderPreview = useCallback(() => {
    // Resolve embed references first if embed support is enabled
    const contentToRender = embedSupport
      ? resolveEmbedReferences(editorContent)
      : editorContent;

    // Simple markdown to HTML conversion for preview
    // In a real implementation, you might want to use a library like marked or remark
    const lines = contentToRender.split("\n");
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
          .replace(
            /!\[([^\]]*)\]\(([^)]+)\)/g,
            '<img alt="$1" src="$2" style="max-width: 100%; height: auto;" />',
          )
          .replace(
            /\[([^\]]+)\]\(([^)]+)\)/g,
            '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>',
          );

        // Handle video embeds and other HTML content
        if (
          line.includes('<div class="video-embed">') ||
          line.includes("<iframe")
        ) {
          html += line;
        } else if (line.trim().startsWith("<") && line.trim().endsWith(">")) {
          // Handle other HTML tags
          html += line;
        } else {
          html += `<p>${line}</p>`;
        }
      }
    }

    return { __html: html };
  }, [editorContent, embedSupport, resolveEmbedReferences]);

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

      {/* Validation Errors */}
      {embedSupport && validationErrors.length > 0 && (
        <div className="bg-red-50 border-b border-red-200 p-3">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-red-600">⚠</span>
            <h4 className="font-medium text-red-900">Embed Syntax Errors</h4>
          </div>
          <div className="space-y-1 text-sm">
            {validationErrors.map((error, index) => (
              <div key={index} className="text-red-700">
                <span className="font-mono text-xs bg-red-100 px-1 rounded">
                  Line {error.line}:{error.column}
                </span>{" "}
                {error.message}
                {error.suggestion && (
                  <div className="text-red-600 text-xs mt-1 ml-4">
                    💡 {error.suggestion}
                  </div>
                )}
              </div>
            ))}
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
          {embedSupport && (
            <span
              className={
                validationErrors.length > 0 ? "text-red-600" : "text-green-600"
              }
            >
              Embeds:{" "}
              {validationErrors.length > 0
                ? `${validationErrors.length} errors`
                : "Valid"}
            </span>
          )}
        </div>

        <div className="flex gap-4 items-center">
          {error && (
            <div className="text-red-600 font-medium">Error: {error}</div>
          )}

          {filePath && (
            <div className="text-gray-500">
              File: {filePath.split("/").pop()}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
