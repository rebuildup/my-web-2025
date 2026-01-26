import React from "react";

interface HomeProps {
  onOpenPopup?: () => void;
  onGameStart?: () => void;
}

const Game: React.FC<HomeProps> = ({ onOpenPopup, onGameStart }) => {
  return (
    <div className="home-container" style={{ zIndex: 1 }}>
      <button onClick={onGameStart} className="openbtn">
        Game Start
      </button>
    </div>
  );
};

export default Game;
