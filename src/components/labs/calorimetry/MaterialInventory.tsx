"use client";

import { MaterialInfo } from "./types";

interface MaterialInventoryProps {
  materials: MaterialInfo[];
  selected: string | null;
  onSelect: (materialId: string) => void;
}

/**
 * Bench inventory, pinned to the bottom-left corner of the canvas, listing
 * the materials available for the active section (metals or biomass fuels).
 * Clicking a material selects/deselects it; no drag-to-station wiring yet.
 */
export default function MaterialInventory({
  materials,
  selected,
  onSelect,
}: MaterialInventoryProps) {
  return (
    <div className="absolute bottom-3 left-3 w-44 border-2 border-[var(--sim-border)] bg-[var(--sim-neutral-0)] shadow-md">
      <div className="px-3 py-1.5 bg-[var(--sim-neutral-100)] border-b-2 border-[var(--sim-border)] text-[10px] font-bold tracking-widest text-[var(--sim-neutral-600)] uppercase">
        Inventory
      </div>
      <div className="p-2 flex flex-col gap-1">
        {materials.map((material) => {
          const isActive = material.id === selected;
          return (
            <button
              key={material.id}
              type="button"
              onClick={() => onSelect(material.id)}
              aria-pressed={isActive}
              className={`text-left px-2 py-1.5 border-2 text-xs font-semibold cursor-pointer transition-colors duration-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--sim-accent-700)] ${
                isActive
                  ? "bg-[var(--sim-accent-500)] border-[var(--sim-accent-500)] text-white"
                  : "bg-[var(--sim-neutral-50)] border-[var(--sim-border-subtle)] text-[var(--sim-neutral-900)] hover:bg-[var(--sim-neutral-100)]"
              }`}
            >
              {material.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
