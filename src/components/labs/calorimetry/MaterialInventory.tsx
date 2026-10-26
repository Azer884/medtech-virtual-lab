"use client";

import { MaterialInfo } from "./types";

interface MaterialInventoryProps {
  materials: MaterialInfo[];
  /** Materials out on a station, whose cases show empty. */
  inUseIds?: string[];
}

/**
 * Bench inventory, pinned to the bottom-left corner of the canvas, listing
 * the materials available for the active section as draggable cases — each
 * one a picture of the sample rendered from its Unity model, dragged onto a
 * station to use it. Drop handling lives on the station that wants it.
 *
 * A sample that is on a station has left its case, so that case shows an
 * empty slot and can't be dragged until it is removed from that station.
 */
export default function MaterialInventory({ materials, inUseIds = [] }: MaterialInventoryProps) {
  return (
    <div className="absolute bottom-3 left-3 flex gap-2">
      {materials.map((material) => {
        const inUse = inUseIds.includes(material.id);

        return (
          <div
            key={material.id}
            draggable={!inUse}
            onDragStart={(e) => {
              e.dataTransfer.effectAllowed = "copy";
              e.dataTransfer.setData("text/plain", material.id);
              // Only the sample is carried, not its white case: the browser
              // snapshots the drag image, so it gets a bare copy of the
              // transparent picture, parked off-screen for the snapshot.
              // Cloned from the case's own img, which has already loaded, so
              // the copy is ready the moment the browser snapshots it.
              const image = e.currentTarget.querySelector("img");
              if (!image) return;
              const ghost = image.cloneNode() as HTMLImageElement;
              ghost.removeAttribute("class");
              ghost.width = 56;
              ghost.height = 56;
              ghost.style.cssText = "position:fixed;top:-1000px;left:-1000px;background:transparent;pointer-events:none";
              document.body.appendChild(ghost);
              e.dataTransfer.setDragImage(ghost, 28, 28);
              window.setTimeout(() => ghost.remove(), 0);
            }}
            title={inUse ? `${material.label} (on a station)` : material.label}
            className={`w-24 flex flex-col items-center gap-1 border-2 shadow-md px-2 py-2 select-none transition-colors duration-100 ${
              inUse
                ? "border-dashed border-[var(--sim-neutral-300)] bg-[var(--sim-neutral-50)] cursor-default"
                : "border-[var(--sim-border)] bg-[var(--sim-neutral-0)] cursor-grab active:cursor-grabbing hover:border-[var(--sim-accent-700)]"
            }`}
          >
            {inUse ? (
              <div aria-hidden className="w-14 h-14" />
            ) : (
              // eslint-disable-next-line @next/next/no-img-element -- a native img is what setDragImage needs
              <img
                src={material.icon}
                alt={material.label}
                width={56}
                height={56}
                draggable={false}
                className="w-14 h-14 object-contain"
              />
            )}
            <span
              className={`text-[10px] font-semibold text-center leading-tight ${
                inUse ? "text-[var(--sim-neutral-500)]" : "text-[var(--sim-neutral-900)]"
              }`}
            >
              {material.label}
            </span>
          </div>
        );
      })}
    </div>
  );
}
