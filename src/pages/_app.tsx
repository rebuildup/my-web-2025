// src/pages/_app.tsx
import { useEffect, useState } from "react";
import type { AppProps } from "next/app";
import Head from "next/head";
import { useRouter } from "next/router";
import { initAnimations } from "@/lib/animation";
import ErrorBoundary from "@/components/ui/ErrorBoundary";
import "@/styles/globals.css";

// Simple loading indicator component
const LoadingIndicator = () => (
  <div className="fixed top-0 left-0 w-full z-50">
    <div className="h-1 w-full bg-gray-200">
      <div className="h-full bg-primary-500 animate-pulse-slow"></div>
    </div>
  </div>
);

// Custom error handler for analytics or logging
const logError = (error: Error, errorInfo: React.ErrorInfo) => {
  // In production, you would send this to an error tracking service
  console.error("Application error:", error, errorInfo);
};

export default function MyApp({ Component, pageProps }: AppProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  // Handle route change loading states
  useEffect(() => {
    const handleStart = () => setLoading(true);
    const handleComplete = () => setLoading(false);

    router.events.on("routeChangeStart", handleStart);
    router.events.on("routeChangeComplete", handleComplete);
    router.events.on("routeChangeError", handleComplete);

    return () => {
      router.events.off("routeChangeStart", handleStart);
      router.events.off("routeChangeComplete", handleComplete);
      router.events.off("routeChangeError", handleComplete);
    };
  }, [router.events]);

  // Initialize GSAP animations on client-side
  useEffect(() => {
    initAnimations();
  }, []);

  return (
    <>
      <Head>
        {/* Adobe Fonts (Typekit) */}
        <script>
          {`
            (function(d) {
              var config = {
                kitId: 'abc1def', // Replace with your actual Adobe Fonts kit ID
                scriptTimeout: 3000,
                async: true
              },
              h=d.documentElement,t=setTimeout(function(){h.className=h.className.replace(/\bwf-loading\b/g,"")+" wf-inactive";},config.scriptTimeout),tk=d.createElement("script"),f=false,s=d.getElementsByTagName("script")[0],a;h.className+=" wf-loading";tk.src='https://use.typekit.net/'+config.kitId+'.js';tk.async=true;tk.onload=tk.onreadystatechange=function(){a=this.readyState;if(f||a&&a!="complete"&&a!="loaded")return;f=true;clearTimeout(t);try{Typekit.load(config)}catch(e){}};s.parentNode.insertBefore(tk,s)
            })(document);
          `}
        </script>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      {/* Loading indicator for route changes */}
      {loading && <LoadingIndicator />}

      {/* Error boundary wraps the entire app */}
      <ErrorBoundary onError={logError}>
        <Component {...pageProps} />
      </ErrorBoundary>

      {/* Add a global error handler */}
      <script
        dangerouslySetInnerHTML={{
          __html: `
            window.onerror = function(message, source, lineno, colno, error) {
              console.error('Global error:', { message, source, lineno, colno, error });
              // In production, you would send this to an error tracking service
              return false;
            };
          `,
        }}
      />
    </>
  );
}
