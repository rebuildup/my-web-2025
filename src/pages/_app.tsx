import { useEffect, useState } from "react";
import type { AppProps } from "next/app";
import Head from "next/head";
import { useRouter } from "next/router";
import { initAnimations } from "@/lib/animation";
import ErrorBoundary from "@/components/ui/ErrorBoundary";
import "@/styles/globals.css";

const LoadingIndicator = () => (
  <div className="fixed top-0 left-0 w-full z-50">
    <div className="h-1 w-full bg-slate-200">
      <div className="h-full bg-primary-500 animate-pulse"></div>
    </div>
  </div>
);

const logError = (error: Error, errorInfo: React.ErrorInfo) => {
  console.error("Application error:", error, errorInfo);
};

export default function MyApp({ Component, pageProps }: AppProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

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

  useEffect(() => {
    initAnimations();
  }, []);

  return (
    <>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      {loading && <LoadingIndicator />}
      <ErrorBoundary onError={logError}>
        <Component {...pageProps} />
      </ErrorBoundary>
    </>
  );
}
