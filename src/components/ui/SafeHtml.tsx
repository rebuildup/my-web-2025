"use client";

import DOMPurify, {
	type Config as DomPurifyConfig,
} from "isomorphic-dompurify";
import type { HTMLAttributes } from "react";
import { useEffect, useRef } from "react";

type SafeHtmlProps = HTMLAttributes<HTMLDivElement> & {
	html: string;
	sanitizeOptions?: DomPurifyConfig;
};

export function SafeHtml({
	html,
	sanitizeOptions,
	className,
	...rest
}: SafeHtmlProps) {
	const containerRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		if (!containerRef.current) {
			return;
		}

		const sanitizedHtml = DOMPurify.sanitize(html, sanitizeOptions) as string;
		containerRef.current.innerHTML = sanitizedHtml;

		return () => {
			if (containerRef.current) {
				containerRef.current.innerHTML = "";
			}
		};
	}, [html, sanitizeOptions]);

	return <div ref={containerRef} className={className} {...rest} />;
}
