import { Draggable, Droppable } from "@hello-pangea/dnd";
import { Trash2 } from "lucide-react";
import { CATEGORY_COLORS, CATEGORY_NAMES } from "./constants";
import type { ComposedBlock } from "./types";

interface ComposedBlocksProps {
	composedBlocks: ComposedBlock[];
	removeComposedBlock: (blockId: string) => void;
	resetComposedBlocks: () => void;
}

export default function ComposedBlocks({
	composedBlocks,
	removeComposedBlock,
	resetComposedBlocks,
}: ComposedBlocksProps) {
	return (
		<div className="space-y-4">
			<div className="flex items-center justify-between">
				<h2 className="neue-haas-grotesk-display text-xl ">メール作成エリア</h2>
				<button
					type="button"
					onClick={resetComposedBlocks}
					className="px-3 py-1 text-xs flex items-center gap-1 noto-sans-jp-light"
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
						className="space-y-3 min-h-96 max-h-96 overflow-y-auto rounded-xl  shadow-[0_8px_24px_rgba(0,0,0,0.25)] p-4"
					>
						{composedBlocks.length === 0 && (
							<div className="text-center  py-8">
								<p className="noto-sans-jp-light">
									ここにブロックをドラッグ&ドロップしてください
								</p>
							</div>
						)}

						{composedBlocks.map((block, index) => (
							<Draggable key={block.id} draggableId={block.id} index={index}>
								{(provided, snapshot) => (
									<div
										ref={provided.innerRef}
										{...provided.draggableProps}
										{...provided.dragHandleProps}
										className={`p-3 rounded-lg hover:/20 transition-colors ${
											CATEGORY_COLORS[block.category]
										} ${snapshot.isDragging ? "" : ""}`}
									>
										<div className="flex items-start justify-between">
											<div className="flex-1">
												<div className="flex items-center gap-2 mb-1">
													<span className="text-xs rounded-lg px-2 py-1 noto-sans-jp-light">
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
												className="ml-2 p-1"
												aria-label={`「${block.title}」を構成から削除`}
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
	);
}
