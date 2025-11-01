"use client";

import { Paper, ToggleButton, ToggleButtonGroup, Tooltip } from "@mui/material";
import { Bold, Code, Italic, Strikethrough, Underline } from "lucide-react";
import type { EditorCommand } from "@/cms/types/editor";

type IconElement = React.ReactElement;

const BUTTONS: Array<{
	command: EditorCommand;
	icon: IconElement;
	title: string;
}> = [
	{
		command: "toggle-bold",
		icon: <Bold size={16} />,
		title: "Bold (Cmd+B)",
	},
	{
		command: "toggle-italic",
		icon: <Italic size={16} />,
		title: "Italic (Cmd+I)",
	},
	{
		command: "toggle-underline",
		icon: <Underline size={16} />,
		title: "Underline (Cmd+U)",
	},
	{
		command: "toggle-strike",
		icon: <Strikethrough size={16} />,
		title: "Strikethrough (Cmd+Shift+X)",
	},
	{
		command: "toggle-code",
		icon: <Code size={16} />,
		title: "Inline code (Cmd+`)",
	},
];

export interface InlineToolbarProps {
	onCommand?: (command: EditorCommand) => void;
	disabled?: boolean;
}

export function InlineToolbar({
	onCommand,
	disabled = false,
}: InlineToolbarProps) {
	return (
		<Paper
			elevation={8}
			sx={{
				display: "inline-flex",
				borderRadius: 999,
				px: 1,
				py: 0.5,
				alignItems: "center",
				bgcolor: "rgba(12,18,32,0.92)",
				border: (theme) => `1px solid ${theme.palette.divider}`,
				boxShadow: "0 18px 42px rgba(12, 15, 22, 0.4)",
			}}
			role="toolbar"
			aria-label="Inline formatting controls"
		>
			<ToggleButtonGroup size="small" color="primary">
				{BUTTONS.map(({ command, icon, title }) => (
					<Tooltip key={command} title={title}>
						<ToggleButton
							value={command}
							onClick={() => onCommand?.(command)}
							disabled={disabled}
							sx={{ border: "none" }}
						>
							{icon}
						</ToggleButton>
					</Tooltip>
				))}
			</ToggleButtonGroup>
		</Paper>
	);
}
