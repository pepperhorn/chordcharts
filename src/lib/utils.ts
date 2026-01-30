import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { nanoid } from "nanoid";
import type { Beat, BeatSlot, Measure, Section, TimeSignature, ChordChart } from "./schema";
import { DIVISIONS } from "./constants";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Chord chart utilities
export const generateId = () => nanoid(8);

export function createBeatSlot(): BeatSlot {
  return {
    id: generateId(),
    chord: null,
    nashvilleChord: null,
    slash: { articulation: "none", tied: false, rest: false },
  };
}

export function createBeat(division: keyof typeof DIVISIONS = "quarter"): Beat {
  const slotCount = DIVISIONS[division].slots;
  return {
    id: generateId(),
    division,
    slots: Array.from({ length: slotCount }, createBeatSlot),
    dynamics: null,
    lyrics: null,
  };
}

export function createMeasure(timeSignature: TimeSignature): Measure {
  return {
    id: generateId(),
    instruction: null,
    barlineStart: "single",
    barlineEnd: "single",
    beats: Array.from({ length: timeSignature.beats }, () => createBeat()),
    repeatStart: false,
    repeatEnd: false,
    repeatCount: 2,
    ending: null,
  };
}

export function createSection(name = "New Section"): Section {
  const timeSignature = { beats: 4, beatUnit: 4 };
  return {
    id: generateId(),
    name,
    timeSignature,
    measures: [createMeasure(timeSignature)],
    navigation: null,
    rehearsalMark: null,
  };
}

export function createEmptyChart(): ChordChart {
  return {
    version: "1.0",
    meta: {
      title: "Untitled",
      composer: "",
      arranger: "",
      key: "C",
      tempo: 120,
      tempoText: "",
      notationType: "standard",
      measuresPerLine: 4,
    },
    sections: [createSection("Intro")],
  };
}

export function formatChord(chord: { root: string; quality: string; bass?: string; extensions?: string[] }): string {
  const qualitySymbol = getQualitySymbol(chord.quality);
  const extStr = chord.extensions?.length ? chord.extensions.join("") : "";
  const bassStr = chord.bass ? `/${chord.bass}` : "";
  return `${chord.root}${qualitySymbol}${extStr}${bassStr}`;
}

export function getQualitySymbol(quality: string): string {
  const qualityMap: Record<string, string> = {
    maj: "", min: "m", dim: "dim", aug: "aug",
    maj7: "maj7", min7: "m7", dom7: "7", dim7: "dim7",
    hdim7: "m7b5", minmaj7: "mM7", aug7: "aug7",
    sus2: "sus2", sus4: "sus4", sus9: "sus9", add2: "add2", add9: "add9",
    "69": "6/9", "6": "6", min6: "m6", "9": "9", maj9: "maj9",
    min9: "m9", "11": "11", "13": "13",
  };
  return qualityMap[quality] ?? quality;
}

export function formatTimeSignature(ts: TimeSignature): string {
  return `${ts.beats}/${ts.beatUnit}`;
}

export function deepClone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}
