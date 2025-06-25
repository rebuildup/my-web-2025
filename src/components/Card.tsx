import { ReactNode } from "react";

interface CardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  padding?: "sm" | "md" | "lg";
  onClick?: () => void;
}

export default function Card({
  children,
  className = "",
  hover = true,
  padding = "md",
  onClick,
}: CardProps) {
  const paddingClasses = {
    sm: "p-4",
    md: "p-6",
    lg: "p-8",
  };

  const baseClasses = `
    bg-white/70 dark:bg-slate-800/70 
    backdrop-blur-sm 
    rounded-xl 
    border border-slate-200/50 dark:border-slate-700/50
    ${paddingClasses[padding]}
    ${hover ? "hover:shadow-xl transition-shadow duration-300" : ""}
    ${className}
  `;

  return (
    <div
      className={baseClasses.trim()}
      onClick={onClick}
      style={onClick ? { cursor: "pointer" } : undefined}
    >
      {children}
    </div>
  );
}
