import { CHORD_ROOTS, CHORD_QUALITIES, CHORD_ALIASES, NASHVILLE_NUMBERS } from "./constants";

/** Quality aliases sorted longest-first for parsing. */
const QUALITY_ALIASES = [...CHORD_ALIASES].sort((a, b) => b.pattern.length - a.pattern.length);

const VALID_QUALITIES = new Set(CHORD_QUALITIES.map((q) => q.value));
const ROOTS_BY_LENGTH = [...CHORD_ROOTS].sort((a, b) => b.length - a.length);

function parseRootFromStart(input: string): { root: string; rest: string } | null {
  const trimmed = input.trim();
  for (const root of ROOTS_BY_LENGTH) {
    if (trimmed.toLowerCase().startsWith(root.toLowerCase())) {
      return { root, rest: trimmed.slice(root.length).trim() };
    }
  }
  return null;
}

function parseQualityFromRest(rest: string): string | null {
  const lower = rest.toLowerCase();
  for (const { pattern, quality } of QUALITY_ALIASES) {
    if (pattern === "" && lower === "") return "maj";
    if (pattern && lower === pattern) return quality;
    if (pattern && lower.startsWith(pattern) && lower.length === pattern.length) return quality;
  }
  return null;
}

export interface ParseResult {
  valid: boolean;
  chord?: { root: string; quality: string };
  nashville?: { degree: string; quality: string };
  error?: string;
}

/**
 * Parse a chord string into internal format. Accepts common spellings and normalizes.
 * For standard chords: "Am7", "F#maj7", "Bbdim", "c" (-> C major).
 * For Nashville: "1", "4m7", "b7", "#4dim".
 */
export function parseChord(input: string, isNashville: boolean): ParseResult {
  const raw = input.trim();
  if (!raw) {
    return { valid: false, error: "Enter a chord" };
  }

  if (isNashville) {
    return parseNashville(raw);
  }

  const parsed = parseRootFromStart(raw);
  if (!parsed) {
    return { valid: false, error: `Unknown root. Use one of: ${CHORD_ROOTS.join(", ")}` };
  }

  const quality = parseQualityFromRest(parsed.rest);
  if (quality === null && parsed.rest.length > 0) {
    return { valid: false, error: `Unknown quality: "${parsed.rest}"` };
  }

  const finalQuality = quality ?? "maj";
  if (!VALID_QUALITIES.has(finalQuality)) {
    return { valid: false, error: `Unsupported quality: ${finalQuality}` };
  }

  return {
    valid: true,
    chord: { root: parsed.root, quality: finalQuality },
  };
}

const NASHVILLE_BY_LENGTH = [...NASHVILLE_NUMBERS].sort((a, b) => b.length - a.length);

function parseNashville(raw: string): ParseResult {
  const lower = raw.toLowerCase();
  let degree: string | null = null;
  let rest = lower;

  for (const num of NASHVILLE_BY_LENGTH) {
    if (lower === num || lower.startsWith(num)) {
      const afterNum = raw.slice(num.length).trim();
      const afterLower = afterNum.toLowerCase();
      if (afterNum === "" || parseQualityFromRest(afterLower) !== null) {
        degree = num;
        rest = afterNum;
        break;
      }
    }
  }

  if (degree === null) {
    return { valid: false, error: `Invalid Nashville degree. Use e.g. 1-7, b2, #4` };
  }

  const quality = rest.length === 0 ? "maj" : parseQualityFromRest(rest);
  if (quality === null) {
    return { valid: false, error: `Unknown quality: "${rest}"` };
  }
  if (!VALID_QUALITIES.has(quality)) {
    return { valid: false, error: `Unsupported quality: ${quality}` };
  }

  return {
    valid: true,
    nashville: { degree, quality },
  };
}
