"use client";

import { StationInfo } from "./types";

interface StationTabsProps {
  stations: StationInfo[];
  activeStation: string;
  onSelect: (stationId: string) => void;
}

export default function StationTabs({ stations, activeStation, onSelect }: StationTabsProps) {
  return (
    <div className="flex border-b-2 border-[var(--sim-border)] bg-[var(--sim-panel-bg)]">
      {stations.map((station) => {
        const isActive = station.id === activeStation;
        return (
          <button
            key={station.id}
            type="button"
            onClick={() => onSelect(station.id)}
            aria-current={isActive}
            className={`flex-1 text-center px-4 py-3 border-r-2 border-[var(--sim-border)] last:border-r-0 text-xs font-bold tracking-widest uppercase cursor-pointer transition-colors duration-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--sim-accent-700)] focus-visible:ring-offset-[-2px] ${
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
