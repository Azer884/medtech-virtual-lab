"use client";

import { useState } from "react";
import CalorimetryUnity from "./CalorimetryUnity";
import MaterialInventory from "./MaterialInventory";
import {
  CalorimetryBench,
  CalorimetrySection,
  MaterialInfo,
  StationInfo,
  sampleAt,
  samplesInUse,
  scaleReading,
} from "./types";
import { UnityCalorimetrySnapshot } from "./unityState";

interface StationCanvasProps {
  section: CalorimetrySection;
  station: StationInfo;
  materials: MaterialInfo[];
  bench: CalorimetryBench;
  snapshot: UnityCalorimetrySnapshot;
  onPlaceSample: (materialId: string) => void;
  onRemoveSample: () => void;
}

/**
 * Bench canvas for the active station. Unity draws the station's apparatus
 * underneath. A material dragged in from the inventory is set on the
 * station — on the scale pan, into the beaker or cup, onto the plate or
 * under the can — and Unity draws it there. On the balance, the scale's LCD
 * also reads its mass. A sample stays on its station until removed.
 */
export default function StationCanvas({
  section,
  station,
  materials,
  bench,
  snapshot,
  onPlaceSample,
  onRemoveSample,
}: StationCanvasProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const isBalance = station.id === "balance";
  const onStation = sampleAt(bench, section, station.id);
  const inUse = samplesInUse(bench, section);

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
        if (materials.some((m) => m.id === materialId) && !inUse.includes(materialId)) {
          onPlaceSample(materialId);
        }
      }}
      className={`relative flex-1 min-h-[500px] border-2 bg-[var(--sim-panel-bg)] flex flex-col items-center justify-center gap-3 p-8 text-center transition-colors duration-100 ${
        isDragOver
          ? "border-[var(--sim-accent-700)] outline outline-2 outline-dashed outline-[var(--sim-accent-900)] outline-offset-[-4px]"
          : "border-[var(--sim-border)]"
      }`}
    >
      <CalorimetryUnity snapshot={snapshot} />

      <div className="absolute top-3 left-3 right-3 flex flex-col items-center gap-1 pointer-events-none">
        <span className="text-sm font-bold tracking-widest text-[var(--sim-label)] uppercase">
          {station.label}
        </span>
        <p className="max-w-md text-sm text-[var(--sim-neutral-500)]">
          {station.description}
        </p>
      </div>

      <div className="absolute bottom-3 right-3 w-44 flex flex-col gap-1.5 border-2 border-[var(--sim-border)] bg-[var(--sim-neutral-0)] shadow-md px-3 py-2 text-left">
        <span className="text-[10px] font-bold tracking-widest uppercase text-[var(--sim-label)]">
          {station.label}
        </span>
        {isBalance && (
          <span className="font-mono text-2xl font-semibold text-[var(--sim-neutral-900)] tabular-nums">
            {scaleReading(bench, section)} g
          </span>
        )}
        <span className="text-xs text-[var(--sim-neutral-600)] leading-tight">
          {onStation ? onStation.label : "Empty. Drag a material here from the inventory."}
        </span>
        {onStation && (
          <button
            type="button"
            onClick={onRemoveSample}
            className="self-start mt-0.5 text-xs font-semibold text-[var(--sim-accent-700)] hover:underline"
          >
            Remove sample
          </button>
        )}
      </div>

      <MaterialInventory materials={materials} inUseIds={inUse} />
    </div>
  );
}
