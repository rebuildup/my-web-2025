// src/components/ui/MaintenanceMode.tsx
import React, { useEffect, useRef } from "react";
import Head from "next/head";
import { gsap } from "gsap";

interface MaintenanceModeProps {
  title?: string;
  message?: string;
  estimatedCompletion?: string;
  showCountdown?: boolean;
  contactEmail?: string;
}

const MaintenanceMode: React.FC<MaintenanceModeProps> = ({
  title = "Site Under Maintenance",
  message = "We're currently performing scheduled maintenance. Please check back soon!",
  estimatedCompletion = "",
  showCountdown = false,
  contactEmail = "support@example.com",
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const gearRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Fade in animation
    if (containerRef.current) {
      gsap.fromTo(
        containerRef.current,
        { opacity: 0 },
        { opacity: 1, duration: 0.8, ease: "power2.out" }
      );
    }

    // Rotate the gear continuously
    if (gearRef.current) {
      gsap.to(gearRef.current, {
        rotation: 360,
        repeat: -1,
        duration: 8,
        ease: "none",
      });
    }

    // Stagger in the content
    if (contentRef.current) {
      gsap.fromTo(
        contentRef.current.children,
        { y: 20, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          stagger: 0.15,
          delay: 0.3,
          duration: 0.6,
          ease: "power3.out",
        }
      );
    }
  }, []);

  return (
    <>
      <Head>
        <title>{title}</title>
        <meta name="robots" content="noindex, nofollow" />
      </Head>
      <div
        ref={containerRef}
        className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 flex items-center justify-center px-4 py-12"
      >
        <div className="max-w-md w-full bg-white rounded-xl shadow-xl overflow-hidden">
          <div className="bg-primary-500 p-6 text-white text-center">
            <div className="relative mx-auto w-24 h-24 mb-4">
              <div
                ref={gearRef}
                className="absolute inset-0 flex items-center justify-center"
              >
                <svg
                  className="w-20 h-20"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    fillRule="evenodd"
                    d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-8 h-8 bg-white rounded-full"></div>
              </div>
            </div>
            <h1 className="text-2xl font-bold">{title}</h1>
          </div>

          <div ref={contentRef} className="p-8 space-y-6">
            <p className="text-gray-600 text-center">{message}</p>

            {estimatedCompletion && (
              <div className="text-center">
                <p className="text-sm text-gray-500 mb-1">
                  Estimated completion:
                </p>
                <p className="font-medium text-gray-800">
                  {estimatedCompletion}
                </p>
              </div>
            )}

            {showCountdown && estimatedCompletion && (
              <div className="bg-gray-50 rounded-lg p-4 text-center">
                <p className="text-sm text-gray-500 mb-2">Time remaining:</p>
                <div className="flex justify-center space-x-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary-500">
                      00
                    </div>
                    <div className="text-xs text-gray-500">Hours</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary-500">
                      00
                    </div>
                    <div className="text-xs text-gray-500">Minutes</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary-500">
                      00
                    </div>
                    <div className="text-xs text-gray-500">Seconds</div>
                  </div>
                </div>
              </div>
            )}

            <div className="text-center text-sm text-gray-500">
              <p>
                Questions or concerns?{" "}
                <a
                  href={`mailto:${contactEmail}`}
                  className="text-primary-500 hover:text-primary-600 transition-colors"
                >
                  Contact us
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default MaintenanceMode;
