import React from "react";

interface OuterCircleSvgProps {
  size?: number | string;
  className?: string;
  color?: string;
}

const OuterCircleSvg: React.FC<OuterCircleSvgProps> = ({
  size = "4320",
  className = "",
  color = "var(--MainAccent)",
}) => {
  return (
    <svg
      id="lay 2"
      data-name="lay 2"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 4320 4320"
      width={size}
      height={size}
      className={className}
    >
      <defs>
        <style>
          {`
            .cls-1 {
              fill: none;
              stroke: ${color};
              stroke-miterlimit: 10;
              stroke-width: 3px;
            }
          `}
        </style>
      </defs>
      <g id="Outer_circle">
        <circle className="cls-1" cx="2160" cy="2160" r="2158.5" />
        <circle className="cls-1" cx="2160" cy="2160" r="2117.5" />
        <circle className="cls-1" cx="2160" cy="2160" r="1945" />
      </g>
    </svg>
  );
};

export default OuterCircleSvg;
