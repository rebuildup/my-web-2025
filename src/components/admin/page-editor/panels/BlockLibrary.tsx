"use client";

import { useMemo, useState } from "react";
import {
	getBlockDefinitions,
	searchBlocks,
} from "@/cms/page-editor/lib/blocks/registry";
import type { BlockType } from "@/cms/types/blocks";

export interface BlockLibraryProps {
	onInsertBlock?: (type: BlockType) => void;
}

export function BlockLibrary({ onInsertBlock }: BlockLibraryProps) {
	const [query, setQuery] = useState("");
	const definitions = useMemo(
		() => (query ? searchBlocks(query) : getBlockDefinitions()),
		[query],
	);

	const grouped = useMemo(() => {
		return definitions.reduce<Record<string, typeof definitions>>(
			(acc, def) => {
				if (!acc[def.group]) {
					acc[def.group] = [];
				}
				acc[def.group]?.push(def);
				return acc;
			},
			{},
		);
	}, [definitions]);

	return (
		<div
			style={{
				height: "100%",
				display: "flex",
				flexDirection: "column",
				minHeight: 0,
				padding: 8,
				overflow: "hidden",
				boxSizing: "border-box",
			}}
		>
			<div
				style={{
					display: "flex",
					alignItems: "center",
					justifyContent: "space-between",
					padding: "6px 0",
					flexShrink: 0,
				}}
			>
				<h3 style={{ margin: 0, fontSize: 14, fontWeight: 700 }}>Blocks</h3>
				<button
					onClick={() => setQuery("")}
					disabled={!query}
					type="button"
					style={{
						fontSize: 12,
						padding: "4px 8px",
						background: "transparent",
						color: "inherit",
						borderRadius: 6,
						cursor: query ? "pointer" : "not-allowed",
					}}
				>
					Clear
				</button>
			</div>
			<div
				style={{
					display: "flex",
					flexDirection: "column",
					gap: 10,
					padding: "6px 0",
					flexShrink: 0,
				}}
			>
				<input
					placeholder="Search blocks"
					value={query}
					onChange={(event) => setQuery(event.target.value)}
					style={{
						fontSize: 13,
						padding: "8px 10px",
						borderRadius: 6,
						background: "transparent",
						color: "inherit",
						outline: "none",
					}}
				/>
			</div>
			<div
				style={{
					display: "flex",
					flexDirection: "column",
					gap: 12,
					minHeight: 0,
					flex: 1,
					overflowY: "auto",
				}}
			>
				{Object.entries(grouped).map(([group, items]) => (
					<div
						key={group}
						style={{ display: "flex", flexDirection: "column", gap: 6 }}
					>
						<div
							style={{
								fontSize: 11,
								opacity: 0.65,
								textTransform: "uppercase",
								letterSpacing: 1,
							}}
						>
							{translateGroup(group)}
						</div>
						<div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
							{items.map((item) => (
								<button
									key={item.type}
									onClick={() => onInsertBlock?.(item.type)}
									type="button"
									className="flex items-center justify-start gap-2 px-1.5 py-1 rounded-md cursor-pointer border-0 bg-transparent outline-none text-left"
									onMouseEnter={(e) => {
										(e.currentTarget as HTMLButtonElement).style.background =
											"rgba(255,255,255,0.06)";
									}}
									onMouseLeave={(e) => {
										(e.currentTarget as HTMLButtonElement).style.background =
											"transparent";
									}}
								>
									<div className="w-7 h-7 inline-flex items-center justify-center rounded-md bg-blue-500 text-white font-bold text-[11px] shrink-0 -ml-1.5">
										{String(item.icon ?? "?")}
									</div>
									<div
										style={{
											display: "flex",
											flexDirection: "column",
											minWidth: 0,
											textAlign: "left",
										}}
									>
										<div
											style={{
												fontSize: 14,
												fontWeight: 700,
												whiteSpace: "nowrap",
												textOverflow: "ellipsis",
												overflow: "hidden",
												textAlign: "left",
											}}
										>
											{item.label}
										</div>
										{item.description ? (
											<div
												style={{
													fontSize: 12,
													opacity: 0.7,
													whiteSpace: "nowrap",
													textOverflow: "ellipsis",
													overflow: "hidden",
												}}
											>
												{item.description}
											</div>
										) : null}
									</div>
								</button>
							))}
						</div>
					</div>
				))}
			</div>
		</div>
	);
}

function translateGroup(group: string) {
	switch (group) {
		case "basic":
			return "Basic";
		case "media":
			return "Media";
		case "advanced":
			return "Advanced";
		case "database":
			return "Database";
		case "embed":
			return "Embed";
		case "layout":
			return "Layout";
		default:
			return group;
	}
}
