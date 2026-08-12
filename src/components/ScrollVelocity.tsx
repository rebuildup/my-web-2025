"use client";

import {
	useAnimationFrame,
	useScroll,
	useSpring,
	useTransform,
	useVelocity,
} from "framer-motion";
import { useRef } from "react";

interface ScrollVelocityProps {
	text: string;
	className?: string;
	velocity?: number;
	damping?: number;
	stiffness?: number;
	numCopies?: number;
}

const DEFAULT_VELOCITY = 5;
const DEFAULT_DAMPING = 50;
const DEFAULT_STIFFNESS = 400;
const DEFAULT_COPIES = 6;

export function ScrollVelocity({
	text,
	className,
	velocity = DEFAULT_VELOCITY,
	damping = DEFAULT_DAMPING,
	stiffness = DEFAULT_STIFFNESS,
	numCopies = DEFAULT_COPIES,
}: ScrollVelocityProps) {
	const wrapRef = useRef<HTMLDivElement>(null);
	const baseX = useRef(0);

	const { scrollY } = useScroll();
	const scrollVelocity = useVelocity(scrollY);
	const smoothVelocity = useSpring(scrollVelocity, { damping, stiffness });
	const directionFactor = useRef(1);

	// velocityMapping input: scroll velocity, output: px/s translation
	// Negative output moves left (default), positive moves right.
	const x = useTransform(smoothVelocity, (latest) => {
		const sign = Math.sign(latest);
		directionFactor.current = sign === 0 ? 1 : sign;
		return latest * velocity;
	});

	useAnimationFrame((_, delta) => {
		const el = wrapRef.current;
		if (!el) return;
		const moveBy = directionFactor.current * Math.abs(x.get()) * (delta / 1000);
		baseX.current += moveBy;
		// Reset before the first copy drifts too far so the loop stays seamless.
		const firstCopyWidth = el.scrollWidth / numCopies;
		if (baseX.current >= firstCopyWidth) {
			baseX.current -= firstCopyWidth;
		} else if (baseX.current <= -firstCopyWidth) {
			baseX.current += firstCopyWidth;
		}
		el.style.transform = `translate3d(${-baseX.current}px, 0, 0)`;
	});

	const copies = Array.from({ length: numCopies }, (_, i) => i);

	return (
		<div className={`overflow-hidden whitespace-nowrap ${className ?? ""}`}>
			<div ref={wrapRef} className="flex w-max will-change-transform">
				{copies.map((i) => (
					<span key={i} className="shrink-0 pr-8" aria-hidden={i !== 0}>
						{text}
					</span>
				))}
			</div>
		</div>
	);
}
