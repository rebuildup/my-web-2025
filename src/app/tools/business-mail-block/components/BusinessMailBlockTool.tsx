"use client";

import { DragDropContext } from "@hello-pangea/dnd";
import ToolWrapper from "../../components/ToolWrapper";
import AvailableBlocks from "./AvailableBlocks";
import ComposedBlocks from "./ComposedBlocks";
import Controls from "./Controls";
import CustomBlockForm from "./CustomBlockForm";
import EmailGuidelines from "./EmailGuidelines";
import EmailValidation from "./EmailValidation";
import GeneratedEmail from "./GeneratedEmail";
import TemplateLibrary from "./TemplateLibrary";
import VariablesInput from "./VariablesInput";
import { useMailBlockState } from "./useMailBlockState";

export default function BusinessMailBlockTool() {
	const state = useMailBlockState();

	return (
		<ToolWrapper
			toolName="Business Mail Block Tool"
			description="ビジネスメールをScratch風ブロックUIで簡単作成.挨拶、本文、締め、署名を組み合わせてプロフェッショナルなメールを作成.テンプレート機能とバリデーション機能付き."
			category="Business"
		>
			<DragDropContext onDragEnd={state.handleDragEnd}>
				<div className="space-y-8">
					{state.showTemplateLibrary && (
						<TemplateLibrary
							templates={state.templates}
							selectedTemplate={state.selectedTemplate}
							loadTemplate={state.loadTemplate}
							exportTemplate={state.exportTemplate}
							deleteTemplate={state.deleteTemplate}
							onClose={() => state.setShowTemplateLibrary(false)}
						/>
					)}

					{state.showGuidelines && (
						<EmailGuidelines onClose={() => state.setShowGuidelines(false)} />
					)}

					<div className="space-y-4">
						<Controls
							searchTerm={state.searchTerm}
							setSearchTerm={state.setSearchTerm}
							selectedCategory={state.selectedCategory}
							setSelectedCategory={state.setSelectedCategory}
							showFavoritesOnly={state.showFavoritesOnly}
							setShowFavoritesOnly={state.setShowFavoritesOnly}
							showTemplateLibrary={state.showTemplateLibrary}
							setShowTemplateLibrary={state.setShowTemplateLibrary}
							showValidation={state.showValidation}
							setShowValidation={state.setShowValidation}
							showGuidelines={state.showGuidelines}
							setShowGuidelines={state.setShowGuidelines}
							showCustomBlockForm={state.showCustomBlockForm}
							setShowCustomBlockForm={state.setShowCustomBlockForm}
						/>

						{state.showCustomBlockForm && (
							<CustomBlockForm
								customBlockContent={state.customBlockContent}
								setCustomBlockContent={state.setCustomBlockContent}
								customBlockCategory={state.customBlockCategory}
								setCustomBlockCategory={state.setCustomBlockCategory}
								addCustomBlock={state.addCustomBlock}
								onClose={() => state.setShowCustomBlockForm(false)}
							/>
						)}
					</div>

					<div className="grid-system grid-1 lg:grid-2 gap-8">
						<AvailableBlocks
							filteredBlocks={state.filteredBlocks}
							toggleFavorite={state.toggleFavorite}
							removeCustomBlock={state.removeCustomBlock}
						/>

						<ComposedBlocks
							composedBlocks={state.composedBlocks}
							removeComposedBlock={state.removeComposedBlock}
							resetComposedBlocks={state.resetComposedBlocks}
						/>
					</div>

					{state.allVariables.length > 0 && (
						<VariablesInput
							allVariables={state.allVariables}
							variables={state.variables}
							updateVariable={state.updateVariable}
						/>
					)}

					{state.showValidation && (
						<EmailValidation validationResult={state.validationResult} />
					)}

					<GeneratedEmail
						generatedEmail={state.generatedEmail}
						copyToClipboard={state.copyToClipboard}
						downloadEmail={state.downloadEmail}
						saveAsTemplateFromUI={state.saveAsTemplateFromUI}
						composedBlocksCount={state.composedBlocks.length}
					/>
				</div>
			</DragDropContext>
		</ToolWrapper>
	);
}
