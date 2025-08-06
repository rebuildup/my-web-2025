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
    <nav aria-label="Breadcrumb" className={`text-sm mb-4 ${className}`}>
      <ol className="flex items-center space-x-2">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          const isCurrent = item.isCurrent || isLast;

          return (
            <li
              key={`${item.href || item.label}-${index}`}
              className="flex items-center"
            >
              {/* Separator */}
              {index > 0 && (
                <span className="mx-2 text-muted-foreground select-none">
                  /
                </span>
              )}

              {/* Breadcrumb item */}
              {isCurrent || !item.href ? (
                <span
                  className="font-medium text-foreground"
                  aria-current={isCurrent ? "page" : undefined}
                >
                  {item.label}
                </span>
              ) : (
                <Link
                  href={item.href}
                  className="text-muted-foreground hover:text-foreground transition-colors duration-200 hover:underline"
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
