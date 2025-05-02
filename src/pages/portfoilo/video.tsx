import React, { useEffect, useRef } from "react";
import Link from "next/link";
import Layout from "@/components/layout/Layout";
import { gsap } from "gsap";

const VideoPortfolioPage = () => {
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

  const videoProjects = [
    {
      title: "Project 1",
      description: "A sample video project description.",
      thumbnail: "/images/portfolio/video/placeholder.jpg",
    },
    {
      title: "Project 2",
      description: "Another video project description.",
      thumbnail: "/images/portfolio/video/placeholder.jpg",
    },
    {
      title: "Project 3",
      description: "Yet another video project description.",
      thumbnail: "/images/portfolio/video/placeholder.jpg",
    },
  ];

  return (
    <Layout
      title="Video Portfolio"
      description="Explore my video production and editing projects"
    >
      <div ref={contentRef}>
        <div className="mb-4">
          <Link
            href="/portfolio"
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
            Back to Portfolio
          </Link>
        </div>

        <h1 className="text-3xl font-bold text-gray-800 mb-6">
          Video Projects
        </h1>

        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <p className="text-gray-700">
            Below are some of my video production and editing projects. Each
            project showcases different skills and techniques.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {videoProjects.map((project, index) => (
            <div
              key={index}
              className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300"
            >
              <div className="h-48 bg-gray-200 flex items-center justify-center">
                <span className="text-gray-400">Thumbnail Placeholder</span>
              </div>
              <div className="p-4">
                <h3 className="text-xl font-bold text-gray-800 mb-2">
                  {project.title}
                </h3>
                <p className="text-gray-600">{project.description}</p>
                <button className="mt-4 text-primary-500 font-medium hover:text-primary-700 transition-colors">
                  View Details
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Layout>
  );
};

export default VideoPortfolioPage;
