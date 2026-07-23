"use client";

import { Pause, RotateCcw, SkipForward, X } from "lucide-react";

export const StopDialog = ({
	theme,
	onClose,
	onReset,
	onStop,
	onSkip,
}: {
	theme: string;
	onClose: () => void;
	onReset: () => void;
	onStop: () => void;
	onSkip: () => void;
}) => {
	return (
		<div className="fixed inset-0 z-100 flex items-center justify-center pointer-events-auto">
			{/* Overlay */}
			<div className="absolute inset-0  " onClick={onClose} />
			{/* Dialog */}
			<div
				className={`relative z-10 rounded-2xl border   p-6 max-w-md w-full mx-4 ${
					theme === "dark" ? "bg-[#1a1a1a]/95 " : " "
				}`}
			>
				<button
					onClick={onClose}
					className={`absolute top-4 right-4 p-2 ${theme === "dark" ? " " : " "}`}
					aria-label="ダイアログを閉じる"
				>
					<X size={20} />
				</button>

				<h3 className={`text-xl font-bold mb-4 ${theme === "dark" ? "" : ""}`}>
					タイマーを停止しますか？
				</h3>
				<div className="grid grid-cols-3 gap-3">
					<button
						onClick={onReset}
						className="px-2 py-4 font-medium flex flex-col items-center justify-center gap-2"
					>
						<RotateCcw size={24} />
						<span className="text-xs">リセット</span>
					</button>
					<button
						onClick={onStop}
						className="px-2 py-4 font-medium flex flex-col items-center justify-center gap-2"
					>
						<Pause size={24} />
						<span className="text-xs">一時停止</span>
					</button>
					<button
						onClick={onSkip}
						className="px-2 py-4 font-medium flex flex-col items-center justify-center gap-2"
					>
						<SkipForward size={24} />
						<span className="text-xs">スキップ</span>
					</button>
				</div>
			</div>
		</div>
	);
};
