"use client";

import React from "react";

interface YouTubePlayerContentProps {
	hasSource: boolean;
	uniqueId: string;
	error: string | null;
}

export function YouTubePlayerContent({
	hasSource,
	uniqueId,
	error,
}: YouTubePlayerContentProps) {
	return (
		<div className="flex-1 relative ">
			{!hasSource ? (
				<div className="absolute inset-0 flex items-center justify-center  text-xs p-4 text-center">
					URLを設定してください
				</div>
			) : uniqueId ? (
				<div id={uniqueId} className="w-full h-full" />
			) : null}
			{error && (
				<div className="absolute inset-0 flex items-center justify-center   text-xs p-4 text-center z-10">
					{error}
				</div>
			)}
		</div>
	);
}
