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
  onValidationErrors?: (errors: EmbedValidationError[]) => void;
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
  onValidationErrors,
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
  const [showEmbedHelper, setShowEmbedHelper] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Update editor content when prop changes
  useEffect(() => {
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
        if (onValidationErrors) {
          onValidationErrors(errors);
        }
      }
    },
    [onChange, embedSupport, validateEmbedSyntax, onValidationErrors],
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

  // Embed helper actions (only shown when embedSupport is enabled)
  const embedActions = embedSupport
    ? [
        {
          label: "Insert Image Embed",
          icon: "🖼️",
          action: () => {
            const availableImages = mediaData?.images.length || 0;
            if (availableImages === 0) {
              alert(
                "No images available for embedding. Please add images first.",
              );
              return;
            }
            const index = prompt(
              `Enter image index (0-${availableImages - 1}):`,
            );
            if (index !== null && !isNaN(Number(index))) {
              const altText = prompt("Enter alt text (optional):");
              const embedText =
                altText && altText.trim()
                  ? `![image:${index} "${altText}"]`
                  : `![image:${index}]`;
              insertMarkdown(embedText);
            }
          },
        },
        {
          label: "Insert Video Embed",
          icon: "🎥",
          action: () => {
            const availableVideos = mediaData?.videos.length || 0;
            if (availableVideos === 0) {
              alert(
                "No videos available for embedding. Please add videos first.",
              );
              return;
            }
            const index = prompt(
              `Enter video index (0-${availableVideos - 1}):`,
            );
            if (index !== null && !isNaN(Number(index))) {
              const title = prompt("Enter video title (optional):");
              const embedText =
                title && title.trim()
                  ? `![video:${index} "${title}"]`
                  : `![video:${index}]`;
              insertMarkdown(embedText);
            }
          },
        },
        {
          label: "Insert Link Embed",
          icon: "🔗",
          action: () => {
            const availableLinks = mediaData?.externalLinks.length || 0;
            if (availableLinks === 0) {
              alert(
                "No external links available for embedding. Please add links first.",
              );
              return;
            }
            const index = prompt(`Enter link index (0-${availableLinks - 1}):`);
            if (index !== null && !isNaN(Number(index))) {
              const customText = prompt("Enter custom link text (optional):");
              const embedText =
                customText && customText.trim()
                  ? `[link:${index} "${customText}"]`
                  : `[link:${index}]`;
              insertMarkdown(embedText);
            }
          },
        },
      ]
    : [];

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

            {/* Embed helpers */}
            {embedSupport && embedActions.length > 0 && (
              <>
                <div className="w-px h-6 bg-foreground mx-2" />
                {embedActions.map((action, index) => (
                  <button
                    key={`embed-${index}`}
                    type="button"
                    onClick={action.action}
                    className={buttonStyle}
                    title={action.label}
                  >
                    <span className="font-mono text-xs">{action.icon}</span>
                  </button>
                ))}

                {/* Embed helper toggle */}
                <button
                  type="button"
                  onClick={() => setShowEmbedHelper(!showEmbedHelper)}
                  className={showEmbedHelper ? activeButtonStyle : buttonStyle}
                  title="Show Embed Helper"
                >
                  <span className="font-mono text-xs">?</span>
                </button>
              </>
            )}

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

      {/* Embed Helper Panel */}
      {embedSupport && showEmbedHelper && mediaData && (
        <div className="bg-blue-50 border-b border-foreground p-3 text-sm">
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-medium text-blue-900">Embed Reference Guide</h4>
            <button
              type="button"
              onClick={() => setShowEmbedHelper(false)}
              className="text-blue-600 hover:text-blue-800"
            >
              ✕
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div>
              <h5 className="font-medium text-blue-800 mb-1">
                Images ({mediaData.images.length})
              </h5>
              {mediaData.images.length > 0 ? (
                <div className="space-y-1">
                  {mediaData.images.slice(0, 3).map((img, index) => (
                    <div key={index} className="text-blue-700">
                      <code>![image:{index}]</code> - {img.split("/").pop()}
                    </div>
                  ))}
                  {mediaData.images.length > 3 && (
                    <div className="text-blue-600">
                      ...and {mediaData.images.length - 3} more
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-gray-500">No images available</div>
              )}
            </div>
            <div>
              <h5 className="font-medium text-blue-800 mb-1">
                Videos ({mediaData.videos.length})
              </h5>
              {mediaData.videos.length > 0 ? (
                <div className="space-y-1">
                  {mediaData.videos.slice(0, 3).map((video, index) => (
                    <div key={index} className="text-blue-700">
                      <code>![video:{index}]</code> - {video.title}
                    </div>
                  ))}
                  {mediaData.videos.length > 3 && (
                    <div className="text-blue-600">
                      ...and {mediaData.videos.length - 3} more
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-gray-500">No videos available</div>
              )}
            </div>
            <div>
              <h5 className="font-medium text-blue-800 mb-1">
                Links ({mediaData.externalLinks.length})
              </h5>
              {mediaData.externalLinks.length > 0 ? (
                <div className="space-y-1">
                  {mediaData.externalLinks.slice(0, 3).map((link, index) => (
                    <div key={index} className="text-blue-700">
                      <code>[link:{index}]</code> - {link.title}
                    </div>
                  ))}
                  {mediaData.externalLinks.length > 3 && (
                    <div className="text-blue-600">
                      ...and {mediaData.externalLinks.length - 3} more
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-gray-500">No links available</div>
              )}
            </div>
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
