import React from "react";

interface SlotSlash {
  articulation: "none" | "accent" | "staccato" | "marcato";
  tied: boolean;
  rest: boolean;
}

interface BeamedSlashGroupProps {
  slots: SlotSlash[];
  size?: "sm" | "md";
}

/**
 * Renders standard slash notation with stems and a beam for divisions 2–5.
 * One beam per beat; each note has a stem (tail) and diagonal slash (head).
 */
export function BeamedSlashGroup({ slots, size = "md" }: BeamedSlashGroupProps) {
  const slotWidth = size === "sm" ? 12 : 16;
  const stemLength = size === "sm" ? 18 : 24;
  const beamHeight = 3;
  const headSize = size === "sm" ? 8 : 10;
  const articulationGap = 4;
  const n = slots.length;
  const totalWidth = n * slotWidth;
  const totalHeight = beamHeight + stemLength + headSize + articulationGap + (slots.some((s) => s.articulation !== "none") ? 8 : 0);

  return (
    <svg
      width={totalWidth}
      height={totalHeight}
      viewBox={`0 0 ${totalWidth} ${totalHeight}`}
      className="flex-shrink-0"
      role="img"
      aria-label={`Beamed rhythm, ${n} notes per beat`}
    >
      {/* Beam: horizontal line spanning the beat */}
      <line
        x1={slotWidth / 2}
        y1={beamHeight / 2}
        x2={totalWidth - slotWidth / 2}
        y2={beamHeight / 2}
        stroke="currentColor"
        strokeWidth={beamHeight}
        strokeLinecap="round"
      />
      {slots.map((slot, i) => {
        const cx = (i + 0.5) * slotWidth;
        const stemTop = beamHeight;
        const stemBottom = beamHeight + stemLength;
        const headY = stemBottom;

        if (slot.rest) {
          return (
            <g key={i} aria-label="Rest">
              {/* Eighth rest shape */}
              <path
                d={`M ${cx - 2} ${stemTop + 4} Q ${cx} ${stemTop} ${cx + 3} ${stemTop + 6} L ${cx + 2} ${stemBottom - 2} Q ${cx} ${stemBottom + 2} ${cx - 3} ${stemBottom}`}
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </g>
          );
        }

        return (
          <g key={i}>
            {/* Stem (tail) from beam down to head */}
            <line
              x1={cx}
              y1={stemTop}
              x2={cx}
              y2={headY}
              stroke="currentColor"
              strokeWidth={size === "sm" ? 1.5 : 2}
              strokeLinecap="round"
            />
            {/* Diagonal slash (note head) */}
            <line
              x1={cx - headSize / 2}
              y1={headY + headSize / 2}
              x2={cx + headSize / 2}
              y2={headY - headSize / 2}
              stroke="currentColor"
              strokeWidth={size === "sm" ? 2 : 2.5}
              strokeLinecap="round"
            />
            {/* Articulation above the beam */}
            {slot.articulation === "accent" && (
              <path
                d={`M ${cx - 3} ${stemTop - 4} L ${cx} ${stemTop - 8} L ${cx + 3} ${stemTop - 4}`}
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            )}
            {slot.articulation === "staccato" && (
              <circle cx={cx} cy={stemTop - 5} r="1.5" fill="currentColor" />
            )}
            {slot.articulation === "marcato" && (
              <path
                d={`M ${cx - 2} ${stemTop - 8} L ${cx} ${stemTop - 3} L ${cx + 2} ${stemTop - 8}`}
                fill="currentColor"
                stroke="currentColor"
                strokeWidth="0.5"
              />
            )}
          </g>
        );
      })}
    </svg>
  );
}
