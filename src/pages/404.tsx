// src/pages/404.tsx
import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import Layout from "@/components/layout/Layout";
import { gsap } from "gsap";
import Button from "@/components/ui/Button";
import AnimatedSection from "@/components/ui/AnimatedSection";

const NotFoundPage = () => {
  const router = useRouter();
  const contentRef = useRef<HTMLDivElement>(null);
  const [path, setPath] = useState<string>("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      setPath(window.location.pathname);
    }
  }, []);

  // Recommended links that users might be looking for
  const suggestedLinks = [
    { title: "Home", path: "/" },
    { title: "About", path: "/about" },
    { title: "Portfolio", path: "/portfolio" },
    { title: "Workshop", path: "/workshop" },
    { title: "Tools", path: "/tools" },
  ];

  // Animation for 404 number
  useEffect(() => {
    if (contentRef.current) {
      const el = contentRef.current.querySelector(".number-404");
      if (el) {
        gsap.fromTo(
          el,
          { scale: 0.5, opacity: 0 },
          {
            scale: 1,
            opacity: 1,
            duration: 0.8,
            ease: "elastic.out(1, 0.5)",
          }
        );
      }
    }
  }, []);

  return (
    <Layout
      title="404 - Page Not Found"
      description="The page you're looking for could not be found"
    >
      <div className="min-h-[70vh] flex flex-col items-center justify-center py-12">
        <AnimatedSection
          animation="fadeInUp"
          className="text-center max-w-2xl mx-auto"
        >
          <div className="number-404 text-9xl font-bold text-gradient-primary mb-4 opacity-0">
            404
          </div>

          <h1 className="text-3xl font-bold text-gray-800 mb-6">
            Page Not Found
          </h1>

          <p className="text-xl text-gray-600 mb-8 max-w-md mx-auto">
            The page <span className="font-mono text-primary-500">{path}</span>{" "}
            doesn't exist or has been moved to a new location.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
            <Button
              variant="primary"
              size="lg"
              onClick={() => router.back()}
              icon={
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10 19l-7-7m0 0l7-7m-7 7h18"
                  />
                </svg>
              }
            >
              Go Back
            </Button>

            <Button
              href="/"
              variant="outline"
              size="lg"
              icon={
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                  />
                </svg>
              }
            >
              Return Home
            </Button>
          </div>
        </AnimatedSection>

        <AnimatedSection
          animation="fadeInUp"
          delay={0.3}
          className="w-full max-w-2xl mx-auto"
        >
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">
              Looking for something else?
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 mb-6">
              {suggestedLinks.map((link, index) => (
                <Link
                  key={index}
                  href={link.path}
                  className="bg-gray-50 hover:bg-primary-50 p-3 rounded-md text-center transition-colors no-underline text-gray-700 hover:text-primary-600"
                >
                  {link.title}
                </Link>
              ))}
            </div>

            <div className="mt-4 text-center">
              <p className="text-gray-600 mb-3">
                Still can't find what you're looking for?
              </p>
              <Link
                href="/search"
                className="text-primary-500 hover:text-primary-700 font-medium inline-flex items-center"
              >
                Try searching the site
                <svg
                  className="w-4 h-4 ml-1"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M14 5l7 7m0 0l-7 7m7-7H3"
                  />
                </svg>
              </Link>
            </div>
          </div>
        </AnimatedSection>
      </div>
    </Layout>
  );
};

export default NotFoundPage;
