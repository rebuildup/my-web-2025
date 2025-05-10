import React, { useEffect } from "react";
import Header from "./Header";
import Footer from "./Footer";
import Meta from "./Meta";
import { initAnimations } from "@/lib/animation";

interface LayoutProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  url?: string;
}

const Layout: React.FC<LayoutProps> = ({
  children,
  title,
  description,
  keywords,
  image,
  url,
}) => {
  useEffect(() => {
    // Initialize animations after the component mounts
    initAnimations();
  }, []);

  return (
    <>
      <Meta
        title={title}
        description={description}
        keywords={keywords}
        image={image}
        url={url}
      />
      <div className="flex flex-col min-h-screen bg-dark-500">
        <Header />
        <main className="flex-grow container-custom mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </main>
        <Footer />
      </div>
    </>
  );
};

export default Layout;
