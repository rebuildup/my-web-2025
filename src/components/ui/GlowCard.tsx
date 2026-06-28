import type { PropsWithChildren } from "react";

export default function GlowCard({
	className,
	children,
}: PropsWithChildren<{ className?: string }>) {
	return (
		<div
			className={className}
			style={{
				border: "1px solid rgba(255,255,255,0.12)",
			}}
		>
			{children}
		</div>
	);
}
