"use client";

import { ExternalLink } from "@/types/content";
import { useState } from "react";

interface ExternalLinksSectionProps {
	links: ExternalLink[];
	onLinksChange: (links: ExternalLink[]) => void;
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
			setNewLink({
				type: "website",
				url: "",
				title: "",
				description: "",
			});
			setShowAddForm(false); // フォームを閉じる
		}
	};

	const cancelAdd = () => {
		setNewLink({
			type: "website",
			url: "",
			title: "",
			description: "",
		});
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

	const getLinkIcon = (type: ExternalLink["type"]) => {
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
	};

	const inputStyle =
		"w-full border border-main px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-main focus:ring-offset-2 focus:ring-offset-base";
	const labelStyle =
		"block noto-sans-jp-regular text-sm font-medium text-main mb-1";
	const buttonStyle =
		"border border-main px-3 py-1 text-xs hover:bg-main hover:text-base transition-colors focus:outline-none focus:ring-2 focus:ring-main focus:ring-offset-2 focus:ring-offset-base";

	return (
		<div className="space-y-4">
			<div className="flex justify-between items-center">
				<h3 className="neue-haas-grotesk-display text-xl text-main leading-snug">
					External Links
				</h3>
				{!showAddForm && (
					<button
						type="button"
						onClick={() => setShowAddForm(true)}
						className={`${buttonStyle} bg-main text-white border-main hover:bg-main/80`}
					>
						+ Add Link
					</button>
				)}
			</div>

			{/* Add New Link Form - 条件付きで表示 */}
			{showAddForm && (
				<div className="border border-gray-200 p-4 rounded space-y-3">
					<h4 className="noto-sans-jp-regular text-sm font-medium text-main">
						Add New Link
					</h4>

					<div className="grid grid-cols-1 md:grid-cols-2 gap-3">
						<div>
							<label className={labelStyle}>Type</label>
							<select
								value={newLink.type}
								onChange={(e) =>
									setNewLink((prev) => ({
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
								onChange={(e) =>
									setNewLink((prev) => ({ ...prev, title: e.target.value }))
								}
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
							onChange={(e) =>
								setNewLink((prev) => ({ ...prev, url: e.target.value }))
							}
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
								setNewLink((prev) => ({ ...prev, description: e.target.value }))
							}
							className={`${inputStyle} h-20 resize-vertical`}
							placeholder="Optional description"
							rows={2}
						/>
					</div>

					<div className="flex justify-end gap-2">
						<button type="button" onClick={cancelAdd} className={buttonStyle}>
							Cancel
						</button>
						<button
							type="button"
							onClick={addLink}
							className={`${buttonStyle} bg-main text-white border-main hover:bg-main/80`}
							disabled={!newLink.url.trim() || !newLink.title.trim()}
						>
							Add Link
						</button>
					</div>
				</div>
			)}

			{/* Existing Links */}
			{links.length > 0 && (
				<div className="space-y-3">
					<h4 className="noto-sans-jp-regular text-sm font-medium text-main">
						Current Links ({links.length})
					</h4>

					{links.map((link, index) => (
						<div
							key={link.url || `external-link-${index}`}
							className="border border-gray-200 p-4 rounded space-y-3"
						>
							<div className="flex justify-between items-start">
								<div className="flex-1 space-y-3">
									<div className="grid grid-cols-1 md:grid-cols-2 gap-3">
										<div>
											<label className={labelStyle}>Type</label>
											<select
												value={link.type}
												onChange={(e) =>
													updateLink(index, "type", e.target.value)
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
											<label className={labelStyle}>Title</label>
											<input
												type="text"
												value={link.title}
												onChange={(e) =>
													updateLink(index, "title", e.target.value)
												}
												className={inputStyle}
											/>
										</div>
									</div>

									<div>
										<label className={labelStyle}>URL</label>
										<input
											type="url"
											value={link.url}
											onChange={(e) => updateLink(index, "url", e.target.value)}
											className={inputStyle}
										/>
									</div>

									<div>
										<label className={labelStyle}>Description</label>
										<textarea
											value={link.description || ""}
											onChange={(e) =>
												updateLink(index, "description", e.target.value)
											}
											className={`${inputStyle} h-16 resize-vertical`}
											rows={2}
										/>
									</div>
								</div>

								<button
									type="button"
									onClick={() => removeLink(index)}
									className="ml-4 text-red-500 hover:text-red-700 text-sm"
									title="Remove link"
								>
									Remove
								</button>
							</div>

							{/* Preview */}
							<div className="mt-3 p-3 bg-gray-50 rounded">
								<p className="text-xs text-gray-600 mb-2">Preview:</p>
								<div className="flex items-center gap-2">
									<span className="text-lg">{getLinkIcon(link.type)}</span>
									<div className="flex-1">
										<div className="flex items-center gap-2 mb-1">
											<span className="bg-gray-200 text-gray-700 px-2 py-1 text-xs rounded">
												{link.type}
											</span>
											<span className="font-medium text-sm">{link.title}</span>
										</div>
										<a
											href={link.url}
											target="_blank"
											rel="noopener noreferrer"
											className="text-xs text-blue-600 hover:underline break-all"
										>
											{link.url}
										</a>
										{link.description && (
											<p className="text-xs text-gray-600 mt-1">
												{link.description}
											</p>
										)}
									</div>
								</div>
							</div>
						</div>
					))}
				</div>
			)}

			{/* Quick Add Common Links - Add Linkフォームが表示されていない時のみ表示 */}
			{!showAddForm && (
				<div className="border border-gray-200 p-4 rounded">
					<h4 className="noto-sans-jp-regular text-sm font-medium text-main mb-3">
						Quick Add
					</h4>
					<div className="grid grid-cols-2 md:grid-cols-4 gap-2">
						{[
							{
								type: "github" as const,
								title: "GitHub Repository",
								placeholder: "https://github.com/user/repo",
							},
							{
								type: "demo" as const,
								title: "Live Demo",
								placeholder: "https://demo.example.com",
							},
							{
								type: "booth" as const,
								title: "Booth Store",
								placeholder: "https://booth.pm/ja/items/...",
							},
							{
								type: "website" as const,
								title: "Website",
								placeholder: "https://example.com",
							},
						].map((template) => (
							<button
								key={template.type}
								type="button"
								onClick={() => {
									setNewLink({
										type: template.type,
										title: template.title,
										url: "",
										description: "",
									});
									setShowAddForm(true);
								}}
								className={`${buttonStyle} text-center p-2`}
							>
								<div className="text-lg mb-1">{getLinkIcon(template.type)}</div>
								<div className="text-xs">{template.type}</div>
							</button>
						))}
					</div>
				</div>
			)}
		</div>
	);
}
