"use client";

import { useState } from "react";
import SectionTabs from "./SectionTabs";
import StationCanvas from "./StationCanvas";
import StationTabs from "./StationTabs";
import { CalorimetrySection, getMaterialsFor, getStationsFor } from "./types";

export default function CalorimetrySim() {
  const [activeSection, setActiveSection] = useState<CalorimetrySection>("metal");
  const stations = getStationsFor(activeSection);
  const materials = getMaterialsFor(activeSection);
  const [activeStation, setActiveStation] = useState(stations[0].id);
  const [selectedMaterial, setSelectedMaterial] = useState<string | null>(null);

  const selectSection = (section: CalorimetrySection) => {
    setActiveSection(section);
    setActiveStation(getStationsFor(section)[0].id);
    setSelectedMaterial(null);
  };

  const selectMaterial = (materialId: string) =>
    setSelectedMaterial((current) => (current === materialId ? null : materialId));

  const station = stations.find((s) => s.id === activeStation) ?? stations[0];

  return (
    <div className="w-full border-2 border-[var(--sim-border)] bg-[var(--sim-neutral-50)]">
      <SectionTabs activeSection={activeSection} onSelect={selectSection} />
      <StationTabs stations={stations} activeStation={activeStation} onSelect={setActiveStation} />

      <div className="p-4">
        <StationCanvas
          station={station}
          materials={materials}
          selectedMaterial={selectedMaterial}
          onSelectMaterial={selectMaterial}
        />
      </div>
    </div>
  );
}
