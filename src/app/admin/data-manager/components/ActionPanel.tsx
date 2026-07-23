interface ActionPanelProps {
	onCancel: () => void;
	isLoading: boolean;
	isClient: boolean;
	saveStatus: "idle" | "saving" | "success" | "error";
	buttonStyle: string;
}

export function ActionPanel({ onCancel, isLoading, isClient, saveStatus, buttonStyle }: ActionPanelProps) {
	return (
		<div className="flex justify-end gap-4 pt-6  ">
			<button type="button" onClick={onCancel} className={buttonStyle} disabled={isLoading}>{isClient ? "キャンセル" : "Cancel"}</button>
			<button type="submit" className={`${buttonStyle} ${saveStatus === "success" ? " " : ""} ${saveStatus === "error" ? " " : ""}`} disabled={isLoading}>
				{saveStatus === "saving" && (isClient ? "保存中..." : "Saving...")}
				{saveStatus === "success" && (isClient ? "✓ 保存完了" : "✓ Saved")}
				{saveStatus === "error" && (isClient ? "✗ エラー" : "✗ Error")}
				{saveStatus === "idle" && (isLoading ? (isClient ? "保存中..." : "Saving...") : isClient ? "保存" : "Save")}
			</button>
		</div>
	);
}
