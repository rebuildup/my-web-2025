"use client";

import type { TagInfo, TagManagementSystem } from "@/types/enhanced-content";
import { Plus, Search, Tag as TagIcon, X } from "lucide-react";
import React, { useCallback, useEffect, useRef, useState } from "react";

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
    try {
      setIsLoading(true);
      const tags = await tagManager.getAllTags();
      setAvailableTags(tags);
    } catch (error) {
      console.error("Failed to load tags:", error);
    } finally {
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
      const filtered = availableTags.filter(
        (tag) =>
          tag.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
          !selectedTags.includes(tag.name),
      );
      setFilteredTags(filtered);
    } else {
      setFilteredTags(
        availableTags.filter((tag) => !selectedTags.includes(tag.name)),
      );
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
      await tagManager.updateTagUsage(tagName);
      await loadTags(); // Refresh to get updated usage counts
    } catch (error) {
      console.error("Failed to update tag usage:", error);
    }

    setSearchQuery("");
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
      await tagManager.createTag(tagName);
      await handleTagSelect(tagName);
      setNewTagInput("");
      await loadTags(); // Refresh tag list
    } catch (error) {
      console.error("Failed to create new tag:", error);
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
            className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium"
          >
            <TagIcon className="w-3 h-3" />
            {tag}
            <button
              type="button"
              onClick={() => handleTagRemove(tag)}
              className="ml-1 hover:bg-blue-200 rounded-full p-0.5 transition-colors"
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
              w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg
              focus:ring-2 focus:ring-blue-500 focus:border-transparent
              disabled:bg-gray-100 disabled:cursor-not-allowed
              ${!canAddMoreTags ? "opacity-60" : ""}
            `}
          />
        </div>

        {/* Dropdown */}
        {isDropdownOpen && canAddMoreTags && (
          <div
            ref={dropdownRef}
            className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto"
          >
            {isLoading ? (
              <div className="px-4 py-3 text-gray-500 text-center">
                Loading tags...
              </div>
            ) : (
              <>
                {/* Create new tag option */}
                {showCreateOption && (
                  <button
                    type="button"
                    onClick={handleCreateNewTag}
                    className="w-full px-4 py-3 text-left hover:bg-gray-50 border-b border-gray-100 flex items-center gap-2 text-green-600"
                  >
                    <Plus className="w-4 h-4" />
                    Create &quot;{newTagInput}&quot;
                  </button>
                )}

                {/* Existing tags */}
                {filteredTags.length > 0 ? (
                  filteredTags.map((tag) => (
                    <button
                      key={tag.name}
                      type="button"
                      onClick={() => handleTagSelect(tag.name)}
                      className="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center justify-between group"
                    >
                      <div className="flex items-center gap-2">
                        <TagIcon className="w-4 h-4 text-gray-400" />
                        <span>{tag.name}</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <span className="bg-gray-100 px-2 py-1 rounded">
                          {tag.count} uses
                        </span>
                      </div>
                    </button>
                  ))
                ) : searchQuery && !showCreateOption ? (
                  <div className="px-4 py-3 text-gray-500 text-center">
                    No tags found for &quot;{searchQuery}&quot;
                  </div>
                ) : !searchQuery && filteredTags.length === 0 ? (
                  <div className="px-4 py-3 text-gray-500 text-center">
                    All available tags are already selected
                  </div>
                ) : null}
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
