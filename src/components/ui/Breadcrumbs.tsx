/**
 * Simple Breadcrumbs Component
 * Pass breadcrumb items directly to display
 */

import Link from "next/link";

export interface BreadcrumbItem {
	label: string;
	href?: string;
	isCurrent?: boolean;
}

interface BreadcrumbsProps {
	items: BreadcrumbItem[];
	className?: string;
}

export function Breadcrumbs({ items, className = "" }: BreadcrumbsProps) {
	if (!items || items.length === 0) {
		return null;
	}

	return (
		<nav
			aria-label="Breadcrumb"
			className={`text-xs md:text-sm mb-4 ${className}`}
		>
			<ol className="flex items-baseline space-x-1 md:space-x-2 noto-sans-jp-light p-0 list-none m-0">
				{items.map((item, index) => {
					const isLast = index === items.length - 1;
					const isCurrent = item.isCurrent || isLast;

					return (
						<li
							key={item.href || item.label}
							className="flex items-baseline"
						>
							{/* Separator */}
							{index > 0 && (
								<span className="mx-2 select-none leading-none">/</span>
							)}

							{/* Breadcrumb item */}
							{isCurrent || !item.href ? (
								<span
									className=" leading-none"
									aria-current={isCurrent ? "page" : undefined}
								>
									{item.label}
								</span>
							) : (
								<Link
									href={item.href}
									className="  transition-colors duration-200 hover:underline leading-none"
								>
									{item.label}
								</Link>
							)}
						</li>
					);
				})}
			</ol>
		</nav>
	);
}
