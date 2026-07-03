"use client";

import { useRouter } from "next/navigation";

interface HomeNavButtonProps {
	href: string;
	label: string;
	animationDelay: number;
}

export default function HomeNavButton({
	href,
	label,
	animationDelay,
}: HomeNavButtonProps) {
	const router = useRouter();
	return (
		<button
			type="button"
			onClick={() => router.push(href)}
			style={{ animationDelay: `${animationDelay}ms` }}
			className="flex items-center w-full sm:w-[190px] h-10 animate-fade-in-up cursor-pointer"
		>
			<span className="flex-1 text-sm font-medium">{label}</span>
		</button>
	);
}
