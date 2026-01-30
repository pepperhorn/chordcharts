import React from "react";

/** SMuFL slash notehead (Petaluma): U+E100 Slash with vertical ends, U+E105 small variant */
const SLASH_NOTEHEAD = "\uE100";
const SLASH_NOTEHEAD_SMALL = "\uE105";

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
 * Note heads use Petaluma (SMuFL); stem and beam are SVG (Petaluma has no simple beam glyph for this layout).
 */
export function BeamedSlashGroup({ slots, size = "md" }: BeamedSlashGroupProps) {
  const slotWidth = size === "sm" ? 12 : 16;
  const stemLength = size === "sm" ? 18 : 24;
  const beamHeight = 3;
  const headFontSize = size === "sm" ? 14 : 18;
  const articulationGap = 4;
  const n = slots.length;
  const totalWidth = n * slotWidth;
  const totalHeight = beamHeight + stemLength + headFontSize + articulationGap + (slots.some((s) => s.articulation !== "none") ? 8 : 0);
  const headY = beamHeight + stemLength;

  return (
    <svg
      width={totalWidth}
      height={totalHeight}
      viewBox={`0 0 ${totalWidth} ${totalHeight}`}
      className="flex-shrink-0"
      role="img"
      aria-label={`Beamed rhythm, ${n} notes per beat`}
    >
      <defs>
        <style>{`svg .petaluma-slash { font-family: "Petaluma", sans-serif; fill: currentColor; }`}</style>
      </defs>
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

        if (slot.rest) {
          return (
            <g key={i} aria-label="Rest">
              <text
                x={cx}
                y={headY}
                textAnchor="middle"
                dominantBaseline="middle"
                fontSize={headFontSize}
                className="petaluma-slash"
              >
                {"\uE4E6"}
              </text>
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
            {/* Slash note head (Petaluma SMuFL) */}
            <text
              x={cx}
              y={headY}
              textAnchor="middle"
              dominantBaseline="middle"
              fontSize={headFontSize}
              className="petaluma-slash"
            >
              {size === "sm" ? SLASH_NOTEHEAD_SMALL : SLASH_NOTEHEAD}
            </text>
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
