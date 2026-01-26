import React from "react";
import Link from "next/link";

interface HomeProps {
  onOpenPopup?: () => void;
}

const Game: React.FC<HomeProps> = ({ onOpenPopup }) => {
  return (
    <div className="home-container" style={{ zIndex: 1 }}>
      <Link href="/tools/ProtoType/Prototype" className="openbtn">
        Game Start
      </Link>
    </div>
  );
};

export default Game;
