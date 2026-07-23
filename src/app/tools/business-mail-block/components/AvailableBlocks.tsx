import { Draggable, Droppable } from "@hello-pangea/dnd";
import { Heart, Trash2 } from "lucide-react";
import { CATEGORY_COLORS, CATEGORY_NAMES } from "./constants";
import type { MailBlock } from "./types";

interface AvailableBlocksProps {
	filteredBlocks: MailBlock[];
	toggleFavorite: (blockId: string) => void;
	removeCustomBlock: (blockId: string) => void;
}

export default function AvailableBlocks({
	filteredBlocks,
	toggleFavorite,
	removeCustomBlock,
}: AvailableBlocksProps) {
	return (
		<div className="space-y-4">
			<h2 className="neue-haas-grotesk-display text-xl ">利用可能なブロック</h2>

			<Droppable droppableId="available" isDropDisabled={true}>
				{(provided) => (
					<div
						ref={provided.innerRef}
						{...provided.droppableProps}
						className="space-y-3 min-h-96 max-h-96 overflow-y-auto rounded-xl  shadow-[0_8px_24px_rgba(0,0,0,0.25)] p-4"
					>
						{filteredBlocks.map((block, index) => (
							<Draggable key={block.id} draggableId={block.id} index={index}>
								{(provided, snapshot) => (
									<div
										ref={provided.innerRef}
										{...provided.draggableProps}
										{...provided.dragHandleProps}
										className={`p-3 rounded-lg cursor-move hover:/20 transition-colors ${
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
													{block.formality && (
														<span
															className={`text-xs px-2 py-1  ${
																block.formality === "formal"
																	? "  "
																	: block.formality === "casual"
																		? "  "
																		: "  "
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
																className="text-xs px-1 py-0.5    "
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
																className="text-xs px-2 py-1    noto-sans-jp-light"
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
													className="p-1"
													aria-label={
														block.isFavorite
															? "お気に入りから削除"
															: "お気に入りに追加"
													}
												>
													<Heart
														className={`w-4 h-4 ${block.isFavorite ? "" : ""}`}
													/>
												</button>
												{block.isCustom && (
													<button
														type="button"
														onClick={() => removeCustomBlock(block.id)}
														className="p-1"
														aria-label="カスタムブロックを削除"
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
	);
}
