// src/pages/privacy-policy.tsx
import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Layout from "@/components/layout/Layout";
import { gsap } from "gsap";
import Button from "@/components/ui/Button";
import AnimatedSection from "@/components/ui/AnimatedSection";
import Card from "@/components/ui/Card";

const PrivacyPolicyPage = () => {
  const contentRef = useRef<HTMLDivElement>(null);
  const [activeSection, setActiveSection] = useState<string>("introduction");

  // Automatic scrolling to anchors
  useEffect(() => {
    if (typeof window !== "undefined") {
      const hash = window.location.hash.slice(1);
      if (hash) {
        setTimeout(() => {
          const element = document.getElementById(hash);
          if (element) {
            element.scrollIntoView({ behavior: "smooth" });
            setActiveSection(hash);
          }
        }, 500);
      }
    }
  }, []);

  // Handle section link clicks
  const handleSectionClick = (sectionId: string) => {
    setActiveSection(sectionId);
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  // Privacy policy sections
  const sections = [
    { id: "introduction", title: "Introduction" },
    { id: "information-collection", title: "Information Collection" },
    { id: "information-usage", title: "Information Usage" },
    { id: "information-protection", title: "Information Protection" },
    { id: "cookies", title: "Cookies" },
    { id: "third-party", title: "Third-Party Services" },
    { id: "childrens-privacy", title: "Children's Privacy" },
    { id: "changes", title: "Changes to Policy" },
    { id: "contact", title: "Contact Information" },
  ];

  // Last updated date
  const lastUpdated = "May 1, 2025";

  return (
    <Layout
      title="Privacy Policy"
      description="Our privacy policy and how we handle your data"
    >
      <div className="container-custom max-w-5xl py-8">
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

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar Navigation */}
          <AnimatedSection animation="fadeInLeft" className="lg:col-span-1">
            <div className="sticky top-24">
              <Card className="overflow-hidden">
                <div className="bg-primary-500 text-white p-4">
                  <h3 className="text-lg font-semibold">Contents</h3>
                </div>
                <div className="p-4">
                  <ul className="space-y-2">
                    {sections.map((section) => (
                      <li key={section.id}>
                        <button
                          onClick={() => handleSectionClick(section.id)}
                          className={`text-left w-full px-2 py-1 rounded-md transition-colors ${
                            activeSection === section.id
                              ? "bg-primary-50 text-primary-700 font-medium"
                              : "text-gray-600 hover:text-primary-500"
                          }`}
                        >
                          {section.title}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="p-4 border-t border-gray-100">
                  <p className="text-sm text-gray-500">
                    Last Updated: {lastUpdated}
                  </p>
                </div>
              </Card>
            </div>
          </AnimatedSection>

          {/* Main Content */}
          <AnimatedSection animation="fadeInRight" className="lg:col-span-3">
            <div ref={contentRef} className="space-y-8">
              <header>
                <h1 className="text-3xl font-bold text-gray-800 mb-2">
                  Privacy Policy
                </h1>
                <p className="text-gray-600 mb-4">
                  Last Updated: {lastUpdated}
                </p>
                <div className="h-1 w-20 bg-primary-500 rounded"></div>
              </header>

              {/* Introduction */}
              <section id="introduction" className="scroll-mt-24">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">
                  Introduction
                </h2>
                <Card>
                  <div className="prose max-w-none">
                    <p>
                      Welcome to our Privacy Policy. This document explains how
                      we collect, use, and protect your personal information
                      when you visit our website. We respect your privacy and
                      are committed to protecting your personal data.
                    </p>
                    <p>
                      By using our website, you consent to the data practices
                      described in this policy. We may change this policy from
                      time to time, so please check this page occasionally to
                      ensure that you're happy with any changes.
                    </p>
                  </div>
                </Card>
              </section>

              {/* Information Collection */}
              <section id="information-collection" className="scroll-mt-24">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">
                  Information Collection
                </h2>
                <Card>
                  <div className="prose max-w-none">
                    <p>
                      We collect information from you when you visit our
                      website, register on our site, place an order, subscribe
                      to a newsletter, respond to a survey, fill out a form, or
                      enter information on our site.
                    </p>
                    <h3>Information we may collect:</h3>
                    <ul>
                      <li>
                        Name and contact information (email address, phone
                        number)
                      </li>
                      <li>
                        Demographic information (such as postal code,
                        preferences, interests)
                      </li>
                      <li>
                        Technical information (IP address, browser type, device
                        information)
                      </li>
                      <li>Usage data (pages visited, time spent on site)</li>
                    </ul>
                  </div>
                </Card>
              </section>

              {/* Information Usage */}
              <section id="information-usage" className="scroll-mt-24">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">
                  Information Usage
                </h2>
                <Card>
                  <div className="prose max-w-none">
                    <p>
                      Any information we collect from you may be used in one of
                      the following ways:
                    </p>
                    <ul>
                      <li>
                        To personalize your experience (your information helps
                        us to better respond to your individual needs)
                      </li>
                      <li>
                        To improve our website (we continually strive to improve
                        our website offerings based on the information and
                        feedback we receive from you)
                      </li>
                      <li>
                        To improve customer service (your information helps us
                        to more effectively respond to your customer service
                        requests and support needs)
                      </li>
                      <li>
                        To process transactions (your information, whether
                        public or private, will not be sold, exchanged,
                        transferred, or given to any other company for any
                        reason whatsoever, without your consent)
                      </li>
                      <li>
                        To send periodic emails (the email address you provide
                        may be used to send you information, respond to
                        inquiries, and/or other requests or questions)
                      </li>
                    </ul>
                  </div>
                </Card>
              </section>

              {/* Information Protection */}
              <section id="information-protection" className="scroll-mt-24">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">
                  Information Protection
                </h2>
                <Card>
                  <div className="prose max-w-none">
                    <p>
                      We implement a variety of security measures to maintain
                      the safety of your personal information when you enter,
                      submit, or access your personal information.
                    </p>
                    <p>
                      We use regular malware scanning and secure servers behind
                      a firewall. All supplied sensitive information is
                      transmitted via Secure Socket Layer (SSL) technology and
                      then encrypted into our database only to be accessible by
                      those authorized with special access rights to such
                      systems, and are required to keep the information
                      confidential.
                    </p>
                  </div>
                </Card>
              </section>

              {/* Cookies */}
              <section id="cookies" className="scroll-mt-24">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">
                  Cookies
                </h2>
                <Card>
                  <div className="prose max-w-none">
                    <p>
                      We use cookies to understand and save your preferences for
                      future visits, keep track of advertisements, and compile
                      aggregate data about site traffic and site interaction so
                      that we can offer better site experiences and tools in the
                      future.
                    </p>
                    <p>
                      You can choose to have your computer warn you each time a
                      cookie is being sent, or you can choose to turn off all
                      cookies via your browser settings. Since each browser is a
                      little different, look at your browser's Help Menu to
                      learn the correct way to modify your cookies.
                    </p>
                    <p>
                      If you disable cookies, some features will be disabled,
                      but many of our site's features will still function
                      properly.
                    </p>
                  </div>
                </Card>
              </section>

              {/* Third-Party Services */}
              <section id="third-party" className="scroll-mt-24">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">
                  Third-Party Services
                </h2>
                <Card>
                  <div className="prose max-w-none">
                    <p>
                      We may use third-party service providers to help us
                      operate our website or administer activities on our
                      behalf, such as sending out newsletters or surveys.
                    </p>
                    <p>
                      We may share your information with these third parties for
                      those limited purposes provided that you have given us
                      your permission. These third-party service providers have
                      their own privacy policies addressing how they use such
                      information.
                    </p>
                  </div>
                </Card>
              </section>

              {/* Children's Privacy */}
              <section id="childrens-privacy" className="scroll-mt-24">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">
                  Children's Privacy
                </h2>
                <Card>
                  <div className="prose max-w-none">
                    <p>
                      Our website does not specifically target children under
                      the age of 13. We do not knowingly collect personal
                      identifiable information from children under 13. If you
                      are a parent or guardian and you are aware that your child
                      has provided us with personal information, please contact
                      us so that we can take necessary actions.
                    </p>
                  </div>
                </Card>
              </section>

              {/* Changes to Policy */}
              <section id="changes" className="scroll-mt-24">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">
                  Changes to Policy
                </h2>
                <Card>
                  <div className="prose max-w-none">
                    <p>
                      We reserve the right to modify this privacy policy at any
                      time, so please review it frequently. Changes and
                      clarifications will take effect immediately upon their
                      posting on the website.
                    </p>
                    <p>
                      If we make material changes to this policy, we will notify
                      you here that it has been updated, so that you are aware
                      of what information we collect, how we use it, and under
                      what circumstances, if any, we use and/or disclose it.
                    </p>
                  </div>
                </Card>
              </section>

              {/* Contact Information */}
              <section id="contact" className="scroll-mt-24">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">
                  Contact Information
                </h2>
                <Card>
                  <div className="prose max-w-none">
                    <p>
                      If you have any questions or concerns regarding this
                      privacy policy, you may contact us using the information
                      below:
                    </p>
                    <div className="mt-4 bg-gray-50 p-4 rounded-md">
                      <div className="font-medium text-gray-800">Email:</div>
                      <div className="text-primary-500">
                        privacy@yourwebsite.com
                      </div>
                      <div className="font-medium text-gray-800 mt-2">
                        Address:
                      </div>
                      <div className="text-gray-700">
                        123 Privacy Street, Web City, WC 12345
                      </div>
                    </div>
                  </div>
                </Card>
              </section>
            </div>
          </AnimatedSection>
        </div>
      </div>
    </Layout>
  );
};

export default PrivacyPolicyPage;
