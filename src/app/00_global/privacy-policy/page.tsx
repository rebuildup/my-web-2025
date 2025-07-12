import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy - samuido',
  description: 'プライバシーポリシー',
};

export default function PrivacyPolicyPage() {
  return (
    <div className="container-grid">
      <section className="py-16 text-center">
        <h1 className="neue-haas-grotesk-display mb-4 text-4xl text-white md:text-6xl">
          Privacy Policy
        </h1>
        <p className="noto-sans-jp-light mb-8 text-xl text-gray-300 md:text-2xl">
          プライバシーポリシー
        </p>
      </section>

      <section className="py-12">
        <div className="card">
          <h2 className="neue-haas-grotesk-display mb-6 text-2xl text-white">
            プライバシーポリシー
          </h2>
          <p className="noto-sans-jp-regular text-gray-300">
            プライバシーポリシーの詳細をここに記載します。
          </p>
        </div>
      </section>
    </div>
  );
}
