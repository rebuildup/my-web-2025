"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import GlowCard from "@/components/ui/GlowCard";
import type { PortfolioContentItem } from "@/types/portfolio";

export default function RandomContent({
	items,
	className,
}: {
	items: PortfolioContentItem[];
	className?: string;
}) {
	const nonEmpty = useMemo(
		() => items.filter((it) => typeof it?.id === "string"),
		[items],
	);
	const pick = useCallback(() => {
		if (nonEmpty.length === 0) return null;
		const i = Math.floor(Math.random() * nonEmpty.length);
		return nonEmpty[i] || null;
	}, [nonEmpty]);

	// SSRとCSRの不一致を避けるため、初期はnullにしてマウント後に決定
	const [current, setCurrent] = useState<PortfolioContentItem | null>(null);

	useEffect(() => {
		setCurrent(pick());
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	return (
		<div className={className}>
			<GlowCard className="p-6 bg-base/30 backdrop-blur">
				<div className="flex items-center justify-between gap-4">
					<div className="space-y-1">
						<div className="noto-sans-jp-light text-xs text-main/70">
							Random Pick
						</div>
						<div className="zen-kaku-gothic-new text-lg text-main">
							{current?.title || "コンテンツがありません"}
						</div>
					</div>
					<button
						type="button"
						className="px-3 py-2 text-xs border border-main hover:border-accent transition-colors"
						onClick={() => setCurrent(pick())}
					>
						ランダム
					</button>
				</div>
				{current && (
					<div className="mt-3">
						<Link
							href={`/portfolio/${current.id}`}
							className="text-xs underline underline-offset-4 text-accent hover:text-main"
						>
							詳細を見る →
						</Link>
					</div>
				)}
			</GlowCard>
		</div>
	);
}
