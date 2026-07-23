import type { MailTemplate } from "./types";
import { CATEGORY_NAMES } from "./constants";

interface TemplateLibraryProps {
	templates: MailTemplate[];
	selectedTemplate: string;
	loadTemplate: (templateId: string) => void;
	exportTemplate: (templateId: string) => void;
	deleteTemplate: (templateId: string) => void;
	onClose: () => void;
}

export default function TemplateLibrary({
	templates,
	selectedTemplate,
	loadTemplate,
	exportTemplate,
	deleteTemplate,
	onClose,
}: TemplateLibraryProps) {
	return (
		<div className="space-y-4 rounded-xl  shadow-[0_8px_24px_rgba(0,0,0,0.25)] p-4">
			<div className="flex items-center justify-between">
				<h2 className="neue-haas-grotesk-display text-xl ">
					テンプレートライブラリ
				</h2>
				<button type="button" onClick={onClose} className="">
					×
				</button>
			</div>

			<div className="grid-system grid-1 sm:grid-2 lg:grid-3 gap-4">
				{templates.map((template) => (
					<div
						key={template.id}
						className={`rounded-lg p-3 hover:/20 transition-colors ${
							selectedTemplate === template.id ? " " : ""
						}`}
					>
						<div className="space-y-2">
							<div className="flex items-start justify-between">
								<h3 className="noto-sans-jp-regular text-sm">
									{template.name}
								</h3>
								<div className="flex gap-1">
									{template.isBuiltIn && (
										<span className="text-xs px-2 py-1    ">内蔵</span>
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
										className="text-xs px-2 py-1 rounded-lg"
									>
										{CATEGORY_NAMES[block.category]}
									</span>
								))}
							</div>
							<div className="flex gap-2 pt-2">
								<button
									type="button"
									onClick={() => loadTemplate(template.id)}
									className="text-xs px-3 py-1"
								>
									読み込み
								</button>
								<button
									type="button"
									onClick={() => exportTemplate(template.id)}
									className="text-xs px-3 py-1"
								>
									エクスポート
								</button>
								{!template.isBuiltIn && (
									<button
										type="button"
										onClick={() => deleteTemplate(template.id)}
										className="text-xs px-3 py-1"
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
	);
}
