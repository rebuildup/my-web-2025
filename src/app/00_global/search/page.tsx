import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Search - samuido',
  description: 'サイト内検索機能',
};

export default function SearchPage() {
  return (
    <div className="container-grid">
      <section className="py-16 text-center">
        <h1 className="neue-haas-grotesk-display mb-4 text-4xl text-white md:text-6xl">Search</h1>
        <p className="noto-sans-jp-light mb-8 text-xl text-gray-300 md:text-2xl">サイト内検索</p>
      </section>

      <section className="py-12">
        <div className="card">
          <h2 className="neue-haas-grotesk-display mb-6 text-2xl text-white">検索機能</h2>
          <p className="noto-sans-jp-regular text-gray-300">サイト内検索機能の実装予定です。</p>
        </div>
      </section>
    </div>
  );
}
