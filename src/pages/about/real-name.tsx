import React, { useEffect, useRef } from "react";
import Link from "next/link";
import Layout from "@/components/layout/Layout";
import { gsap } from "gsap";

const RealNamePage = () => {
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

  return (
    <Layout
      title="My Real Name"
      description="Learn about my real name and its origin"
    >
      <div ref={contentRef}>
        <div className="mb-4">
          <Link
            href="/about"
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
            Back to About
          </Link>
        </div>

        <h1 className="text-3xl font-bold text-gray-800 mb-6">My Real Name</h1>

        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <p className="text-gray-700 mb-4">
            This page would contain information about my real name, its meaning,
            origin, and perhaps a story behind it.
          </p>
          <p className="text-gray-700">
            For now, this is a placeholder page as part of the site structure.
          </p>
        </div>
      </div>
    </Layout>
  );
};

export default RealNamePage;
