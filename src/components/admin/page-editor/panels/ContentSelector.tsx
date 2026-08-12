"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { fetchContentList } from "@/cms/page-editor/lib/api/content";
import type { ContentIndexItem } from "@/cms/types/content";
import { SimpleSelect, type SimpleSelectOption } from "@/components/admin/ui";
import { adminColor } from "@/components/admin/ui/tokens";

export interface ContentSelectorProps {
	selectedContentId?: string;
	onSelect: (contentId: string) => void;
}

export function ContentSelector({
	selectedContentId,
	onSelect,
}: ContentSelectorProps) {
	const [contents, setContents] = useState<ContentIndexItem[]>([]);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const sortedContents = useMemo(
		() =>
			[...contents].sort(
				(a, b) =>
					new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
			),
		[contents],
	);

	const options = useMemo<SimpleSelectOption[]>(
		() =>
			sortedContents.map((content) => ({
				value: content.id,
				label: content.title || content.id,
			})),
		[sortedContents],
	);

	const loadContents = useCallback(async () => {
		setLoading(true);
		setError(null);
		try {
			const data = await fetchContentList();
			setContents(data);
		} catch (err) {
			console.error("[ContentSelector] Failed to load contents", err);
			setError(err instanceof Error ? err.message : "Failed to load contents");
		} finally {
			setLoading(false);
		}
	}, []);

	useEffect(() => {
		void loadContents();
	}, [loadContents]);

	const lastUpdatedLabel = useMemo(() => {
		if (!selectedContentId) {
			return null;
		}
		const target = sortedContents.find((item) => item.id === selectedContentId);
		if (!target) {
			return null;
		}
		return new Date(target.updatedAt).toLocaleString();
	}, [sortedContents, selectedContentId]);

	return (
		<div>
			<div
				style={{
					display: "flex",
					flexDirection: "row",
					alignItems: "center",
					justifyContent: "space-between",
					paddingTop: 12,
					paddingBottom: 12,
				}}
			>
				<h3
					style={{
						margin: 0,
						fontSize: 16,
						fontWeight: 600,
						color: adminColor.textPrimary,
					}}
				>
					Content
				</h3>
				<button
					type="button"
					disabled={loading}
					onClick={() => void loadContents()}
					style={{
						fontSize: 13,
						padding: "4px 12px",
						background: "transparent",
						color: adminColor.accent,
						border: "none",
						borderRadius: 4,
						cursor: loading ? "not-allowed" : "pointer",
						opacity: loading ? 0.6 : 1,
					}}
				>
					Refresh
				</button>
			</div>
			<div>
				{loading && (
					<div
						style={{
							display: "flex",
							flexDirection: "row",
							alignItems: "center",
							gap: 12,
						}}
					>
						<div
							style={{
								width: 18,
								height: 18,
								border: `2px solid ${adminColor.borderInput}`,
								borderTopColor: adminColor.accent,
								borderRadius: "50%",
							}}
						/>
						<span
							style={{
								fontSize: 14,
								color: adminColor.textSecondary,
							}}
						>
							Loading content list...
						</span>
					</div>
				)}
				{!loading && error && (
					<div
						role="alert"
						style={{
							padding: "8px 12px",
							borderLeft: `4px solid ${adminColor.error}`,
							backgroundColor: "rgba(185, 28, 28, 0.1)",
							color: adminColor.error,
							fontSize: 14,
							borderRadius: 4,
						}}
					>
						{error}
					</div>
				)}
				{!loading && !error && (
					<div
						style={{
							display: "flex",
							flexDirection: "column",
							gap: 8,
						}}
					>
						<SimpleSelect
							data-testid="content-select"
							value={selectedContentId ?? ""}
							options={options}
							placeholder="Select content"
							onChange={(value) => {
								if (value) {
									onSelect(value);
								}
							}}
							fullWidth
							size="small"
							aria-label="Content"
						/>
						{lastUpdatedLabel && (
							<span
								style={{
									fontSize: 12,
									color: adminColor.textSecondary,
								}}
							>
								Last updated: {lastUpdatedLabel}
							</span>
						)}
					</div>
				)}
			</div>
		</div>
	);
}
