"use client";

import React from "react";

export interface BreadcrumbItem {
	label: string;
	href?: string;
	isCurrent?: boolean;
}

interface RawDOMContainerProps {
	title: string;
	breadcrumbs: BreadcrumbItem[];
	children: React.ReactNode;
}

export function RawDOMContainer({
	title,
	breadcrumbs,
	children,
}: RawDOMContainerProps) {
	return (
		<div className="fixed inset-0 w-screen h-dvh z-[9999] bg-white text-black scheme-light font-sans overflow-y-auto p-8 box-border">
			<div
				style={{ maxWidth: "900px", margin: "0 auto", paddingBottom: "4rem" }}
			>
				<nav
					style={{ fontSize: "0.85rem", marginBottom: "1rem", color: "#666" }}
				>
					{breadcrumbs.map((item, idx) => (
						<React.Fragment key={item.label}>
							{item.href ? (
								<a
									href={item.href}
									style={{ color: "#0066cc", textDecoration: "none" }}
								>
									{item.label}
								</a>
							) : (
								<span style={{ color: "#000" }}>{item.label}</span>
							)}
							{idx < breadcrumbs.length - 1 && (
								<span style={{ margin: "0 8px" }}>/</span>
							)}
						</React.Fragment>
					))}
				</nav>

				<h1
					style={{
						borderBottom: "1px solid #ccc",
						paddingBottom: "10px",
						marginBottom: "20px",
						fontSize: "1.5rem",
						fontWeight: "normal",
					}}
				>
					{title}
				</h1>

				{children}
			</div>
		</div>
	);
}
