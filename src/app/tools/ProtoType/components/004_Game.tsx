import React from "react";
interface HomeProps {
  onOpenPopup: () => void;
}

const Game: React.FC<HomeProps> = ({ onOpenPopup }) => {
  return (
    <div className="home-container" style={{ zIndex: 1 }}>
      <button onClick={onOpenPopup} className="openbtn">
        Game Start
      </button>
    </div>
  );
};

export default Game;
