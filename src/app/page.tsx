"use client";
import Link from "next/link";
import DarkVeil from "@/components/DarkVeil";
import GlassSurface from "@/components/GlassSurface";
import XProfileImage from "@/components/XProfileImage";
import { motion } from "framer-motion";

export default function Home() {
	return (
		<div className="min-h-screen relative">
			<div id="main-content" className="absolute inset-0">
				<div id="bg" className="fixed inset-0">
					<DarkVeil />
				</div>
			</div>

			<main
				id="main-content"
				className="relative z-10 flex min-h-screen items-center justify-center"
				tabIndex={-1}
			>
				<div className="container mx-auto px-4">
					<div className="max-w-3xl mx-auto flex flex-col items-center">
						<div
							className="flex items-start"
							style={{ width: "max-content", minWidth: "410px" }}
						>
							<div className="flex flex-col items-start">
								<motion.div
									initial={{ opacity: 0, y: 20 }}
									animate={{ opacity: 1, y: 0 }}
									transition={{ duration: 0.6 }}
								>
									<h1 className="text-4xl sm:text-4xl font-bold italic tracking-tight text-main">
										yusuke-kim.com
									</h1>
								</motion.div>
								<motion.div
									initial={{ opacity: 0, y: 20 }}
									animate={{ opacity: 1, y: 0 }}
									transition={{ duration: 0.6, delay: 0.1 }}
								>
									<p className="mt-3 text-xs sm:text-xs text-main/70 leading-relaxed">
										高専生 木村友亮のウェブサイト
										<br />
										普段はsamuidoという名前で活動しています
									</p>
								</motion.div>
							</div>
							<div style={{ marginLeft: "auto" }}>
								<motion.div
									initial={{ opacity: 0, scale: 0.9 }}
									animate={{ opacity: 1, scale: 1 }}
									transition={{ duration: 0.6, delay: 0.2 }}
								>
									<XProfileImage href="https://x.com/361do_sleep" size={100} />
								</motion.div>
							</div>
						</div>

						<div
							className="mt-8 grid grid-cols-2 gap-4 sm:gap-6 justify-items-center"
							style={{ width: "max-content", minWidth: "400px" }}
						>
							<motion.div
								initial={{ opacity: 0, y: 20 }}
								animate={{ opacity: 1, y: 0 }}
								transition={{ duration: 0.6, delay: 0.3 }}
							>
								<GlassSurface
									className="h-8! rounded-full justify-self-center"
									width={200}
									height={32}
									borderRadius={16}
								>
									<Link
										href="/about"
										className="inline-flex w-full h-full items-center justify-center text-[10px] sm:text-xs px-3 sm:px-4 text-main hover:text-main whitespace-nowrap"
									>
										About
									</Link>
								</GlassSurface>
							</motion.div>

							<motion.div
								initial={{ opacity: 0, y: 20 }}
								animate={{ opacity: 1, y: 0 }}
								transition={{ duration: 0.6, delay: 0.4 }}
							>
								<GlassSurface
									className="h-8! rounded-full justify-self-center"
									width={200}
									height={32}
									borderRadius={16}
								>
									<Link
										href="/portfolio"
										className="inline-flex w-full h-full items-center justify-center text-[10px] sm:text-xs px-3 sm:px-4 text-main hover:text-main whitespace-nowrap"
									>
										Portfolio
									</Link>
								</GlassSurface>
							</motion.div>

							<motion.div
								initial={{ opacity: 0, y: 20 }}
								animate={{ opacity: 1, y: 0 }}
								transition={{ duration: 0.6, delay: 0.5 }}
							>
								<GlassSurface
									className="h-8! rounded-full justify-self-center"
									width={200}
									height={32}
									borderRadius={16}
								>
									<Link
										href="/workshop"
										className="inline-flex w-full h-full items-center justify-center text-[10px] sm:text-xs px-3 sm:px-4 text-main hover:text-main whitespace-nowrap"
									>
										Workshop
									</Link>
								</GlassSurface>
							</motion.div>

							<motion.div
								initial={{ opacity: 0, y: 20 }}
								animate={{ opacity: 1, y: 0 }}
								transition={{ duration: 0.6, delay: 0.6 }}
							>
								<GlassSurface
									className="h-8! rounded-full justify-self-center"
									width={200}
									height={32}
									borderRadius={16}
								>
									<Link
										href="/tools"
										className="inline-flex w-full h-full items-center justify-center text-[10px] sm:text-xs px-3 sm:px-4 text-main hover:text-main whitespace-nowrap"
									>
										Tools
									</Link>
								</GlassSurface>
							</motion.div>
						</div>
					</div>
				</div>
			</main>

			<footer className="fixed bottom-2 left-0 right-0 z-10 flex items-center justify-center gap-4 py-3 backdrop-blur-sm">
				<span className="text-xs text-main">© 2025 361do_sleep</span>
				<Link
					href="/privacy-policy"
					className="text-xs transition underline underline-offset-4 text-main hover:text-main"
				>
					Privacy Policy
				</Link>
			</footer>
		</div>
	);
}