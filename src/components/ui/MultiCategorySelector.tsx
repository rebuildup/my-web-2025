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
		color: "  ",
	},
	video: {
		label: "Video",
		color: "  ",
	},
	design: {
		label: "Design",
		color: "  ",
	},
	"video&design": {
		label: "Video & Design",
		color: "  ",
	},
	other: {
		label: "Other",
		color: "  ",
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
					<label className="block noto-sans-jp-regular text-sm font-medium ">
						Categories
						{maxSelections && (
							<span className=" ml-1">(max {maxSelections})</span>
						)}
					</label>
					<button
						type="button"
						onClick={() => setShowHelp(!showHelp)}
						className=""
						aria-label="Show category help"
					>
						<HelpCircle className="w-4 h-4" />
					</button>
				</div>

				{/* Selection count */}
				<div className="text-xs ">
					{selectedCategories.length} selected
					{maxSelections && ` / ${maxSelections}`}
				</div>
			</div>

			{/* Help panel */}
			{showHelp && (
				<div className="   rounded-lg p-4">
					<div className="flex items-start gap-2">
						<Info className="w-4 h-4  mt-0.5 shrink-0" />
						<div className="space-y-2">
							<h4 className="text-sm font-medium ">Category Guidelines</h4>
							<ul className="text-xs  space-y-1">
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
							className={`px-4 py-2 text-sm font-medium ${isSelected ? " " : " "} ${disabled ? " cursor-not-allowed" : ""} ${!canSelectMore && !isSelected ? "" : ""}`}
						>
							{categoryInfo.label}
							{isSelected && <Check className="w-3 h-3 ml-2 inline" />}
						</button>
					);
				})}
			</div>

			{/* Validation error */}
			{validationError && (
				<div className="   rounded-lg p-3">
					<div className="flex items-center gap-2">
						<div className="w-4 h-4  rounded-full flex items-center justify-center">
							<span className=" text-xs">!</span>
						</div>
						<span className="text-sm ">{validationError}</span>
					</div>
				</div>
			)}

			{/* Selection summary */}
			{selectedCategories.length > 0 && (
				<div className="  rounded-lg p-3">
					<h4 className="text-sm font-medium mb-2">Selected Categories</h4>
					<div className="flex flex-wrap gap-2">
						{selectedCategories.map((category) => {
							const categoryInfo = CATEGORY_INFO[category];
							return (
								<span
									key={category}
									className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium "
								>
									{categoryInfo.label}
									<button
										type="button"
										onClick={(e) => {
											e.stopPropagation();
											handleCategoryToggle(category);
										}}
										className="ml-1 p-0.5"
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
					<div className="mt-3 pt-3  ">
						<h5 className="text-xs font-medium mb-1">
							Will appear in galleries:
						</h5>
						<div className="text-xs ">
							{hasOtherSelected ||
							selectedCategories.filter((cat) => cat !== "other").length ===
								0 ? (
								<span className="">All gallery only (Other category)</span>
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
				<div className="text-center py-4 ">
					<div className="text-sm">No specific categories selected</div>
					<div className="text-xs mt-1">
						Item will appear in &quot;Other&quot; category (All gallery only)
					</div>
				</div>
			)}
		</div>
	);
}
