import React from "react";

interface SlashNotationProps {
  articulation: "none" | "accent" | "staccato" | "marcato";
  tied?: boolean;
  size?: "sm" | "md" | "lg";
}

export function SlashNotation({
  articulation = "none",
  tied = false,
  size = "md",
}: SlashNotationProps) {
  const sizeMap = {
    sm: { width: 12, height: 20, stroke: 2 },
    md: { width: 16, height: 28, stroke: 2.5 },
    lg: { width: 20, height: 36, stroke: 3 },
  };
  const { width, height, stroke } = sizeMap[size];
  const articulationOffset = 6;
  const totalHeight = height + (articulation !== "none" ? articulationOffset : 0);

  return (
    <svg
      width={width}
      height={totalHeight}
      viewBox={`0 0 ${width} ${totalHeight}`}
      className="flex-shrink-0"
      role="img"
      aria-label={`Rhythm slash${articulation !== "none" ? ` with ${articulation}` : ""}${tied ? ", tied" : ""}`}
    >
      {articulation === "accent" && (
        <path
          d={`M ${width * 0.2} ${articulationOffset - 2} L ${width * 0.5} 2 L ${width * 0.8} ${articulationOffset - 2}`}
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      )}
      {articulation === "staccato" && (
        <circle cx={width / 2} cy={articulationOffset / 2} r="2" fill="currentColor" />
      )}
      {articulation === "marcato" && (
        <path
          d={`M ${width * 0.3} ${articulationOffset} L ${width * 0.5} 1 L ${width * 0.7} ${articulationOffset}`}
          fill="currentColor"
          stroke="currentColor"
          strokeWidth="1"
        />
      )}
      <line
        x1={width * 0.15}
        y1={height - 4 + (articulation !== "none" ? articulationOffset : 0)}
        x2={width * 0.85}
        y2={8 + (articulation !== "none" ? articulationOffset : 0)}
        stroke="currentColor"
        strokeWidth={stroke}
        strokeLinecap="round"
      />
      {tied && (
        <path
          d={`M ${width} ${height * 0.7 + (articulation !== "none" ? articulationOffset : 0)} Q ${width + 8} ${height * 0.9 + (articulation !== "none" ? articulationOffset : 0)} ${width + 16} ${height * 0.7 + (articulation !== "none" ? articulationOffset : 0)}`}
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
        />
      )}
    </svg>
  );
}
