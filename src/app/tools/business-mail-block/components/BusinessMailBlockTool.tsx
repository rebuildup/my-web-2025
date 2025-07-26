"use client";

import { useState, useCallback, useEffect } from "react";
import ToolWrapper from "../../components/ToolWrapper";
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from "@hello-pangea/dnd";
import { Copy, Download, Trash2, Search, Heart } from "lucide-react";

// Types for mail blocks
interface MailBlock {
  id: string;
  category: "greeting" | "body" | "closing" | "signature";
  title: string;
  content: string;
  variables?: string[];
  isFavorite?: boolean;
  usageCount?: number;
}

interface ComposedBlock extends MailBlock {
  customContent?: string;
  variableValues?: Record<string, string>;
}

// Predefined mail blocks
const MAIL_BLOCKS: MailBlock[] = [
  // Greeting blocks
  {
    id: "greeting-first",
    category: "greeting",
    title: "初回挨拶",
    content: "はじめまして、{company}の{name}です。",
    variables: ["company", "name"],
  },
  {
    id: "greeting-regular",
    category: "greeting",
    title: "継続挨拶",
    content: "いつもお世話になっております。{company}の{name}です。",
    variables: ["company", "name"],
  },
  {
    id: "greeting-seasonal",
    category: "greeting",
    title: "季節挨拶",
    content: "暑い日が続いておりますが、いかがお過ごしでしょうか。",
  },

  // Body blocks
  {
    id: "body-request",
    category: "body",
    title: "依頼",
    content:
      "つきましては、{content}についてご相談させていただきたく存じます。",
    variables: ["content"],
  },
  {
    id: "body-confirm",
    category: "body",
    title: "確認",
    content:
      "ご多忙の中恐縮ですが、{content}についてご確認をお願いいたします。",
    variables: ["content"],
  },
  {
    id: "body-report",
    category: "body",
    title: "報告",
    content: "この度、{content}についてご報告させていただきます。",
    variables: ["content"],
  },

  // Closing blocks
  {
    id: "closing-reply",
    category: "closing",
    title: "返信依頼",
    content: "ご検討のほど、よろしくお願いいたします。",
  },
  {
    id: "closing-contact",
    category: "closing",
    title: "連絡依頼",
    content: "ご不明な点がございましたら、お気軽にお声がけください。",
  },
  {
    id: "closing-cooperation",
    category: "closing",
    title: "協力依頼",
    content: "ご協力のほど、よろしくお願いいたします。",
  },

  // Signature blocks
  {
    id: "signature-basic",
    category: "signature",
    title: "基本署名",
    content: "{company}\n{department}\n{name}\nTEL: {phone}\nEmail: {email}",
    variables: ["company", "department", "name", "phone", "email"],
  },
  {
    id: "signature-custom",
    category: "signature",
    title: "カスタム署名",
    content: "{customSignature}",
    variables: ["customSignature"],
  },
];

const CATEGORY_COLORS = {
  greeting: "bg-base border-foreground text-foreground",
  body: "bg-base border-foreground text-foreground",
  closing: "bg-base border-foreground text-foreground",
  signature: "bg-base border-foreground text-foreground",
};

const CATEGORY_NAMES = {
  greeting: "挨拶",
  body: "本文",
  closing: "締め",
  signature: "署名",
};

export default function BusinessMailBlockTool() {
  const [availableBlocks, setAvailableBlocks] =
    useState<MailBlock[]>(MAIL_BLOCKS);
  const [composedBlocks, setComposedBlocks] = useState<ComposedBlock[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [variables, setVariables] = useState<Record<string, string>>({});
  const [generatedEmail, setGeneratedEmail] = useState("");

  // Filter available blocks
  const filteredBlocks = availableBlocks.filter((block) => {
    const matchesSearch =
      block.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      block.content.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      selectedCategory === "all" || block.category === selectedCategory;
    const matchesFavorites = !showFavoritesOnly || block.isFavorite;

    return matchesSearch && matchesCategory && matchesFavorites;
  });

  // Handle drag end
  const handleDragEnd = useCallback(
    (result: DropResult) => {
      if (!result.destination) return;

      const { source, destination } = result;

      if (
        source.droppableId === "available" &&
        destination.droppableId === "composed"
      ) {
        // Add block to composed area
        const blockToAdd = availableBlocks.find(
          (block) => block.id === result.draggableId
        );
        if (blockToAdd) {
          const newComposedBlock: ComposedBlock = {
            ...blockToAdd,
            id: `${blockToAdd.id}-${Date.now()}`, // Unique ID for composed block
          };

          const newComposedBlocks = [...composedBlocks];
          newComposedBlocks.splice(destination.index, 0, newComposedBlock);
          setComposedBlocks(newComposedBlocks);
        }
      } else if (
        source.droppableId === "composed" &&
        destination.droppableId === "composed"
      ) {
        // Reorder composed blocks
        const newComposedBlocks = [...composedBlocks];
        const [removed] = newComposedBlocks.splice(source.index, 1);
        newComposedBlocks.splice(destination.index, 0, removed);
        setComposedBlocks(newComposedBlocks);
      }
    },
    [availableBlocks, composedBlocks]
  );

  // Remove block from composed area
  const removeComposedBlock = useCallback((blockId: string) => {
    setComposedBlocks((prev) => prev.filter((block) => block.id !== blockId));
  }, []);

  // Toggle favorite
  const toggleFavorite = useCallback((blockId: string) => {
    setAvailableBlocks((prev) =>
      prev.map((block) =>
        block.id === blockId
          ? { ...block, isFavorite: !block.isFavorite }
          : block
      )
    );
  }, []);

  // Update variable value
  const updateVariable = useCallback((key: string, value: string) => {
    setVariables((prev) => ({ ...prev, [key]: value }));
  }, []);

  // Generate email from composed blocks
  const generateEmail = useCallback(() => {
    const emailParts = composedBlocks.map((block) => {
      let content = block.customContent || block.content;

      // Replace variables
      if (block.variables && Array.isArray(block.variables)) {
        block.variables.forEach((variable: string) => {
          const value = variables[variable] || `{${variable}}`;
          content = content.replace(
            new RegExp(`\\{${variable}\\}`, "g"),
            value
          );
        });
      }

      return content;
    });

    const email = emailParts.join("\n\n");
    setGeneratedEmail(email);
  }, [composedBlocks, variables]);

  // Copy to clipboard
  const copyToClipboard = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(generatedEmail);
      // Show success feedback (could add toast notification)
    } catch (error) {
      console.error("Failed to copy to clipboard:", error);
    }
  }, [generatedEmail]);

  // Download as text file
  const downloadEmail = useCallback(() => {
    const blob = new Blob([generatedEmail], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "business-email.txt";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [generatedEmail]);

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleToolShortcut = (event: CustomEvent) => {
      switch (event.detail.key.toLowerCase()) {
        case "c":
          if (generatedEmail) {
            copyToClipboard();
          }
          break;
        case "d":
          if (generatedEmail) {
            downloadEmail();
          }
          break;
        case "r":
          setComposedBlocks([]);
          setVariables({});
          break;
      }
    };

    document.addEventListener(
      "toolShortcut",
      handleToolShortcut as EventListener
    );
    return () =>
      document.removeEventListener(
        "toolShortcut",
        handleToolShortcut as EventListener
      );
  }, [generatedEmail, copyToClipboard, downloadEmail]);

  // Generate email when composed blocks or variables change
  useEffect(() => {
    generateEmail();
  }, [generateEmail]);

  // Get all unique variables from composed blocks
  const allVariables = Array.from(
    new Set(
      composedBlocks.flatMap((block) => (block.variables as string[]) || [])
    )
  );

  return (
    <ToolWrapper
      toolName="Business Mail Block Tool"
      description="ビジネスメールをScratch風ブロックUIで簡単作成。挨拶、本文、締め、署名を組み合わせてプロフェッショナルなメールを作成。"
      category="Business"
      keyboardShortcuts={[
        { key: "c", description: "メールをコピー" },
        { key: "d", description: "メールをダウンロード" },
        { key: "r", description: "全てリセット" },
      ]}
    >
      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="space-y-8">
          {/* Controls */}
          <div className="space-y-4">
            <div className="flex flex-wrap gap-4 items-center">
              <div className="relative flex-1 min-w-64">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-accent" />
                <input
                  type="text"
                  placeholder="ブロックを検索..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-foreground bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
                />
              </div>

              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-4 py-2 border border-foreground bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
              >
                <option value="all">全カテゴリ</option>
                <option value="greeting">挨拶</option>
                <option value="body">本文</option>
                <option value="closing">締め</option>
                <option value="signature">署名</option>
              </select>

              <button
                onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
                className={`px-4 py-2 border border-foreground flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-accent noto-sans-jp-light ${
                  showFavoritesOnly
                    ? "bg-accent text-background"
                    : "bg-background text-foreground"
                }`}
              >
                <Heart className="w-4 h-4" />
                お気に入りのみ
              </button>
            </div>
          </div>

          <div className="grid-system grid-1 lg:grid-2 gap-8">
            {/* Available Blocks */}
            <div className="space-y-4">
              <h2 className="neue-haas-grotesk-display text-xl text-primary">
                利用可能なブロック
              </h2>

              <Droppable droppableId="available" isDropDisabled={true}>
                {(provided) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className="space-y-3 min-h-96 max-h-96 overflow-y-auto border border-foreground p-4"
                  >
                    {filteredBlocks.map((block, index) => (
                      <Draggable
                        key={block.id}
                        draggableId={block.id}
                        index={index}
                      >
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className={`p-3 border border-foreground cursor-move hover:bg-accent hover:text-background transition-colors ${
                              CATEGORY_COLORS[block.category]
                            } ${snapshot.isDragging ? "opacity-50" : ""}`}
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="text-xs bg-background border border-foreground px-2 py-1 noto-sans-jp-light">
                                    {CATEGORY_NAMES[block.category]}
                                  </span>
                                  <span className="text-sm noto-sans-jp-regular">
                                    {block.title}
                                  </span>
                                </div>
                                <p className="text-xs noto-sans-jp-light leading-relaxed whitespace-pre-line">
                                  {block.content}
                                </p>
                                {block.variables && (
                                  <div className="mt-2 flex flex-wrap gap-1">
                                    {block.variables.map((variable) => (
                                      <span
                                        key={variable}
                                        className="text-xs px-2 py-1 bg-background text-accent border border-accent noto-sans-jp-light"
                                      >
                                        {variable}
                                      </span>
                                    ))}
                                  </div>
                                )}
                              </div>
                              <button
                                onClick={() => toggleFavorite(block.id)}
                                className="ml-2 p-1 hover:bg-accent hover:text-background border border-foreground focus:outline-none focus:ring-2 focus:ring-accent"
                              >
                                <Heart
                                  className={`w-4 h-4 ${
                                    block.isFavorite ? "fill-current" : ""
                                  }`}
                                />
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

            {/* Composed Email */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="neue-haas-grotesk-display text-xl text-primary">
                  メール作成エリア
                </h2>
                <button
                  onClick={() => setComposedBlocks([])}
                  className="px-3 py-1 text-xs border border-foreground hover:bg-accent hover:text-background focus:outline-none focus:ring-2 focus:ring-accent flex items-center gap-1 noto-sans-jp-light"
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
                    className="space-y-3 min-h-96 max-h-96 overflow-y-auto border border-foreground p-4 bg-base"
                  >
                    {composedBlocks.length === 0 && (
                      <div className="text-center text-accent py-8">
                        <p className="noto-sans-jp-light">
                          ここにブロックをドラッグ&ドロップしてください
                        </p>
                      </div>
                    )}

                    {composedBlocks.map((block, index) => (
                      <Draggable
                        key={block.id}
                        draggableId={block.id}
                        index={index}
                      >
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className={`p-3 border border-foreground hover:bg-accent hover:text-background transition-colors ${
                              CATEGORY_COLORS[block.category]
                            } ${snapshot.isDragging ? "opacity-50" : ""}`}
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="text-xs bg-background border border-foreground px-2 py-1 noto-sans-jp-light">
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
                                onClick={() => removeComposedBlock(block.id)}
                                className="ml-2 p-1 hover:bg-accent hover:text-background border border-foreground focus:outline-none focus:ring-2 focus:ring-accent"
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
          </div>

          {/* Variables Input */}
          {allVariables.length > 0 && (
            <div className="space-y-4">
              <h3 className="neue-haas-grotesk-display text-lg text-primary">
                変数設定
              </h3>
              <div className="grid-system grid-1 sm:grid-2 lg:grid-3 gap-4">
                {allVariables.map((variable: string) => (
                  <div key={variable} className="space-y-1">
                    <label className="text-sm text-foreground noto-sans-jp-regular">
                      {variable}
                    </label>
                    <input
                      type="text"
                      value={variables[variable] || ""}
                      onChange={(e) => updateVariable(variable, e.target.value)}
                      placeholder={`${variable}を入力...`}
                      className="w-full px-3 py-2 border border-foreground bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Generated Email Preview */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="neue-haas-grotesk-display text-lg text-primary">
                生成されたメール
              </h3>
              <div className="flex gap-2">
                <button
                  onClick={copyToClipboard}
                  disabled={!generatedEmail}
                  className="px-4 py-2 border border-foreground bg-background text-foreground hover:bg-accent hover:text-background disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-accent flex items-center gap-2 noto-sans-jp-regular"
                >
                  <Copy className="w-4 h-4" />
                  コピー
                </button>
                <button
                  onClick={downloadEmail}
                  disabled={!generatedEmail}
                  className="px-4 py-2 border border-foreground bg-background text-foreground hover:bg-accent hover:text-background disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-accent flex items-center gap-2 noto-sans-jp-regular"
                >
                  <Download className="w-4 h-4" />
                  ダウンロード
                </button>
              </div>
            </div>

            <div className="border border-foreground p-4 bg-base min-h-32">
              <pre className="whitespace-pre-wrap text-sm text-foreground noto-sans-jp-light leading-relaxed">
                {generatedEmail || "メールブロックを追加してください..."}
              </pre>
            </div>
          </div>
        </div>
      </DragDropContext>
    </ToolWrapper>
  );
}
