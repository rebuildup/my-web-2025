"use client";

import { Edit3, Upload } from "lucide-react";
import Image from "next/image";
import React from "react";

const STICKY_IMAGE_MAX_WIDTH = 480;

export const ImageWidget = ({
	content,
	theme,
	onChange,
	onLoad,
}: {
	content: string;
	theme: string;
	onChange: (content: string) => void;
	onLoad: (e: React.SyntheticEvent<HTMLImageElement>) => void;
}) => {
	if (!content) {
		return (
			<div className="flex flex-col gap-4 w-full h-full items-center justify-center p-4">
				<div
					className={`w-full flex flex-col gap-3 p-6 rounded-xl   ${
						theme === "dark" ? "bg-[#222]/90 border " : " border "
					}`}
				>
					<input
						type="text"
						placeholder="Paste image URL..."
						className={`w-full p-2 text-sm ${theme === "dark" ? " " : " "}`}
						onKeyDown={(e) => {
							if (e.key === "Enter") onChange(e.currentTarget.value);
						}}
					/>
					<div
						className={`text-center text-[10px] font-bold uppercase tracking-widest ${
							theme === "dark" ? "" : ""
						}`}
					>
						OR
					</div>
					<label
						className={`cursor-pointer flex items-center justify-center gap-2 p-3 rounded-lg border  transition-all ${
							theme === "dark" ? "  " : "  "
						}`}
					>
						<Upload size={16} />
						<span className="text-xs font-medium">Upload File</span>
						<input
							type="file"
							accept="image/*"
							className="hidden"
							onChange={(e) => {
								const file = e.target.files?.[0];
								if (file) {
									const reader = new FileReader();
									reader.onloadend = () => {
										onChange(reader.result as string);
									};
									reader.readAsDataURL(file);
								}
							}}
						/>
					</label>
				</div>
			</div>
		);
	}

	return (
		<div className="relative group w-full h-full flex items-center justify-center">
			<Image
				src={content}
				width={STICKY_IMAGE_MAX_WIDTH}
				height={STICKY_IMAGE_MAX_WIDTH}
				unoptimized
				alt="Widget"
				className="w-full h-full object-contain pointer-events-none select-none rounded-lg"
				onLoad={onLoad}
				onError={(e) => {
					(e.target as HTMLImageElement).src =
						"https://via.placeholder.com/300?text=Image+Error";
				}}
			/>
			<button
				onClick={() => onChange("")}
				className="absolute top-2 right-2 p-2"
				aria-label="編集"
			>
				<Edit3 size={14} />
			</button>
		</div>
	);
};
