import React from "react";

interface PlaygroundCommonProps {
  children?: React.ReactNode;
  title?: string;
}

const PlaygroundCommon: React.FC<PlaygroundCommonProps> = ({
  children,
  title = "Playground",
}) => {
  return (
    <div className="playground-common">
      <h1>{title}</h1>
      <div className="playground-content">{children}</div>
    </div>
  );
};

export default PlaygroundCommon;
