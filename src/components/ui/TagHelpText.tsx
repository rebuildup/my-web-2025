"use client";

import { Info } from "lucide-react";
import { useState } from "react";

interface TagHelpTextProps {
	className?: string;
}

export function TagHelpText({ className = "" }: TagHelpTextProps) {
	const [isExpanded, setIsExpanded] = useState(false);

	return (
		<div className={`text-xs text-gray-500 ${className}`}>
			<div className="flex items-center gap-2">
				<Info className="w-3 h-3" />
				<span>
					Tags help categorize and search your content.{" "}
					<button
						type="button"
						onClick={() => setIsExpanded(!isExpanded)}
						className="text-blue-600 hover:text-blue-800 underline"
					>
						{isExpanded ? "Show less" : "Learn more"}
					</button>
				</span>
			</div>

			{isExpanded && (
				<div className="mt-2 pl-5 space-y-2 text-gray-600">
					<div>
						<strong>How to use tags:</strong>
					</div>
					<ul className="list-disc list-inside space-y-1 ml-2">
						<li>Type to search existing tags or create new ones</li>
						<li>
							Press Enter to add the first suggested tag or create a new one
						</li>
						<li>Click on suggested tags to add them quickly</li>
						<li>Use descriptive, single-word tags when possible</li>
						<li>
							Common tags: &quot;react&quot;, &quot;typescript&quot;,
							&quot;design&quot;, &quot;video&quot;, etc.
						</li>
					</ul>
					<div>
						<strong>Tips:</strong>
					</div>
					<ul className="list-disc list-inside space-y-1 ml-2">
						<li>
							Tags are automatically normalized (lowercase, no special chars)
						</li>
						<li>Existing tags show usage counts to help you choose</li>
						<li>You can select up to 15 tags per item</li>
						<li>Tags help visitors find related content</li>
					</ul>
				</div>
			)}
		</div>
	);
}
