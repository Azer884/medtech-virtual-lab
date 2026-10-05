"use client";

import MaterialInventory from "./MaterialInventory";
import { MaterialInfo, StationInfo } from "./types";

interface StationCanvasProps {
  station: StationInfo;
  materials: MaterialInfo[];
  selectedMaterial: string | null;
  onSelectMaterial: (materialId: string) => void;
}

/**
 * Bench canvas for the active station. No interaction or chemistry yet —
 * this is scaffolding so the tab/station shell has somewhere to render,
 * matching the other sims' canvas footprint.
 */
export default function StationCanvas({
  station,
  materials,
  selectedMaterial,
  onSelectMaterial,
}: StationCanvasProps) {
  return (
    <div className="relative flex-1 min-h-[500px] border-2 border-[var(--sim-border)] bg-[var(--sim-panel-bg)] flex flex-col items-center justify-center gap-3 p-8 text-center">
      <span className="text-sm font-bold tracking-widest text-[var(--sim-label)] uppercase">
        {station.label}
      </span>
      <p className="max-w-md text-sm text-[var(--sim-neutral-500)]">
        {station.description}
      </p>
      <span className="mt-2 text-xs italic text-[var(--sim-neutral-400)]">
        Station controls coming soon.
      </span>

      <MaterialInventory
        materials={materials}
        selected={selectedMaterial}
        onSelect={onSelectMaterial}
      />
    </div>
  );
}
