"use client";

import {
	Alert,
	Box,
	Button,
	CircularProgress,
	Stack,
	Typography,
} from "@mui/material";
import { useCallback, useEffect, useMemo, useState } from "react";
import { fetchContentList } from "@/cms/page-editor/lib/api/content";
import type { ContentIndexItem } from "@/cms/types/content";
import { SimpleSelect, type SimpleSelectOption } from "@/components/admin/ui";

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
		<Box>
			<Stack
				sx={{
					flexDirection: "row",
					alignItems: "center",
					justifyContent: "space-between",
					px: 0,
					py: 1.5,
				}}
			>
				<Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
					Content
				</Typography>
				<Button
					size="small"
					variant="text"
					onClick={() => void loadContents()}
					disabled={loading}
				>
					Refresh
				</Button>
			</Stack>
			<Box sx={{ px: 0, py: 0 }}>
				{loading && (
					<Stack
						spacing={1.5}
						sx={{ flexDirection: "row", alignItems: "center" }}
					>
						<CircularProgress size={18} />
						<Typography variant="body2" color="text.secondary">
							Loading content list...
						</Typography>
					</Stack>
				)}
				{!loading && error && <Alert severity="error">{error}</Alert>}
				{!loading && !error && (
					<Stack spacing={1}>
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
							<Typography variant="caption" color="text.secondary">
								Last updated: {lastUpdatedLabel}
							</Typography>
						)}
					</Stack>
				)}
			</Box>
		</Box>
	);
}
