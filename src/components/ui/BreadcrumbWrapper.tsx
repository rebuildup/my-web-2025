"use client";

import { useEffect, useState } from "react";
import { Breadcrumb } from "./Breadcrumb";

export function BreadcrumbWrapper() {
	const [isClient, setIsClient] = useState(false);

	useEffect(() => {
		setIsClient(true);
	}, []);

	if (!isClient) {
		return null;
	}

	return (
		<div className="container-system pt-8">
			<Breadcrumb />
		</div>
	);
}
