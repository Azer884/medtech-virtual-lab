"use client";

import { MaterialInfo } from "./types";

interface MaterialInventoryProps {
  materials: MaterialInfo[];
}

/**
 * Bench inventory, pinned to the bottom-left corner of the canvas, listing
 * the materials available for the active section as draggable cases — each
 * one a ball standing in for the real material model, dragged onto a
 * station to use it. Drop handling lives on the station that wants it.
 */
export default function MaterialInventory({ materials }: MaterialInventoryProps) {
  return (
    <div className="absolute bottom-3 left-3 flex gap-2">
      {materials.map((material) => (
        <div
          key={material.id}
          className="w-20 flex flex-col items-center gap-1.5 border-2 border-[var(--sim-border)] bg-[var(--sim-neutral-0)] shadow-md px-2 py-2"
        >
          <div
            draggable
            onDragStart={(e) => {
              e.dataTransfer.effectAllowed = "copy";
              e.dataTransfer.setData("text/plain", material.id);
            }}
            role="img"
            aria-label={material.label}
            title={material.label}
            className="w-9 h-9 rounded-full bg-[var(--sim-accent-500)] border-2 border-[var(--sim-accent-700)] cursor-grab active:cursor-grabbing shadow-sm"
          />
          <span className="text-[10px] font-semibold text-center text-[var(--sim-neutral-700)] leading-tight">
            {material.label}
          </span>
        </div>
      ))}
    </div>
  );
}
