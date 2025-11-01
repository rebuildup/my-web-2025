/**
 * Page Header Component
 * Simple header with optional breadcrumbs and page title
 */

import { type BreadcrumbItem, Breadcrumbs } from "@/components/ui/Breadcrumbs";

interface PageHeaderProps {
	title?: string;
	description?: string;
	className?: string;
	breadcrumbs?: BreadcrumbItem[];
}

export function PageHeader({
	title,
	description,
	className = "",
	breadcrumbs,
}: PageHeaderProps) {
	return (
		<div className={`container mx-auto px-4 py-4 ${className}`}>
			{/* Breadcrumbs */}
			{breadcrumbs && breadcrumbs.length > 0 && (
				<Breadcrumbs items={breadcrumbs} />
			)}

			{/* Page Title */}
			{title && (
				<div className="mb-4">
					<h1 className="text-3xl font-bold text-main mb-2">{title}</h1>
					{description && <p className="text-main/70">{description}</p>}
				</div>
			)}
		</div>
	);
}
