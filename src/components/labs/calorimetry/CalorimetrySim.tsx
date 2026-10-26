"use client";

import { useMemo, useState } from "react";
import SectionTabs from "./SectionTabs";
import StationCanvas from "./StationCanvas";
import StationTabs from "./StationTabs";
import {
  CalorimetryBench,
  CalorimetrySection,
  INITIAL_BENCH,
  getMaterialsFor,
  getStationsFor,
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
      const placed = { ...prev.placements[activeSection] };
      delete placed[station.id];
      return { ...prev, placements: { ...prev.placements, [activeSection]: placed } };
    });
  };

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
        />
      </div>
    </div>
  );
}
