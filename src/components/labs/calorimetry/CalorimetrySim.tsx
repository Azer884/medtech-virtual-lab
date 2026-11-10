"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import SectionTabs from "./SectionTabs";
import StationCanvas from "./StationCanvas";
import StationTabs from "./StationTabs";
import {
  CalorimetryBench,
  CalorimetrySection,
  CUP_STATION,
  INITIAL_BENCH,
  benchSettled,
  getMaterialsFor,
  getStationsFor,
  ignite,
  stepBench,
  syncCup,
  uncover,
} from "./types";
import { toUnitySnapshot } from "./unityState";

/** How often the bench is advanced, ms. */
const TICK_MS = 100;
/** The most one tick may advance the bench, s. */
const MAX_STEP_SECONDS = 1;

export default function CalorimetrySim() {
  const [activeSection, setActiveSection] = useState<CalorimetrySection>("metal");
  const stations = getStationsFor(activeSection);
  const materials = getMaterialsFor(activeSection);
  const [activeStation, setActiveStation] = useState(stations[0].id);
  const [bench, setBench] = useState<CalorimetryBench>(INITIAL_BENCH);

  const selectSection = (section: CalorimetrySection) => {
    setActiveSection(section);
    setActiveStation(getStationsFor(section)[0].id);
  };

  const station = stations.find((s) => s.id === activeStation) ?? stations[0];

  // A sample already out on some station stays there: it can't be dropped
  // anywhere else until it is removed back to the inventory. Dropping onto an
  // occupied station sends the sample that was there back to the inventory.
  const placeSample = (materialId: string) => {
    setBench((prev) => {
      const placed = prev.placements[activeSection];
      if (Object.values(placed).includes(materialId)) return prev;
      const next = {
        ...prev,
        placements: { ...prev.placements, [activeSection]: { ...placed, [station.id]: materialId } },
      };
      return station.id === CUP_STATION ? syncCup(next) : next;
    });
  };

  const removeSample = () => {
    setBench((prev) => {
      // A burning sample stays on the dish until it is out.
      if (prev.burning !== null && prev.placements[activeSection][station.id] === prev.burning) return prev;
      const placed = { ...prev.placements[activeSection] };
      delete placed[station.id];
      const next = { ...prev, placements: { ...prev.placements, [activeSection]: placed } };
      // Taking the sample off the dish means lifting the can off first.
      if (station.id === CUP_STATION) return syncCup(next);
      return station.id === "tin-can-calorimeter" ? uncover(next) : next;
    });
  };

  // Stable, so the Unity event listener isn't re-attached every render.
  const toggleHeater = useCallback(() => {
    setBench((prev) => ({ ...prev, heaterOn: !prev.heaterOn }));
  }, []);

  const igniteSample = () => setBench(ignite);

  // Everything back in the inventory, cold water, plate off.
  const resetBench = () => setBench(INITIAL_BENCH);

  // One clock runs the whole bench in real time, whichever station is open:
  // the bath heats and cools, a lit sample burns down and warms the flask, the
  // cup water and the metal in it meet in the middle, and a metal carries the
  // bath's heat with it. It only ticks while something is still changing.
  const settled = benchSettled(bench);
  useEffect(() => {
    if (settled) return;
    let last = performance.now();
    const id = window.setInterval(() => {
      // Real elapsed time, so the bench keeps pace when the browser throttles
      // the timer in a background tab. Capped, so a long sleep can't jump it.
      const now = performance.now();
      const dt = Math.min(MAX_STEP_SECONDS, (now - last) / 1000);
      last = now;
      setBench((prev) => stepBench(prev, dt));
    }, TICK_MS);
    return () => window.clearInterval(id);
  }, [settled]);

  // Memoised so Unity only gets a SetState when something it draws changed.
  const snapshot = useMemo(
    () => toUnitySnapshot(bench, activeSection, station.id),
    [bench, activeSection, station.id],
  );

  return (
    <div className="w-full border-2 border-[var(--sim-border)] bg-[var(--sim-neutral-50)]">
      <SectionTabs activeSection={activeSection} onSelect={selectSection} />
      <StationTabs stations={stations} activeStation={activeStation} onSelect={setActiveStation} />

      <div className="p-4">
        <StationCanvas
          section={activeSection}
          station={station}
          materials={materials}
          bench={bench}
          snapshot={snapshot}
          onPlaceSample={placeSample}
          onRemoveSample={removeSample}
          onHeaterToggle={toggleHeater}
          onIgnite={igniteSample}
        />
        <div className="mt-2 flex justify-end">
          <button
            type="button"
            onClick={resetBench}
            disabled={bench === INITIAL_BENCH}
            className="border-2 border-[var(--sim-border)] bg-[var(--sim-neutral-0)] px-2.5 py-1 text-xs font-bold tracking-widest uppercase text-[var(--sim-neutral-900)] enabled:hover:border-[var(--sim-accent-700)] disabled:cursor-not-allowed disabled:text-[var(--sim-neutral-500)] disabled:bg-[var(--sim-neutral-50)]"
          >
            Reset bench
          </button>
        </div>
      </div>
    </div>
  );
}
