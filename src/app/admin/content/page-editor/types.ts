import type { Block } from "@/cms/types/blocks";

export interface ToastMessage {
 type: "success" | "error";
 text: string;
}

// SSR/CSR で ID が変わるとハイドレーション不一致が発生するため、
// 初期ブロックは固定 ID で定義して安定化させる
export const INITIAL_BLOCKS: Block[] = [
 {
 id: "initial-paragraph",
 type: "paragraph",
 content: "",
 attributes: {},
 },
];
