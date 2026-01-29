"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";

interface SearchBarProps {
	keyword: string | null;
	mode: string;
}

function SearchBarInner({ keyword, mode }: SearchBarProps) {
	const searchParams = useSearchParams();
	const router = useRouter();
	const [inputValue, setInputValue] = useState(keyword || "");

	const currentMode = searchParams.get("mode") || "normal";

	const handleModeChange = (newMode: string) => {
		const params = new URLSearchParams(searchParams.toString());
		params.set("mode", newMode);
		router.push(`/workshop?${params.toString()}`);
	};

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		const params = new URLSearchParams(searchParams.toString());
		if (inputValue.trim()) {
			params.set("q", inputValue.trim());
		} else {
			params.delete("q");
		}
		params.delete("page");
		router.push(`/workshop?${params.toString()}`);
	};

	return (
		<div className="flex items-center gap-4">
			<form onSubmit={handleSubmit} className="relative w-60 h-9">
				<div className="relative w-full h-full bg-[#0a0a0f] border border-[#333333] rounded px-3 flex items-center gap-2">
					<svg
						className="w-4 h-4 text-[#888888] shrink-0"
						fill="none"
						stroke="currentColor"
						viewBox="0 0 24 24"
					>
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							strokeWidth={2}
							d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
						/>
					</svg>
					<input
						type="text"
						value={inputValue}
						onChange={(e) => setInputValue(e.target.value)}
						placeholder="Search articles..."
						className="flex-1 bg-transparent text-sm text-[#f2f2f2] placeholder-[#f2f2f240] outline-none min-w-0"
					/>
					{inputValue && (
						<button
							type="button"
							onClick={() => {
								setInputValue("");
								const params = new URLSearchParams(searchParams.toString());
								params.delete("q");
								params.delete("page");
								router.push(`/workshop?${params.toString()}`);
							}}
							className="text-[#888888] hover:text-[#f2f2f2] transition-colors"
						>
							<svg
								className="w-4 h-4"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M6 18L18 6M6 6l12 12"
								/>
							</svg>
						</button>
					)}
				</div>
			</form>

			{/* Search Mode Selector - only show when there's a search query */}
			{keyword && (
				<div className="flex bg-[#1a1a1f] border border-[#333333] rounded text-xs">
					<button
						type="button"
						onClick={() => handleModeChange("normal")}
						className={`px-3 py-1.5 rounded transition-colors ${
							currentMode === "normal"
								? "bg-[#2b57ff] text-white"
								: "text-[#f2f2f2] hover:bg-[#2a2a2f]"
						}`}
					>
						通常
					</button>
					<button
						type="button"
						onClick={() => handleModeChange("detailed")}
						className={`px-3 py-1.5 rounded transition-colors ${
							currentMode === "detailed"
								? "bg-[#2b57ff] text-white"
								: "text-[#f2f2f2] hover:bg-[#2a2a2f]"
						}`}
					>
						詳細
					</button>
				</div>
			)}
		</div>
	);
}

export function SearchBar(props: SearchBarProps) {
	return (
		<Suspense fallback={<SearchBarFallback />}>
			<SearchBarInner {...props} />
		</Suspense>
	);
}

function SearchBarFallback() {
	return (
		<div className="relative w-60 h-9">
			<div className="relative w-full h-full bg-[#0a0a0f] border border-[#333333] rounded px-3 flex items-center gap-2">
				<svg
					className="w-4 h-4 text-[#888888] shrink-0"
					fill="none"
					stroke="currentColor"
					viewBox="0 0 24 24"
				>
					<path
						strokeLinecap="round"
						strokeLinejoin="round"
						strokeWidth={2}
						d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
					/>
				</svg>
				<div className="flex-1 h-4 bg-[#f2f2f240] rounded animate-pulse" />
			</div>
		</div>
	);
}
