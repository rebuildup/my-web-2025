"use client";

import { useState, useRef, useCallback } from "react";
import { Upload, File, Folder, Archive, X } from "lucide-react";
import { FrameData, UploadMethod } from "../types";
import {
  processFiles,
  processZipFile,
  sortFramesByName,
} from "../utils/fileProcessor";

interface FileUploaderProps {
  onFilesLoaded: (frames: FrameData[]) => void;
}

export default function FileUploader({ onFilesLoaded }: FileUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedMethod, setSelectedMethod] =
    useState<UploadMethod["type"]>("files");

  const fileInputRef = useRef<HTMLInputElement>(null);
  const folderInputRef = useRef<HTMLInputElement>(null);
  const zipInputRef = useRef<HTMLInputElement>(null);

  const uploadMethods: UploadMethod[] = [
    {
      type: "files",
      label: "複数ファイル選択",
      description: "複数のPNGファイルを選択してアップロード",
      accept: "image/png",
      multiple: true,
    },
    {
      type: "folder",
      label: "フォルダ選択",
      description: "フォルダ内のPNGファイルを一括選択",
      accept: "image/png",
      webkitdirectory: true,
    },
    {
      type: "zip",
      label: "ZIPファイル",
      description: "ZIPファイル内のPNGファイルを展開",
      accept: ".zip,application/zip",
    },
  ];

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    async (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      setError(null);
      setIsProcessing(true);

      try {
        const items = Array.from(e.dataTransfer.items);
        const files: File[] = [];

        for (const item of items) {
          if (item.kind === "file") {
            const file = item.getAsFile();
            if (file) {
              if (
                file.type === "image/png" ||
                file.name.toLowerCase().endsWith(".png")
              ) {
                files.push(file);
              } else if (
                file.type === "application/zip" ||
                file.name.toLowerCase().endsWith(".zip")
              ) {
                const zipFrames = await processZipFile(file);
                const sortedFrames = sortFramesByName(zipFrames);
                onFilesLoaded(sortedFrames);
                return;
              }
            }
          }
        }

        if (files.length > 0) {
          const frames = await processFiles(files);
          const sortedFrames = sortFramesByName(frames);
          onFilesLoaded(sortedFrames);
        } else {
          setError("PNGファイルまたはZIPファイルをドロップしてください。");
        }
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "ファイルの処理中にエラーが発生しました。"
        );
      } finally {
        setIsProcessing(false);
      }
    },
    [onFilesLoaded]
  );

  const handleFileSelect = useCallback(
    async (files: FileList | null) => {
      if (!files || files.length === 0) return;

      setError(null);
      setIsProcessing(true);

      try {
        const fileArray = Array.from(files);

        if (selectedMethod === "zip") {
          const zipFile = fileArray.find(
            (f) =>
              f.type === "application/zip" ||
              f.name.toLowerCase().endsWith(".zip")
          );
          if (zipFile) {
            const frames = await processZipFile(zipFile);
            const sortedFrames = sortFramesByName(frames);
            onFilesLoaded(sortedFrames);
          } else {
            setError("ZIPファイルを選択してください。");
          }
        } else {
          const pngFiles = fileArray.filter(
            (f) =>
              f.type === "image/png" || f.name.toLowerCase().endsWith(".png")
          );

          if (pngFiles.length === 0) {
            setError("PNGファイルが見つかりませんでした。");
            return;
          }

          const frames = await processFiles(pngFiles);
          const sortedFrames = sortFramesByName(frames);
          onFilesLoaded(sortedFrames);
        }
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "ファイルの処理中にエラーが発生しました。"
        );
      } finally {
        setIsProcessing(false);
      }
    },
    [selectedMethod, onFilesLoaded]
  );

  const triggerFileSelect = useCallback(() => {
    const inputRef =
      selectedMethod === "folder"
        ? folderInputRef
        : selectedMethod === "zip"
          ? zipInputRef
          : fileInputRef;
    inputRef.current?.click();
  }, [selectedMethod]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return (
    <div className="space-y-4">
      {/* Upload Method Selection */}
      <div className="grid grid-3 gap-4">
        {uploadMethods.map((method) => (
          <button
            key={method.type}
            onClick={() => setSelectedMethod(method.type)}
            className={`p-4 border rounded-lg text-left transition-colors ${
              selectedMethod === method.type
                ? "border-primary bg-primary/10"
                : "border-foreground hover:bg-foreground/5"
            }`}
          >
            <div className="flex items-center gap-2 mb-2">
              {method.type === "files" && <File size={20} />}
              {method.type === "folder" && <Folder size={20} />}
              {method.type === "zip" && <Archive size={20} />}
              <span className="font-medium">{method.label}</span>
            </div>
            <p className="text-sm text-foreground">{method.description}</p>
          </button>
        ))}
      </div>

      {/* Drop Zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={triggerFileSelect}
        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
          isDragging
            ? "border-primary bg-primary/10"
            : "border-foreground/30 hover:border-foreground/50 hover:bg-foreground/5"
        }`}
      >
        <Upload size={48} className="mx-auto mb-4 text-foreground/50" />
        <div className="space-y-2">
          <p className="text-lg font-medium">
            {selectedMethod === "files" && "ファイルを選択またはドロップ"}
            {selectedMethod === "folder" && "フォルダを選択またはドロップ"}
            {selectedMethod === "zip" && "ZIPファイルを選択またはドロップ"}
          </p>
          <p className="text-sm text-foreground">
            {selectedMethod === "files" && "複数のPNGファイルを選択できます"}
            {selectedMethod === "folder" &&
              "フォルダ内のPNGファイルを自動検出します"}
            {selectedMethod === "zip" && "ZIP内のPNGファイルを展開します"}
          </p>
        </div>
      </div>

      {/* Hidden File Inputs */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/png"
        multiple
        onChange={(e) => handleFileSelect(e.target.files)}
        className="hidden"
      />
      <input
        ref={folderInputRef}
        type="file"
        accept="image/png"
        {...({ webkitdirectory: "" } as Record<string, string>)}
        onChange={(e) => handleFileSelect(e.target.files)}
        className="hidden"
      />
      <input
        ref={zipInputRef}
        type="file"
        accept=".zip,application/zip"
        onChange={(e) => handleFileSelect(e.target.files)}
        className="hidden"
      />

      {/* Processing State */}
      {isProcessing && (
        <div className="text-center py-4">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <p className="mt-2 text-sm text-foreground">ファイルを処理中...</p>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start justify-between">
          <div className="flex items-start gap-2">
            <X size={20} className="text-red-500 mt-0.5" />
            <div>
              <p className="font-medium text-red-800">エラー</p>
              <p className="text-sm text-red-600">{error}</p>
            </div>
          </div>
          <button
            onClick={clearError}
            className="text-red-500 hover:text-red-700"
            aria-label="エラーを閉じる"
          >
            <X size={16} />
          </button>
        </div>
      )}
    </div>
  );
}
