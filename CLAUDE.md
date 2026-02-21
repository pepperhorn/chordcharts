# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
pnpm dev        # Start dev server at localhost:4321
pnpm build      # Production build
pnpm preview    # Serve production build
```

No test suite exists. TypeScript checking is done via `astro check` (run by `@astrojs/check`).

Path alias: `@` → `src/`

## Architecture

**Chord Charts** is a single-page chord chart editor. The single Astro page (`src/pages/index.astro`) mounts `<ChordChartEditor client:load />` — everything else is React.

### Data Model (src/lib/schema.ts)

The chart is a strict hierarchy: `ChordChart → Section[] → Measure[] → Beat[] → BeatSlot[]`

- **BeatSlot**: leaf node — holds a `chord` (standard or Nashville) and a `slash` (articulation)
- **Beat**: has a `division` (quarter/eighth/8th-triplet/sixteenth/16th-triplet) that determines slot count (1–6)
- **Measure**: holds beats + barline config + endings (1st/2nd/3rd volta)
- **Section**: groups measures with a shared time signature + name
- All IDs are nanoid 8-char strings via `generateId()` in `src/lib/utils.ts`

Zod schemas enforce structure at runtime (import validation). TypeScript types are derived from those schemas.

### State Management (src/lib/store.ts)

Single Zustand store (`useChartStore`) with ~40 actions. Key design points:

- **Undo/redo**: 50-entry history stored as full chart snapshots. Every mutation calls `saveHistory()` before updating.
- **Selection**: single-item selection model — stores `{ type: 'section'|'measure'|'beat'|'slot', id }`. Drives PropertiesPanel content and keyboard navigation.
- **UI state** (zoom 50–200%, theme, visibility toggles for slashes/dynamics/lyrics/instructions) lives alongside chart data in the same store.

### Rhythm Notation SVG

`BeamedSlashGroup.tsx` renders beamed eighth/sixteenth slashes as SVG with `viewBox="0 0 100 52"`, `width="100%"`, `preserveAspectRatio="none"`. Slots are percentage-positioned so slashes align with chord symbols above regardless of container width. See `MEMORY.md` for exact dimension constants.

`SlashNotation.tsx` handles single quarter-note slashes.

### Measure Layout

Measures use CSS flex-wrap with `flexShrink: 0`. Each measure gets `flexBasis: calc(100/N%)` where N comes from `meta.measuresPerLine` (max 4). When a measure's chord content makes it wider than its flex-basis, it forces a line wrap rather than shrinking. This is intentional — do NOT add `overflow: hidden` to measure wrappers (breaks `min-width: auto` behavior).

### Key Files

| File | Role |
|------|------|
| `src/lib/schema.ts` | All Zod schemas + derived TS types |
| `src/lib/store.ts` | Zustand store — all state and actions |
| `src/lib/chordParser.ts` | Parse chord strings (standard + Nashville) |
| `src/lib/constants.ts` | Lookup tables: TIME_SIGNATURES, DIVISIONS, ARTICULATIONS, etc. |
| `src/lib/io.ts` | JSON/Markdown import-export |
| `src/lib/utils.ts` | Factory functions (createMeasure, createBeat, etc.), formatChord |
| `src/components/ChordChartEditor.tsx` | Root component, keyboard shortcuts (Ctrl+Z/Y, number keys 1–5) |
| `src/components/Toolbar.tsx` | Top bar: chord input, undo/redo, zoom, file I/O |
| `src/components/PropertiesPanel.tsx` | Sidebar: chart metadata + selection-context editing |
| `src/components/ChartCanvas.tsx` | Measure grid, section reordering via drag |
| `src/components/MeasureComponent.tsx` | Measure with barlines, time sig, endings |
| `src/components/BeatComponent.tsx` | Beat with chord row + rhythm row |
| `src/components/BeamedSlashGroup.tsx` | SVG beamed rhythm slashes |
| `src/styles/chord-chart.css` | CSS custom properties for themes (light/dark/high-contrast) |

### Theming

Three themes (light/dark/high-contrast) applied via `data-theme` attribute on the editor root div. CSS variables defined in `src/styles/chord-chart.css`. Theme is set in store and written to the DOM by `ChordChartEditor`.

### Chord Parsing

`chordParser.ts` handles both standard (`Am7`, `F#maj7`, `Bbdim`) and Nashville (`1`, `4m7`, `b7`) notation. Quality aliases are sorted by length for greedy matching. Returns a `ParseResult` with `valid` flag — invalid chords still render but are visually flagged.
