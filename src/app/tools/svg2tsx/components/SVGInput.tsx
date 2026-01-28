"use client";

import { Folder } from "lucide-react";
import { useCallback, useRef, useState } from "react";
import type { SVGInputData } from "../types";

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
		<div className="rounded-xl bg-base/75 backdrop-blur-md shadow-[0_8px_24px_rgba(0,0,0,0.25)] p-4">
			<h3 className="text-lg font-medium mb-4">SVG入力</h3>

			{/* Tab Navigation */}
			<div className="flex border-b border-main/20 mb-4">
				{[
					{ key: "file", label: "ファイル" },
					{ key: "code", label: "コード" },
					{ key: "url", label: "URL" },
				].map(({ key, label }) => (
					<button
						type="button"
						key={key}
						onClick={() => setActiveTab(key as typeof activeTab)}
						className={`px-4 py-2 border-b-2 transition-colors ${
							activeTab === key
								? "border-accent text-main"
								: "border-transparent hover:border-main/40"
						}`}
					>
						{label}
					</button>
				))}
			</div>

			{/* File Upload */}
			{activeTab === "file" && (
				<div
					className={`border-2 border-dashed border-main/20 p-8 text-center transition-colors rounded-lg ${
						dragOver
							? "border-accent bg-main/10"
							: "hover:border-main/40 hover:bg-main/5"
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
						aria-label="SVGファイルを選択"
					/>

					<div className="space-y-4">
						<Folder className="w-12 h-12 mx-auto text-main/50" />
						<div>
							<p className="text-lg mb-2">SVGファイルをドラッグ&ドロップ</p>
							<p className="text-sm text-main/70 mb-4">または</p>
							<button
								type="button"
								onClick={() => fileInputRef.current?.click()}
								className="bg-main text-white px-4 py-2 hover:bg-main/90 transition-colors"
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
						className="w-full h-64 p-3 rounded-lg bg-main/10 font-mono text-sm resize-none focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-base"
						aria-label="SVGコードを入力"
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
							className="flex-1 p-3 rounded-lg bg-main/10 focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-base"
							aria-label="SVG URLを入力"
						/>
						<button
							type="button"
							onClick={handleUrlLoad}
							disabled={!urlInput}
							className="bg-main text-white px-4 py-2 hover:bg-main/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
						>
							読み込み
						</button>
					</div>
				</div>
			)}
		</div>
	);
}
