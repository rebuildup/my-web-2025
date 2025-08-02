"use client";

import { useEffect, useState } from "react";

export function GADebug() {
  const [gaStatus, setGaStatus] = useState({
    gaId: process.env.NEXT_PUBLIC_GA_ID,
    isInitialized: false,
    dataLayer: false,
    gtag: false,
    consent: false,
  });

  useEffect(() => {
    const checkGAStatus = () => {
      setGaStatus({
        gaId: process.env.NEXT_PUBLIC_GA_ID,
        isInitialized: typeof window !== "undefined" && !!window.gtag,
        dataLayer: typeof window !== "undefined" && !!window.dataLayer,
        gtag: typeof window !== "undefined" && !!window.gtag,
        consent: true, // デフォルトでコンセントを与える
      });
    };

    checkGAStatus();
    const interval = setInterval(checkGAStatus, 1000);
    return () => clearInterval(interval);
  }, []);

  if (process.env.NODE_ENV !== "development") {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 bg-black/80 text-white p-4 rounded-lg text-xs z-50">
      <h3 className="font-bold mb-2">Google Analytics Debug</h3>
      <div className="space-y-1">
        <div>GA ID: {gaStatus.gaId || "Not set"}</div>
        <div>Initialized: {gaStatus.isInitialized ? "✅" : "❌"}</div>
        <div>DataLayer: {gaStatus.dataLayer ? "✅" : "❌"}</div>
        <div>Gtag: {gaStatus.gtag ? "✅" : "❌"}</div>
        <div>Consent: {gaStatus.consent ? "✅" : "❌"}</div>
      </div>
    </div>
  );
}
