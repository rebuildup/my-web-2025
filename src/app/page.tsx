import Image from "next/image";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      {/* Navigation */}
      <nav className="p-6 flex justify-between items-center backdrop-blur-sm bg-white/70 dark:bg-slate-900/70 border-b border-slate-200/50 dark:border-slate-700/50">
        <div className="text-2xl font-bold text-slate-800 dark:text-slate-100">
          Portfolio
        </div>
        <div className="hidden md:flex space-x-8">
          <a
            href="#about"
            className="text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100 transition-colors"
          >
            About
          </a>
          <a
            href="#projects"
            className="text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100 transition-colors"
          >
            Projects
          </a>
          <a
            href="#contact"
            className="text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100 transition-colors"
          >
            Contact
          </a>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="container mx-auto px-6 py-20">
        <div className="text-center space-y-8">
          <div className="space-y-4">
            <h1 className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-slate-800 via-slate-700 to-slate-600 dark:from-slate-100 dark:via-slate-200 dark:to-slate-300 bg-clip-text text-transparent">
              Hello, I'm Alex
            </h1>
            <p className="text-xl md:text-2xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
              Full-stack developer passionate about creating beautiful,
              functional web experiences
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <button className="px-8 py-4 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 rounded-xl font-semibold hover:bg-slate-800 dark:hover:bg-slate-200 transition-colors shadow-lg hover:shadow-xl">
              View My Work
            </button>
            <button className="px-8 py-4 border-2 border-slate-900 dark:border-slate-100 text-slate-900 dark:text-slate-100 rounded-xl font-semibold hover:bg-slate-900 hover:text-white dark:hover:bg-slate-100 dark:hover:text-slate-900 transition-colors">
              Get In Touch
            </button>
          </div>
        </div>

        {/* Features Grid */}
        <div className="mt-32 grid md:grid-cols-3 gap-8">
          <div className="bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm p-8 rounded-2xl border border-slate-200/50 dark:border-slate-700/50 hover:shadow-xl transition-shadow">
            <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center mb-6">
              <svg
                className="w-6 h-6 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"
                />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-3 text-slate-800 dark:text-slate-100">
              Frontend Development
            </h3>
            <p className="text-slate-600 dark:text-slate-300">
              Building responsive and interactive user interfaces with modern
              frameworks and technologies.
            </p>
          </div>

          <div className="bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm p-8 rounded-2xl border border-slate-200/50 dark:border-slate-700/50 hover:shadow-xl transition-shadow">
            <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center mb-6">
              <svg
                className="w-6 h-6 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01"
                />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-3 text-slate-800 dark:text-slate-100">
              Backend Development
            </h3>
            <p className="text-slate-600 dark:text-slate-300">
              Creating robust server-side applications and APIs with scalable
              architecture and best practices.
            </p>
          </div>

          <div className="bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm p-8 rounded-2xl border border-slate-200/50 dark:border-slate-700/50 hover:shadow-xl transition-shadow">
            <div className="w-12 h-12 bg-purple-500 rounded-xl flex items-center justify-center mb-6">
              <svg
                className="w-6 h-6 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zM21 5a2 2 0 00-2-2h-4a2 2 0 00-2 2v12a4 4 0 004 4h4a2 2 0 002-2V5z"
                />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-3 text-slate-800 dark:text-slate-100">
              UI/UX Design
            </h3>
            <p className="text-slate-600 dark:text-slate-300">
              Designing intuitive and beautiful user experiences that delight
              users and drive engagement.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-32 py-12 border-t border-slate-200/50 dark:border-slate-700/50 backdrop-blur-sm bg-white/30 dark:bg-slate-900/30">
        <div className="container mx-auto px-6 text-center">
          <p className="text-slate-600 dark:text-slate-400">
            © 2025 Alex Portfolio. Built with Next.js and Tailwind CSS v4.
          </p>
        </div>
      </footer>
    </div>
  );
}
