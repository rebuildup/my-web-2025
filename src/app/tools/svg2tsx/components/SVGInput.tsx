"use client";

import { useState, useRef, useCallback } from "react";
import { Folder } from "lucide-react";
import { SVGInputData } from "../types";

interface SVGInputProps {
  onSVGChange: (data: SVGInputData) => void;
  currentInput: SVGInputData | null;
}

export function SVGInput({ onSVGChange, currentInput }: SVGInputProps) {
  const [activeTab, setActiveTab] = useState<"file" | "code" | "url">("file");
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [codeInput, setCodeInput] = useState(currentInput?.content || "");
  const [urlInput, setUrlInput] = useState("");

  const handleFileUpload = useCallback(
    (file: File) => {
      if (file.type !== "image/svg+xml" && !file.name.endsWith(".svg")) {
        alert("SVGファイルを選択してください");
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        onSVGChange({
          type: "file",
          content,
          fileName: file.name,
        });
      };
      reader.readAsText(file);
    },
    [onSVGChange],
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);

      const files = Array.from(e.dataTransfer.files);
      const svgFile = files.find(
        (file) => file.type === "image/svg+xml" || file.name.endsWith(".svg"),
      );

      if (svgFile) {
        handleFileUpload(svgFile);
      }
    },
    [handleFileUpload],
  );

  const handleCodeChange = useCallback(
    (value: string) => {
      setCodeInput(value);
      onSVGChange({
        type: "code",
        content: value,
      });
    },
    [onSVGChange],
  );

  const handleUrlLoad = useCallback(async () => {
    if (!urlInput) return;

    try {
      const response = await fetch(urlInput);
      if (!response.ok) throw new Error("Failed to fetch SVG");

      const content = await response.text();
      onSVGChange({
        type: "url",
        content,
        fileName: urlInput.split("/").pop() || "svg-from-url.svg",
      });
    } catch {
      alert("SVGの読み込みに失敗しました");
    }
  }, [urlInput, onSVGChange]);

  return (
    <div className="bg-base border border-foreground p-4">
      <h3 className="text-lg font-medium mb-4">SVG入力</h3>

      {/* Tab Navigation */}
      <div className="flex border-b border-foreground mb-4">
        {[
          { key: "file", label: "ファイル" },
          { key: "code", label: "コード" },
          { key: "url", label: "URL" },
        ].map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key as typeof activeTab)}
            className={`px-4 py-2 border-b-2 transition-colors ${
              activeTab === key
                ? "border-primary text-primary"
                : "border-transparent hover:border-foreground"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* File Upload */}
      {activeTab === "file" && (
        <div
          className={`border-2 border-dashed p-8 text-center transition-colors ${
            dragOver
              ? "border-primary bg-primary/10"
              : "border-foreground hover:border-primary"
          }`}
          onDrop={handleDrop}
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".svg,image/svg+xml"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleFileUpload(file);
            }}
            className="hidden"
          />

          <div className="space-y-4">
            <Folder className="w-12 h-12 mx-auto text-foreground/50" />
            <div>
              <p className="text-lg mb-2">SVGファイルをドラッグ&ドロップ</p>
              <p className="text-sm text-foreground/70 mb-4">または</p>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="bg-primary text-white px-4 py-2 hover:bg-primary/90 transition-colors"
              >
                ファイルを選択
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Code Input */}
      {activeTab === "code" && (
        <div className="space-y-4">
          <label className="block text-sm font-medium">SVGコード</label>
          <textarea
            value={codeInput}
            onChange={(e) => handleCodeChange(e.target.value)}
            placeholder="<svg>...</svg>"
            className="w-full h-64 p-3 border border-foreground bg-background font-mono text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
      )}

      {/* URL Input */}
      {activeTab === "url" && (
        <div className="space-y-4">
          <label className="block text-sm font-medium">SVG URL</label>
          <div className="flex gap-2">
            <input
              type="url"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              placeholder="https://example.com/image.svg"
              className="flex-1 p-3 border border-foreground bg-background focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <button
              onClick={handleUrlLoad}
              disabled={!urlInput}
              className="bg-primary text-white px-4 py-2 hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              読み込み
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
