// src/pages/search.tsx
import React, { useEffect, useRef, useState, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import Layout from "@/components/layout/Layout";
import { gsap } from "gsap";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import AnimatedSection from "@/components/ui/AnimatedSection";

// Type definition for search results
interface SearchResult {
  title: string;
  path: string;
  excerpt: string;
  category: string;
}

// Type definition for search index
interface SearchIndex {
  [key: string]: SearchResult[];
}

const SearchPage = () => {
  const router = useRouter();
  const contentRef = useRef<HTMLDivElement>(null);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [hasSearched, setHasSearched] = useState<boolean>(false);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  // Simulated search index - in a real application, this would be loaded from a JSON file
  // generated during the build process or fetched from an API
  const searchIndex: SearchIndex = {
    about: [
      {
        title: "About Me",
        path: "/about",
        excerpt: "Information about me, my background, and qualifications.",
        category: "About",
      },
      {
        title: "My Real Name",
        path: "/about/real-name",
        excerpt: "Learn about my real name and its origin.",
        category: "About",
      },
      {
        title: "Education",
        path: "/about/education",
        excerpt: "My educational background and qualifications.",
        category: "About",
      },
      {
        title: "Experience",
        path: "/about/experience",
        excerpt: "Professional experience and career history.",
        category: "About",
      },
      {
        title: "Contact Information",
        path: "/about/contact",
        excerpt: "Ways to get in touch with me.",
        category: "About",
      },
    ],
    portfolio: [
      {
        title: "Portfolio Overview",
        path: "/portfolio",
        excerpt: "A showcase of my work, projects, and achievements.",
        category: "Portfolio",
      },
      {
        title: "Video Projects",
        path: "/portfolio/video",
        excerpt: "Video production and editing projects.",
        category: "Portfolio",
      },
      {
        title: "Design Work",
        path: "/portfolio/design",
        excerpt: "Graphic design, UI/UX, and visual projects.",
        category: "Portfolio",
      },
      {
        title: "Code Projects",
        path: "/portfolio/code",
        excerpt: "Web development and programming projects.",
        category: "Portfolio",
      },
    ],
    workshop: [
      {
        title: "Workshop",
        path: "/workshop",
        excerpt: "Interactive demos and experiments for you to explore.",
        category: "Workshop",
      },
      {
        title: "Interactive Demos",
        path: "/workshop/interactive",
        excerpt: "Explore interactive demonstrations and experiments.",
        category: "Workshop",
      },
      {
        title: "Tutorials",
        path: "/workshop/tutorials",
        excerpt: "Step-by-step guides and tutorials on various topics.",
        category: "Workshop",
      },
    ],
    tools: [
      {
        title: "Tools Overview",
        path: "/tools",
        excerpt: "Useful tools and resources available for your use.",
        category: "Tools",
      },
      {
        title: "Calculator",
        path: "/tools/calculator",
        excerpt: "A simple calculator tool for basic calculations.",
        category: "Tools",
      },
      {
        title: "Converter",
        path: "/tools/converter",
        excerpt: "Convert between different units and measurements.",
        category: "Tools",
      },
      {
        title: "Generator",
        path: "/tools/generator",
        excerpt: "Generate various types of content and data.",
        category: "Tools",
      },
    ],
    other: [
      {
        title: "Home",
        path: "/",
        excerpt:
          "Welcome to my personal website. Explore the various sections.",
        category: "Other",
      },
      {
        title: "Privacy Policy",
        path: "/privacy-policy",
        excerpt: "Our privacy policy and how we handle your data.",
        category: "Other",
      },
    ],
  };

  // Get all search results
  const getAllResults = useCallback((): SearchResult[] => {
    return Object.values(searchIndex).flat();
  }, []);

  // Client-side search implementation
  const handleSearch = useCallback(
    (query: string = searchTerm) => {
      setIsSearching(true);
      setHasSearched(true);

      // Update URL with search term for bookmarking/sharing
      router.replace(
        {
          pathname: router.pathname,
          query: { q: query },
        },
        undefined,
        { shallow: true }
      );

      // Simulate network delay for a more realistic search experience
      setTimeout(() => {
        if (query.trim() === "") {
          setSearchResults([]);
          setIsSearching(false);
          return;
        }

        const allResults = getAllResults();
        const normalizedQuery = query.toLowerCase();

        // Search logic - checking title and excerpt for matches
        const results = allResults.filter((result) => {
          return (
            result.title.toLowerCase().includes(normalizedQuery) ||
            result.excerpt.toLowerCase().includes(normalizedQuery)
          );
        });

        setSearchResults(results);
        setIsSearching(false);
      }, 500);
    },
    [searchTerm, router, getAllResults]
  );

  // Get search term from URL query parameters
  useEffect(() => {
    if (router.query.q) {
      const query = Array.isArray(router.query.q)
        ? router.query.q[0]
        : router.query.q;

      setSearchTerm(query);
      if (query.trim() !== "") {
        handleSearch(query);
      }
    }
  }, [router.query.q, handleSearch]);

  // Form submission handler
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSearch();
  };

  // Get unique categories from results
  const getCategories = (): string[] => {
    if (searchResults.length === 0) return [];
    const categories = searchResults.map((result) => result.category);
    return ["all", ...Array.from(new Set(categories))];
  };

  // Filter results by category
  const filteredResults =
    selectedCategory === "all"
      ? searchResults
      : searchResults.filter((result) => result.category === selectedCategory);

  // Animation for search input on mount
  useEffect(() => {
    if (contentRef.current) {
      const searchBox = contentRef.current.querySelector(".search-box");
      if (searchBox) {
        gsap.fromTo(
          searchBox,
          { y: -20, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.6, ease: "power3.out" }
        );
      }
    }
  }, []);

  return (
    <Layout
      title="Site Search"
      description="Search through the website content"
    >
      <div className="max-w-5xl mx-auto py-8 px-4">
        <AnimatedSection animation="fadeInUp" className="mb-6">
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
        </AnimatedSection>

        <div ref={contentRef}>
          <AnimatedSection animation="fadeInDown" className="mb-8 text-center">
            <h1 className="text-3xl font-bold text-gray-800 mb-4">
              Site Search
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Search through the website content to find what you&apos;re
              looking for.
            </p>
          </AnimatedSection>

          <AnimatedSection animation="fadeInUp" className="search-box mb-8">
            <Card className="p-8">
              <form onSubmit={handleSubmit} className="mb-4">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-grow relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg
                        className="h-5 w-5 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                        />
                      </svg>
                    </div>
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="Search the site..."
                      className="pl-10 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring focus:ring-primary-500 focus:ring-opacity-50"
                    />
                  </div>
                  <Button
                    type="submit"
                    variant="primary"
                    isLoading={isSearching}
                  >
                    Search
                  </Button>
                </div>
              </form>

              <div className="text-sm text-gray-500">
                <p>
                  Search for content across the site. Try searching for terms
                  like &ldquo;portfolio&rdquo;, &ldquo;about&rdquo;,
                  &ldquo;tools&rdquo;, etc.
                </p>
              </div>
            </Card>
          </AnimatedSection>

          {/* Search results */}
          {hasSearched && (
            <AnimatedSection animation="fadeInUp" delay={0.3}>
              {isSearching ? (
                <div className="flex justify-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
                </div>
              ) : searchResults.length > 0 ? (
                <div>
                  <div className="flex flex-wrap justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-gray-800">
                      Search Results{" "}
                      <span className="text-lg font-normal text-gray-500">
                        ({searchResults.length} results for &ldquo;{searchTerm}
                        &rdquo;)
                      </span>
                    </h2>

                    {/* Category filter */}
                    {getCategories().length > 1 && (
                      <div className="flex items-center space-x-2 mt-3 md:mt-0">
                        <span className="text-sm text-gray-500">Filter:</span>
                        <div className="flex flex-wrap gap-2">
                          {getCategories().map((category) => (
                            <button
                              key={category}
                              onClick={() => setSelectedCategory(category)}
                              className={`px-3 py-1 text-sm rounded-full transition-colors ${
                                selectedCategory === category
                                  ? "bg-primary-500 text-white"
                                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                              }`}
                            >
                              {category.charAt(0).toUpperCase() +
                                category.slice(1)}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="space-y-4">
                    {filteredResults.map((result, index) => (
                      <Card
                        key={index}
                        hoverable={true}
                        className="transition-all duration-300"
                      >
                        <Link
                          href={result.path}
                          className="block p-6 no-underline hover:no-underline"
                        >
                          <div className="flex justify-between items-start">
                            <h3 className="text-xl font-bold text-primary-500 hover:text-primary-700 transition-colors mb-2">
                              {result.title}
                            </h3>
                            <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full">
                              {result.category}
                            </span>
                          </div>
                          <p className="text-gray-600 mb-1">{result.excerpt}</p>
                          <div className="text-sm text-gray-400">
                            {result.path}
                          </div>
                        </Link>
                      </Card>
                    ))}
                  </div>
                </div>
              ) : (
                <Card className="p-8 text-center">
                  <div className="mb-4">
                    <svg
                      className="h-16 w-16 mx-auto text-gray-300"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-gray-700 mb-2">
                    No results found
                  </h3>
                  <p className="text-gray-500 mb-4">
                    We couldn&apos;t find any matches for &ldquo;{searchTerm}
                    &rdquo;.
                  </p>
                  <div className="max-w-md mx-auto">
                    <h4 className="font-medium text-gray-700 mb-2">
                      Suggestions:
                    </h4>
                    <ul className="text-left text-gray-600 space-y-1 mb-6">
                      <li>• Check your spelling</li>
                      <li>• Try more general keywords</li>
                      <li>• Try different keywords</li>
                      <li>• Try fewer keywords</li>
                    </ul>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setSearchTerm("");
                        setSearchResults([]);
                        setHasSearched(false);
                        router.replace(router.pathname, undefined, {
                          shallow: true,
                        });
                      }}
                    >
                      Clear Search
                    </Button>
                  </div>
                </Card>
              )}
            </AnimatedSection>
          )}

          {/* Common searches if no search performed yet */}
          {!hasSearched && (
            <AnimatedSection animation="fadeInUp" delay={0.4}>
              <Card>
                <div className="p-6">
                  <h2 className="text-xl font-bold text-gray-800 mb-4">
                    Popular Searches
                  </h2>
                  <div className="flex flex-wrap gap-2">
                    {[
                      "portfolio",
                      "projects",
                      "about",
                      "contact",
                      "tools",
                      "workshop",
                    ].map((term) => (
                      <button
                        key={term}
                        onClick={() => {
                          setSearchTerm(term);
                          handleSearch(term);
                        }}
                        className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md transition-colors"
                      >
                        {term}
                      </button>
                    ))}
                  </div>
                </div>
              </Card>
            </AnimatedSection>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default SearchPage;
