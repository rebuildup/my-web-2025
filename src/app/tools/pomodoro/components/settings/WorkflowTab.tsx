"use client";

import { X } from "lucide-react";
import type { ScheduleStep } from "../../utils/pomodoro-constants";

export const WorkflowTab = ({
	theme,
	customSchedule,
	onUpdateSchedule,
	onAddStep,
	onRemoveStep,
}: {
	theme: string;
	customSchedule: ScheduleStep[];
	onUpdateSchedule: (index: number, updates: Partial<ScheduleStep>) => void;
	onAddStep: () => void;
	onRemoveStep: (index: number) => void;
}) => {
	return (
		<div>
			<h3
				className={`text-lg font-semibold mb-4 ${theme === "dark" ? "" : ""}`}
			>
				ワークフローの編集
			</h3>
			<div className="space-y-2">
				{customSchedule.map((step, index) => (
					<div
						key={step.id}
						className={`flex items-center gap-2 p-2 rounded border ${
							theme === "dark" ? " " : " "
						}`}
					>
						<input
							type="text"
							value={step.label}
							onChange={(e) =>
								onUpdateSchedule(index, { label: e.target.value })
							}
							className={`flex-1 px-2 py-1.5 border text-sm ${theme === "dark" ? " " : " "}`}
							placeholder="ラベル"
							aria-label="ステップラベル"
						/>
						<input
							type="number"
							min="1"
							value={step.duration}
							onChange={(e) =>
								onUpdateSchedule(index, {
									duration: parseInt(e.target.value) || 1,
								})
							}
							className={`w-16 px-2 py-1.5 border text-sm ${theme === "dark" ? " " : " "}`}
							aria-label="分数"
						/>
						<span className={`text-xs ${theme === "dark" ? "" : ""}`}>分</span>
						<select
							value={step.type}
							onChange={(e) =>
								onUpdateSchedule(index, {
									type: e.target.value as "focus" | "break",
								})
							}
							aria-label="ステップ種別"
							className={`px-2 py-1.5 border text-sm appearance-none cursor-pointer ${theme === "dark" ? " " : " "}`}
							style={{
								backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='${theme === "dark" ? "white" : "black"}' d='M6 9L1 4h10z'/%3E%3C/svg%3E")`,
								backgroundRepeat: "no-repeat",
								backgroundPosition: "right 0.5rem center",
								paddingRight: "2rem",
							}}
						>
							<option value="focus">作業</option>
							<option value="break">休憩</option>
						</select>
						<button
							onClick={() => onRemoveStep(index)}
							className="p-1 shrink-0"
							aria-label="ステップを削除"
						>
							<X size={14} />
						</button>
					</div>
				))}
				<button
					onClick={onAddStep}
					className={`w-full py-3 border ${theme === "dark" ? " " : " "}`}
				>
					+ ステップを追加
				</button>
			</div>
		</div>
	);
};
