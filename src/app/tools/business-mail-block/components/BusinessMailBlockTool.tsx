"use client";

import { DragDropContext, type DropResult } from "@hello-pangea/dnd";
import { useCallback, useEffect, useState } from "react";
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
import { BUILT_IN_TEMPLATES, MAIL_BLOCKS } from "./constants";
import type {
	ComposedBlock,
	MailBlock,
	MailTemplate,
	ValidationResult,
} from "./types";
import { validateEmail } from "./validation";

export default function BusinessMailBlockTool() {
	const [availableBlocks, setAvailableBlocks] =
		useState<MailBlock[]>(MAIL_BLOCKS);
	const [composedBlocks, setComposedBlocks] = useState<ComposedBlock[]>([]);
	const [searchTerm, setSearchTerm] = useState("");
	const [selectedCategory, setSelectedCategory] = useState<string>("all");
	const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
	const [variables, setVariables] = useState<Record<string, string>>({});
	const [generatedEmail, setGeneratedEmail] = useState("");

	// New state for enhanced features
	const [templates, setTemplates] =
		useState<MailTemplate[]>(BUILT_IN_TEMPLATES);
	const [selectedTemplate, setSelectedTemplate] = useState<string>("");
	const [showTemplateLibrary, setShowTemplateLibrary] = useState(false);
	const [showValidation, setShowValidation] = useState(true);
	const [showGuidelines, setShowGuidelines] = useState(false);
	const [validationResult, setValidationResult] = useState<ValidationResult>({
		isValid: true,
		errors: [],
		warnings: [],
		suggestions: [],
	});
	const [customBlockContent, setCustomBlockContent] = useState("");
	const [customBlockCategory, setCustomBlockCategory] = useState<
		"greeting" | "body" | "closing" | "signature"
	>("body");
	const [showCustomBlockForm, setShowCustomBlockForm] = useState(false);

	// Filter available blocks
	const filteredBlocks = availableBlocks.filter((block) => {
		const matchesSearch =
			block.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
			block.content.toLowerCase().includes(searchTerm.toLowerCase());
		const matchesCategory =
			selectedCategory === "all" || block.category === selectedCategory;
		const matchesFavorites = !showFavoritesOnly || block.isFavorite;

		return matchesSearch && matchesCategory && matchesFavorites;
	});

	// Handle drag end
	const handleDragEnd = useCallback(
		(result: DropResult) => {
			if (!result.destination) return;

			const { source, destination } = result;

			if (
				source.droppableId === "available" &&
				destination.droppableId === "composed"
			) {
				// Add block to composed area
				const blockToAdd = availableBlocks.find(
					(block) => block.id === result.draggableId,
				);
				if (blockToAdd) {
					const newComposedBlock: ComposedBlock = {
						...blockToAdd,
						id: `${blockToAdd.id}-${Date.now()}`, // Unique ID for composed block
					};

					const newComposedBlocks = [...composedBlocks];
					newComposedBlocks.splice(destination.index, 0, newComposedBlock);
					setComposedBlocks(newComposedBlocks);
				}
			} else if (
				source.droppableId === "composed" &&
				destination.droppableId === "composed"
			) {
				// Reorder composed blocks
				const newComposedBlocks = [...composedBlocks];
				const [removed] = newComposedBlocks.splice(source.index, 1);
				newComposedBlocks.splice(destination.index, 0, removed);
				setComposedBlocks(newComposedBlocks);
			}
		},
		[availableBlocks, composedBlocks],
	);

	// Remove block from composed area
	const removeComposedBlock = useCallback((blockId: string) => {
		setComposedBlocks((prev) => prev.filter((block) => block.id !== blockId));
	}, []);

	// Reset all composed blocks
	const resetComposedBlocks = useCallback(() => {
		setComposedBlocks([]);
	}, []);

	// Toggle favorite
	const toggleFavorite = useCallback((blockId: string) => {
		setAvailableBlocks((prev) =>
			prev.map((block) =>
				block.id === blockId
					? { ...block, isFavorite: !block.isFavorite }
					: block,
			),
		);
	}, []);

	// Remove a custom block from available blocks
	const removeCustomBlock = useCallback((blockId: string) => {
		setAvailableBlocks((prev) => prev.filter((b) => b.id !== blockId));
	}, []);

	// Update variable value
	const updateVariable = useCallback((key: string, value: string) => {
		setVariables((prev) => ({ ...prev, [key]: value }));
	}, []);

	// Generate email from composed blocks
	const generateEmail = useCallback(() => {
		const emailParts = composedBlocks.map((block) => {
			let content = block.customContent || block.content;

			// Replace variables
			if (block.variables && Array.isArray(block.variables)) {
				block.variables.forEach((variable: string) => {
					const value = variables[variable] || `{${variable}}`;
					content = content.replace(
						new RegExp(`\\{${variable}\\}`, "g"),
						value,
					);
				});
			}

			return content;
		});

		const email = emailParts.join("\n\n");
		setGeneratedEmail(email);
	}, [composedBlocks, variables]);

	// Copy to clipboard
	const copyToClipboard = useCallback(async () => {
		try {
			await navigator.clipboard.writeText(generatedEmail);
		} catch (error) {
			console.error("Failed to copy to clipboard:", error);
		}
	}, [generatedEmail]);

	// Download as text file
	const downloadEmail = useCallback(() => {
		const blob = new Blob([generatedEmail], { type: "text/plain" });
		const url = URL.createObjectURL(blob);
		const a = document.createElement("a");
		a.href = url;
		a.download = "business-email.txt";
		document.body.appendChild(a);
		a.click();
		document.body.removeChild(a);
		URL.revokeObjectURL(url);
	}, [generatedEmail]);

	// Load template
	const loadTemplate = useCallback(
		(templateId: string) => {
			const template = templates.find((t) => t.id === templateId);
			if (template) {
				setComposedBlocks(template.blocks);
				setVariables(template.variables);
				setSelectedTemplate(templateId);

				// Update last used timestamp
				setTemplates((prev) =>
					prev.map((t) =>
						t.id === templateId
							? { ...t, lastUsed: new Date().toISOString() }
							: t,
					),
				);
			}
		},
		[templates],
	);

	// Save current composition as template
	const saveAsTemplate = useCallback(
		(name: string, description: string, category: MailTemplate["category"]) => {
			const newTemplate: MailTemplate = {
				id: `template-custom-${Date.now()}`,
				name,
				description,
				category,
				isBuiltIn: false,
				createdAt: new Date().toISOString(),
				blocks: [...composedBlocks],
				variables: { ...variables },
			};

			setTemplates((prev) => [...prev, newTemplate]);
			return newTemplate.id;
		},
		[composedBlocks, variables],
	);

	// Save handler triggered from the UI (prompts for name + description)
	const saveAsTemplateFromUI = useCallback(() => {
		const name = prompt("テンプレート名を入力してください:");
		if (name) {
			const description = prompt("テンプレートの説明を入力してください:") || "";
			saveAsTemplate(name, description, "custom");
		}
	}, [saveAsTemplate]);

	// Delete custom template
	const deleteTemplate = useCallback(
		(templateId: string) => {
			setTemplates((prev) =>
				prev.filter((t) => t.id !== templateId || t.isBuiltIn),
			);
			if (selectedTemplate === templateId) {
				setSelectedTemplate("");
			}
		},
		[selectedTemplate],
	);

	// Add custom block
	const addCustomBlock = useCallback(() => {
		if (customBlockContent.trim()) {
			const newBlock: MailBlock = {
				id: `custom-${Date.now()}`,
				category: customBlockCategory,
				title: "カスタムブロック",
				content: customBlockContent,
				isCustom: true,
				formality: "neutral",
				tags: ["カスタム"],
			};

			setAvailableBlocks((prev) => [...prev, newBlock]);
			setCustomBlockContent("");
			setShowCustomBlockForm(false);
		}
	}, [customBlockContent, customBlockCategory]);

	// Export template as JSON
	const exportTemplate = useCallback(
		(templateId: string) => {
			const template = templates.find((t) => t.id === templateId);
			if (template) {
				const blob = new Blob([JSON.stringify(template, null, 2)], {
					type: "application/json",
				});
				const url = URL.createObjectURL(blob);
				const a = document.createElement("a");
				a.href = url;
				a.download = `${template.name.replace(/[^a-zA-Z0-9]/g, "_")}.json`;
				document.body.appendChild(a);
				a.click();
				document.body.removeChild(a);
				URL.revokeObjectURL(url);
			}
		},
		[templates],
	);

	// Generate email when composed blocks or variables change
	useEffect(() => {
		generateEmail();
	}, [generateEmail]);

	// Validate email when composition changes
	useEffect(() => {
		const result = validateEmail(composedBlocks, variables);
		setValidationResult(result);
	}, [composedBlocks, variables]);

	// Get all unique variables from composed blocks
	const allVariables = Array.from(
		new Set(
			composedBlocks.flatMap((block) => (block.variables as string[]) || []),
		),
	);

	return (
		<ToolWrapper
			toolName="Business Mail Block Tool"
			description="ビジネスメールをScratch風ブロックUIで簡単作成.挨拶、本文、締め、署名を組み合わせてプロフェッショナルなメールを作成.テンプレート機能とバリデーション機能付き."
			category="Business"
		>
			<DragDropContext onDragEnd={handleDragEnd}>
				<div className="space-y-8">
					{showTemplateLibrary && (
						<TemplateLibrary
							templates={templates}
							selectedTemplate={selectedTemplate}
							loadTemplate={loadTemplate}
							exportTemplate={exportTemplate}
							deleteTemplate={deleteTemplate}
							onClose={() => setShowTemplateLibrary(false)}
						/>
					)}

					{showGuidelines && (
						<EmailGuidelines onClose={() => setShowGuidelines(false)} />
					)}

					<div className="space-y-4">
						<Controls
							searchTerm={searchTerm}
							setSearchTerm={setSearchTerm}
							selectedCategory={selectedCategory}
							setSelectedCategory={setSelectedCategory}
							showFavoritesOnly={showFavoritesOnly}
							setShowFavoritesOnly={setShowFavoritesOnly}
							showTemplateLibrary={showTemplateLibrary}
							setShowTemplateLibrary={setShowTemplateLibrary}
							showValidation={showValidation}
							setShowValidation={setShowValidation}
							showGuidelines={showGuidelines}
							setShowGuidelines={setShowGuidelines}
							showCustomBlockForm={showCustomBlockForm}
							setShowCustomBlockForm={setShowCustomBlockForm}
						/>

						{showCustomBlockForm && (
							<CustomBlockForm
								customBlockContent={customBlockContent}
								setCustomBlockContent={setCustomBlockContent}
								customBlockCategory={customBlockCategory}
								setCustomBlockCategory={setCustomBlockCategory}
								addCustomBlock={addCustomBlock}
								onClose={() => setShowCustomBlockForm(false)}
							/>
						)}
					</div>

					<div className="grid-system grid-1 lg:grid-2 gap-8">
						<AvailableBlocks
							filteredBlocks={filteredBlocks}
							toggleFavorite={toggleFavorite}
							removeCustomBlock={removeCustomBlock}
						/>

						<ComposedBlocks
							composedBlocks={composedBlocks}
							removeComposedBlock={removeComposedBlock}
							resetComposedBlocks={resetComposedBlocks}
						/>
					</div>

					{allVariables.length > 0 && (
						<VariablesInput
							allVariables={allVariables}
							variables={variables}
							updateVariable={updateVariable}
						/>
					)}

					{showValidation && (
						<EmailValidation validationResult={validationResult} />
					)}

					<GeneratedEmail
						generatedEmail={generatedEmail}
						copyToClipboard={copyToClipboard}
						downloadEmail={downloadEmail}
						saveAsTemplateFromUI={saveAsTemplateFromUI}
						composedBlocksCount={composedBlocks.length}
					/>
				</div>
			</DragDropContext>
		</ToolWrapper>
	);
}
