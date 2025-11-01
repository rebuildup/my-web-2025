"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

interface BreadcrumbItem {
	name: string;
	href: string;
}

export function Breadcrumb() {
	const [isClient, setIsClient] = useState(false);
	const pathname = usePathname();

	useEffect(() => {
		setIsClient(true);
	}, []);

	if (!isClient) {
		return null;
	}

	// ホームページでは表示しない
	if (pathname === "/") {
		return null;
	}

	const generateBreadcrumbs = (): BreadcrumbItem[] => {
		const pathSegments = pathname.split("/").filter(Boolean);
		const breadcrumbs: BreadcrumbItem[] = [{ name: "Home", href: "/" }];

		let currentPath = "";

		for (let i = 0; i < pathSegments.length; i++) {
			currentPath += `/${pathSegments[i]}`;
			const segment = pathSegments[i];

			// Galleryセグメントをスキップ（存在しないページなので）
			if (segment === "gallery") {
				continue;
			}

			// セグメントを日本語名に変換
			const getSegmentName = (segment: string): string => {
				switch (segment) {
					case "portfolio":
						return "Portfolio";
					case "develop":
						return "Development Projects";
					case "video":
						return "Video Projects";
					case "design":
						return "Design Projects";
					case "video&design":
						return "Video & Design";
					case "all":
						return "All Projects";
					case "playground":
						return "Playground";
					case "tools":
						return "Tools";
					case "workshop":
						return "Workshop";
					case "plugins":
						return "Plugins";
					case "downloads":
						return "Downloads";
					case "analytics":
						return "Analytics";
					case "about":
						return "About";
					case "contact":
						return "Contact";
					case "search":
						return "Search";
					case "privacy-policy":
						return "Privacy Policy";
					default:
						// 動的セグメント（[slug]など）の場合は、そのまま表示
						return segment.charAt(0).toUpperCase() + segment.slice(1);
				}
			};

			breadcrumbs.push({
				name: getSegmentName(segment),
				href: currentPath,
			});
		}

		return breadcrumbs;
	};

	const breadcrumbs = generateBreadcrumbs();

	return (
		<nav aria-label="Breadcrumb" className="mb-4">
			<ol className="flex items-center space-x-2 text-sm">
				{breadcrumbs.map((crumb, index) => (
					<li key={crumb.href} className="flex items-center space-x-2">
						{index === breadcrumbs.length - 1 ? (
							// 最後の項目は現在のページなのでリンクにしない
							<span className="text-accent">{crumb.name}</span>
						) : (
							<>
								<Link
									href={crumb.href}
									className="text-main hover:text-accent transition-colors"
								>
									{crumb.name}
								</Link>
								<span className="text-main">/</span>
							</>
						)}
					</li>
				))}
			</ol>
		</nav>
	);
}
