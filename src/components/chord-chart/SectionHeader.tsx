import React from "react";
import { useChartStore } from "@/lib/store";
import type { Section } from "@/lib/schema";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Trash2, Plus, GripVertical } from "lucide-react";
import { SECTION_PRESETS } from "@/lib/constants";
import { SectionNavigation } from "./NavigationMarkers";

interface SectionHeaderProps {
  section: Section;
  index: number;
}

export function SectionHeader({ section }: SectionHeaderProps) {
  const { updateSection, deleteSection, addMeasure } = useChartStore();
  const [isEditing, setIsEditing] = React.useState(false);
  const [name, setName] = React.useState(section.name);

  React.useEffect(() => {
    setName(section.name);
  }, [section.name]);

  const handleNameChange = () => {
    if (name.trim()) updateSection(section.id, { name: name.trim() });
    setIsEditing(false);
  };

  return (
    <div
      className="flex items-center gap-2 py-2 border-b border-border"
      role="heading"
      aria-level={2}
    >
      <Button
        variant="ghost"
        size="icon"
        className="cursor-grab"
        aria-label="Drag to reorder section"
      >
        <GripVertical className="h-4 w-4" />
      </Button>
      {section.rehearsalMark && (
        <span
          className="px-2 py-1 bg-primary text-primary-foreground font-bold rounded"
          aria-label={`Rehearsal mark ${section.rehearsalMark}`}
        >
          {section.rehearsalMark}
        </span>
      )}
      <SectionNavigation navigation={section.navigation} position="start" />
      {isEditing ? (
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          onBlur={handleNameChange}
          onKeyDown={(e) => e.key === "Enter" && handleNameChange()}
          className="w-48"
          autoFocus
        />
      ) : (
        <button
          onClick={() => setIsEditing(true)}
          className="text-lg font-semibold hover:underline"
          aria-label={`Section name: ${section.name}. Click to edit.`}
        >
          {section.name}
        </button>
      )}
      <span
        className="text-sm text-muted-foreground ml-2"
        aria-label={`Time signature: ${section.timeSignature.beats} over ${section.timeSignature.beatUnit}`}
      >
        {section.timeSignature.beats}/{section.timeSignature.beatUnit}
      </span>
      <div className="flex-1" />
      <Button
        variant="ghost"
        size="sm"
        onClick={() => addMeasure(section.id)}
        aria-label="Add measure to section"
      >
        <Plus className="h-4 w-4 mr-1" />
        Measure
      </Button>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" aria-label="Section options">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {SECTION_PRESETS.map((preset) => (
            <DropdownMenuItem
              key={preset}
              onClick={() => updateSection(section.id, { name: preset })}
            >
              Rename to {preset}
            </DropdownMenuItem>
          ))}
          <DropdownMenuItem
            className="text-destructive"
            onClick={() => deleteSection(section.id)}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete Section
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
