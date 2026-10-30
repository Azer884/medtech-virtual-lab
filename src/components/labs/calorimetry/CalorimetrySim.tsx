"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import SectionTabs from "./SectionTabs";
import StationCanvas from "./StationCanvas";
import StationTabs from "./StationTabs";
import {
  CalorimetryBench,
  CalorimetrySection,
  INITIAL_BENCH,
  bathSettled,
  flaskSettled,
  getMaterialsFor,
  getStationsFor,
  ignite,
  stepBath,
  stepFlask,
  uncover,
} from "./types";
import { toUnitySnapshot } from "./unityState";

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
      return {
        ...prev,
        placements: { ...prev.placements, [activeSection]: { ...placed, [station.id]: materialId } },
      };
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
      return station.id === "tin-can-calorimeter" ? uncover(next) : next;
    });
  };

  // Stable, so the Unity event listener isn't re-attached every render.
  const toggleHeater = useCallback(() => {
    setBench((prev) => ({ ...prev, heaterOn: !prev.heaterOn }));
  }, []);

  const igniteSample = () => setBench(ignite);

  // The bath heats and cools in real time whichever station is open, so a
  // plate left on while weighing elsewhere keeps warming the water.
  const settled = bathSettled(bench);
  useEffect(() => {
    if (settled) return;
    const tickMs = 250;
    const id = window.setInterval(() => setBench((prev) => stepBath(prev, tickMs / 1000)), tickMs);
    return () => window.clearInterval(id);
  }, [settled]);

  // A lit sample burns down, and the flask water warms and cools, in real
  // time too, whichever station is open.
  const flaskIdle = flaskSettled(bench);
  useEffect(() => {
    if (flaskIdle) return;
    const tickMs = 100;
    const id = window.setInterval(() => setBench((prev) => stepFlask(prev, tickMs / 1000)), tickMs);
    return () => window.clearInterval(id);
  }, [flaskIdle]);

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
      </div>
    </div>
  );
}
