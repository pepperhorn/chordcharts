import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";
import type {
  ChordChart,
  Section,
  Measure,
  Beat,
  BeatSlot,
  Selection,
  Chord,
  NashvilleChord,
} from "./schema";
import {
  createEmptyChart,
  createSection,
  createMeasure,
  createBeatSlot,
  deepClone,
} from "./utils";
import { DIVISIONS } from "./constants";
import { ChordChartSchema } from "./schema";

interface HistoryEntry {
  chart: ChordChart;
  description: string;
}

interface EditorUIState {
  selection: Selection | null;
  isPlaying: boolean;
  zoom: number;
  showSlashes: boolean;
  showDynamics: boolean;
  showLyrics: boolean;
  showInstructions: boolean;
  theme: "light" | "dark" | "high-contrast";
  articulationSize: "sm" | "md" | "lg" | "xl";
  showKeyboardShortcuts: boolean;
}

interface ChartState {
  chart: ChordChart;
  ui: EditorUIState;
  history: HistoryEntry[];
  historyIndex: number;
  setChart: (chart: ChordChart) => void;
  updateMeta: (meta: Partial<ChordChart["meta"]>) => void;
  addSection: (name?: string) => void;
  updateSection: (sectionId: string, updates: Partial<Section>) => void;
  deleteSection: (sectionId: string) => void;
  reorderSections: (fromIndex: number, toIndex: number) => void;
  addMeasure: (sectionId: string, afterMeasureId?: string) => void;
  updateMeasure: (sectionId: string, measureId: string, updates: Partial<Measure>) => void;
  deleteMeasure: (sectionId: string, measureId: string) => void;
  updateBeat: (sectionId: string, measureId: string, beatId: string, updates: Partial<Beat>) => void;
  setBeatDivision: (
    sectionId: string,
    measureId: string,
    beatId: string,
    division: keyof typeof DIVISIONS
  ) => void;
  updateSlot: (
    sectionId: string,
    measureId: string,
    beatId: string,
    slotId: string,
    updates: Partial<BeatSlot>
  ) => void;
  setSlotChord: (
    sectionId: string,
    measureId: string,
    beatId: string,
    slotId: string,
    chord: Chord | null
  ) => void;
  setSlotNashville: (
    sectionId: string,
    measureId: string,
    beatId: string,
    slotId: string,
    chord: NashvilleChord | null
  ) => void;
  setSelection: (selection: Selection | null) => void;
  selectNext: () => void;
  selectPrevious: () => void;
  setZoom: (zoom: number) => void;
  toggleShowSlashes: () => void;
  toggleShowDynamics: () => void;
  toggleShowLyrics: () => void;
  toggleShowInstructions: () => void;
  setTheme: (theme: EditorUIState["theme"]) => void;
  setArticulationSize: (size: EditorUIState["articulationSize"]) => void;
  toggleShowKeyboardShortcuts: () => void;
  undo: () => void;
  redo: () => void;
  canUndo: () => boolean;
  canRedo: () => boolean;
  exportJSON: () => string;
  importJSON: (json: string) => void;
}

const saveHistory = (get: () => ChartState, description: string) => {
  const state = get();
  const newHistory = state.history.slice(0, state.historyIndex + 1);
  newHistory.push({ chart: deepClone(state.chart), description });
  if (newHistory.length > 50) newHistory.shift();
  return { history: newHistory, historyIndex: newHistory.length - 1 };
};

export const useChartStore = create<ChartState>()(
  subscribeWithSelector((set, get) => ({
    chart: createEmptyChart(),
    ui: {
      selection: null,
      isPlaying: false,
      zoom: 100,
      showSlashes: true,
      showDynamics: true,
      showLyrics: true,
      showInstructions: true,
      theme: "light",
      articulationSize: "lg",
      showKeyboardShortcuts: true,
    },
    history: [],
    historyIndex: -1,

    setChart: (chart) => set({ chart, ...saveHistory(get, "Load chart") }),

    updateMeta: (meta) =>
      set((state) => ({
        chart: { ...state.chart, meta: { ...state.chart.meta, ...meta } },
        ...saveHistory(get, "Update metadata"),
      })),

    addSection: (name = "New Section") =>
      set((state) => ({
        chart: {
          ...state.chart,
          sections: [...state.chart.sections, createSection(name)],
        },
        ...saveHistory(get, `Add section: ${name}`),
      })),

    updateSection: (sectionId, updates) =>
      set((state) => ({
        chart: {
          ...state.chart,
          sections: state.chart.sections.map((s) =>
            s.id === sectionId ? { ...s, ...updates } : s
          ),
        },
        ...saveHistory(get, "Update section"),
      })),

    deleteSection: (sectionId) =>
      set((state) => {
        const sections = state.chart.sections.filter((s) => s.id !== sectionId);
        if (sections.length === 0) sections.push(createSection("Section 1"));
        return { chart: { ...state.chart, sections }, ...saveHistory(get, "Delete section") };
      }),

    reorderSections: (fromIndex, toIndex) =>
      set((state) => {
        const sections = [...state.chart.sections];
        const [removed] = sections.splice(fromIndex, 1);
        sections.splice(toIndex, 0, removed);
        return { chart: { ...state.chart, sections }, ...saveHistory(get, "Reorder sections") };
      }),

    addMeasure: (sectionId, afterMeasureId) =>
      set((state) => ({
        chart: {
          ...state.chart,
          sections: state.chart.sections.map((section) => {
            if (section.id !== sectionId) return section;
            const newMeasure = createMeasure(section.timeSignature);
            const measures = [...section.measures];
            if (afterMeasureId) {
              const index = measures.findIndex((m) => m.id === afterMeasureId);
              measures.splice(index + 1, 0, newMeasure);
            } else measures.push(newMeasure);
            return { ...section, measures };
          }),
        },
        ...saveHistory(get, "Add measure"),
      })),

    updateMeasure: (sectionId, measureId, updates) =>
      set((state) => ({
        chart: {
          ...state.chart,
          sections: state.chart.sections.map((section) =>
            section.id !== sectionId
              ? section
              : {
                  ...section,
                  measures: section.measures.map((m) =>
                    m.id === measureId ? { ...m, ...updates } : m
                  ),
                }
          ),
        },
        ...saveHistory(get, "Update measure"),
      })),

    deleteMeasure: (sectionId, measureId) =>
      set((state) => ({
        chart: {
          ...state.chart,
          sections: state.chart.sections.map((section) => {
            if (section.id !== sectionId) return section;
            const measures = section.measures.filter((m) => m.id !== measureId);
            if (measures.length === 0) measures.push(createMeasure(section.timeSignature));
            return { ...section, measures };
          }),
        },
        ...saveHistory(get, "Delete measure"),
      })),

    updateBeat: (sectionId, measureId, beatId, updates) =>
      set((state) => ({
        chart: {
          ...state.chart,
          sections: state.chart.sections.map((section) =>
            section.id !== sectionId
              ? section
              : {
                  ...section,
                  measures: section.measures.map((measure) =>
                    measure.id !== measureId
                      ? measure
                      : {
                          ...measure,
                          beats: measure.beats.map((beat) =>
                            beat.id === beatId ? { ...beat, ...updates } : beat
                          ),
                        }
                  ),
                }
          ),
        },
        ...saveHistory(get, "Update beat"),
      })),

    setBeatDivision: (sectionId, measureId, beatId, division) =>
      set((state) => ({
        chart: {
          ...state.chart,
          sections: state.chart.sections.map((section) =>
            section.id !== sectionId
              ? section
              : {
                  ...section,
                  measures: section.measures.map((measure) =>
                    measure.id !== measureId
                      ? measure
                      : {
                          ...measure,
                          beats: measure.beats.map((beat) => {
                            if (beat.id !== beatId) return beat;
                            const newSlotCount = DIVISIONS[division].slots;
                            const currentSlots = beat.slots;
                            const newSlots =
                              newSlotCount > currentSlots.length
                                ? [
                                    ...currentSlots,
                                    ...Array.from(
                                      { length: newSlotCount - currentSlots.length },
                                      createBeatSlot
                                    ),
                                  ]
                                : currentSlots.slice(0, newSlotCount);
                            return { ...beat, division, slots: newSlots };
                          }),
                        }
                  ),
                }
          ),
        },
        ...saveHistory(get, `Set division: ${division}`),
      })),

    updateSlot: (sectionId, measureId, beatId, slotId, updates) =>
      set((state) => ({
        chart: {
          ...state.chart,
          sections: state.chart.sections.map((section) =>
            section.id !== sectionId
              ? section
              : {
                  ...section,
                  measures: section.measures.map((measure) =>
                    measure.id !== measureId
                      ? measure
                      : {
                          ...measure,
                          beats: measure.beats.map((beat) =>
                            beat.id !== beatId
                              ? beat
                              : {
                                  ...beat,
                                  slots: beat.slots.map((slot) =>
                                    slot.id === slotId ? { ...slot, ...updates } : slot
                                  ),
                                }
                          ),
                        }
                  ),
                }
          ),
        },
        ...saveHistory(get, "Update slot"),
      })),

    setSlotChord: (sectionId, measureId, beatId, slotId, chord) =>
      get().updateSlot(sectionId, measureId, beatId, slotId, { chord }),

    setSlotNashville: (sectionId, measureId, beatId, slotId, chord) =>
      get().updateSlot(sectionId, measureId, beatId, slotId, { nashvilleChord: chord }),

    setSelection: (selection) =>
      set((state) => ({ ui: { ...state.ui, selection } })),

    selectNext: () => {},
    selectPrevious: () => {},

    setZoom: (zoom) =>
      set((state) => ({
        ui: { ...state.ui, zoom: Math.max(50, Math.min(200, zoom)) },
      })),

    toggleShowSlashes: () =>
      set((state) => ({ ui: { ...state.ui, showSlashes: !state.ui.showSlashes } })),
    toggleShowDynamics: () =>
      set((state) => ({ ui: { ...state.ui, showDynamics: !state.ui.showDynamics } })),
    toggleShowLyrics: () =>
      set((state) => ({ ui: { ...state.ui, showLyrics: !state.ui.showLyrics } })),
    toggleShowInstructions: () =>
      set((state) => ({ ui: { ...state.ui, showInstructions: !state.ui.showInstructions } })),
    setTheme: (theme) => set((state) => ({ ui: { ...state.ui, theme } })),

    setArticulationSize: (size) => set((state) => ({ ui: { ...state.ui, articulationSize: size } })),
    toggleShowKeyboardShortcuts: () => set((state) => ({ ui: { ...state.ui, showKeyboardShortcuts: !state.ui.showKeyboardShortcuts } })),

    undo: () => {
      const state = get();
      if (state.historyIndex >= 0 && state.history[state.historyIndex]) {
        const chartToRestore = state.history[state.historyIndex].chart;
        const newIndex = state.historyIndex - 1;
        set({ chart: deepClone(chartToRestore), historyIndex: newIndex });
      }
    },

    redo: () => {
      const state = get();
      if (state.historyIndex < state.history.length - 1) {
        const newIndex = state.historyIndex + 1;
        set({ chart: deepClone(state.history[newIndex].chart), historyIndex: newIndex });
      }
    },

    canUndo: () => {
      const state = get();
      return state.historyIndex >= 0 && state.history.length > 0 && state.history[state.historyIndex] != null;
    },
    canRedo: () => get().historyIndex < get().history.length - 1,

    exportJSON: () => JSON.stringify(get().chart, null, 2),

    importJSON: (json) => {
      try {
        const parsed = JSON.parse(json);
        const chart = ChordChartSchema.parse(parsed);
        set({ chart, ...saveHistory(get, "Import chart") });
      } catch (e) {
        console.error("Failed to import JSON:", e);
      }
    },
  }))
);
