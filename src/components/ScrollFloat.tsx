"use client";

import { motion, useInView } from "framer-motion";
import { type ReactNode, useRef } from "react";

interface ScrollFloatProps {
	children: ReactNode;
	stagger?: number;
	className?: string;
}

export function ScrollFloat({
	children,
	stagger = 0,
	className,
}: ScrollFloatProps) {
	const ref = useRef<HTMLDivElement>(null);
	// Use initial: false to ensure server and client start with same state
	const isInView = useInView(ref, { once: true, amount: 0.3, initial: false });

	return (
		<motion.div
			ref={ref}
			initial={{ opacity: 0, y: 50 }}
			animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
			transition={{
				duration: 0.6,
				delay: stagger / 1000,
				ease: [0.25, 0.1, 0.25, 1],
			}}
			className={className}
			suppressHydrationWarning
		>
			{children}
		</motion.div>
	);
}
