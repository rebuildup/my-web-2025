"use client";

import dynamic from "next/dynamic";

const ProtoTypeApp = dynamic(() => import("./ProtoTypeApp"), {
  ssr: false,
  loading: () => (
    <div
      className="min-h-screen flex items-center justify-center"
      style={{
        backgroundColor: "var(--ProtoTypeMainBG, #000000)",
        color: "var(--ProtoTypeMainColor, #ffffff)",
      }}
    >
      <div className="text-center">
        <div className="text-2xl mb-4">Loading ProtoType...</div>
        <div className="text-sm opacity-70">
          タイピングゲームを読み込み中...
        </div>
      </div>
    </div>
  ),
});

export default function ProtoTypeClient() {
  return <ProtoTypeApp />;
}
