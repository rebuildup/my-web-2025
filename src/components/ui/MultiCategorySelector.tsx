"use client";

import { Check, HelpCircle, Info } from "lucide-react";
import { useState } from "react";
import type { EnhancedCategoryType } from "@/types/enhanced-content";

interface MultiCategorySelectorProps {
	selectedCategories: EnhancedCategoryType[];
	onChange: (categories: EnhancedCategoryType[]) => void;
	availableCategories: EnhancedCategoryType[];
	maxSelections?: number;
	showOtherOption?: boolean;
	className?: string;
	disabled?: boolean;
}

// Category information for help display
const CATEGORY_INFO: Record<
	EnhancedCategoryType,
	{ label: string; color: string }
> = {
	develop: {
		label: "Development",
		color: "bg-blue-100 text-blue-800 border-blue-200",
	},
	video: {
		label: "Video",
		color: "bg-purple-100 text-purple-800 border-purple-200",
	},
	design: {
		label: "Design",
		color: "bg-green-100 text-green-800 border-green-200",
	},
	"video&design": {
		label: "Video & Design",
		color: "bg-indigo-100 text-indigo-800 border-indigo-200",
	},
	other: {
		label: "Other",
		color: "bg-gray-100 text-gray-800 border-gray-200",
	},
};

export function MultiCategorySelector({
	selectedCategories,
	onChange,
	availableCategories,
	maxSelections,

	className = "",
	disabled = false,
}: MultiCategorySelectorProps) {
	const [showHelp, setShowHelp] = useState(false);
	const [validationError, setValidationError] = useState<string | null>(null);

	// Filter available categories - exclude "other" as it's automatic
	const filteredCategories = availableCategories.filter(
		(category) => category !== "other",
	);

	const handleCategoryToggle = (category: EnhancedCategoryType) => {
		if (disabled) return;

		let newCategories: EnhancedCategoryType[];

		if (selectedCategories.includes(category)) {
			// Remove category
			newCategories = selectedCategories.filter((c) => c !== category);
			setValidationError(null);
		} else {
			// Add category
			if (maxSelections && selectedCategories.length >= maxSelections) {
				setValidationError(
					`Maximum ${maxSelections} categories can be selected`,
				);
				return;
			}

			newCategories = [...selectedCategories, category];
			setValidationError(null);
		}

		// If no specific categories are selected, automatically set "other"
		const finalCategories =
			newCategories.length === 0
				? (["other"] as EnhancedCategoryType[])
				: (newCategories.filter(
						(c) => c !== "other",
					) as EnhancedCategoryType[]);
		onChange(finalCategories);
	};

	const canSelectMore =
		!maxSelections || selectedCategories.length < maxSelections;
	const hasOtherSelected = selectedCategories.includes("other");

	return (
		<div className={`space-y-4 ${className}`}>
			{/* Header with help toggle */}
			<div className="flex items-center justify-between">
				<div className="flex items-center gap-2">
					<label className="block noto-sans-jp-regular text-sm font-medium text-main">
						Categories
						{maxSelections && (
							<span className="text-gray-400 ml-1">(max {maxSelections})</span>
						)}
					</label>
					<button
						type="button"
						onClick={() => setShowHelp(!showHelp)}
						className="text-gray-400 hover:text-gray-600 transition-colors"
						aria-label="Show category help"
					>
						<HelpCircle className="w-4 h-4" />
					</button>
				</div>

				{/* Selection count */}
				<div className="text-xs text-gray-500">
					{selectedCategories.length} selected
					{maxSelections && ` / ${maxSelections}`}
				</div>
			</div>

			{/* Help panel */}
			{showHelp && (
				<div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
					<div className="flex items-start gap-2">
						<Info className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
						<div className="space-y-2">
							<h4 className="text-sm font-medium text-blue-900">
								Category Guidelines
							</h4>
							<ul className="text-xs text-blue-800 space-y-1">
								<li>
									• Default is &quot;Other&quot; - items appear only in All
									gallery
								</li>
								<li>
									• Select Development, Video, or Design for specific galleries
								</li>
								<li>• Multiple selections allowed for cross-category items</li>
								<li>• Filter: All / Development / Video / Video or Design</li>
							</ul>
						</div>
					</div>
				</div>
			)}

			{/* Category selection buttons */}
			<div className="flex flex-wrap gap-2">
				{filteredCategories.map((category) => {
					const isSelected = selectedCategories.includes(category);
					const categoryInfo = CATEGORY_INFO[category];

					return (
						<button
							key={category}
							type="button"
							onClick={() => handleCategoryToggle(category)}
							disabled={disabled || (!canSelectMore && !isSelected)}
							className={`
                px-4 py-2 text-sm font-medium border transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-main focus:ring-offset-2 focus:ring-offset-base
                ${
									isSelected
										? "bg-main text-base border-main"
										: "bg-base text-main border-main hover:bg-main hover:bg-opacity-10"
								}
                ${disabled ? "opacity-50 cursor-not-allowed" : ""}
                ${!canSelectMore && !isSelected ? "opacity-60" : ""}
              `}
						>
							{categoryInfo.label}
							{isSelected && <Check className="w-3 h-3 ml-2 inline" />}
						</button>
					);
				})}
			</div>

			{/* Validation error */}
			{validationError && (
				<div className="bg-red-50 border border-red-200 rounded-lg p-3">
					<div className="flex items-center gap-2">
						<div className="w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
							<span className="text-white text-xs">!</span>
						</div>
						<span className="text-sm text-red-800">{validationError}</span>
					</div>
				</div>
			)}

			{/* Selection summary */}
			{selectedCategories.length > 0 && (
				<div className="bg-base border border-main rounded-lg p-3">
					<h4 className="text-sm font-medium text-main mb-2">
						Selected Categories
					</h4>
					<div className="flex flex-wrap gap-2">
						{selectedCategories.map((category) => {
							const categoryInfo = CATEGORY_INFO[category];
							return (
								<span
									key={category}
									className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-main text-base"
								>
									{categoryInfo.label}
									<button
										type="button"
										onClick={(e) => {
											e.stopPropagation();
											handleCategoryToggle(category);
										}}
										className="ml-1 hover:bg-black hover:bg-opacity-10 rounded-full p-0.5 transition-colors"
										aria-label={`Remove ${categoryInfo.label} category`}
										disabled={disabled}
									>
										×
									</button>
								</span>
							);
						})}
					</div>

					{/* Gallery visibility info */}
					<div className="mt-3 pt-3 border-t border-main">
						<h5 className="text-xs font-medium text-main mb-1">
							Will appear in galleries:
						</h5>
						<div className="text-xs text-gray-400">
							{hasOtherSelected ||
							selectedCategories.filter((cat) => cat !== "other").length ===
								0 ? (
								<span className="text-orange-600">
									All gallery only (Other category)
								</span>
							) : (
								<>
									<span>All</span>
									{selectedCategories
										.filter((cat) => cat !== "other")
										.map((cat) => `, ${CATEGORY_INFO[cat].label}`)
										.join("")}
								</>
							)}
						</div>
					</div>
				</div>
			)}

			{/* Empty state */}
			{selectedCategories.filter((cat) => cat !== "other").length === 0 && (
				<div className="text-center py-4 text-gray-500">
					<div className="text-sm">No specific categories selected</div>
					<div className="text-xs mt-1">
						Item will appear in &quot;Other&quot; category (All gallery only)
					</div>
				</div>
			)}
		</div>
	);
}
