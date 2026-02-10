import { CHORD_ROOTS, CHORD_QUALITIES, CHORD_ALIASES, CHORD_EXTENSIONS, NASHVILLE_NUMBERS } from "./constants";
import type { Chord, NashvilleChord, Polychord } from "./schema";

/** Quality aliases sorted longest-first for parsing. */
const QUALITY_ALIASES = [...CHORD_ALIASES].sort((a, b) => b.pattern.length - a.pattern.length);

const VALID_QUALITIES = new Set<string>(CHORD_QUALITIES.map((q) => q.value));
const EXTENSIONS_SET = new Set<string>(CHORD_EXTENSIONS);
const ROOTS_BY_LENGTH = [...CHORD_ROOTS].sort((a, b) => b.length - a.length);

// Valid root notes for type narrowing
type ValidRoot = Chord["root"];
const VALID_ROOTS_SET = new Set<string>(CHORD_ROOTS);

function isValidRoot(root: string): root is ValidRoot {
  return VALID_ROOTS_SET.has(root);
}

// Valid Nashville degrees for type narrowing
type ValidDegree = NashvilleChord["degree"];
const VALID_DEGREES_SET = new Set<string>(NASHVILLE_NUMBERS);

function isValidDegree(degree: string): degree is ValidDegree {
  return VALID_DEGREES_SET.has(degree);
}

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

function parseQualityWithExtensions(rest: string): { quality: string; extensions: string[] } | null {
  const lower = rest.toLowerCase();
  for (const { pattern, quality } of QUALITY_ALIASES) {
    if (pattern === "" && lower === "") return { quality: "maj", extensions: [] };
    if (!pattern) continue;
    if (!lower.startsWith(pattern.toLowerCase())) continue;
    const remainder = rest.slice(pattern.length).trim();
    if (remainder === "") return { quality, extensions: [] };

    // Parse multiple extensions (e.g., "b9#11" or "(b9,#11)" or "b9/b5")
    const extensions = parseExtensions(remainder);
    if (extensions.length > 0) return { quality, extensions };
  }
  return null;
}

/** Parse one or more extensions from a string like "b9#11", "(b9,#11)", "b9/b5" */
function parseExtensions(input: string): string[] {
  // Remove surrounding parentheses if present
  let str = input.trim();
  if (str.startsWith("(") && str.endsWith(")")) {
    str = str.slice(1, -1);
  }

  const extensions: string[] = [];
  const extensionsArray = Array.from(EXTENSIONS_SET);
  // Sort by length descending for greedy matching
  const sortedExtensions = extensionsArray.sort((a, b) => b.length - a.length);

  // Split on common delimiters first
  const parts = str.split(/[,]/);

  for (const part of parts) {
    let remaining = part.trim().toLowerCase();

    // Greedily match extensions from the string
    while (remaining.length > 0) {
      let matched = false;
      for (const ext of sortedExtensions) {
        if (remaining.startsWith(ext.toLowerCase())) {
          extensions.push(ext);
          remaining = remaining.slice(ext.length).trim();
          matched = true;
          break;
        }
      }
      if (!matched) {
        // If we can't match anything, this isn't a valid extension string
        if (extensions.length === 0) return [];
        break;
      }
    }
  }

  return extensions;
}

export interface ParseResult {
  valid: boolean;
  chord?: Chord;
  nashville?: NashvilleChord;
  polychord?: Polychord;
  error?: string;
}

/**
 * Parse a chord string into internal format. Accepts common spellings and normalizes.
 * For standard chords: "Am7", "F#maj7", "Bbdim", "c" (-> C major), "C/G" (bass note), "D/C7" (polychord).
 * For Nashville: "1", "4m7", "b7", "#4dim", "1/5" (with bass).
 */
export function parseChord(input: string, isNashville: boolean): ParseResult {
  const raw = input.trim();
  if (!raw) {
    return { valid: false, error: "Enter a chord" };
  }

  if (isNashville) {
    return parseNashville(raw);
  }

  // Check for slash notation (bass note or polychord)
  const slashIndex = raw.indexOf("/");
  if (slashIndex > 0) {
    const upperPart = raw.slice(0, slashIndex).trim();
    const lowerPart = raw.slice(slashIndex + 1).trim();

    // Parse upper part
    const upperResult = parseStandardChord(upperPart);
    if (!upperResult.valid || !upperResult.chord) {
      return upperResult;
    }

    // Try to parse lower part as a full chord (polychord)
    const lowerChordResult = parseStandardChord(lowerPart);
    if (lowerChordResult.valid && lowerChordResult.chord) {
      // It's a polychord (e.g., D/C7)
      return {
        valid: true,
        polychord: {
          upper: upperResult.chord,
          lower: lowerChordResult.chord,
        },
      };
    }

    // Try to parse lower part as just a bass note
    const bassResult = parseRootFromStart(lowerPart);
    if (bassResult && bassResult.rest === "" && isValidRoot(bassResult.root)) {
      // It's a simple slash chord (e.g., C/G)
      return {
        valid: true,
        chord: {
          ...upperResult.chord,
          bass: bassResult.root,
        },
      };
    }

    return { valid: false, error: `Invalid bass note or lower chord: "${lowerPart}"` };
  }

  // No slash, parse as standard chord
  return parseStandardChord(raw);
}

function parseStandardChord(raw: string): ParseResult {
  const parsed = parseRootFromStart(raw);
  if (!parsed) {
    return { valid: false, error: `Unknown root. Use one of: ${CHORD_ROOTS.join(", ")}` };
  }

  // Validate root is a valid root note
  if (!isValidRoot(parsed.root)) {
    return { valid: false, error: `Invalid root: ${parsed.root}` };
  }

  const parsedQuality = parseQualityWithExtensions(parsed.rest);
  if (parsedQuality === null && parsed.rest.length > 0) {
    return { valid: false, error: `Unknown quality: "${parsed.rest}"` };
  }

  const { quality: finalQuality, extensions } = parsedQuality ?? { quality: "maj", extensions: [] as string[] };
  if (!VALID_QUALITIES.has(finalQuality)) {
    return { valid: false, error: `Unsupported quality: ${finalQuality}` };
  }

  const chord: Chord = { root: parsed.root, quality: finalQuality };
  if (extensions.length > 0) chord.extensions = extensions;
  return { valid: true, chord };
}

const NASHVILLE_BY_LENGTH = [...NASHVILLE_NUMBERS].sort((a, b) => b.length - a.length);

function parseNashville(raw: string): ParseResult {
  // Check for slash notation (bass degree)
  const slashIndex = raw.indexOf("/");
  if (slashIndex > 0) {
    const upperPart = raw.slice(0, slashIndex).trim();
    const bassPart = raw.slice(slashIndex + 1).trim();

    // Parse upper part
    const upperResult = parseNashvilleChord(upperPart);
    if (!upperResult.valid || !upperResult.nashville) {
      return upperResult;
    }

    // Parse bass degree
    const bassLower = bassPart.toLowerCase();
    let bassDegree: string | null = null;
    for (const num of NASHVILLE_BY_LENGTH) {
      if (bassLower === num) {
        bassDegree = num;
        break;
      }
    }

    if (bassDegree === null || !isValidDegree(bassDegree)) {
      return { valid: false, error: `Invalid bass degree: "${bassPart}"` };
    }

    return {
      valid: true,
      nashville: {
        ...upperResult.nashville,
        bass: bassDegree,
      },
    };
  }

  // No slash, parse as standard Nashville chord
  return parseNashvilleChord(raw);
}

function parseNashvilleChord(raw: string): ParseResult {
  const lower = raw.toLowerCase();
  let degree: string | null = null;
  let rest = raw;

  for (const num of NASHVILLE_BY_LENGTH) {
    if (lower === num || lower.startsWith(num)) {
      const afterNum = raw.slice(num.length).trim();
      const afterLower = afterNum.toLowerCase();
      if (afterNum === "" || parseQualityWithExtensions(afterLower) !== null) {
        degree = num;
        rest = afterNum;
        break;
      }
    }
  }

  if (degree === null || !isValidDegree(degree)) {
    return { valid: false, error: `Invalid Nashville degree. Use e.g. 1-7, b2, #4` };
  }

  // Parse quality and extensions
  if (rest.length === 0) {
    return {
      valid: true,
      nashville: { degree, quality: "maj" },
    };
  }

  const parsedQuality = parseQualityWithExtensions(rest);
  if (parsedQuality === null) {
    return { valid: false, error: `Unknown quality: "${rest}"` };
  }

  const { quality, extensions } = parsedQuality;
  if (!VALID_QUALITIES.has(quality)) {
    return { valid: false, error: `Unsupported quality: ${quality}` };
  }

  const nashville: NashvilleChord = { degree, quality };
  if (extensions.length > 0) nashville.extensions = extensions;

  return {
    valid: true,
    nashville,
  };
}
