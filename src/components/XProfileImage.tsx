import Image from "next/image";

interface XProfileImageProps {
	href: string;
	size?: number;
}

export default function XProfileImage({ href, size = 48 }: XProfileImageProps) {
	const imageUrl =
		"https://pbs.twimg.com/profile_images/2034243179176960000/ZcmwOt4U_400x400.jpg";

	return (
		<a
			href={href}
			target="_blank"
			rel="noopener noreferrer"
			className="flex-shrink-0"
		>
			<Image
				src={imageUrl}
				alt="X (Twitter) プロフィール"
				width={size}
				height={size}
				className="rounded-full border-2 border-main/20 hover:border-main/40 transition-colors"
				unoptimized
			/>
		</a>
	);
}
