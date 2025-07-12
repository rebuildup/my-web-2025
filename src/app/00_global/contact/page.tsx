import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Contact - samuido',
  description: 'お問い合わせフォーム',
};

export default function ContactPage() {
  return (
    <div className="container-grid">
      <section className="py-16 text-center">
        <h1 className="neue-haas-grotesk-display mb-4 text-4xl text-white md:text-6xl">Contact</h1>
        <p className="noto-sans-jp-light mb-8 text-xl text-gray-300 md:text-2xl">お問い合わせ</p>
      </section>

      <section className="py-12">
        <div className="card">
          <h2 className="neue-haas-grotesk-display mb-6 text-2xl text-white">
            お問い合わせフォーム
          </h2>
          <p className="noto-sans-jp-regular text-gray-300">お問い合わせフォームの実装予定です。</p>
        </div>
      </section>
    </div>
  );
}
