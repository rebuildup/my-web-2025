"use client";

import { Plus, Search, Tag as TagIcon, X } from "lucide-react";
import type React from "react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { TagInfo, TagManagementSystem } from "@/types/enhanced-content";

interface TagManagementUIProps {
	selectedTags: string[];
	onChange: (tags: string[]) => void;
	tagManager: TagManagementSystem;
	allowNewTags?: boolean;
	maxTags?: number;
	placeholder?: string;
	className?: string;
}

// Loads all tags via tagManager on mount and exposes a refresh handle.
function useTagLoader(tagManager: TagManagementSystem) {
	const [availableTags, setAvailableTags] = useState<TagInfo[]>([]);
	const [isLoading, setIsLoading] = useState(false);

	const loadTags = useCallback(async () => {
		setIsLoading(true);
		try {
			const tags = await tagManager.getAllTags();
			setAvailableTags(tags);
		} catch (error) {
			console.error("Failed to load tags:", error);
			setAvailableTags([]);
		} finally {
			setIsLoading(false);
		}
	}, [tagManager]);

	useEffect(() => {
		void loadTags();
	}, [loadTags]);

	return { availableTags, isLoading, loadTags };
}

// Filters available tags by query: exact match → starts-with → contains, then by usage.
function useTagFilter(
	availableTags: TagInfo[],
	selectedTags: string[],
	searchQuery: string,
) {
	return useMemo(() => {
		const notSelected = availableTags.filter(
			(tag) => !selectedTags.includes(tag.name),
		);
		if (!searchQuery.trim()) return notSelected;

		const query = searchQuery.toLowerCase();
		const filtered = notSelected.filter((tag) =>
			tag.name.toLowerCase().includes(query),
		);
		filtered.sort((a, b) => {
			const aName = a.name.toLowerCase();
			const bName = b.name.toLowerCase();
			const aExact = aName === query;
			const bExact = bName === query;
			if (aExact !== bExact) return aExact ? -1 : 1;
			const aStarts = aName.startsWith(query);
			const bStarts = bName.startsWith(query);
			if (aStarts !== bStarts) return aStarts ? -1 : 1;
			return b.count - a.count;
		});
		return filtered;
	}, [availableTags, selectedTags, searchQuery]);
}

function SelectedTags({
	selectedTags,
	onRemove,
}: {
	selectedTags: string[];
	onRemove: (tag: string) => void;
}) {
	return (
		<div className="flex flex-wrap gap-2 mb-3">
			{selectedTags.map((tag) => (
				<span
					key={tag}
					className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium"
				>
					<TagIcon className="w-3 h-3" />
					{tag}
					<button
						type="button"
						onClick={() => onRemove(tag)}
						className="ml-1 p-0.5"
						aria-label={`Remove ${tag} tag`}
					>
						<X className="w-3 h-3" />
					</button>
				</span>
			))}
		</div>
	);
}

function TagDropdown({
	filteredTags,
	searchQuery,
	isLoading,
	showCreateOption,
	newTagInput,
	allowNewTags,
	onSelect,
	onCreate,
}: {
	filteredTags: TagInfo[];
	searchQuery: string;
	isLoading: boolean;
	showCreateOption: boolean;
	newTagInput: string;
	allowNewTags: boolean;
	onSelect: (name: string) => void;
	onCreate: () => void;
}) {
	if (isLoading) {
		return <div className="px-4 py-3 text-center">Loading tags...</div>;
	}
	return (
		<>
			{showCreateOption && (
				<button
					type="button"
					onClick={onCreate}
					className="w-full px-4 py-3 text-left flex items-center gap-2"
				>
					<Plus className="w-4 h-4" />
					Create &quot;{newTagInput}&quot;
				</button>
			)}
			{filteredTags.length > 0 ? (
				filteredTags.slice(0, 20).map((tag) => (
					<button
						key={tag.name}
						type="button"
						onClick={() => onSelect(tag.name)}
						className="w-full px-4 py-3 text-left flex items-center justify-between group"
					>
						<div className="flex items-center gap-2">
							<TagIcon className="w-4 h-4 " />
							<span className="font-medium">{tag.name}</span>
						</div>
						<div className="flex items-center gap-2 text-xs ">
							<span className=" bg-opacity-10 px-2 py-1 rounded">
								{tag.count} use{tag.count !== 1 ? "s" : ""}
							</span>
						</div>
					</button>
				))
			) : searchQuery && !showCreateOption ? (
				<div className="px-4 py-3 text-center">
					<div className=" mb-2">
						No existing tags found for &quot;{searchQuery}&quot;
					</div>
					{allowNewTags && (
						<div className="text-xs ">Press Enter to create a new tag</div>
					)}
				</div>
			) : !searchQuery ? (
				<div className="px-4 py-3 text-center">
					<div className=" mb-2">All available tags are already selected</div>
					<div className="text-xs ">Type to create a new tag</div>
				</div>
			) : null}
			{filteredTags.length > 20 && (
				<div className="px-4 py-2 text-xs  text-center  ">
					... and {filteredTags.length - 20} more tags. Keep typing to narrow
					down results.
				</div>
			)}
		</>
	);
}

export function TagManagementUI({
	selectedTags,
	onChange,
	tagManager,
	allowNewTags = true,
	maxTags,
	placeholder = "Search or add tags...",
	className = "",
}: TagManagementUIProps) {
	const [searchQuery, setSearchQuery] = useState("");
	const [isDropdownOpen, setIsDropdownOpen] = useState(false);
	const [newTagInput, setNewTagInput] = useState("");

	const inputRef = useRef<HTMLInputElement>(null);
	const dropdownRef = useRef<HTMLDivElement>(null);

	const { availableTags, isLoading, loadTags } = useTagLoader(tagManager);
	const filteredTags = useTagFilter(availableTags, selectedTags, searchQuery);

	// Close dropdown when clicking outside
	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (
				dropdownRef.current &&
				!dropdownRef.current.contains(event.target as Node) &&
				inputRef.current &&
				!inputRef.current.contains(event.target as Node)
			) {
				setIsDropdownOpen(false);
				setSearchQuery("");
				setNewTagInput("");
			}
		};

		document.addEventListener("mousedown", handleClickOutside);
		return () => document.removeEventListener("mousedown", handleClickOutside);
	}, []);

	const handleTagSelect = async (tagName: string) => {
		if (selectedTags.includes(tagName)) return;
		if (maxTags && selectedTags.length >= maxTags) return;

		onChange([...selectedTags, tagName]);

		// Update tag usage
		try {
			await tagManager.updateTagUsage(tagName);
			await loadTags(); // Refresh to get updated usage counts
		} catch (error) {
			console.error("Failed to update tag usage:", error);
		}

		setSearchQuery("");
		setNewTagInput("");
		setIsDropdownOpen(false);
	};

	const handleTagRemove = (tagName: string) => {
		onChange(selectedTags.filter((tag) => tag !== tagName));
	};

	const handleCreateNewTag = async () => {
		const tagName = newTagInput.trim();
		if (!tagName || !allowNewTags) return;
		if (selectedTags.includes(tagName)) return;
		if (maxTags && selectedTags.length >= maxTags) return;

		try {
			await tagManager.createTag(tagName);
			await handleTagSelect(tagName);
			setNewTagInput("");
			setSearchQuery("");
			await loadTags(); // Refresh tag list
		} catch (error) {
			console.error("Failed to create tag:", error);
			alert(
				`Failed to create tag "${tagName}": ${error instanceof Error ? error.message : "Unknown error"}`,
			);
		}
	};

	const handleInputKeyDown = (e: React.KeyboardEvent) => {
		if (e.key === "Enter") {
			e.preventDefault();
			if (newTagInput.trim() && allowNewTags) {
				handleCreateNewTag();
			} else if (filteredTags.length > 0) {
				handleTagSelect(filteredTags[0].name);
			}
		} else if (e.key === "Escape") {
			setIsDropdownOpen(false);
			setSearchQuery("");
			setNewTagInput("");
		} else if (
			e.key === "Backspace" &&
			!searchQuery &&
			!newTagInput &&
			selectedTags.length > 0
		) {
			handleTagRemove(selectedTags[selectedTags.length - 1]);
		}
	};

	const handleInputChange = (value: string) => {
		setSearchQuery(value);
		setNewTagInput(value);
		setIsDropdownOpen(true);
	};

	const canAddMoreTags = !maxTags || selectedTags.length < maxTags;
	const showCreateOption = Boolean(
		allowNewTags &&
			newTagInput.trim() &&
			!availableTags.some(
				(tag) => tag.name.toLowerCase() === newTagInput.toLowerCase(),
			) &&
			canAddMoreTags,
	);

	return (
		<div className={`relative ${className}`}>
			<SelectedTags selectedTags={selectedTags} onRemove={handleTagRemove} />

			<div className="relative">
				<div className="relative">
					<Search className="absolute left-3 top-1/2 transform -translate-y-1/2  w-4 h-4" />
					<input
						ref={inputRef}
						type="text"
						value={searchQuery || newTagInput}
						onChange={(e) => handleInputChange(e.target.value)}
						onKeyDown={handleInputKeyDown}
						onFocus={() => setIsDropdownOpen(true)}
						placeholder={
							canAddMoreTags ? placeholder : `Maximum ${maxTags} tags selected`
						}
						disabled={!canAddMoreTags}
						className={`w-full pl-10 pr-4 py-2 ${!canAddMoreTags ? "" : ""}`}
					/>
				</div>

				{isDropdownOpen && canAddMoreTags && (
					<div
						ref={dropdownRef}
						className="absolute z-[9999] w-full mt-1  rounded-lg  max-h-60 overflow-y-auto"
						style={{ backgroundColor: "#181818", zIndex: 9999 }}
					>
						<TagDropdown
							filteredTags={filteredTags}
							searchQuery={searchQuery}
							isLoading={isLoading}
							showCreateOption={showCreateOption}
							newTagInput={newTagInput}
							allowNewTags={allowNewTags}
							onSelect={handleTagSelect}
							onCreate={handleCreateNewTag}
						/>
					</div>
				)}
			</div>

			{maxTags && (
				<div className="mt-2 text-xs ">
					{selectedTags.length} / {maxTags} tags selected
				</div>
			)}
		</div>
	);
}
