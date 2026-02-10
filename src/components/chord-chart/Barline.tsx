import React from "react";

interface BarlineProps {
  type: "single" | "double" | "final" | "repeatStart" | "repeatEnd" | "repeatBoth";
  position: "start" | "end";
  hasRepeat?: boolean;
}

export function Barline({ type }: BarlineProps) {
  // Height matches beat__rhythm-row (52px) for proper vertical alignment
  const height = 52;
  const width = type === "single" ? 8 : type === "double" || type === "final" ? 16 : type === "repeatBoth" ? 36 : 24;

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      className={`barline barline--${type} flex-shrink-0`}
      style={{ display: 'block' }}
      role="img"
      aria-label={`${type} barline`}
    >
      {type === "single" && (
        <line x1="4" y1="0" x2="4" y2={height} stroke="currentColor" strokeWidth="1.5" />
      )}
      {type === "double" && (
        <>
          <line x1="4" y1="0" x2="4" y2={height} stroke="currentColor" strokeWidth="1.5" />
          <line x1="10" y1="0" x2="10" y2={height} stroke="currentColor" strokeWidth="1.5" />
        </>
      )}
      {type === "final" && (
        <>
          <line x1="4" y1="0" x2="4" y2={height} stroke="currentColor" strokeWidth="1.5" />
          <line x1="10" y1="0" x2="10" y2={height} stroke="currentColor" strokeWidth="4" />
        </>
      )}
      {type === "repeatStart" && (
        <>
          <line x1="4" y1="0" x2="4" y2={height} stroke="currentColor" strokeWidth="4" />
          <line x1="10" y1="0" x2="10" y2={height} stroke="currentColor" strokeWidth="1.5" />
          <circle cx="18" cy={height * 0.35} r="2.5" fill="currentColor" />
          <circle cx="18" cy={height * 0.65} r="2.5" fill="currentColor" />
        </>
      )}
      {type === "repeatEnd" && (
        <>
          <circle cx="6" cy={height * 0.35} r="2.5" fill="currentColor" />
          <circle cx="6" cy={height * 0.65} r="2.5" fill="currentColor" />
          <line x1="14" y1="0" x2="14" y2={height} stroke="currentColor" strokeWidth="1.5" />
          <line x1="20" y1="0" x2="20" y2={height} stroke="currentColor" strokeWidth="4" />
        </>
      )}
      {type === "repeatBoth" && (
        <>
          <circle cx="6" cy={height * 0.35} r="2.5" fill="currentColor" />
          <circle cx="6" cy={height * 0.65} r="2.5" fill="currentColor" />
          <line x1="14" y1="0" x2="14" y2={height} stroke="currentColor" strokeWidth="1.5" />
          <line x1="20" y1="0" x2="20" y2={height} stroke="currentColor" strokeWidth="4" />
          <line x1="22" y1="0" x2="22" y2={height} stroke="currentColor" strokeWidth="1.5" />
          <circle cx="30" cy={height * 0.35} r="2.5" fill="currentColor" />
          <circle cx="30" cy={height * 0.65} r="2.5" fill="currentColor" />
        </>
      )}
    </svg>
  );
}
