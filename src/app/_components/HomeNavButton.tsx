import Link from "next/link";

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
	return (
		<Link
			href={href}
			prefetch={true}
			style={{ animationDelay: `${animationDelay}ms` }}
			className="flex items-center w-full sm:w-[190px] h-10 animate-fade-in-up cursor-pointer"
		>
			<span className="flex-1 text-sm font-medium">{label}</span>
		</Link>
	);
}
