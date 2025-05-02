import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Layout from "@/components/layout/Layout";
import { gsap } from "gsap";

const SearchPage = () => {
  const contentRef = useRef<HTMLDivElement>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);

  useEffect(() => {
    if (contentRef.current) {
      gsap.fromTo(
        contentRef.current.children,
        { opacity: 0, y: 20 },
        {
          opacity: 1,
          y: 0,
          stagger: 0.15,
          duration: 0.6,
          ease: "power2.out",
        }
      );
    }
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();

    // In a real implementation, this would call an API or search through site content
    // For now, we'll just simulate some results
    if (searchTerm.trim() === "") {
      setSearchResults([]);
      return;
    }

    const dummyResults = [
      {
        title: "About Page",
        path: "/about",
        excerpt: "Information about me and my background.",
      },
      {
        title: "Portfolio",
        path: "/portfolio",
        excerpt: "Explore my work and projects.",
      },
      {
        title: "Workshop",
        path: "/workshop",
        excerpt: "Interactive demos and tutorials.",
      },
      {
        title: "Tools",
        path: "/tools",
        excerpt: "Useful tools and resources.",
      },
    ].filter(
      (item) =>
        item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.excerpt.toLowerCase().includes(searchTerm.toLowerCase())
    );

    setSearchResults(dummyResults);
  };

  return (
    <Layout
      title="Site Search"
      description="Search through the website content"
    >
      <div ref={contentRef}>
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Site Search</h1>

        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <form onSubmit={handleSearch} className="mb-6">
            <div className="flex">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search the site..."
                className="flex-grow px-4 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
              <button
                type="submit"
                className="bg-primary-500 text-white px-6 py-2 rounded-r-md hover:bg-primary-600 transition-colors"
              >
                Search
              </button>
            </div>
          </form>

          {searchResults.length > 0 ? (
            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-4">
                Search Results
              </h2>
              <div className="space-y-4">
                {searchResults.map((result, index) => (
                  <div
                    key={index}
                    className="border-b border-gray-200 pb-4 last:border-b-0"
                  >
                    <h3 className="text-xl font-bold text-gray-800 mb-1">
                      <Link
                        href={result.path}
                        className="text-primary-500 hover:text-primary-700 transition-colors"
                      >
                        {result.title}
                      </Link>
                    </h3>
                    <p className="text-gray-600">{result.excerpt}</p>
                  </div>
                ))}
              </div>
            </div>
          ) : searchTerm ? (
            <div className="text-center py-6">
              <p className="text-gray-600">
                No results found for "{searchTerm}".
              </p>
            </div>
          ) : (
            <div className="text-center py-6">
              <p className="text-gray-600">
                Enter a search term to find content across the site.
              </p>
            </div>
          )}
        </div>

        <Link
          href="/"
          className="inline-flex items-center text-primary-500 hover:text-primary-700 transition-colors"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 mr-2"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z"
              clipRule="evenodd"
            />
          </svg>
          Back to Home
        </Link>
      </div>
    </Layout>
  );
};

export default SearchPage;
