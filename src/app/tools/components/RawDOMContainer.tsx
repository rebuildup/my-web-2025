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
		<div
			style={{
				position: "fixed",
				top: 0,
				left: 0,
				width: "100vw",
				height: "100vh",
				zIndex: 9999,
				backgroundColor: "#ffffff",
				color: "#000000",
				colorScheme: "light",
				fontFamily: "sans-serif",
				overflowY: "auto",
				padding: "2rem",
				boxSizing: "border-box",
			}}
		>
			<div
				style={{ maxWidth: "900px", margin: "0 auto", paddingBottom: "4rem" }}
			>
				<nav
					style={{ fontSize: "0.85rem", marginBottom: "1rem", color: "#666" }}
				>
					{breadcrumbs.map((item, index) => (
						<React.Fragment key={index}>
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
							{index < breadcrumbs.length - 1 && (
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
