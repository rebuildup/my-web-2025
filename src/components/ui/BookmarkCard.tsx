"use client";

import { useEffect, useState } from "react";

interface BookmarkCardProps {
	url: string;
	title?: string;
	description?: string;
	image?: string;
	linkText?: string;
}

interface Metadata {
	title?: string;
	description?: string;
	image?: string;
}

export function BookmarkCard({
	url,
	title: initialTitle,
	description: initialDescription,
	image: initialImage,
	linkText,
}: BookmarkCardProps) {
	const [metadata, setMetadata] = useState<Metadata | null>(null);

	useEffect(() => {
		let cancelled = false;

		const fetchMetadata = async () => {
			if (!url) {
				return;
			}

			try {
				const response = await fetch(
					`/api/metadata?url=${encodeURIComponent(url)}`,
				);
				if (!cancelled) {
					if (response.ok) {
						const data = (await response.json()) as Metadata;
						setMetadata(data);
					}
				}
			} catch (error) {
				console.warn("Failed to fetch metadata:", error);
			}
		};

		void fetchMetadata();

		return () => {
			cancelled = true;
		};
	}, [url]);

	const displayTitle =
		metadata?.title ||
		initialTitle ||
		(() => {
			try {
				return new URL(url).hostname.replace(/^www\./, "");
			} catch {
				return url;
			}
		})();
	const displayDescription = metadata?.description || initialDescription;
	const displayImage = (metadata?.image || initialImage)?.trim();
	const hasImage = displayImage && displayImage.length > 0;

	return (
		<div className="my-4 w-full max-w-full border border-white/8 rounded-lg overflow-hidden bg-gradient-to-br from-[rgba(20,22,32,0.6)] to-[rgba(29,31,45,0.4)] shadow-[0_2px_8px_rgba(0,0,0,0.12),0_1px_2px_rgba(0,0,0,0.08)] backdrop-blur-sm [&_*]:!no-underline [&_*]:!decoration-none">
			<a
				href={url}
				className="block px-3 py-2.5 text-inherit !no-underline !decoration-none border-none outline-none bg-transparent [&_*]:!no-underline [&_*]:!decoration-none"
				target="_blank"
				rel="noreferrer"
				style={{ textDecoration: "none" }}
			>
				<div className="flex flex-col gap-2.5 md:flex-row md:items-center md:gap-3">
					{hasImage && (
						<div
							className="flex-shrink-0 rounded overflow-hidden"
							style={{
								maxWidth: "140px",
								maxHeight: "140px",
								width: "140px",
								height: "140px",
								display: "flex",
								alignItems: "center",
								justifyContent: "center",
								position: "relative",
							}}
						>
							<img
								src={displayImage}
								alt=""
								loading="lazy"
								className="rounded"
								style={{
									maxWidth: "140px",
									maxHeight: "140px",
									width: "auto",
									height: "auto",
									objectFit: "contain",
									display: "block",
								}}
								onError={(e) => {
									// 画像の読み込みに失敗した場合、非表示にする
									const target = e.target as HTMLImageElement;
									target.style.display = "none";
								}}
							/>
						</div>
					)}
					<div className="flex flex-col gap-1 flex-1 min-w-0 [&_*]:!no-underline [&_*]:!decoration-none">
						<div
							className="text-base font-bold leading-[1.3] text-[rgba(242,242,242,0.95)] m-0 !no-underline !decoration-none tracking-[-0.01em]"
							style={{ textDecoration: "none" }}
						>
							{displayTitle}
						</div>
						{displayDescription && (
							<div
								className="text-xs leading-[1.5] text-[rgba(242,242,242,0.65)] m-0 line-clamp-2 overflow-hidden !no-underline !decoration-none"
								style={{ textDecoration: "none" }}
							>
								{displayDescription}
							</div>
						)}
						{linkText && (
							<div
								className="text-[10px] leading-[1.3] text-[rgba(156,244,255,0.7)] mt-0.5 font-medium tracking-[0.02em] !no-underline !decoration-none"
								style={{ textDecoration: "none" }}
							>
								{linkText}
							</div>
						)}
					</div>
				</div>
			</a>
		</div>
	);
}
