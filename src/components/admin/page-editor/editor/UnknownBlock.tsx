import { Box } from "@mui/material";
import type { Block } from "@/cms/types/blocks";

export function UnknownBlock({ block }: { block: Block }) {
	return (
		<Box
			sx={{
				p: 3,
				borderRadius: 2,
				bgcolor: "rgba(239,68,68,0.12)",
				border: (theme) => `1px dashed ${theme.palette.error.main}`,
				color: "error.light",
			}}
		>
			Unsupported block: {block.type}
		</Box>
	);
}
