import type { Block } from "@/cms/types/blocks";
import { adminColor } from "@/components/admin/ui/tokens";

export function UnknownBlock({ block }: { block: Block }) {
	return (
		<div
			style={{
				padding: 24,
				borderRadius: 8,
				backgroundColor: "rgba(239,68,68,0.12)",
				border: `1px dashed ${adminColor.error}`,
				color: adminColor.error,
			}}
		>
			Unsupported block: {block.type}
		</div>
	);
}
