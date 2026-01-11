"use client";

import {
	DragDropContext,
	Draggable,
	Droppable,
	type DropResult,
} from "@hello-pangea/dnd";
import {
	AlertCircle,
	BookOpen,
	CheckCircle,
	Copy,
	Download,
	FileText,
	Heart,
	Plus,
	Save,
	Search,
	Trash2,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import ToolWrapper from "../../components/ToolWrapper";

// Types for mail blocks
interface MailBlock {
	id: string;
	category: "greeting" | "body" | "closing" | "signature";
	title: string;
	content: string;
	variables?: string[];
	isFavorite?: boolean;
	usageCount?: number;
	isCustom?: boolean;
	tags?: string[];
	formality?: "formal" | "casual" | "neutral";
}

interface ComposedBlock extends MailBlock {
	customContent?: string;
	variableValues?: Record<string, string>;
}

interface MailTemplate {
	id: string;
	name: string;
	description: string;
	blocks: ComposedBlock[];
	variables: Record<string, string>;
	category: "business" | "inquiry" | "follow-up" | "apology" | "custom";
	isBuiltIn: boolean;
	createdAt: string;
	lastUsed?: string;
}

interface ValidationResult {
	isValid: boolean;
	errors: string[];
	warnings: string[];
	suggestions: string[];
}

// Predefined mail blocks with enhanced metadata
const MAIL_BLOCKS: MailBlock[] = [
	// Greeting blocks
	{
		id: "greeting-first",
		category: "greeting",
		title: "初回挨拶",
		content: "はじめまして、{company}の{name}です.",
		variables: ["company", "name"],
		formality: "formal",
		tags: ["初回", "挨拶", "自己紹介"],
	},
	{
		id: "greeting-regular",
		category: "greeting",
		title: "継続挨拶",
		content: "いつもお世話になっております.{company}の{name}です.",
		variables: ["company", "name"],
		formality: "formal",
		tags: ["継続", "挨拶", "定型"],
	},
	{
		id: "greeting-seasonal",
		category: "greeting",
		title: "季節挨拶",
		content: "暑い日が続いておりますが、いかがお過ごしでしょうか.",
		formality: "formal",
		tags: ["季節", "挨拶", "気遣い"],
	},
	{
		id: "greeting-morning",
		category: "greeting",
		title: "朝の挨拶",
		content: "おはようございます.{company}の{name}です.",
		variables: ["company", "name"],
		formality: "neutral",
		tags: ["朝", "挨拶", "時間"],
	},
	{
		id: "greeting-urgent",
		category: "greeting",
		title: "緊急時挨拶",
		content: "急なご連絡で恐縮です.{company}の{name}です.",
		variables: ["company", "name"],
		formality: "formal",
		tags: ["緊急", "挨拶", "謝罪"],
	},

	// Body blocks
	{
		id: "body-request",
		category: "body",
		title: "依頼",
		content: "つきましては、{content}についてご相談させていただきたく存じます.",
		variables: ["content"],
		formality: "formal",
		tags: ["依頼", "相談", "お願い"],
	},
	{
		id: "body-confirm",
		category: "body",
		title: "確認",
		content: "ご多忙の中恐縮ですが、{content}についてご確認をお願いいたします.",
		variables: ["content"],
		formality: "formal",
		tags: ["確認", "お願い", "謝罪"],
	},
	{
		id: "body-report",
		category: "body",
		title: "報告",
		content: "この度、{content}についてご報告させていただきます.",
		variables: ["content"],
		formality: "formal",
		tags: ["報告", "連絡", "情報"],
	},
	{
		id: "body-apology",
		category: "body",
		title: "謝罪",
		content: "{content}につきまして、心よりお詫び申し上げます.",
		variables: ["content"],
		formality: "formal",
		tags: ["謝罪", "お詫び", "反省"],
	},
	{
		id: "body-thanks",
		category: "body",
		title: "感謝",
		content: "{content}につきまして、心より感謝申し上げます.",
		variables: ["content"],
		formality: "formal",
		tags: ["感謝", "お礼", "謝意"],
	},
	{
		id: "body-schedule",
		category: "body",
		title: "日程調整",
		content: "{date}の{time}からお時間をいただけますでしょうか.",
		variables: ["date", "time"],
		formality: "formal",
		tags: ["日程", "調整", "時間"],
	},

	// Closing blocks
	{
		id: "closing-reply",
		category: "closing",
		title: "返信依頼",
		content: "ご検討のほど、よろしくお願いいたします.",
		formality: "formal",
		tags: ["返信", "検討", "お願い"],
	},
	{
		id: "closing-contact",
		category: "closing",
		title: "連絡依頼",
		content: "ご不明な点がございましたら、お気軽にお声がけください.",
		formality: "formal",
		tags: ["連絡", "質問", "サポート"],
	},
	{
		id: "closing-cooperation",
		category: "closing",
		title: "協力依頼",
		content: "ご協力のほど、よろしくお願いいたします.",
		formality: "formal",
		tags: ["協力", "お願い", "支援"],
	},
	{
		id: "closing-urgent",
		category: "closing",
		title: "急ぎの締め",
		content: "お忙しい中恐縮ですが、お急ぎでご対応いただけますと幸いです.",
		formality: "formal",
		tags: ["急ぎ", "緊急", "謝罪"],
	},
	{
		id: "closing-future",
		category: "closing",
		title: "今後の関係",
		content: "今後ともどうぞよろしくお願いいたします.",
		formality: "formal",
		tags: ["今後", "関係", "継続"],
	},

	// Signature blocks
	{
		id: "signature-basic",
		category: "signature",
		title: "基本署名",
		content: "{company}\n{department}\n{name}\nTEL: {phone}\nEmail: {email}",
		variables: ["company", "department", "name", "phone", "email"],
		formality: "formal",
		tags: ["基本", "連絡先", "会社"],
	},
	{
		id: "signature-detailed",
		category: "signature",
		title: "詳細署名",
		content:
			"{company}\n{department} {position}\n{name}\n〒{zipcode} {address}\nTEL: {phone} / FAX: {fax}\nEmail: {email}\nWebsite: {website}",
		variables: [
			"company",
			"department",
			"position",
			"name",
			"zipcode",
			"address",
			"phone",
			"fax",
			"email",
			"website",
		],
		formality: "formal",
		tags: ["詳細", "住所", "連絡先"],
	},
	{
		id: "signature-simple",
		category: "signature",
		title: "シンプル署名",
		content: "{name}\n{email}",
		variables: ["name", "email"],
		formality: "casual",
		tags: ["シンプル", "最小限", "カジュアル"],
	},
];

// Helper to safely get a predefined block without non-null assertions
const getMailBlockById = (id: string): MailBlock => {
	const found = MAIL_BLOCKS.find((b) => b.id === id);
	return (
		found || {
			id,
			category: "body",
			title: id,
			content: "",
		}
	);
};

// Built-in email templates
const BUILT_IN_TEMPLATES: MailTemplate[] = [
	{
		id: "template-business-inquiry",
		name: "ビジネス問い合わせ",
		description: "新規取引先への問い合わせメール",
		category: "inquiry",
		isBuiltIn: true,
		createdAt: new Date().toISOString(),
		blocks: [
			{ ...getMailBlockById("greeting-first"), id: "greeting-first-1" },
			{ ...getMailBlockById("body-request"), id: "body-request-1" },
			{ ...getMailBlockById("closing-reply"), id: "closing-reply-1" },
			{ ...getMailBlockById("signature-basic"), id: "signature-basic-1" },
		],
		variables: {
			company: "株式会社サンプル",
			name: "田中太郎",
			content: "貴社サービスについて",
			department: "営業部",
			phone: "03-1234-5678",
			email: "tanaka@sample.co.jp",
		},
	},
	{
		id: "template-follow-up",
		name: "フォローアップ",
		description: "会議後のフォローアップメール",
		category: "follow-up",
		isBuiltIn: true,
		createdAt: new Date().toISOString(),
		blocks: [
			{ ...getMailBlockById("greeting-regular"), id: "greeting-regular-1" },
			{ ...getMailBlockById("body-thanks"), id: "body-thanks-1" },
			{ ...getMailBlockById("body-confirm"), id: "body-confirm-1" },
			{ ...getMailBlockById("closing-contact"), id: "closing-contact-1" },
			{ ...getMailBlockById("signature-basic"), id: "signature-basic-1" },
		],
		variables: {
			company: "株式会社サンプル",
			name: "田中太郎",
			content: "本日の会議の件",
			department: "営業部",
			phone: "03-1234-5678",
			email: "tanaka@sample.co.jp",
		},
	},
	{
		id: "template-apology",
		name: "謝罪メール",
		description: "ミスやトラブルに対する謝罪メール",
		category: "apology",
		isBuiltIn: true,
		createdAt: new Date().toISOString(),
		blocks: [
			{ ...getMailBlockById("greeting-urgent"), id: "greeting-urgent-1" },
			{ ...getMailBlockById("body-apology"), id: "body-apology-1" },
			{
				...getMailBlockById("closing-cooperation"),
				id: "closing-cooperation-1",
			},
			{ ...getMailBlockById("signature-basic"), id: "signature-basic-1" },
		],
		variables: {
			company: "株式会社サンプル",
			name: "田中太郎",
			content: "この度のご迷惑",
			department: "営業部",
			phone: "03-1234-5678",
			email: "tanaka@sample.co.jp",
		},
	},
];

const CATEGORY_COLORS = {
	greeting: "bg-green-50 border-green-300 text-green-800",
	body: "bg-blue-50 border-blue-300 text-blue-800",
	closing: "bg-purple-50 border-purple-300 text-purple-800",
	signature: "bg-gray-50 border-gray-300 text-gray-800",
};

const CATEGORY_NAMES = {
	greeting: "挨拶",
	body: "本文",
	closing: "締め",
	signature: "署名",
};

// Email validation and professional guidelines
const validateEmail = (
	blocks: ComposedBlock[],
	variables: Record<string, string>,
): ValidationResult => {
	const errors: string[] = [];
	const warnings: string[] = [];
	const suggestions: string[] = [];

	// Check for required categories
	const categories = blocks.map((b) => b.category);
	if (!categories.includes("greeting")) {
		errors.push("挨拶ブロックが必要です");
	}
	if (!categories.includes("body")) {
		errors.push("本文ブロックが必要です");
	}
	if (!categories.includes("closing")) {
		warnings.push("締めのブロックを追加することをお勧めします");
	}
	if (!categories.includes("signature")) {
		warnings.push("署名ブロックを追加することをお勧めします");
	}

	// Check for proper order
	const expectedOrder = ["greeting", "body", "closing", "signature"];
	let lastValidIndex = -1;
	for (const block of blocks) {
		const currentIndex = expectedOrder.indexOf(block.category);
		if (currentIndex < lastValidIndex) {
			warnings.push(
				`${CATEGORY_NAMES[block.category]}の順序を確認してください`,
			);
		}
		lastValidIndex = Math.max(lastValidIndex, currentIndex);
	}

	// Check for missing variables
	const allVariables = new Set(blocks.flatMap((b) => b.variables || []));
	for (const variable of allVariables) {
		if (!variables[variable] || variables[variable].trim() === "") {
			errors.push(`変数「${variable}」が設定されていません`);
		}
	}

	// Check for professional tone
	const emailContent = blocks.map((b) => b.content).join(" ");
	if (
		!emailContent.includes("お世話になっております") &&
		!emailContent.includes("はじめまして")
	) {
		suggestions.push("適切な挨拶を含めることをお勧めします");
	}
	if (!emailContent.includes("よろしくお願い")) {
		suggestions.push("締めの挨拶を含めることをお勧めします");
	}

	// Check email length
	const totalLength = emailContent.length;
	if (totalLength < 50) {
		warnings.push("メールが短すぎる可能性があります");
	} else if (totalLength > 1000) {
		warnings.push("メールが長すぎる可能性があります");
	}

	return {
		isValid: errors.length === 0,
		errors,
		warnings,
		suggestions,
	};
};

// Professional email guidelines
const EMAIL_GUIDELINES = {
	structure: [
		"件名は具体的で簡潔に",
		"挨拶から始める",
		"本文は要点を明確に",
		"適切な締めの言葉",
		"署名を忘れずに",
	],
	tone: [
		"敬語を正しく使用",
		"相手の立場を考慮",
		"感謝の気持ちを表現",
		"謙虚な姿勢を保つ",
		"明確で分かりやすい表現",
	],
	formatting: [
		"適切な改行を使用",
		"箇条書きで整理",
		"重要な部分を強調",
		"読みやすい文字数",
		"統一された書式",
	],
};

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
			// Show success feedback (could add toast notification)
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

	// Handle keyboard shortcuts
	useEffect(() => {
		const handleToolShortcut = (event: CustomEvent) => {
			switch (event.detail.key.toLowerCase()) {
				case "c":
					if (generatedEmail) {
						copyToClipboard();
					}
					break;
				case "d":
					if (generatedEmail) {
						downloadEmail();
					}
					break;
				case "r":
					setComposedBlocks([]);
					setVariables({});
					setSelectedTemplate("");
					break;
				case "t":
					setShowTemplateLibrary(!showTemplateLibrary);
					break;
				case "v":
					setShowValidation(!showValidation);
					break;
				case "g":
					setShowGuidelines(!showGuidelines);
					break;
			}
		};

		document.addEventListener(
			"toolShortcut",
			handleToolShortcut as EventListener,
		);
		return () =>
			document.removeEventListener(
				"toolShortcut",
				handleToolShortcut as EventListener,
			);
	}, [
		generatedEmail,
		copyToClipboard,
		downloadEmail,
		showTemplateLibrary,
		showValidation,
		showGuidelines,
	]);

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
			keyboardShortcuts={[
				{ key: "c", description: "メールをコピー" },
				{ key: "d", description: "メールをダウンロード" },
				{ key: "r", description: "全てリセット" },
				{ key: "t", description: "テンプレートライブラリ表示切替" },
				{ key: "v", description: "バリデーション表示切替" },
				{ key: "g", description: "ガイドライン表示切替" },
			]}
		>
			<DragDropContext onDragEnd={handleDragEnd}>
				<div className="space-y-8">
					{/* Template Library */}
					{showTemplateLibrary && (
						<div className="space-y-4 rounded-xl bg-base/75 backdrop-blur-md shadow-[0_8px_24px_rgba(0,0,0,0.25)] p-4">
							<div className="flex items-center justify-between">
								<h2 className="neue-haas-grotesk-display text-xl text-main">
									テンプレートライブラリ
								</h2>
								<button
									type="button"
									onClick={() => setShowTemplateLibrary(false)}
									className="text-accent hover:text-main"
								>
									×
								</button>
							</div>

							<div className="grid-system grid-1 sm:grid-2 lg:grid-3 gap-4">
								{templates.map((template) => (
									<div
										key={template.id}
										className={`rounded-lg bg-main/10 p-3 hover:bg-main/20 transition-colors ${
											selectedTemplate === template.id
												? "bg-accent text-main"
												: "bg-base"
										}`}
									>
										<div className="space-y-2">
											<div className="flex items-start justify-between">
												<h3 className="noto-sans-jp-regular text-sm">
													{template.name}
												</h3>
												<div className="flex gap-1">
													{template.isBuiltIn && (
														<span className="text-xs px-2 py-1 bg-green-100 text-green-800 border border-green-300">
															内蔵
														</span>
													)}
												</div>
											</div>
											<p className="text-xs noto-sans-jp-light">
												{template.description}
											</p>
											<div className="flex flex-wrap gap-1">
												{template.blocks.map((block) => (
													<span
														key={`${template.id}-${block.id}`}
														className="text-xs px-2 py-1 rounded-lg bg-main/10"
													>
														{CATEGORY_NAMES[block.category]}
													</span>
												))}
											</div>
											<div className="flex gap-2 pt-2">
												<button
													type="button"
													onClick={() => loadTemplate(template.id)}
													className="text-xs px-3 py-1 rounded-lg bg-main/10 hover:bg-main/20 focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-base"
												>
													読み込み
												</button>
												<button
													type="button"
													onClick={() => exportTemplate(template.id)}
													className="text-xs px-3 py-1 rounded-lg bg-main/10 hover:bg-main/20 focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-base"
												>
													エクスポート
												</button>
												{!template.isBuiltIn && (
													<button
														type="button"
														onClick={() => deleteTemplate(template.id)}
														className="text-xs px-3 py-1 border border-red-500 text-red-500 hover:bg-red-500 hover:text-white focus:outline-none focus:ring-2 focus:ring-red-500"
													>
														削除
													</button>
												)}
											</div>
										</div>
									</div>
								))}
							</div>
						</div>
					)}

					{/* Professional Guidelines */}
					{showGuidelines && (
						<div className="space-y-4 rounded-xl bg-base/75 backdrop-blur-md shadow-[0_8px_24px_rgba(0,0,0,0.25)] p-4">
							<div className="flex items-center justify-between">
								<h2 className="neue-haas-grotesk-display text-xl text-main">
									プロフェッショナルメールガイドライン
								</h2>
								<button
									type="button"
									onClick={() => setShowGuidelines(false)}
									className="text-accent hover:text-main"
								>
									×
								</button>
							</div>

							<div className="grid-system grid-1 sm:grid-3 gap-6">
								<div className="space-y-3">
									<h3 className="neue-haas-grotesk-display text-lg text-main">
										構造
									</h3>
									<ul className="space-y-1">
										{EMAIL_GUIDELINES.structure.map((item) => (
											<li
												key={`structure-${item}`}
												className="text-sm noto-sans-jp-light flex items-start gap-2"
											>
												<CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
												{item}
											</li>
										))}
									</ul>
								</div>

								<div className="space-y-3">
									<h3 className="neue-haas-grotesk-display text-lg text-main">
										トーン
									</h3>
									<ul className="space-y-1">
										{EMAIL_GUIDELINES.tone.map((item) => (
											<li
												key={`tone-${item}`}
												className="text-sm noto-sans-jp-light flex items-start gap-2"
											>
												<CheckCircle className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
												{item}
											</li>
										))}
									</ul>
								</div>

								<div className="space-y-3">
									<h3 className="neue-haas-grotesk-display text-lg text-main">
										フォーマット
									</h3>
									<ul className="space-y-1">
										{EMAIL_GUIDELINES.formatting.map((item) => (
											<li
												key={`formatting-${item}`}
												className="text-sm noto-sans-jp-light flex items-start gap-2"
											>
												<CheckCircle className="w-4 h-4 text-purple-500 mt-0.5 flex-shrink-0" />
												{item}
											</li>
										))}
									</ul>
								</div>
							</div>
						</div>
					)}

					{/* Controls */}
					<div className="space-y-4">
						<div className="space-y-4">
							{/* Main Controls */}
							<div className="flex flex-wrap gap-4 items-center">
								<div className="relative flex-1 min-w-64">
									<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-accent" />
									<input
										type="text"
										placeholder="ブロックを検索..."
										value={searchTerm}
										onChange={(e) => setSearchTerm(e.target.value)}
										className="w-full pl-10 pr-4 py-2 rounded-lg bg-main/10 text-main focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-base"
									/>
								</div>

								<select
									value={selectedCategory}
									onChange={(e) => setSelectedCategory(e.target.value)}
									className="px-4 py-2 rounded-lg bg-main/10 text-main hover:bg-main/20 focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-base"
								>
									<option value="all">全カテゴリ</option>
									<option value="greeting">挨拶</option>
									<option value="body">本文</option>
									<option value="closing">締め</option>
									<option value="signature">署名</option>
								</select>

								<button
									type="button"
									onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
									className={`px-4 py-2 rounded-lg bg-main/10 hover:bg-main/20 flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-base noto-sans-jp-light ${
										showFavoritesOnly
											? "bg-accent text-main"
											: "bg-base text-main"
									}`}
								>
									<Heart className="w-4 h-4" />
									お気に入りのみ
								</button>
							</div>

							{/* Feature Toggle Buttons */}
							<div className="flex flex-wrap gap-2">
								<button
									type="button"
									onClick={() => setShowTemplateLibrary(!showTemplateLibrary)}
									className={`px-3 py-2 text-sm rounded-lg bg-main/10 hover:bg-main/20 flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-base noto-sans-jp-light ${
										showTemplateLibrary
											? "bg-accent text-main"
											: "bg-base text-main hover:bg-accent hover:text-main"
									}`}
								>
									<FileText className="w-4 h-4" />
									テンプレート
								</button>

								<button
									type="button"
									onClick={() => setShowValidation(!showValidation)}
									className={`px-3 py-2 text-sm rounded-lg bg-main/10 hover:bg-main/20 flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-base noto-sans-jp-light ${
										showValidation
											? "bg-accent text-main"
											: "bg-base text-main hover:bg-accent hover:text-main"
									}`}
								>
									<CheckCircle className="w-4 h-4" />
									バリデーション
								</button>

								<button
									type="button"
									onClick={() => setShowGuidelines(!showGuidelines)}
									className={`px-3 py-2 text-sm rounded-lg bg-main/10 hover:bg-main/20 flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-base noto-sans-jp-light ${
										showGuidelines
											? "bg-accent text-main"
											: "bg-base text-main hover:bg-accent hover:text-main"
									}`}
								>
									<BookOpen className="w-4 h-4" />
									ガイドライン
								</button>

								<button
									type="button"
									onClick={() => setShowCustomBlockForm(!showCustomBlockForm)}
									className={`px-3 py-2 text-sm rounded-lg bg-main/10 hover:bg-main/20 flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-base noto-sans-jp-light ${
										showCustomBlockForm
											? "bg-accent text-main"
											: "bg-base text-main hover:bg-accent hover:text-main"
									}`}
								>
									<Plus className="w-4 h-4" />
									カスタムブロック
								</button>
							</div>

							{/* Custom Block Form */}
							{showCustomBlockForm && (
								<div className="rounded-xl bg-base/75 backdrop-blur-md shadow-[0_8px_24px_rgba(0,0,0,0.25)] p-4 space-y-3">
									<h3 className="neue-haas-grotesk-display text-lg text-main">
										カスタムブロック作成
									</h3>
									<div className="grid-system grid-1 sm:grid-2 gap-4">
										<div className="space-y-2">
											<label
												htmlFor="customBlockCategory"
												className="text-sm text-main noto-sans-jp-regular"
											>
												カテゴリ
											</label>
											<select
												id="customBlockCategory"
												value={customBlockCategory}
												onChange={(e) =>
													setCustomBlockCategory(
														e.target.value as
															| "greeting"
															| "body"
															| "closing"
															| "signature",
													)
												}
												className="w-full px-3 py-2 rounded-lg bg-main/10 text-main focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-base"
											>
												<option value="greeting">挨拶</option>
												<option value="body">本文</option>
												<option value="closing">締め</option>
												<option value="signature">署名</option>
											</select>
										</div>
										<div className="space-y-2">
											<label
												htmlFor="customBlockContent"
												className="text-sm text-main noto-sans-jp-regular"
											>
												内容
											</label>
											<textarea
												id="customBlockContent"
												value={customBlockContent}
												onChange={(e) => setCustomBlockContent(e.target.value)}
												placeholder="ブロックの内容を入力... 変数は{変数名}で指定"
												className="w-full px-3 py-2 rounded-lg bg-main/10 text-main focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-base resize-none"
												rows={3}
											/>
										</div>
									</div>
									<div className="flex gap-2">
										<button
											type="button"
											onClick={addCustomBlock}
											disabled={!customBlockContent.trim()}
											className="px-4 py-2 rounded-lg bg-main/10 text-main hover:bg-main/20 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-base noto-sans-jp-regular"
										>
											追加
										</button>
										<button
											type="button"
											onClick={() => setShowCustomBlockForm(false)}
											className="px-4 py-2 rounded-lg bg-main/10 text-main hover:bg-main/20 focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-base noto-sans-jp-regular"
										>
											キャンセル
										</button>
									</div>
								</div>
							)}
						</div>
					</div>

					<div className="grid-system grid-1 lg:grid-2 gap-8">
						{/* Available Blocks */}
						<div className="space-y-4">
							<h2 className="neue-haas-grotesk-display text-xl text-main">
								利用可能なブロック
							</h2>

							<Droppable droppableId="available" isDropDisabled={true}>
								{(provided) => (
									<div
										ref={provided.innerRef}
										{...provided.droppableProps}
										className="space-y-3 min-h-96 max-h-96 overflow-y-auto rounded-xl bg-base/75 backdrop-blur-md shadow-[0_8px_24px_rgba(0,0,0,0.25)] p-4"
									>
										{filteredBlocks.map((block, index) => (
											<Draggable
												key={block.id}
												draggableId={block.id}
												index={index}
											>
												{(provided, snapshot) => (
													<div
														ref={provided.innerRef}
														{...provided.draggableProps}
														{...provided.dragHandleProps}
														className={`p-3 rounded-lg bg-main/10 cursor-move hover:bg-main/20 transition-colors ${
															CATEGORY_COLORS[block.category]
														} ${snapshot.isDragging ? "opacity-50" : ""}`}
													>
														<div className="flex items-start justify-between">
															<div className="flex-1">
																<div className="flex items-center gap-2 mb-1">
																	<span className="text-xs rounded-lg bg-main/10 px-2 py-1 noto-sans-jp-light">
																		{CATEGORY_NAMES[block.category]}
																	</span>
																	<span className="text-sm noto-sans-jp-regular">
																		{block.title}
																	</span>
																	{block.formality && (
																		<span
																			className={`text-xs px-2 py-1 border ${
																				block.formality === "formal"
																					? "bg-blue-100 text-blue-800 border-blue-300"
																					: block.formality === "casual"
																						? "bg-green-100 text-green-800 border-green-300"
																						: "bg-gray-100 text-gray-800 border-gray-300"
																			}`}
																		>
																			{block.formality === "formal"
																				? "敬語"
																				: block.formality === "casual"
																					? "カジュアル"
																					: "中性"}
																		</span>
																	)}
																</div>
																<p className="text-xs noto-sans-jp-light leading-relaxed whitespace-pre-line">
																	{block.content}
																</p>
																{block.tags && block.tags.length > 0 && (
																	<div className="mt-1 flex flex-wrap gap-1">
																		{block.tags.map((tag, tagIndex) => (
																			<span
																				key={tagIndex}
																				className="text-xs px-1 py-0.5 bg-gray-100 text-gray-600 border border-gray-300"
																			>
																				#{tag}
																			</span>
																		))}
																	</div>
																)}
																{block.variables && (
																	<div className="mt-2 flex flex-wrap gap-1">
																		{block.variables.map((variable) => (
																			<span
																				key={variable}
																				className="text-xs px-2 py-1 bg-base text-accent border border-accent noto-sans-jp-light"
																			>
																				{variable}
																			</span>
																		))}
																	</div>
																)}
															</div>
															<div className="flex flex-col gap-1 ml-2">
																<button
																	type="button"
																	onClick={() => toggleFavorite(block.id)}
																	className="p-1 rounded-lg bg-main/10 hover:bg-main/20 focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-base"
																>
																	<Heart
																		className={`w-4 h-4 ${
																			block.isFavorite ? "fill-current" : ""
																		}`}
																	/>
																</button>
																{block.isCustom && (
																	<button
																		type="button"
																		onClick={() => {
																			setAvailableBlocks((prev) =>
																				prev.filter((b) => b.id !== block.id),
																			);
																		}}
																		className="p-1 hover:bg-red-500 hover:text-white border border-red-500 text-red-500 focus:outline-none focus:ring-2 focus:ring-red-500"
																	>
																		<Trash2 className="w-4 h-4" />
																	</button>
																)}
															</div>
														</div>
													</div>
												)}
											</Draggable>
										))}
										{provided.placeholder}
									</div>
								)}
							</Droppable>
						</div>

						{/* Composed Email */}
						<div className="space-y-4">
							<div className="flex items-center justify-between">
								<h2 className="neue-haas-grotesk-display text-xl text-main">
									メール作成エリア
								</h2>
								<button
									type="button"
									onClick={() => setComposedBlocks([])}
									className="px-3 py-1 text-xs rounded-lg bg-main/10 hover:bg-main/20 focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-base flex items-center gap-1 noto-sans-jp-light"
									title="全てリセット"
								>
									<Trash2 className="w-4 h-4" />
									リセット
								</button>
							</div>

							<Droppable droppableId="composed">
								{(provided) => (
									<div
										ref={provided.innerRef}
										{...provided.droppableProps}
										className="space-y-3 min-h-96 max-h-96 overflow-y-auto rounded-xl bg-base/75 backdrop-blur-md shadow-[0_8px_24px_rgba(0,0,0,0.25)] p-4"
									>
										{composedBlocks.length === 0 && (
											<div className="text-center text-accent py-8">
												<p className="noto-sans-jp-light">
													ここにブロックをドラッグ&ドロップしてください
												</p>
											</div>
										)}

										{composedBlocks.map((block, index) => (
											<Draggable
												key={block.id}
												draggableId={block.id}
												index={index}
											>
												{(provided, snapshot) => (
													<div
														ref={provided.innerRef}
														{...provided.draggableProps}
														{...provided.dragHandleProps}
														className={`p-3 rounded-lg bg-main/10 hover:bg-main/20 transition-colors ${
															CATEGORY_COLORS[block.category]
														} ${snapshot.isDragging ? "opacity-50" : ""}`}
													>
														<div className="flex items-start justify-between">
															<div className="flex-1">
																<div className="flex items-center gap-2 mb-1">
																	<span className="text-xs rounded-lg bg-main/10 px-2 py-1 noto-sans-jp-light">
																		{CATEGORY_NAMES[block.category]}
																	</span>
																	<span className="text-sm noto-sans-jp-regular">
																		{block.title}
																	</span>
																</div>
																<p className="text-xs noto-sans-jp-light leading-relaxed whitespace-pre-line">
																	{block.content}
																</p>
															</div>
															<button
																type="button"
																onClick={() => removeComposedBlock(block.id)}
																className="ml-2 p-1 rounded-lg bg-main/10 hover:bg-main/20 focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-base"
															>
																<Trash2 className="w-4 h-4" />
															</button>
														</div>
													</div>
												)}
											</Draggable>
										))}
										{provided.placeholder}
									</div>
								)}
							</Droppable>
						</div>
					</div>

					{/* Variables Input */}
					{allVariables.length > 0 && (
						<div className="space-y-4">
							<h3 className="neue-haas-grotesk-display text-lg text-main">
								変数設定
							</h3>
							<div className="grid-system grid-1 sm:grid-2 lg:grid-3 gap-4">
								{allVariables.map((variable: string) => (
									<div key={variable} className="space-y-1">
										<label
											htmlFor={`var-${variable}`}
											className="text-sm text-main noto-sans-jp-regular"
										>
											{variable}
										</label>
										<input
											id={`var-${variable}`}
											type="text"
											value={variables[variable] || ""}
											onChange={(e) => updateVariable(variable, e.target.value)}
											placeholder={`${variable}を入力...`}
											className="w-full px-3 py-2 rounded-lg bg-main/10 text-main focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-base"
										/>
									</div>
								))}
							</div>
						</div>
					)}

					{/* Email Validation */}
					{showValidation && (
						<div className="space-y-4">
							<h3 className="neue-haas-grotesk-display text-lg text-main">
								メールバリデーション
							</h3>

							<div className="grid-system grid-1 sm:grid-3 gap-4">
								{/* Errors */}
								{validationResult.errors.length > 0 && (
									<div className="bg-red-50 border border-red-300 p-3">
										<div className="flex items-center gap-2 mb-2">
											<AlertCircle className="w-4 h-4 text-red-500" />
											<h4 className="text-sm neue-haas-grotesk-display text-red-800">
												エラー ({validationResult.errors.length})
											</h4>
										</div>
										<ul className="space-y-1">
											{validationResult.errors.map((error) => (
												<li
													key={`error-${error}`}
													className="text-xs text-red-700 noto-sans-jp-light"
												>
													• {error}
												</li>
											))}
										</ul>
									</div>
								)}

								{/* Warnings */}
								{validationResult.warnings.length > 0 && (
									<div className="bg-yellow-50 border border-yellow-300 p-3">
										<div className="flex items-center gap-2 mb-2">
											<AlertCircle className="w-4 h-4 text-yellow-500" />
											<h4 className="text-sm neue-haas-grotesk-display text-yellow-800">
												警告 ({validationResult.warnings.length})
											</h4>
										</div>
										<ul className="space-y-1">
											{validationResult.warnings.map((warning) => (
												<li
													key={`warning-${warning}`}
													className="text-xs text-yellow-700 noto-sans-jp-light"
												>
													• {warning}
												</li>
											))}
										</ul>
									</div>
								)}

								{/* Suggestions */}
								{validationResult.suggestions.length > 0 && (
									<div className="bg-blue-50 border border-blue-300 p-3">
										<div className="flex items-center gap-2 mb-2">
											<CheckCircle className="w-4 h-4 text-blue-500" />
											<h4 className="text-sm neue-haas-grotesk-display text-blue-800">
												提案 ({validationResult.suggestions.length})
											</h4>
										</div>
										<ul className="space-y-1">
											{validationResult.suggestions.map((suggestion) => (
												<li
													key={`suggestion-${suggestion}`}
													className="text-xs text-blue-700 noto-sans-jp-light"
												>
													• {suggestion}
												</li>
											))}
										</ul>
									</div>
								)}

								{/* Success */}
								{validationResult.isValid &&
									validationResult.warnings.length === 0 &&
									validationResult.suggestions.length === 0 && (
										<div className="bg-green-50 border border-green-300 p-3">
											<div className="flex items-center gap-2">
												<CheckCircle className="w-4 h-4 text-green-500" />
												<h4 className="text-sm neue-haas-grotesk-display text-green-800">
													メールは適切に構成されています
												</h4>
											</div>
										</div>
									)}
							</div>
						</div>
					)}

					{/* Generated Email Preview */}
					<div className="space-y-4">
						<div className="flex items-center justify-between">
							<h3 className="neue-haas-grotesk-display text-lg text-main">
								生成されたメール
							</h3>
							<div className="flex gap-2">
								<button
									type="button"
									onClick={copyToClipboard}
									disabled={!generatedEmail}
									className="px-4 py-2 rounded-lg bg-main/10 text-main hover:bg-main/20 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-base flex items-center gap-2 noto-sans-jp-regular"
								>
									<Copy className="w-4 h-4" />
									コピー
								</button>
								<button
									type="button"
									onClick={downloadEmail}
									disabled={!generatedEmail}
									className="px-4 py-2 rounded-lg bg-main/10 text-main hover:bg-main/20 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-base flex items-center gap-2 noto-sans-jp-regular"
								>
									<Download className="w-4 h-4" />
									ダウンロード
								</button>
								<button
									type="button"
									onClick={() => {
										const name = prompt("テンプレート名を入力してください:");
										if (name) {
											const description =
												prompt("テンプレートの説明を入力してください:") || "";
											saveAsTemplate(name, description, "custom");
										}
									}}
									disabled={composedBlocks.length === 0}
									className="px-4 py-2 rounded-lg bg-main/10 text-main hover:bg-main/20 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-base flex items-center gap-2 noto-sans-jp-regular"
								>
									<Save className="w-4 h-4" />
									テンプレート保存
								</button>
							</div>
						</div>

						<div className="rounded-xl bg-base/75 backdrop-blur-md shadow-[0_8px_24px_rgba(0,0,0,0.25)] p-4 min-h-32">
							<pre className="whitespace-pre-wrap text-sm text-main noto-sans-jp-light leading-relaxed">
								{generatedEmail || "メールブロックを追加してください..."}
							</pre>
						</div>
					</div>
				</div>
			</DragDropContext>
		</ToolWrapper>
	);
}
