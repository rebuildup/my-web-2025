export const metadata = {
  title: "samuido - Workshop",
  description: "ブログ、プラグイン、ダウンロード素材",
};

export default function WorkshopLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div>{children}</div>;
}
