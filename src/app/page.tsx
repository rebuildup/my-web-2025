"use client";
import { motion } from "framer-motion";
import dynamic from "next/dynamic";
import Link from "next/link";
import XProfileImage from "@/components/XProfileImage";

const HomeBackground = dynamic(() => import("@/components/HomeBackground"), {
	ssr: false,
});

const navItems = [
	{ href: "/about", label: "About" },
	{ href: "/portfolio", label: "Portfolio" },
	{ href: "/workshop", label: "Workshop" },
	{ href: "/tools", label: "Tools" },
];

export default function Home() {
	return (
		<div className="min-h-screen relative bg-[#020202]">
			<HomeBackground />

			<main
				id="main-content"
				className="relative z-10 flex min-h-screen items-center justify-center"
				tabIndex={-1}
			>
				<div className="container mx-auto px-4">
					<div className="max-w-3xl mx-auto flex flex-col items-center">
						<div className="flex items-start w-full justify-between sm:w-max sm:min-w-[410px] sm:justify-normal">
							<div className="flex flex-col items-start">
								<motion.div
									initial={{ opacity: 0, y: 20 }}
									animate={{ opacity: 1, y: 0 }}
									transition={{ duration: 0.3, ease: [0.2, 0.8, 0.2, 1] }}
								>
									<h1 className="text-4xl sm:text-4xl font-bold italic tracking-tight text-main">
										yusuke-kim.com
									</h1>
								</motion.div>
								<motion.div
									initial={{ opacity: 0, y: 20 }}
									animate={{ opacity: 1, y: 0 }}
									transition={{
										duration: 0.3,
										ease: [0.2, 0.8, 0.2, 1],
										delay: 0.05,
									}}
								>
									<p className="mt-3 text-xs sm:text-xs text-main/70 leading-relaxed">
										高専生 木村友亮のウェブサイト
										<br />
										普段はsamuidoという名前で活動しています
									</p>
								</motion.div>
							</div>
							<div className="sm:ml-auto">
								<motion.div
									initial={{ opacity: 0, scale: 0.9 }}
									animate={{ opacity: 1, scale: 1 }}
									transition={{
										duration: 0.3,
										ease: [0.2, 0.8, 0.2, 1],
										delay: 0.1,
									}}
								>
									<XProfileImage href="https://x.com/361do_sleep" size={100} />
								</motion.div>
							</div>
						</div>

						<div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 w-full sm:w-max sm:min-w-[400px]">
							{navItems.map((item, index) => (
								<motion.div
									key={item.href}
									initial={{ opacity: 0, y: 20 }}
									animate={{ opacity: 1, y: 0 }}
									transition={{
										duration: 0.3,
										ease: [0.2, 0.8, 0.2, 1],
										delay: 0.15 + index * 0.05,
									}}
								>
									<Link
										href={item.href}
										className="group flex items-center w-full sm:w-[190px] h-10 bg-white/5 border border-white/10 hover:bg-white/10 hover:border-accent/30 transition-all duration-300"
									>
										<span className="w-1 h-full bg-accent/60 group-hover:bg-accent transition-colors duration-300" />
										<span className="flex-1 text-sm font-medium text-main/80 group-hover:text-main pl-4 tracking-wide transition-colors duration-300">
											{item.label}
										</span>
									</Link>
								</motion.div>
							))}
						</div>

						<motion.footer
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							transition={{
								duration: 0.3,
								ease: [0.2, 0.8, 0.2, 1],
								delay: 0.4,
							}}
							className="mt-16 pt-6 flex items-center justify-center gap-4 w-full sm:w-max sm:min-w-[400px]"
						>
							<span className="text-xs text-main/40">© 2025 361do_sleep</span>
							<Link
								href="/privacy-policy"
								className="text-xs text-main/40 hover:text-main transition-colors underline underline-offset-4"
							>
								Privacy Policy
							</Link>
						</motion.footer>
					</div>
				</div>
			</main>
		</div>
	);
}
