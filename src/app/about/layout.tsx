export const metadata = {
  title: "samuido - About",
  description: "samuido（Web開発者・デザイナー）について",
};

export default function AboutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div>{children}</div>;
}
