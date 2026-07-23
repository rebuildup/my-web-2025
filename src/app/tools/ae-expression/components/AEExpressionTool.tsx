"use client";

import ToolWrapper from "../../components/ToolWrapper";
import { ExpressionControls } from "./ExpressionControls";
import { ExpressionList } from "./ExpressionList";
import { ExpressionOutput } from "./ExpressionOutput";
import { ExpressionParameters } from "./ExpressionParameters";
import { useAEExpressionTool } from "./useAEExpressionTool";

export default function AEExpressionTool() {
	const tool = useAEExpressionTool();

	return (
		<ToolWrapper
			toolName="AE Expression Tool"
			description="AfterEffectsのエクスプレッションをScratch風ブロックUIで簡単に設定.アニメーション、エフェクト、変形などのエクスプレッションを一覧表示."
			category="Design"
		>
			<div className="space-y-8">
				<ExpressionControls
					searchTerm={tool.searchTerm}
					setSearchTerm={tool.setSearchTerm}
					selectedCategory={tool.selectedCategory}
					setSelectedCategory={tool.setSelectedCategory}
					selectedDifficulty={tool.selectedDifficulty}
					setSelectedDifficulty={tool.setSelectedDifficulty}
					showFavoritesOnly={tool.showFavoritesOnly}
					setShowFavoritesOnly={tool.setShowFavoritesOnly}
					showAdvancedSettings={tool.showAdvancedSettings}
					setShowAdvancedSettings={tool.setShowAdvancedSettings}
					exportFormat={tool.exportFormat}
					setExportFormat={tool.setExportFormat}
					showDocumentation={tool.showDocumentation}
					setShowDocumentation={tool.setShowDocumentation}
					savedExpressions={tool.savedExpressions}
					setSavedExpressions={tool.setSavedExpressions}
				/>
				<div className="grid-system grid-1 lg:grid-3 gap-8">
					<ExpressionList
						expressions={tool.filteredExpressions}
						selectedExpression={tool.selectedExpression}
						onSelect={tool.setSelectedExpression}
						onToggleFavorite={tool.toggleFavorite}
					/>
					<ExpressionParameters
						expression={tool.selectedExpression}
						values={tool.parameterValues}
						showDocumentation={tool.showDocumentation}
						onToggleDocumentation={() =>
							tool.setShowDocumentation(!tool.showDocumentation)
						}
						onToggleFavorite={tool.toggleFavorite}
						onUpdateParameter={tool.updateParameter}
					/>
					<ExpressionOutput
						expression={tool.selectedExpression}
						generatedCode={tool.generatedCode}
						validationResult={tool.validationResult}
						isPreviewPlaying={tool.isPreviewPlaying}
						previewTime={tool.previewTime}
						copySuccess={tool.copySuccess}
						onTogglePreview={() =>
							tool.setIsPreviewPlaying(!tool.isPreviewPlaying)
						}
						onResetPreview={() => {
							tool.setPreviewTime(0);
							tool.setIsPreviewPlaying(false);
						}}
						onSave={tool.saveExpression}
						onExport={tool.exportExpression}
						onCopy={tool.copyToClipboard}
					/>
				</div>
			</div>
		</ToolWrapper>
	);
}
