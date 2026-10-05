"use client";

import { useState } from "react";
import MaterialInventory from "./MaterialInventory";
import { MaterialInfo, StationInfo } from "./types";

interface StationCanvasProps {
  station: StationInfo;
  materials: MaterialInfo[];
}

/**
 * Bench canvas for the active station. Materials can be dragged in from the
 * inventory and dropped here — dropping just places a ball for now, no
 * chemistry/reaction logic wired up yet.
 */
export default function StationCanvas({ station, materials }: StationCanvasProps) {
  const [droppedMaterial, setDroppedMaterial] = useState<MaterialInfo | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = "copy";
        setIsDragOver(true);
      }}
      onDragLeave={() => setIsDragOver(false)}
      onDrop={(e) => {
        e.preventDefault();
        setIsDragOver(false);
        const materialId = e.dataTransfer.getData("text/plain");
        const material = materials.find((m) => m.id === materialId);
        if (material) setDroppedMaterial(material);
      }}
      className={`relative flex-1 min-h-[500px] border-2 bg-[var(--sim-panel-bg)] flex flex-col items-center justify-center gap-3 p-8 text-center transition-colors duration-100 ${
        isDragOver
          ? "border-[var(--sim-accent-700)] outline outline-2 outline-dashed outline-[var(--sim-accent-900)] outline-offset-[-4px]"
          : "border-[var(--sim-border)]"
      }`}
    >
      <span className="text-sm font-bold tracking-widest text-[var(--sim-label)] uppercase">
        {station.label}
      </span>
      <p className="max-w-md text-sm text-[var(--sim-neutral-500)]">
        {station.description}
      </p>

      {droppedMaterial ? (
        <div className="flex flex-col items-center gap-1.5 mt-2">
          <div
            role="img"
            aria-label={droppedMaterial.label}
            title={droppedMaterial.label}
            className="w-9 h-9 rounded-full bg-[var(--sim-accent-500)] border-2 border-[var(--sim-accent-700)] shadow-sm"
          />
          <span className="text-xs font-semibold text-[var(--sim-neutral-700)]">
            {droppedMaterial.label}
          </span>
        </div>
      ) : (
        <span className="mt-2 text-xs italic text-[var(--sim-neutral-400)]">
          Drag a material here.
        </span>
      )}

      <MaterialInventory materials={materials} />
    </div>
  );
}
