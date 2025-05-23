import React, { useEffect, useRef } from "react";
import Link from "next/link";
import Layout from "@/components/layout/Layout";
import { gsap } from "gsap";

const HomePage = () => {
  const sectionsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (sectionsRef.current) {
      const sections = sectionsRef.current.querySelectorAll(".section-card");
      gsap.fromTo(
        sections,
        { opacity: 0, y: 50 },
        {
          opacity: 1,
          y: 0,
          stagger: 0.2,
          duration: 0.8,
          ease: "power3.out",
          delay: 0.5,
        }
      );
    }
  }, []);

  const sections = [
    {
      title: "About",
      description: "Information about me, my background, and contact details.",
      path: "/about",
      icon: "👤",
    },
    {
      title: "Portfolio",
      description: "A showcase of my work, projects, and achievements.",
      path: "/portfolio",
      icon: "🎨",
    },
    {
      title: "Workshop",
      description: "Interactive demos and experiments for you to explore.",
      path: "/workshop",
      icon: "🔧",
    },
    {
      title: "Tools",
      description: "Useful tools and resources available for your use.",
      path: "/tools",
      icon: "🧰",
    },
  ];

  return (
    <Layout
      title="Home | Site Map"
      description="Explore the sections of my website"
    >
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-800 mb-4">
          Welcome to My Site
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Explore the various sections below to learn more about me and my work.
        </p>
      </div>

      <div
        ref={sectionsRef}
        className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto"
      >
        {sections.map((section, index) => (
          <Link href={section.path} key={index} className="no-underline">
            <div className="section-card bg-white rounded-lg shadow-lg p-6 border-2 border-transparent hover:border-primary-500 transition-all duration-300 h-full flex flex-col">
              <div className="text-4xl mb-4">{section.icon}</div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">
                {section.title}
              </h2>
              <p className="text-gray-600 flex-grow">{section.description}</p>
              <div className="mt-4 text-primary-500 font-medium flex items-center">
                Explore {section.title}
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 ml-2"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
            </div>
          </Link>
        ))}
      </div>

      <div className="mt-16 text-center">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Quick Links</h2>
        <div className="flex flex-wrap justify-center gap-4">
          <Link
            href="/privacy-policy"
            className="text-primary-500 hover:text-primary-700 transition-colors"
          >
            Privacy Policy
          </Link>
          <Link
            href="/search"
            className="text-primary-500 hover:text-primary-700 transition-colors"
          >
            Site Search
          </Link>
        </div>
      </div>
    </Layout>
  );
};

export default HomePage;
