// src/pages/maintenance.tsx
import React from "react";
import MaintenanceMode from "@/components/ui/MaintenanceMode";

// This page can be used during scheduled maintenance periods
// You can configure your server to redirect all traffic to this page
// during maintenance, or use a maintenance mode toggle in your app

const MaintenancePage: React.FC = () => {
  return (
    <MaintenanceMode
      title="Scheduled Maintenance"
      message="We're currently upgrading our systems to bring you an even better experience. We'll be back online shortly."
      estimatedCompletion="May 3, 2025 at 12:00 PM UTC"
      showCountdown={true}
      contactEmail="support@yourdomain.com"
    />
  );
};

export default MaintenancePage;

// Static generation for maintenance page
export async function getStaticProps() {
  return {
    props: {},
  };
}
