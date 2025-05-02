import React, { useEffect, useRef } from "react";
import Link from "next/link";
import Layout from "@/components/layout/Layout";
import { gsap } from "gsap";

const WorkshopPage = () => {
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

  const workshopItems = [
    {
      title: "Interactive Demos",
      description: "Explore interactive demonstrations and experiments.",
      path: "/workshop/interactive",
    },
    {
      title: "Tutorials",
      description: "Step-by-step guides and tutorials on various topics.",
      path: "/workshop/tutorials",
    },
  ];

  return (
    <Layout
      title="Workshop"
      description="Explore interactive demos and tutorials"
    >
      <div ref={contentRef}>
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Workshop</h1>

        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <p className="text-gray-700 mb-4">
            Welcome to my workshop section. This is where you can find
            interactive demonstrations, experiments, and tutorials on various
            topics.
          </p>
          <p className="text-gray-700">Select a category below to explore.</p>
        </div>

        <h2 className="text-2xl font-bold text-gray-800 mb-4">
          Available Resources
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {workshopItems.map((item, index) => (
            <Link href={item.path} key={index} className="no-underline">
              <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow duration-300 text-center h-full flex flex-col">
                <h3 className="text-xl font-bold text-gray-800 mb-2">
                  {item.title}
                </h3>
                <p className="text-gray-600 flex-grow">{item.description}</p>
                <div className="mt-4 text-primary-500 font-medium">Explore</div>
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

export default WorkshopPage;
