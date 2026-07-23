"use client";

import { ExternalLink } from "@/types/content";
import { useState } from "react";

interface ExternalLinksSectionProps {
	links: ExternalLink[];
	onLinksChange: (links: ExternalLink[]) => void;
}

const inputStyle =
	"w-full  px-3 py-2 text-sm   focus: focus:ring-offset-2 focus:ring-offset-base";
const labelStyle = "block noto-sans-jp-regular text-sm font-medium mb-1";
const buttonStyle =
	" px-3 py-1 text-xs hover: hover: transition-colors   focus: focus:ring-offset-2 focus:ring-offset-base";

function getLinkIcon(type: ExternalLink["type"]) {
	switch (type) {
		case "github":
			return "🐙";
		case "demo":
			return "🚀";
		case "booth":
			return "🛍️";
		case "website":
			return "🌐";
		default:
			return "🔗";
	}
}

function LinkPreview({ link }: { link: ExternalLink }) {
	return (
		<div className="mt-3 p-3  rounded">
			<p className="text-xs  mb-2">Preview:</p>
			<div className="flex items-center gap-2">
				<span className="text-lg">{getLinkIcon(link.type)}</span>
				<div className="flex-1">
					<div className="flex items-center gap-2 mb-1">
						<span className="  px-2 py-1 text-xs rounded">{link.type}</span>
						<span className="font-medium text-sm">{link.title}</span>
					</div>
					<a
						href={link.url}
						target="_blank"
						rel="noopener noreferrer"
						className="text-xs  hover:underline break-all"
					>
						{link.url}
					</a>
					{link.description && (
						<p className="text-xs  mt-1">{link.description}</p>
					)}
				</div>
			</div>
		</div>
	);
}

function LinkEditor({
	link,
	index,
	onUpdate,
	onRemove,
}: {
	link: ExternalLink;
	index: number;
	onUpdate: (
		index: number,
		field: keyof ExternalLink,
		value: unknown,
	) => void;
	onRemove: (index: number) => void;
}) {
	return (
		<div key={link.title} className="  p-4 rounded space-y-3">
			<div className="flex justify-between items-start">
				<div className="flex-1 space-y-3">
					<div className="grid grid-cols-1 md:grid-cols-2 gap-3">
						<div>
							<label className={labelStyle} htmlFor={`link-${index}-type`}>
								Type
							</label>
							<select
								id={`link-${index}-type`}
								value={link.type}
								onChange={(e) => onUpdate(index, "type", e.target.value)}
								className={inputStyle}
							>
								<option value="website">Website</option>
								<option value="github">GitHub</option>
								<option value="demo">Demo</option>
								<option value="booth">Booth</option>
								<option value="other">Other</option>
							</select>
						</div>

						<div>
							<label className={labelStyle} htmlFor={`link-${index}-title`}>
								Title
							</label>
							<input
								id={`link-${index}-title`}
								type="text"
								value={link.title}
								onChange={(e) => onUpdate(index, "title", e.target.value)}
								className={inputStyle}
							/>
						</div>
					</div>

					<div>
						<label className={labelStyle} htmlFor={`link-${index}-url`}>
							URL
						</label>
						<input
							id={`link-${index}-url`}
							type="url"
							value={link.url}
							onChange={(e) => onUpdate(index, "url", e.target.value)}
							className={inputStyle}
						/>
					</div>

					<div>
						<label
							className={labelStyle}
							htmlFor={`link-${index}-description`}
						>
							Description
						</label>
						<textarea
							id={`link-${index}-description`}
							value={link.description || ""}
							onChange={(e) => onUpdate(index, "description", e.target.value)}
							className={`${inputStyle} h-16 resize-vertical`}
							rows={2}
						/>
					</div>
				</div>

				<button
					type="button"
					onClick={() => onRemove(index)}
					className="ml-4 text-sm"
					title="Remove link"
				>
					Remove
				</button>
			</div>

			<LinkPreview link={link} />
		</div>
	);
}

function AddLinkForm({
	newLink,
	onChange,
	onAdd,
	onCancel,
}: {
	newLink: ExternalLink;
	onChange: (updater: (prev: ExternalLink) => ExternalLink) => void;
	onAdd: () => void;
	onCancel: () => void;
}) {
	return (
		<div className="  p-4 rounded space-y-3">
			<h4 className="noto-sans-jp-regular text-sm font-medium ">
				Add New Link
			</h4>

			<div className="grid grid-cols-1 md:grid-cols-2 gap-3">
				<div>
					<label className={labelStyle} htmlFor="new-link-type">
						Type
					</label>
					<select
						id="new-link-type"
						value={newLink.type}
						onChange={(e) =>
							onChange((prev) => ({
								...prev,
								type: e.target.value as ExternalLink["type"],
							}))
						}
						className={inputStyle}
					>
						<option value="website">Website</option>
						<option value="github">GitHub</option>
						<option value="demo">Demo</option>
						<option value="booth">Booth</option>
						<option value="other">Other</option>
					</select>
				</div>

				<div>
					<label className={labelStyle}>Title *</label>
					<input
						type="text"
						value={newLink.title}
						onChange={(e) => onChange((prev) => ({ ...prev, title: e.target.value }))}
						className={inputStyle}
						placeholder="Link title"
						autoComplete="off"
					/>
				</div>
			</div>

			<div>
				<label className={labelStyle}>URL *</label>
				<input
					type="url"
					value={newLink.url}
					onChange={(e) => onChange((prev) => ({ ...prev, url: e.target.value }))}
					className={inputStyle}
					placeholder="https://example.com"
					autoComplete="off"
				/>
			</div>

			<div>
				<label className={labelStyle}>Description</label>
				<textarea
					value={newLink.description || ""}
					onChange={(e) =>
						onChange((prev) => ({ ...prev, description: e.target.value }))
					}
					className={`${inputStyle} h-20 resize-vertical`}
					placeholder="Optional description"
					rows={2}
				/>
			</div>

			<div className="flex justify-end gap-2">
				<button type="button" onClick={onCancel} className={buttonStyle}>
					Cancel
				</button>
				<button
					type="button"
					onClick={onAdd}
					className={`${buttonStyle}`}
					disabled={!newLink.url.trim() || !newLink.title.trim()}
				>
					Add Link
				</button>
			</div>
		</div>
	);
}

function QuickAddTemplates({
	onSelect,
}: {
	onSelect: (template: { type: ExternalLink["type"]; title: string }) => void;
}) {
	const templates: { type: ExternalLink["type"]; title: string; placeholder: string }[] = [
		{ type: "github", title: "GitHub Repository", placeholder: "https://github.com/user/repo" },
		{ type: "demo", title: "Live Demo", placeholder: "https://demo.example.com" },
		{ type: "booth", title: "Booth Store", placeholder: "https://booth.pm/ja/items/..." },
		{ type: "website", title: "Website", placeholder: "https://example.com" },
	];
	return (
		<div className="  p-4 rounded">
			<h4 className="noto-sans-jp-regular text-sm font-medium mb-3">
				Quick Add
			</h4>
			<div className="grid grid-cols-2 md:grid-cols-4 gap-2">
				{templates.map((template) => (
					<button
						key={template.type}
						type="button"
						onClick={() => onSelect({ type: template.type, title: template.title })}
						className={`${buttonStyle} text-center p-2`}
					>
						<div className="text-lg mb-1">{getLinkIcon(template.type)}</div>
						<div className="text-xs">{template.type}</div>
					</button>
				))}
			</div>
		</div>
	);
}

export function ExternalLinksSection({
	links,
	onLinksChange,
}: ExternalLinksSectionProps) {
	const [newLink, setNewLink] = useState<ExternalLink>({
		type: "website",
		url: "",
		title: "",
		description: "",
	});
	const [showAddForm, setShowAddForm] = useState(false);

	const addLink = () => {
		if (newLink.url.trim() && newLink.title.trim()) {
			onLinksChange([...links, { ...newLink }]);
			setNewLink({ type: "website", url: "", title: "", description: "" });
			setShowAddForm(false);
		}
	};

	const cancelAdd = () => {
		setNewLink({ type: "website", url: "", title: "", description: "" });
		setShowAddForm(false);
	};

	const updateLink = (
		index: number,
		field: keyof ExternalLink,
		value: unknown,
	) => {
		const updatedLinks = links.map((link, i) =>
			i === index ? { ...link, [field]: value } : link,
		);
		onLinksChange(updatedLinks);
	};

	const removeLink = (index: number) => {
		onLinksChange(links.filter((_, i) => i !== index));
	};

	const handleTemplateSelect = (template: {
		type: ExternalLink["type"];
		title: string;
	}) => {
		setNewLink({ type: template.type, title: template.title, url: "", description: "" });
		setShowAddForm(true);
	};

	return (
		<div className="space-y-4">
			<div className="flex justify-between items-center">
				<h3 className="neue-haas-grotesk-display text-xl leading-snug">
					External Links
				</h3>
				{!showAddForm && (
					<button
						type="button"
						onClick={() => setShowAddForm(true)}
						className={`${buttonStyle}`}
					>
						+ Add Link
					</button>
				)}
			</div>

			{showAddForm && (
				<AddLinkForm
					newLink={newLink}
					onChange={setNewLink}
					onAdd={addLink}
					onCancel={cancelAdd}
				/>
			)}

			{links.length > 0 && (
				<div className="space-y-3">
					<h4 className="noto-sans-jp-regular text-sm font-medium ">
						Current Links ({links.length})
					</h4>
					{links.map((link, index) => (
						<LinkEditor
							key={link.title}
							link={link}
							index={index}
							onUpdate={updateLink}
							onRemove={removeLink}
						/>
					))}
				</div>
			)}

			{!showAddForm && <QuickAddTemplates onSelect={handleTemplateSelect} />}
		</div>
	);
}
