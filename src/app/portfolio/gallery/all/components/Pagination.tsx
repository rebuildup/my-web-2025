"use client";

/**
 * Pagination Component
 * Task 3.1: 無限スクロールまたはページネーションの実装
 */

import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react";

interface PaginationProps {
	currentPage: number;
	totalPages: number;
	onPageChange: (page: number) => void;
}

export function Pagination({
	currentPage,
	totalPages,
	onPageChange,
}: PaginationProps) {
	if (totalPages <= 1) return null;

	const getVisiblePages = () => {
		const delta = 2; // Number of pages to show on each side of current page
		const range = [];
		const rangeWithDots = [];

		// Calculate the range of pages to show
		const start = Math.max(1, currentPage - delta);
		const end = Math.min(totalPages, currentPage + delta);

		for (let i = start; i <= end; i++) {
			range.push(i);
		}

		// Add first page and dots if necessary
		if (start > 1) {
			rangeWithDots.push(1);
			if (start > 2) {
				rangeWithDots.push("...");
			}
		}

		// Add the main range
		rangeWithDots.push(...range);

		// Add last page and dots if necessary
		if (end < totalPages) {
			if (end < totalPages - 1) {
				rangeWithDots.push("...");
			}
			rangeWithDots.push(totalPages);
		}

		return rangeWithDots;
	};

	const visiblePages = getVisiblePages();

	const handlePageClick = (page: number | string) => {
		if (typeof page === "number" && page !== currentPage) {
			onPageChange(page);
		}
	};

	const handlePrevious = () => {
		if (currentPage > 1) {
			onPageChange(currentPage - 1);
		}
	};

	const handleNext = () => {
		if (currentPage < totalPages) {
			onPageChange(currentPage + 1);
		}
	};

	return (
		<nav
			className="flex items-center justify-center space-x-2"
			aria-label="Pagination Navigation"
			data-testid="pagination"
		>
			{/* Previous Button */}
			<button
				type="button"
				onClick={handlePrevious}
				disabled={currentPage === 1}
				className="flex items-center space-x-1 px-3 py-2 border border-main text-main hover:border-accent hover:text-accent disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:border-main disabled:hover:text-main transition-colors"
				aria-label="Go to previous page"
			>
				<ChevronLeft className="w-4 h-4" />
				<span className="text-sm">Previous</span>
			</button>

			{/* Page Numbers */}
			<div className="flex items-center space-x-1">
				{visiblePages.map((page, index) => {
					if (page === "...") {
						const previous = visiblePages[index - 1];
						const next = visiblePages[index + 1];
						const dotsKey = `dots-${typeof previous === "number" ? previous : `start-${index}`}-${typeof next === "number" ? next : `end-${index}`}`;
						return (
							<span
								key={dotsKey}
								className="px-3 py-2 text-main/60"
								aria-hidden="true"
							>
								<MoreHorizontal className="w-4 h-4" />
							</span>
						);
					}

					const pageNumber = page as number;
					const isCurrentPage = pageNumber === currentPage;

					return (
						<button
							type="button"
							key={pageNumber}
							onClick={() => handlePageClick(pageNumber)}
							className={`px-3 py-2 text-sm border transition-colors ${
								isCurrentPage
									? "border-accent bg-accent text-main"
									: "border-main text-main hover:border-accent hover:text-accent"
							}`}
							aria-label={`Go to page ${pageNumber}`}
							aria-current={isCurrentPage ? "page" : undefined}
						>
							{pageNumber}
						</button>
					);
				})}
			</div>

			{/* Next Button */}
			<button
				type="button"
				onClick={handleNext}
				disabled={currentPage === totalPages}
				className="flex items-center space-x-1 px-3 py-2 border border-main text-main hover:border-accent hover:text-accent disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:border-main disabled:hover:text-main transition-colors"
				aria-label="Go to next page"
				data-testid="next-page"
			>
				<span className="text-sm">Next</span>
				<ChevronRight className="w-4 h-4" />
			</button>

			{/* Page Info */}
			<div className="ml-4 text-sm text-main/60">
				Page {currentPage} of {totalPages}
			</div>
		</nav>
	);
}
