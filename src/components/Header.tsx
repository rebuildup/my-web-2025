"use client";

import Link from "next/link";
import { useState } from "react";

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  return (
    <header className="sticky top-0 z-50 w-full bg-white/95 backdrop-blur-md border-b border-gray-200 dark:bg-gray-900/95 dark:border-gray-800">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center space-x-2 font-bold text-xl tracking-tight text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
          >
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              samuido
            </span>
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link
              href="/about"
              className="text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white font-medium transition-colors duration-200 relative group"
            >
              About
              <span className="absolute inset-x-0 -bottom-1 h-0.5 bg-blue-600 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-200"></span>
            </Link>
            <Link
              href="/portfolio"
              className="text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white font-medium transition-colors duration-200 relative group"
            >
              Portfolio
              <span className="absolute inset-x-0 -bottom-1 h-0.5 bg-blue-600 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-200"></span>
            </Link>
            <Link
              href="/workshop"
              className="text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white font-medium transition-colors duration-200 relative group"
            >
              Workshop
              <span className="absolute inset-x-0 -bottom-1 h-0.5 bg-blue-600 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-200"></span>
            </Link>
            <Link
              href="/tools"
              className="text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white font-medium transition-colors duration-200 relative group"
            >
              Tools
              <span className="absolute inset-x-0 -bottom-1 h-0.5 bg-blue-600 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-200"></span>
            </Link>
          </nav>

          {/* Contact Button */}
          <div className="hidden md:flex items-center space-x-4">
            <Link
              href="/about#contact"
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200 shadow-sm hover:shadow-md"
            >
              Contact
            </Link>
          </div>

          {/* Mobile menu button */}
          <button
            onClick={toggleMenu}
            className="md:hidden p-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-300 dark:hover:text-white dark:hover:bg-gray-800 transition-colors"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <nav className="md:hidden py-4 border-t border-gray-200 dark:border-gray-800">
            <div className="space-y-2">
              <Link
                href="/about"
                className="block px-3 py-2 text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white font-medium transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                About
              </Link>
              <Link
                href="/portfolio"
                className="block px-3 py-2 text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white font-medium transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Portfolio
              </Link>
              <Link
                href="/workshop"
                className="block px-3 py-2 text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white font-medium transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Workshop
              </Link>
              <Link
                href="/tools"
                className="block px-3 py-2 text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white font-medium transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Tools
              </Link>
              <Link
                href="/about#contact"
                className="block mx-3 mt-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors text-center"
                onClick={() => setIsMenuOpen(false)}
              >
                Contact
              </Link>
            </div>
          </nav>
        )}
      </div>
    </header>
  );
}
