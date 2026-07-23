"use client";

import { Edit3, Upload } from "lucide-react";
import Image from "next/image";
import type React from "react";
import { useCallback } from "react";

export type WidgetImageContentProps = {
	content: string;
	theme: string;
	id: number;
	updateWidget: (
		id: number,
		data: { content?: string; w?: number; h?: number },
	) => void;
};

export function WidgetImageContent({
	content,
	theme,
	id,
	updateWidget,
}: WidgetImageContentProps) {
	const handleImageLoad = useCallback(
		(e: React.SyntheticEvent<HTMLImageElement>) => {
			const { naturalWidth, naturalHeight } = e.currentTarget;
			if (!naturalWidth || !naturalHeight) return;
			const scale = Math.min(480 / naturalWidth, 1);
			const width = Math.round(naturalWidth * scale);
			const height = Math.round(naturalHeight * scale);
			updateWidget(id, { w: width, h: height });
		},
		[id, updateWidget],
	);

	return (
		<div className="flex flex-col gap-4 w-full h-full items-center justify-center p-4">
			{!content ? (
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
							if (e.key === "Enter")
								updateWidget(id, { content: e.currentTarget.value });
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
										updateWidget(id, {
											content: reader.result as string,
										});
									};
									reader.readAsDataURL(file);
								}
							}}
						/>
					</label>
				</div>
			) : (
				<div className="relative group w-full h-full flex items-center justify-center">
					<Image
						src={content}
						width={300}
						height={300}
						unoptimized
						alt="Widget"
						className="w-full h-full object-contain pointer-events-none select-none rounded-lg"
						onLoad={handleImageLoad}
						onError={(e) => {
							(e.target as HTMLImageElement).src =
								"https://via.placeholder.com/300?text=Image+Error";
						}}
					/>
					<button
						onClick={() => updateWidget(id, { content: "" })}
						className="absolute top-2 right-2 p-2"
						aria-label="編集"
					>
						<Edit3 size={14} />
					</button>
				</div>
			)}
		</div>
	);
}
