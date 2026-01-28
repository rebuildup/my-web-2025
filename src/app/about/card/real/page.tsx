"use client";

import MeishiPhiCard from "./card";

export default function RealCardPage() {
	// このページは名刺表示のみを目的とするため、余分な要素は省略
	return (
		<>
			{/* Hidden h1 for SEO */}
			<h1 className="sr-only">木村友亮のデジタル名刺 - Digital Card</h1>
			<div className="min-h-screen bg-white text-main">
				<main className="flex items-center justify-center py-16">
					<div className="container-system mx-auto max-w-6xl px-6 flex items-center justify-center">
						<MeishiPhiCard baseColor="#ffffff" mainColor="#000000" />
					</div>
				</main>
				<MeishiPhiCard baseColor="#ffffff" mainColor="#000000" />
				<div
					style={{
						width: "910px",
						height: "550px",
						left: "4rem",
						right: "auto",
						position: "absolute",
						marginTop: "4rem",
						backgroundColor: "black",
						boxShadow: "0 10px 36px rgba(0,0,0,0.5)",
					}}
				>
					<div
						style={{
							width: "482.1218px",
							height: "259.6418px",
							top: " 80.2582px",
							left: "80.2582px",
							backgroundColor: "red",
							position: "absolute",
							opacity: 0.5,
						}}
					/>
					<div
						style={{
							width: "80.2582px",
							height: "100%",
							top: "0",
							left: "0",
							backgroundColor: "blue",
							position: "absolute",
						}}
					>
						<div
							style={{
								width: "80.2582px",
								height: "339.9px",
								top: "0",
								left: "0",
								backgroundColor: "green",
								position: "absolute",
							}}
						>
							<div
								style={{
									width: "80.2582px",
									height: "129.8418px",
									top: "0",
									left: "0",
									backgroundColor: "white",
									position: "absolute",
								}}
							></div>
							<div
								style={{
									width: "80.2582px",
									height: "80.2422324px",
									bottom: "0",
									left: "0",
									backgroundColor: "yellow",
									position: "absolute",
								}}
							></div>
						</div>
					</div>
				</div>
			</div>
		</>
	);
}
//61.8 38.2
//550 910
//550 * 0.618 = 339.9
//550 * 0.382 = 210.1
//910 * 0.618 = 562.38
//910 * 0.382 = 347.62
//550 * 0.382 * 0.382 = 80.2582

//910 * 0.618 - 550 * 0.382 * 0.382 = 482.1218

//550 * 0.618 - 550 * 0.382 * 0.382 = 259.6418

//550 * 0.618 * 0.618 = 210.0582
