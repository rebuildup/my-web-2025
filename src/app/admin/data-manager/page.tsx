"use client";

import { redirect } from "next/navigation";
import { useEffect } from "react";
import { ContentTypeTabs } from "./ContentTypeTabs";
import { DataManagerContentPanel } from "./DataManagerContentPanel";
import { DataManagerFooter } from "./DataManagerFooter";
import { DataManagerHeader } from "./DataManagerHeader";
import { useDataManagerActions } from "./useDataManagerActions";

export default function DataManagerPage() {
	const {
		isClient,
		setIsClient,
		selectedContentType,
		setSelectedContentType,
		contentItems,
		selectedItem,
		isLoading,
		previewMode,
		setPreviewMode,
		saveStatus,
		loadContentItems,
		handleSaveItem,
		handleFixThumbnails,
		handleCreateNew,
		handleDeleteItem,
		handleEditItem,
		handleCancel,
	} = useDataManagerActions();

	const nodeEnv = process.env.NODE_ENV;

	useEffect(() => {
		setIsClient(true);
	}, [setIsClient]);

	if (nodeEnv !== "development" && nodeEnv !== "test") {
		redirect("/");
	}

	// Load content items for selected type
	useEffect(() => {
		loadContentItems(selectedContentType);
	}, [selectedContentType, loadContentItems]);

	return (
		<div className="min-h-dvh ">
			<main className="py-10">
				<div className="container mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8">
					<div className="space-y-8">
						{/* Header */}
						<DataManagerHeader />

						{/* Content Type Selector */}
						<ContentTypeTabs
							selectedContentType={selectedContentType}
							isLoading={isLoading}
							onSelectContentType={setSelectedContentType}
						/>

						<DataManagerContentPanel
							selectedContentType={selectedContentType}
							contentItems={contentItems}
							selectedItem={selectedItem}
							isClient={isClient}
							isLoading={isLoading}
							previewMode={previewMode}
							saveStatus={saveStatus}
							onFixThumbnails={handleFixThumbnails}
							onCreateNew={handleCreateNew}
							onEditItem={handleEditItem}
							onDeleteItem={handleDeleteItem}
							onPreviewModeChange={setPreviewMode}
							onSaveItem={handleSaveItem}
							onCancel={handleCancel}
						/>

						<DataManagerFooter isLoading={isLoading} isClient={isClient} />
					</div>
				</div>
			</main>
		</div>
	);
}
