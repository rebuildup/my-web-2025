import React, { useEffect, useRef } from "react";
import Link from "next/link";
import Layout from "@/components/layout/Layout";
import { gsap } from "gsap";

const PortfolioPage = () => {
  const contentRef = useRef<HTMLDivElement>(null);

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

  const categories = [
    {
      title: "Video",
      description: "Video production and editing projects.",
      path: "/portfolio/video",
    },
    {
      title: "Design",
      description: "Graphic design, UI/UX, and visual projects.",
      path: "/portfolio/design",
    },
    {
      title: "Code",
      description: "Web development and programming projects.",
      path: "/portfolio/code",
    },
  ];

  return (
    <Layout
      title="Portfolio"
      description="Explore my portfolio of work and projects"
    >
      <div ref={contentRef}>
        <h1 className="text-3xl font-bold text-gray-800 mb-6">My Portfolio</h1>

        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <p className="text-gray-700 mb-4">
            Welcome to my portfolio section. Here you can explore the various
            projects I&apos;ve worked on, organized by category.
          </p>
          <p className="text-gray-700">
            Select a category below to view specific projects.
          </p>
        </div>

        <h2 className="text-2xl font-bold text-gray-800 mb-4">Categories</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {categories.map((category, index) => (
            <Link href={category.path} key={index} className="no-underline">
              <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow duration-300 text-center">
                <h3 className="text-xl font-bold text-gray-800 mb-2">
                  {category.title}
                </h3>
                <p className="text-gray-600">{category.description}</p>
                <div className="mt-4 text-primary-500 font-medium">
                  View Projects
                </div>
              </div>
            </Link>
          ))}
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

export default PortfolioPage;
