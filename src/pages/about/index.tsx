import React, { useEffect, useRef } from "react";
import Link from "next/link";
import Layout from "@/components/layout/Layout";
import { gsap } from "gsap";

const AboutPage = () => {
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

  const subpages = [
    {
      title: "Real Name",
      description: "Learn about my real name and its origin.",
      path: "/about/real-name",
    },
    {
      title: "Education",
      description: "My educational background and qualifications.",
      path: "/about/education",
    },
    {
      title: "Experience",
      description: "Professional experience and career history.",
      path: "/about/experience",
    },
    {
      title: "Contact",
      description: "Ways to get in touch with me.",
      path: "/about/contact",
    },
  ];

  return (
    <Layout
      title="About Me"
      description="Learn more about me, my background, and qualifications"
    >
      <div ref={contentRef}>
        <h1 className="text-3xl font-bold text-gray-800 mb-6">About Me</h1>

        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <p className="text-gray-700 mb-4">
            Welcome to the about section of my website. Here you can learn more
            about who I am, my background, experiences, and how to get in touch
            with me.
          </p>
          <p className="text-gray-700">
            Explore the subpages below to discover different aspects of my
            personal and professional life.
          </p>
        </div>

        <h2 className="text-2xl font-bold text-gray-800 mb-4">Explore More</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {subpages.map((page, index) => (
            <Link href={page.path} key={index} className="no-underline">
              <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-primary-500 hover:shadow-lg transition-shadow duration-300">
                <h3 className="text-xl font-bold text-gray-800 mb-2">
                  {page.title}
                </h3>
                <p className="text-gray-600">{page.description}</p>
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

export default AboutPage;
