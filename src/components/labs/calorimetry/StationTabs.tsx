"use client";

import { StationInfo } from "./types";

interface StationTabsProps {
  stations: StationInfo[];
  activeStation: string;
  onSelect: (stationId: string) => void;
}

export default function StationTabs({ stations, activeStation, onSelect }: StationTabsProps) {
  return (
    <div className="w-full md:w-56 shrink-0 border-2 border-[var(--sim-border)] bg-[var(--sim-panel-bg)]">
      <div className="px-4 py-2 bg-[var(--sim-neutral-100)] border-b-2 border-[var(--sim-border)] text-[11px] font-bold tracking-widest text-[var(--sim-neutral-600)] uppercase">
        Stations
      </div>
      {stations.map((station) => {
        const isActive = station.id === activeStation;
        return (
          <button
            key={station.id}
            type="button"
            onClick={() => onSelect(station.id)}
            aria-current={isActive}
            className={`w-full text-left px-4 py-3 border-b-2 border-[var(--sim-border)] last:border-b-0 text-xs font-bold tracking-widest uppercase cursor-pointer transition-colors duration-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--sim-accent-700)] focus-visible:ring-offset-[-2px] ${
              isActive
                ? "bg-[var(--sim-accent-500)] text-white"
                : "bg-[var(--sim-neutral-50)] text-[var(--sim-neutral-900)] hover:bg-[var(--sim-neutral-100)]"
            }`}
          >
            {station.label}
          </button>
        );
      })}
    </div>
  );
}
