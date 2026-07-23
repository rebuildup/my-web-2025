"use client";

/**
 * Performance budget indicator shown in the dev panel.
 */
import type React from "react";
import { useEffect, useState } from "react";

interface PerformanceBudgetProps {
	className?: string;
}

export const PerformanceBudgetIndicator: React.FC<PerformanceBudgetProps> = ({
	className = "",
}) => {
	const [budgetStatus, setBudgetStatus] = useState<{
		withinBudget: boolean;
		violations: number;
	}>({
		withinBudget: true,
		violations: 0,
	});

	useEffect(() => {
		// This would integrate with the PerformanceBudget class
		// For now, simulate budget checking
		const checkBudget = () => {
			// Simulate budget check
			setBudgetStatus({
				withinBudget: Math.random() > 0.3,
				violations: Math.floor(Math.random() * 3),
			});
		};

		checkBudget();
		const interval = setInterval(checkBudget, 10000);

		return () => clearInterval(interval);
	}, []);

	return (
		<div className={`flex items-center space-x-2 ${className}`}>
			<div
				className={`w-3 h-3 rounded-full ${
					budgetStatus.withinBudget ? "" : ""
				}`}
			/>
			<span className="text-sm ">
				Performance Budget:{" "}
				{budgetStatus.withinBudget
					? "Within Limits"
					: `${budgetStatus.violations} Violations`}
			</span>
		</div>
	);
};
