"use client";

import { TagManagementUI } from "@/components/ui/TagManagementUI";
import { clientTagManager } from "@/lib/portfolio/client-tag-manager";
import { useState } from "react";

export default function TagManagementPage() {
	const [selectedTags, setSelectedTags] = useState<string[]>([]);
	const [maxTags, setMaxTags] = useState<number>(10);
	const [allowNewTags, setAllowNewTags] = useState<boolean>(true);

	return (
		<div className="min-h-screen bg-gray-50 py-8">
			<div className="max-w-4xl mx-auto px-4">
				<div className="bg-white rounded-lg shadow-sm border p-6">
					<h1 className="text-2xl font-bold text-gray-900 mb-6">
						Tag Management UI Demo
					</h1>

					{/* Controls */}
					<div className="mb-8 p-4 bg-gray-50 rounded-lg">
						<h2 className="text-lg font-semibold mb-4">Controls</h2>
						<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
							<div>
								<label className="block text-sm font-medium text-gray-700 mb-2">
									Max Tags
								</label>
								<input
									type="number"
									min="1"
									max="20"
									value={maxTags}
									onChange={(e) => setMaxTags(parseInt(e.target.value) || 10)}
									className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
								/>
							</div>

							<div>
								<label className="block text-sm font-medium text-gray-700 mb-2">
									Allow New Tags
								</label>
								<label className="flex items-center">
									<input
										type="checkbox"
										checked={allowNewTags}
										onChange={(e) => setAllowNewTags(e.target.checked)}
										className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
									/>
									<span className="ml-2 text-sm text-gray-600">
										Allow creating new tags
									</span>
								</label>
							</div>

							<div>
								<label className="block text-sm font-medium text-gray-700 mb-2">
									Clear All
								</label>
								<button type="button"
									onClick={() => setSelectedTags([])}
									className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
								>
									Clear Tags
								</button>
							</div>
						</div>
					</div>

					{/* Tag Management UI */}
					<div className="mb-8">
						<h2 className="text-lg font-semibold mb-4">Tag Management</h2>
						<TagManagementUI
							selectedTags={selectedTags}
							onChange={setSelectedTags}
							tagManager={clientTagManager}
							allowNewTags={allowNewTags}
							maxTags={maxTags}
							placeholder="Search or add tags..."
							className="max-w-2xl"
						/>
					</div>

					{/* Selected Tags Display */}
					<div className="mb-8">
						<h2 className="text-lg font-semibold mb-4">Selected Tags</h2>
						<div className="p-4 bg-gray-50 rounded-lg">
							{selectedTags.length > 0 ? (
								<div className="space-y-2">
									<p className="text-sm text-gray-600">
										{selectedTags.length} tag
										{selectedTags.length !== 1 ? "s" : ""} selected:
									</p>
									<pre className="text-sm bg-white p-3 rounded border overflow-x-auto">
										{JSON.stringify(selectedTags, null, 2)}
									</pre>
								</div>
							) : (
								<p className="text-gray-500 italic">No tags selected</p>
							)}
						</div>
					</div>

					{/* Usage Instructions */}
					<div className="border-t pt-6">
						<h2 className="text-lg font-semibold mb-4">Usage Instructions</h2>
						<div className="prose prose-sm max-w-none">
							<ul className="space-y-2 text-gray-600">
								<li>• Click the input field to see available tags</li>
								<li>• Type to search existing tags or create new ones</li>
								<li>• Click on a tag to select it</li>
								<li>
									• Press Enter to select the first filtered tag or create a new
									one
								</li>
								<li>• Press Escape to close the dropdown</li>
								<li>
									• Press Backspace on empty input to remove the last selected
									tag
								</li>
								<li>• Click the X button on selected tags to remove them</li>
								<li>
									• Tag usage counts are displayed and updated automatically
								</li>
							</ul>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
