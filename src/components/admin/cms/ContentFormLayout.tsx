import type { FormEventHandler, ReactNode } from "react";
import {
	CONTENT_FORM_SECTIONS,
	contentFormStyles as s,
} from "./ContentForm.styles";
import type {
	ContentFormFeedback,
	ContentFormProps,
} from "./ContentForm.types";

interface ContentFormLayoutProps {
	children: ReactNode;
	sectionIndex: number;
	setSectionIndex: (index: number) => void;
	feedback: ContentFormFeedback;
	onDismissFeedback: () => void;
	onSubmit: FormEventHandler<HTMLFormElement>;
	onCancel: ContentFormProps["onCancel"];
	isLoading: boolean;
	isDirty: boolean;
	mode: ContentFormProps["mode"];
}

export function ContentFormLayout({
	children,
	sectionIndex,
	setSectionIndex,
	feedback,
	onDismissFeedback,
	onSubmit,
	onCancel,
	isLoading,
	isDirty,
	mode,
}: ContentFormLayoutProps) {
	return (
		<form
			onSubmit={onSubmit}
			style={{ display: "flex", flexDirection: "column", gap: 16 }}
		>
			<div
				style={{
					display: "grid",
					gridTemplateColumns: "minmax(0,1fr)",
					gap: 24,
					minHeight: 0,
				}}
			>
				{/* Mobile tab bar */}
				<div
					style={{
						display: "flex",
						gap: 4,
						overflowX: "auto",
						paddingBottom: 4,
					}}
					className="md-hidden-tabs"
				>
					{CONTENT_FORM_SECTIONS.map((label, index) => (
						<button
							key={label}
							type="button"
							onClick={() => setSectionIndex(index)}
							style={{
								padding: "4px 10px",
								fontSize: 12,
								cursor: "pointer",
								whiteSpace: "nowrap",
							}}
						>
							{label}
						</button>
					))}
				</div>
				<div style={{ display: "flex", gap: 24 }}>
					{/* Desktop sidebar */}
					<nav
						style={{
							display: "none",
							flexDirection: "column",
							gap: 2,
							width: 180,
							paddingRight: 12,
							minHeight: 400,
						}}
						className="md-visible-nav"
					>
						{CONTENT_FORM_SECTIONS.map((label, index) => (
							<button
								key={label}
								type="button"
								onClick={() => setSectionIndex(index)}
								style={{
									textAlign: "left",
									justifyContent: "flex-start",
									padding: "6px 10px",
									fontSize: 13,
									cursor: "pointer",
									fontWeight: sectionIndex === index ? 600 : 400,
								}}
							>
								{label}
							</button>
						))}
					</nav>
					{/* Content */}
					<div
						style={{
							flex: 1,
							maxHeight: 500,
							overflowY: "auto",
							paddingRight: 4,
							minWidth: 0,
							scrollbarWidth: "thin",
						}}
					>
						{feedback && (
							<div
								style={{
									padding: "8px 12px",
									marginBottom: 12,
									display: "flex",
									justifyContent: "space-between",
									alignItems: "center",
									fontSize: 13,
								}}
							>
								{feedback.message}
								<button
									type="button"
									style={s.btnDanger}
									onClick={onDismissFeedback}
								>
									×
								</button>
							</div>
						)}
						{children}
					</div>
				</div>
			</div>
			{/* Footer */}
			<div
				style={{
					display: "flex",
					justifyContent: "flex-end",
					gap: 8,
					paddingTop: 8,
				}}
			>
				<button
					type="button"
					style={s.btn}
					onClick={onCancel}
					disabled={isLoading}
				>
					キャンセル
				</button>
				<button
					type="submit"
					style={isDirty ? s.btnPrimary : s.btn}
					disabled={isLoading || !isDirty}
				>
					{mode === "create" ? "作成" : "更新"}
				</button>
			</div>
			<style>{`
				@media (max-width: 768px) {
					.md-hidden-tabs { display: flex !important; }
					.md-visible-nav { display: none !important; }
				}
				@media (min-width: 769px) {
					.md-hidden-tabs { display: none !important; }
					.md-visible-nav { display: flex !important; }
				}
			`}</style>
		</form>
	);
}
