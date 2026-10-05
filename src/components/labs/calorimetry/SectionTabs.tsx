"use client";

import { CALORIMETRY_SECTIONS, CalorimetrySection } from "./types";

interface SectionTabsProps {
  activeSection: CalorimetrySection;
  onSelect: (section: CalorimetrySection) => void;
}

export default function SectionTabs({ activeSection, onSelect }: SectionTabsProps) {
  return (
    <div className="flex border-b-2 border-[var(--sim-border)] bg-[var(--sim-neutral-50)]">
      {CALORIMETRY_SECTIONS.map((section) => {
        const isActive = section.id === activeSection;
        return (
          <button
            key={section.id}
            type="button"
            onClick={() => onSelect(section.id)}
            className={`flex flex-col items-start gap-1 px-6 py-2.5 border-r-2 border-[var(--sim-border)] cursor-pointer transition-colors duration-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--sim-accent-700)] focus-visible:ring-offset-[-2px] ${
              isActive
                ? "bg-[var(--sim-accent-500)] text-white"
                : "bg-[var(--sim-neutral-50)] text-[var(--sim-neutral-600)] hover:bg-[var(--sim-neutral-100)]"
            }`}
          >
            <span className="text-sm font-bold tracking-wide uppercase">
              {section.label}
            </span>
            <span
              className={`text-xs font-semibold ${
                isActive ? "text-white/80" : "text-[var(--sim-neutral-500)]"
              }`}
            >
              {section.subtitle}
            </span>
          </button>
        );
      })}
    </div>
  );
}
