import React from "react";
import CurrentTime from "./013_CurrentTime";
import LoggedInPlayer from "./014_LoggedInPlayer";

// Header.tsx
const Header: React.FC = () => {
  return (
    <div className="header" style={{ zIndex: 2 }}>
      <LoggedInPlayer />
      <h1 className="title">
        {" "}
        Proto<span>T</span>ype
      </h1>
      <CurrentTime />
    </div>
  );
};

export default Header;
