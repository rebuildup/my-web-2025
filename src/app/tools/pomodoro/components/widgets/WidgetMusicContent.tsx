"use client";

export type WidgetMusicContentProps = {
	content: string;
	textClass: string;
	id: number;
	updateWidget: (id: number, data: { content?: string }) => void;
};

export function WidgetMusicContent({
	content,
	textClass,
	id,
	updateWidget,
}: WidgetMusicContentProps) {
	return (
		<div className="w-full h-[152px] overflow-hidden rounded-b-xl">
			<iframe
				width="100%"
				height="100%"
				src={`https://www.youtube.com/embed/${content || "jfKfPfyJRdk"}?controls=0&autoplay=0`}
				title="Music Player"
				frameBorder="0"
				allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
				allowFullScreen
			></iframe>
			<div className="p-2 flex gap-2 justify-center no-drag">
				<input
					type="text"
					placeholder="YouTube Video ID"
					className={`text-[10px] text-center ${textClass}`}
					onKeyDown={(e) => {
						if (e.key === "Enter")
							updateWidget(id, { content: e.currentTarget.value });
					}}
				/>
			</div>
		</div>
	);
}
