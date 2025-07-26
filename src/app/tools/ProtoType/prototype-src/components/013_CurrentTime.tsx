import React, { useState, useEffect } from "react";
import "../styles/002_header.css";

const CurrentTime: React.FC = () => {
  const [currentTime, setCurrentTime] = useState<string>("");

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const options: Intl.DateTimeFormatOptions = {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        timeZone: "Asia/Tokyo",
      };
      setCurrentTime(now.toLocaleString("ja-JP", options));
    };

    updateTime(); // 初回実行
    const timerId = setInterval(updateTime, 1000);

    // クリーンアップ関数
    return () => clearInterval(timerId);
  }, []);

  // CurrentTime.tsx
  return (
    <div className="current-time" style={{ zIndex: 2 }}>
      {" "}
      {currentTime}
    </div>
  );
};

export default CurrentTime;
