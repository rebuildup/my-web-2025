import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '404 - Page Not Found - samuido',
  description: 'ページが見つかりません',
};

export default function NotFoundPage() {
  return (
    <div className="container-grid">
      <section className="py-16 text-center">
        <h1 className="neue-haas-grotesk-display mb-4 text-4xl text-white md:text-6xl">404</h1>
        <p className="noto-sans-jp-light mb-8 text-xl text-gray-300 md:text-2xl">
          ページが見つかりません
        </p>
      </section>

      <section className="py-12">
        <div className="card">
          <h2 className="neue-haas-grotesk-display mb-6 text-2xl text-white">
            404 - Page Not Found
          </h2>
          <p className="noto-sans-jp-regular text-gray-300">
            お探しのページは見つかりませんでした。
          </p>
        </div>
      </section>
    </div>
  );
}
