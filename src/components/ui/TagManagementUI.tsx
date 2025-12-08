"use client";

import { Plus, Search, Tag as TagIcon, X } from "lucide-react";
import type React from "react";
import { useCallback, useEffect, useRef, useState } from "react";
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

export function TagManagementUI({
	selectedTags,
	onChange,
	tagManager,
	allowNewTags = true,
	maxTags,
	placeholder = "Search or add tags...",
	className = "",
}: TagManagementUIProps) {
	const [availableTags, setAvailableTags] = useState<TagInfo[]>([]);
	const [searchQuery, setSearchQuery] = useState("");
	const [isDropdownOpen, setIsDropdownOpen] = useState(false);
	const [isLoading, setIsLoading] = useState(false);
	const [newTagInput, setNewTagInput] = useState("");
	const [filteredTags, setFilteredTags] = useState<TagInfo[]>([]);

	const inputRef = useRef<HTMLInputElement>(null);
	const dropdownRef = useRef<HTMLDivElement>(null);

	const loadTags = useCallback(async () => {
		setIsLoading(true);
		try {
			console.log("Loading tags from tag manager...");
			const tags = await tagManager.getAllTags();
			console.log("Loaded tags:", tags);
			setAvailableTags(tags);
			setIsLoading(false);
		} catch (error) {
			console.error("Failed to load tags:", error);
			// Show empty array on error to prevent UI issues
			setAvailableTags([]);
			setIsLoading(false);
		}
	}, [tagManager]);

	// Load available tags on mount
	useEffect(() => {
		loadTags();
	}, [loadTags]);

	// Filter tags based on search query
	useEffect(() => {
		if (searchQuery.trim()) {
			const query = searchQuery.toLowerCase();
			const filtered = availableTags.filter(
				(tag) =>
					tag.name.toLowerCase().includes(query) &&
					!selectedTags.includes(tag.name),
			);

			// Sort by relevance: exact match first, then starts with, then contains
			filtered.sort((a, b) => {
				const aName = a.name.toLowerCase();
				const bName = b.name.toLowerCase();

				const aExact = aName === query;
				const bExact = bName === query;
				if (aExact && !bExact) return -1;
				if (!aExact && bExact) return 1;

				const aStarts = aName.startsWith(query);
				const bStarts = bName.startsWith(query);
				if (aStarts && !bStarts) return -1;
				if (!aStarts && bStarts) return 1;

				// If same relevance, sort by usage count
				return b.count - a.count;
			});

			setFilteredTags(filtered);
		} else {
			// Show all available tags sorted by usage when no search query
			const available = availableTags.filter(
				(tag) => !selectedTags.includes(tag.name),
			);
			setFilteredTags(available);
		}
	}, [searchQuery, availableTags, selectedTags]);

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

		const newTags = [...selectedTags, tagName];
		onChange(newTags);

		// Update tag usage
		try {
			console.log("Updating tag usage for:", tagName);
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
		const newTags = selectedTags.filter((tag) => tag !== tagName);
		onChange(newTags);
	};

	const handleCreateNewTag = async () => {
		const tagName = newTagInput.trim();
		if (!tagName || !allowNewTags) return;
		if (selectedTags.includes(tagName)) return;
		if (maxTags && selectedTags.length >= maxTags) return;

		try {
			console.log("Creating new tag:", tagName);
			await tagManager.createTag(tagName);
			await handleTagSelect(tagName);
			setNewTagInput("");
			setSearchQuery("");
			await loadTags(); // Refresh tag list
			console.log("New tag created successfully:", tagName);
		} catch (error) {
			console.error("Failed to create new tag:", error);
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
			// Remove last selected tag when backspace is pressed on empty input
			handleTagRemove(selectedTags[selectedTags.length - 1]);
		}
	};

	const handleInputChange = (value: string) => {
		setSearchQuery(value);
		setNewTagInput(value);
		setIsDropdownOpen(true);
	};

	const canAddMoreTags = !maxTags || selectedTags.length < maxTags;
	const showCreateOption =
		allowNewTags &&
		newTagInput.trim() &&
		!availableTags.some(
			(tag) => tag.name.toLowerCase() === newTagInput.toLowerCase(),
		) &&
		canAddMoreTags;

	return (
		<div className={`relative ${className}`}>
			{/* Selected Tags */}
			<div className="flex flex-wrap gap-2 mb-3">
				{selectedTags.map((tag) => (
					<span
						key={tag}
						className="inline-flex items-center gap-1 px-3 py-1 bg-main text-base rounded-full text-sm font-medium"
					>
						<TagIcon className="w-3 h-3" />
						{tag}
						<button
							type="button"
							onClick={() => handleTagRemove(tag)}
							className="ml-1 hover:bg-base hover:bg-opacity-20 rounded-full p-0.5 transition-colors"
							aria-label={`Remove ${tag} tag`}
						>
							<X className="w-3 h-3" />
						</button>
					</span>
				))}
			</div>

			{/* Input Field */}
			<div className="relative">
				<div className="relative">
					<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
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
						className={`
              w-full pl-10 pr-4 py-2 border border-main bg-base text-main
              focus:ring-2 focus:ring-main focus:ring-offset-2 focus:ring-offset-base focus:border-transparent
              disabled:bg-gray-100 disabled:cursor-not-allowed
              ${!canAddMoreTags ? "opacity-60" : ""}
            `}
					/>
				</div>

				{/* Dropdown */}
				{isDropdownOpen && canAddMoreTags && (
					<div
						ref={dropdownRef}
						className="absolute z-[9999] w-full mt-1 border border-main rounded-lg shadow-xl max-h-60 overflow-y-auto"
						style={{ backgroundColor: "#181818", zIndex: 9999 }}
					>
						{isLoading ? (
							<div className="px-4 py-3 text-main text-center">
								Loading tags...
							</div>
						) : (
							<>
								{/* Create new tag option */}
								{showCreateOption && (
									<button
										type="button"
										onClick={handleCreateNewTag}
										className="w-full px-4 py-3 text-left hover:bg-main hover:bg-opacity-10 border-b border-main flex items-center gap-2 text-green-600"
									>
										<Plus className="w-4 h-4" />
										Create &quot;{newTagInput}&quot;
									</button>
								)}

								{/* Existing tags */}
								{filteredTags.length > 0 ? (
									filteredTags.slice(0, 20).map((tag) => (
										<button
											key={tag.name}
											type="button"
											onClick={() => handleTagSelect(tag.name)}
											className="w-full px-4 py-3 text-left hover:bg-main hover:bg-opacity-10 flex items-center justify-between group text-main border-b border-gray-100 last:border-b-0"
										>
											<div className="flex items-center gap-2">
												<TagIcon className="w-4 h-4 text-gray-400" />
												<span className="font-medium">{tag.name}</span>
											</div>
											<div className="flex items-center gap-2 text-xs text-gray-400">
												<span className="bg-main bg-opacity-10 px-2 py-1 rounded">
													{tag.count} use{tag.count !== 1 ? "s" : ""}
												</span>
											</div>
										</button>
									))
								) : searchQuery && !showCreateOption ? (
									<div className="px-4 py-3 text-main text-center">
										<div className="text-gray-500 mb-2">
											No existing tags found for &quot;{searchQuery}&quot;
										</div>
										{allowNewTags && (
											<div className="text-xs text-gray-400">
												Press Enter to create a new tag
											</div>
										)}
									</div>
								) : !searchQuery && filteredTags.length === 0 ? (
									<div className="px-4 py-3 text-main text-center">
										<div className="text-gray-500 mb-2">
											All available tags are already selected
										</div>
										<div className="text-xs text-gray-400">
											Type to create a new tag
										</div>
									</div>
								) : null}

								{/* Show more indicator if there are more tags */}
								{filteredTags.length > 20 && (
									<div className="px-4 py-2 text-xs text-gray-400 text-center border-t border-gray-100">
										... and {filteredTags.length - 20} more tags. Keep typing to
										narrow down results.
									</div>
								)}
							</>
						)}
					</div>
				)}
			</div>

			{/* Tag count indicator */}
			{maxTags && (
				<div className="mt-2 text-xs text-gray-500">
					{selectedTags.length} / {maxTags} tags selected
				</div>
			)}
		</div>
	);
}
