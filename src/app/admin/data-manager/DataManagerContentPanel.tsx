"use client";

import { ContentItem, ContentType } from "@/types/content";
import { ContentList } from "./components/ContentList";
import { DataManagerForm } from "./components/DataManagerForm";
import { PreviewPanel } from "./components/PreviewPanel";
import {
	ActiveButtonStyle,
	ButtonStyle,
	CardStyle,
	Card_title,
	ManagedContentItem,
	PreviewMode,
	SaveStatus,
} from "./useDataManagerActions";

interface DataManagerContentPanelProps {
	selectedContentType: ContentType;
	contentItems: ContentItem[];
	selectedItem: ManagedContentItem | null;
	isClient: boolean;
	isLoading: boolean;
	previewMode: PreviewMode;
	saveStatus: SaveStatus;
	onFixThumbnails: () => Promise<void>;
	onCreateNew: () => void;
	onEditItem: (item: ManagedContentItem) => void;
	onDeleteItem: (id: string) => Promise<void>;
	onPreviewModeChange: (mode: PreviewMode) => void;
	onSaveItem: (item: ManagedContentItem) => Promise<void>;
	onCancel: () => void;
}

export function DataManagerContentPanel({
	selectedContentType,
	contentItems,
	selectedItem,
	isClient,
	isLoading,
	previewMode,
	saveStatus,
	onFixThumbnails,
	onCreateNew,
	onEditItem,
	onDeleteItem,
	onPreviewModeChange,
	onSaveItem,
	onCancel,
}: DataManagerContentPanelProps) {
	return (
		<div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
			<div className="lg:col-span-2">
				<div className={CardStyle}>
					<div className="flex justify-between items-center">
						<h3 className={Card_title}>
							{selectedContentType.charAt(0).toUpperCase() +
								selectedContentType.slice(1)}{" "}
							Items
						</h3>
						<div className="flex gap-2">
							{selectedContentType === "portfolio" && (
								<button type="button"
									onClick={onFixThumbnails}
									className={ButtonStyle}
									disabled={isLoading}
									title="Fix missing thumbnails for portfolio items"
								>
									{isClient ? "🔧 サムネイル修復" : "🔧 Fix Thumbnails"}
								</button>
							)}
							<button type="button"
								onClick={onCreateNew}
								className={ButtonStyle}
								disabled={isLoading}
							>
								{isClient ? "+ 新規作成" : "+ New"}
							</button>
						</div>
					</div>

					<ContentList
						items={contentItems}
						selectedItem={selectedItem}
						onSelectItem={onEditItem}
						onDeleteItem={onDeleteItem}
						isLoading={isLoading}
					/>
				</div>
			</div>

			<div className="lg:col-span-3">
				{selectedItem ? (
					<div className="space-y-4">
						<div className="flex justify-between items-center">
							<div className="flex gap-2">
								<button type="button"
									onClick={() => onPreviewModeChange("form")}
									className={
										previewMode === "form"
											? ActiveButtonStyle
											: ButtonStyle
									}
								>
									{isClient ? "編集フォーム" : "Edit Form"}
								</button>
								<button type="button"
									onClick={() => onPreviewModeChange("preview")}
									className={
										previewMode === "preview"
											? ActiveButtonStyle
											: ButtonStyle
									}
								>
									{isClient ? "プレビュー" : "Preview"}
								</button>
							</div>

							{saveStatus !== "idle" && (
								<div className="flex items-center gap-2">
									{saveStatus === "saving" && (
										<span className=" text-sm">
											{isClient ? "保存中..." : "Saving..."}
										</span>
									)}
									{saveStatus === "success" && (
										<span className=" text-sm">
											{isClient ? "✓ 保存完了" : "✓ Saved"}
										</span>
									)}
									{saveStatus === "error" && (
										<span className=" text-sm">
											{isClient ? "✗ エラー" : "✗ Error"}
										</span>
									)}
								</div>
							)}
						</div>

						<div className={CardStyle}>
							{previewMode === "form" ? (
								<DataManagerForm
									item={selectedItem}
									onSave={onSaveItem}
									onCancel={onCancel}
									isLoading={isLoading}
									saveStatus={saveStatus}
									enhanced={true}
								/>
							) : (
								<PreviewPanel
									item={selectedItem}
									onEdit={() => onPreviewModeChange("form")}
								/>
							)}
						</div>
					</div>
				) : (
					<div className={CardStyle}>
						<div className="text-center py-12">
							<p className="noto-sans-jp-light text-sm ">
								{isClient
									? "編集するアイテムを選択するか、新しいアイテムを作成してください"
									: "Select an item to edit or create a new one"}
							</p>
						</div>
					</div>
				)}
			</div>
		</div>
	);
}
