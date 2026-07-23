import { CheckCircle } from "lucide-react";
import { EMAIL_GUIDELINES } from "./constants";

interface EmailGuidelinesProps {
	onClose: () => void;
}

export default function EmailGuidelines({ onClose }: EmailGuidelinesProps) {
	return (
		<div className="space-y-4 rounded-xl  shadow-[0_8px_24px_rgba(0,0,0,0.25)] p-4">
			<div className="flex items-center justify-between">
				<h2 className="neue-haas-grotesk-display text-xl ">
					プロフェッショナルメールガイドライン
				</h2>
				<button type="button" onClick={onClose} className="">
					×
				</button>
			</div>

			<div className="grid-system grid-1 sm:grid-3 gap-6">
				<div className="space-y-3">
					<h3 className="neue-haas-grotesk-display text-lg ">構造</h3>
					<ul className="space-y-1">
						{EMAIL_GUIDELINES.structure.map((item) => (
							<li
								key={`structure-${item}`}
								className="text-sm noto-sans-jp-light flex items-start gap-2"
							>
								<CheckCircle className="w-4 h-4  mt-0.5 shrink-0" />
								{item}
							</li>
						))}
					</ul>
				</div>

				<div className="space-y-3">
					<h3 className="neue-haas-grotesk-display text-lg ">トーン</h3>
					<ul className="space-y-1">
						{EMAIL_GUIDELINES.tone.map((item) => (
							<li
								key={`tone-${item}`}
								className="text-sm noto-sans-jp-light flex items-start gap-2"
							>
								<CheckCircle className="w-4 h-4  mt-0.5 shrink-0" />
								{item}
							</li>
						))}
					</ul>
				</div>

				<div className="space-y-3">
					<h3 className="neue-haas-grotesk-display text-lg ">フォーマット</h3>
					<ul className="space-y-1">
						{EMAIL_GUIDELINES.formatting.map((item) => (
							<li
								key={`formatting-${item}`}
								className="text-sm noto-sans-jp-light flex items-start gap-2"
							>
								<CheckCircle className="w-4 h-4  mt-0.5 shrink-0" />
								{item}
							</li>
						))}
					</ul>
				</div>
			</div>
		</div>
	);
}
