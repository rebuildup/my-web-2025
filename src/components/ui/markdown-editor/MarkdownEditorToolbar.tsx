import type { SaveStatus } from "./types";

interface MarkdownEditorToolbarProps {
	preview: boolean;
	toolbar: boolean;
	isPreviewMode: boolean;
	isSaving: boolean;
	saveStatus: SaveStatus;
	canSave: boolean;
	onTogglePreview: () => void;
	onSave: () => void;
}

const buttonStyle =
	"px-3 py-1 text-sm  rounded hover: hover: transition-colors   focus: focus:ring-offset-2 focus:ring-offset-base";
const activeButtonStyle =
	"px-3 py-1 text-sm  rounded   focus: focus:ring-offset-2 focus:ring-offset-base";

export function MarkdownEditorToolbar({
	preview,
	toolbar,
	isPreviewMode,
	isSaving,
	saveStatus,
	canSave,
	onTogglePreview,
	onSave,
}: MarkdownEditorToolbarProps) {
	if (!toolbar) return null;

	return (
		<div className="  p-2">
			<div className="flex flex-wrap gap-1 items-center">
				{/* Preview toggle */}
				{preview && (
					<button
						type="button"
						onClick={onTogglePreview}
						className={isPreviewMode ? activeButtonStyle : buttonStyle}
						title="Toggle Preview"
					>
						{isPreviewMode ? "Edit" : "Preview"}
					</button>
				)}

				{/* Save button */}
				{canSave && (
					<>
						<div className="w-px h-6 mx-2" />
						<button
							type="button"
							onClick={onSave}
							disabled={isSaving}
							className={`${buttonStyle} ${saveStatus === "success" ? " " : saveStatus === "error" ? " " : ""}`}
							title="Save File (Ctrl+S)"
						>
							{saveStatus === "saving" && "Saving..."}
							{saveStatus === "success" && "✓ Saved"}
							{saveStatus === "error" && "✗ Error"}
							{saveStatus === "idle" && "Save"}
						</button>
					</>
				)}
			</div>
		</div>
	);
}
