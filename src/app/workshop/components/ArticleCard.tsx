import Image from "next/image";
import Link from "next/link";

interface ArticleCardProps {
	title: string;
	description: string | null | undefined;
	tags: string[];
	thumbnail: string | null;
	date: string;
	href: string;
	isExternal: boolean;
	isNew?: boolean;
}

export function ArticleCard({
	title,
	description,
	tags,
	thumbnail,
	date,
	href,
	isExternal,
	isNew = false,
}: ArticleCardProps) {
	const cardContent = (
		<>
			{/* Thumbnail - Top half */}
			<div className="relative w-full aspect-[2/1] overflow-hidden bg-[#1a1a1f]">
				{thumbnail ? (
					<Image
						src={thumbnail}
						alt={title}
						fill
						className="object-cover transition-transform duration-300 group-hover:scale-105"
						sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
						loading="lazy"
					/>
				) : (
					<div className="w-full h-full flex items-center justify-center bg-[#2a2a2f]">
						<svg
							className="w-16 h-16 text-[#444444]"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={1}
								d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
							/>
						</svg>
					</div>
				)}
				{/* Overlay on hover */}
				<div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300" />
			</div>

			{/* Content - Bottom half */}
			<div className="p-4 flex flex-col min-h-[180px]">
				{/* Title and NEW badge */}
				<div className="flex items-start gap-2">
					<h3 className="flex-1 text-lg font-semibold text-white line-clamp-1">
						{title}
					</h3>
					{isNew && (
						<span className="shrink-0 px-2 py-0.5 text-xs font-semibold bg-[#ff6b35] text-white rounded">
							NEW
						</span>
					)}
				</div>

				{/* Description - Show first few lines */}
				{description && (
					<p className="text-sm text-[#aaaaaa] line-clamp-3 leading-relaxed">
						{description}
					</p>
				)}

				{/* Spacer to push date/tags to bottom */}
				<div className="flex-1" />

				{/* Metadata - Date and Tags */}
				<div className="flex items-center justify-between gap-2 text-sm pt-1">
					<span className="text-[#888888]">{date}</span>
					{tags.length > 0 && (
						<div className="flex gap-1">
							{tags.slice(0, 2).map((tag) => (
								<span
									key={tag}
									className="px-2 py-0.5 text-xs font-medium text-[#f2f2f2] bg-[#1a1a1f] rounded"
								>
									#{tag}
								</span>
							))}
						</div>
					)}
				</div>
			</div>
		</>
	);

	if (isExternal) {
		return (
			<a
				href={href}
				target="_blank"
				rel="noopener noreferrer"
				className="group block cursor-pointer"
			>
				{cardContent}
			</a>
		);
	}

	return (
		<Link href={href} className="group block cursor-pointer">
			{cardContent}
		</Link>
	);
}
