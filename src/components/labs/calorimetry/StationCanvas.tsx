"use client";

import { DragEvent, useRef, useState } from "react";
import CalorimetryUnity, { DropProbe } from "./CalorimetryUnity";
import MaterialInventory from "./MaterialInventory";
import {
  CalorimetryBench,
  CalorimetrySection,
  MaterialInfo,
  StationInfo,
  burnRemaining,
  canIgnite,
  FLASK_WATER_GRAMS,
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
  onHeaterToggle: () => void;
  onIgnite: () => void;
}

/**
 * Bench canvas for the active station. Unity draws the station's apparatus
 * underneath. A material dragged in from the inventory is set on the
 * station — on the scale pan, into the beaker or cup, onto the plate or
 * under the can — and Unity draws it there. It only lands when let go over
 * the apparatus itself, which Unity outlines while the sample is held over it. On the balance, the scale's LCD
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
  onHeaterToggle,
  onIgnite,
}: StationCanvasProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const probeRef = useRef<DropProbe | null>(null);
  const isBalance = station.id === "balance";
  const isBath = station.id === "hot-water-bath";
  const isTinCan = station.id === "tin-can-calorimeter";
  const onStation = sampleAt(bench, section, station.id);
  const onStationBurning = !!onStation && bench.burning === onStation.id;
  const onStationBurnt = !!onStation && bench.burnt.includes(onStation.id);
  const inUse = samplesInUse(bench, section);

  // Without a running 3D bench there is nothing to aim at, so the whole
  // canvas stands in for the station.
  const overApparatus = (e: DragEvent) => probeRef.current?.hover(e.clientX, e.clientY) ?? true;

  const endDrag = () => {
    setIsDragOver(false);
    probeRef.current?.end();
  };

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        const over = overApparatus(e);
        e.dataTransfer.dropEffect = over ? "copy" : "none";
        setIsDragOver(over);
      }}
      onDragLeave={(e) => {
        // Moving onto a child element also fires dragleave; only a real exit counts.
        if (e.currentTarget.contains(e.relatedTarget as Node | null)) return;
        endDrag();
      }}
      onDrop={(e) => {
        e.preventDefault();
        const over = overApparatus(e);
        endDrag();
        if (!over) return;
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
      <CalorimetryUnity snapshot={snapshot} probeRef={probeRef} onHeaterToggle={onHeaterToggle} />

      {section === "biomass" && (
        <div className="absolute top-3 left-3 flex items-center gap-2 border-2 border-[var(--sim-border)] bg-[var(--sim-neutral-0)] shadow-md px-2.5 py-1.5 pointer-events-none">
          <span
            aria-hidden
            className={`h-2.5 w-2.5 rounded-full ${bench.burning !== null ? "bg-orange-500 animate-pulse" : "bg-[var(--sim-neutral-300)]"}`}
          />
          <span className="text-[10px] font-bold tracking-widest uppercase text-[var(--sim-label)]">
            Flask
          </span>
          <span className="font-mono text-sm font-semibold tabular-nums text-[var(--sim-neutral-900)]">
            {bench.flaskTemp.toFixed(1)} °C
          </span>
          <span className="text-[10px] font-semibold tabular-nums text-[var(--sim-neutral-500)]">
            max {bench.flaskMax.toFixed(1)}
          </span>
        </div>
      )}

      {section === "metal" && (
        <div className="absolute top-3 left-3 flex items-center gap-2 border-2 border-[var(--sim-border)] bg-[var(--sim-neutral-0)] shadow-md px-2.5 py-1.5 pointer-events-none">
          <span
            aria-hidden
            className={`h-2.5 w-2.5 rounded-full ${bench.heaterOn ? "bg-red-600" : "bg-[var(--sim-neutral-300)]"}`}
          />
          <span className="text-[10px] font-bold tracking-widest uppercase text-[var(--sim-label)]">
            Hot plate {bench.heaterOn ? "on" : "off"}
          </span>
          <span className="font-mono text-sm font-semibold tabular-nums text-[var(--sim-neutral-900)]">
            {bench.bathTemp.toFixed(1)} °C
          </span>
        </div>
      )}

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
        {isBath && (
          <>
            <span className="font-mono text-2xl font-semibold text-[var(--sim-neutral-900)] tabular-nums">
              {bench.bathTemp.toFixed(1)} °C
            </span>
            <span className="text-xs text-[var(--sim-neutral-600)] leading-tight">
              Heater {bench.heaterOn ? "on" : "off"}. Click the hot plate to switch it.
            </span>
          </>
        )}
        <span className="text-xs text-[var(--sim-neutral-600)] leading-tight">
          {onStation
            ? `${onStation.label}${onStationBurnt ? " (burnt)" : ""}`
            : "Empty. Drag a material here from the inventory."}
        </span>
        {isTinCan && (
          <>
            <span className="font-mono text-2xl font-semibold text-[var(--sim-neutral-900)] tabular-nums">
              {bench.flaskTemp.toFixed(1)} °C
            </span>
            <span className="text-xs text-[var(--sim-neutral-600)] leading-tight">
              Max {bench.flaskMax.toFixed(1)} °C. Flask water, {FLASK_WATER_GRAMS} g.
            </span>
          </>
        )}
        {isTinCan && onStation && (
          <>
            <button
              type="button"
              onClick={onIgnite}
              disabled={!canIgnite(bench)}
              className="flex items-center justify-center gap-1.5 border-2 border-[var(--sim-border)] bg-[var(--sim-neutral-0)] px-2 py-1 text-xs font-bold tracking-widest uppercase text-[var(--sim-neutral-900)] enabled:hover:border-[var(--sim-accent-700)] disabled:cursor-not-allowed disabled:text-[var(--sim-neutral-500)] disabled:bg-[var(--sim-neutral-50)]"
            >
              <span
                aria-hidden
                className={`h-2.5 w-2.5 rounded-full ${onStationBurning ? "bg-orange-500 animate-pulse" : "bg-[var(--sim-neutral-300)]"}`}
              />
              {onStationBurning ? "Burning" : onStationBurnt ? "Burnt out" : "Ignite"}
            </button>
            {onStationBurning && (
              <span className="font-mono text-xs tabular-nums text-[var(--sim-neutral-600)]">
                {Math.ceil(burnRemaining(bench))} s left
              </span>
            )}
          </>
        )}
        {onStation && !onStationBurning && (
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
