import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Layout from "@/components/layout/Layout";
import { gsap } from "gsap";

const InteractivePage = () => {
  const contentRef = useRef<HTMLDivElement>(null);
  const [counter, setCounter] = useState(0);

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

  const incrementCounter = () => {
    setCounter((prev) => prev + 1);

    // Simple animation for the counter
    const counterElement = document.getElementById("counter-value");
    if (counterElement) {
      gsap.fromTo(
        counterElement,
        { scale: 1.5, color: "#0075ff" },
        { scale: 1, color: "#333333", duration: 0.5 }
      );
    }
  };

  return (
    <Layout
      title="Interactive Demos"
      description="Explore interactive demonstrations and experiments"
    >
      <div ref={contentRef}>
        <div className="mb-4">
          <Link
            href="/workshop"
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
            Back to Workshop
          </Link>
        </div>

        <h1 className="text-3xl font-bold text-gray-800 mb-6">
          Interactive Demos
        </h1>

        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <p className="text-gray-700 mb-4">
            This page contains interactive demonstrations and experiments that
            showcase various concepts and techniques.
          </p>
          <p className="text-gray-700">
            Try out the demos below to see them in action.
          </p>
        </div>

        <h2 className="text-2xl font-bold text-gray-800 mb-4">
          Simple Counter Demo
        </h2>

        <div className="bg-white rounded-lg shadow-md p-6 mb-8 text-center">
          <div className="mb-4">
            <p className="text-gray-700 mb-2">
              Click the button below to increment the counter. Watch for the
              animation effect.
            </p>
            <div className="text-4xl font-bold my-6" id="counter-value">
              {counter}
            </div>
            <button
              onClick={incrementCounter}
              className="bg-primary-500 text-white px-6 py-2 rounded-md hover:bg-primary-600 transition-colors"
            >
              Increment
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default InteractivePage;
