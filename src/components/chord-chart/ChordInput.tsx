import React from "react";
import { useChartStore } from "@/lib/store";
import { parseChord } from "@/lib/chordParser";
import { formatChord } from "@/lib/utils";
import { Command, CommandGroup, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CHORD_ROOTS, CHORD_QUALITIES, NASHVILLE_NUMBERS } from "@/lib/constants";
import type { Chord, NashvilleChord } from "@/lib/schema";
import { cn } from "@/lib/utils";

interface ChordInputProps {
  currentChord: Chord | null;
  currentNashville: NashvilleChord | null;
  onChordChange: (chord: Chord | null) => void;
  onNashvilleChange: (chord: NashvilleChord | null) => void;
}

export function ChordInput({
  currentChord,
  currentNashville,
  onChordChange,
  onNashvilleChange,
}: ChordInputProps) {
  const { chart } = useChartStore();
  const isNashville = chart.meta.notationType === "nashville";
  const [open, setOpen] = React.useState(false);
  const [typedValue, setTypedValue] = React.useState("");
  const [root, setRoot] = React.useState(currentChord?.root ?? "C");
  const [quality, setQuality] = React.useState(currentChord?.quality ?? "maj");
  const [nashvilleDegree, setNashvilleDegree] = React.useState(currentNashville?.degree ?? "1");

  React.useEffect(() => {
    setRoot(currentChord?.root ?? "C");
    setQuality(currentChord?.quality ?? "maj");
    setNashvilleDegree(currentNashville?.degree ?? "1");
  }, [currentChord, currentNashville]);

  React.useEffect(() => {
    if (open) {
      setTypedValue(
        isNashville && currentNashville
          ? `${currentNashville.degree}${currentNashville.quality ? CHORD_QUALITIES.find((q) => q.value === currentNashville.quality)?.symbol ?? currentNashville.quality : ""}`
          : currentChord
            ? formatChord(currentChord)
            : ""
      );
    }
  }, [open, isNashville, currentChord, currentNashville]);

  const parseResult = React.useMemo(
    () => (typedValue.trim() ? parseChord(typedValue, isNashville) : null),
    [typedValue, isNashville]
  );
  const isValid = parseResult?.valid ?? false;
  const hasError = parseResult && !parseResult.valid;

  const previewLabel = parseResult?.valid
    ? parseResult.chord
      ? `${parseResult.chord.root} ${CHORD_QUALITIES.find((q) => q.value === parseResult.chord!.quality)?.label ?? parseResult.chord.quality}`
      : parseResult.nashville
        ? `${parseResult.nashville.degree} ${CHORD_QUALITIES.find((q) => q.value === parseResult.nashville!.quality)?.label ?? parseResult.nashville.quality}`
        : null
    : null;

  const applyTypedChord = () => {
    if (!parseResult?.valid) return;
    if (parseResult.chord) {
      onChordChange(parseResult.chord);
      setRoot(parseResult.chord.root);
      setQuality(parseResult.chord.quality);
    }
    if (parseResult.nashville) {
      onNashvilleChange(parseResult.nashville);
      setNashvilleDegree(parseResult.nashville.degree);
      setQuality(parseResult.nashville.quality);
    }
  };

  const handleStandardChordSelect = () => {
    onChordChange({ root, quality });
    setOpen(false);
  };

  const handleNashvilleSelect = () => {
    onNashvilleChange({ degree: nashvilleDegree, quality });
    setOpen(false);
  };

  const handleClear = () => {
    onChordChange(null);
    onNashvilleChange(null);
    setOpen(false);
  };

  const displayLabel = isNashville
    ? currentNashville
      ? `${currentNashville.degree}${currentNashville.quality ?? ""}`
      : "Add chord..."
    : currentChord
      ? formatChord(currentChord)
      : "Add chord...";

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="w-full justify-start font-petaluma" aria-label="Edit chord">
          {displayLabel}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="start">
        <div className="p-2 border-b space-y-1">
          <Input
            value={typedValue}
            onChange={(e) => setTypedValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                if (isValid) {
                  applyTypedChord();
                  setOpen(false);
                }
              }
            }}
            onBlur={() => {
              if (isValid && typedValue.trim()) applyTypedChord();
            }}
            placeholder={isNashville ? "e.g. 1, 4m7, b7" : "e.g. Am7, F#maj7, Bb"}
            aria-label="Type chord"
            aria-invalid={hasError ? "true" : undefined}
            aria-describedby={hasError ? "chord-input-error" : previewLabel ? "chord-input-preview" : undefined}
            className={cn(
              "font-petaluma",
              isValid && typedValue.trim() && "border-green-500 dark:border-green-600",
              hasError && "border-destructive"
            )}
          />
          {previewLabel && (
            <p id="chord-input-preview" className="text-xs text-muted-foreground">
              → {previewLabel}
            </p>
          )}
          {hasError && parseResult?.error && (
            <p id="chord-input-error" className="text-xs text-destructive" role="alert">
              {parseResult.error}
            </p>
          )}
        </div>
        <Command>
          <CommandList>
            {!isNashville && (
              <>
                <CommandGroup heading="Root">
                  <div className="flex flex-wrap gap-1 p-2">
                    {CHORD_ROOTS.map((r) => (
                      <Button
                        key={r}
                        variant={root === r ? "default" : "outline"}
                        size="sm"
                        onClick={() => setRoot(r)}
                        className="w-10"
                      >
                        {r}
                      </Button>
                    ))}
                  </div>
                </CommandGroup>
                <CommandGroup heading="Quality">
                  <div className="flex flex-wrap gap-1 p-2 max-h-32 overflow-y-auto">
                    {CHORD_QUALITIES.map((q) => (
                      <Button
                        key={q.value}
                        variant={quality === q.value ? "default" : "outline"}
                        size="sm"
                        onClick={() => setQuality(q.value)}
                      >
                        {q.label}
                      </Button>
                    ))}
                  </div>
                </CommandGroup>
              </>
            )}
            {isNashville && (
              <CommandGroup heading="Nashville Number">
                <div className="flex flex-wrap gap-1 p-2">
                  {NASHVILLE_NUMBERS.map((n) => (
                    <Button
                      key={n}
                      variant={nashvilleDegree === n ? "default" : "outline"}
                      size="sm"
                      onClick={() => setNashvilleDegree(n)}
                      className="w-10"
                    >
                      {n}
                    </Button>
                  ))}
                </div>
              </CommandGroup>
            )}
            <CommandGroup>
              <div className="flex gap-2 p-2">
                <Button
                  className="flex-1"
                  onClick={isNashville ? handleNashvilleSelect : handleStandardChordSelect}
                >
                  Apply
                </Button>
                <Button variant="outline" onClick={handleClear}>
                  Clear
                </Button>
              </div>
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
