/** Outer tab: which calorimetry setup is being run. */
export type CalorimetrySection = "metal" | "biomass";

export interface CalorimetrySectionInfo {
  id: CalorimetrySection;
  label: string;
  subtitle: string;
}

export const CALORIMETRY_SECTIONS: CalorimetrySectionInfo[] = [
  {
    id: "metal",
    label: "Metal",
    subtitle: "Constant Pressure",
  },
  {
    id: "biomass",
    label: "Biomass",
    subtitle: "Constant Volume",
  },
];

/** Inner tab: a physical station on the bench for the active section. */
export interface StationInfo {
  id: string;
  label: string;
  description: string;
}

export const METAL_STATIONS: StationInfo[] = [
  {
    id: "balance",
    label: "Balance",
    description: "Weigh the metal sample before heating.",
  },
  {
    id: "hot-water-bath",
    label: "Hot Water Bath",
    description: "Heat the metal until it reaches the bath temperature.",
  },
  {
    id: "coffee-cup-calorimeter",
    label: "Coffee Cup Calorimeter",
    description:
      "Transfer the heated metal into the cold water, cover, stir, and record the temperature change.",
  },
];

export const BIOMASS_STATIONS: StationInfo[] = [
  {
    id: "balance",
    label: "Balance",
    description: "Weigh the biomass sample before and after burning.",
  },
  {
    id: "burn-plate",
    label: "Burn Plate",
    description: "Light the biomass sample on the pie plate and mortar screen.",
  },
  {
    id: "tin-can-calorimeter",
    label: "Tin Can Calorimeter",
    description:
      "Assemble the tin can and water flask over the burning sample, stir, and record the maximum temperature.",
  },
];

export function getStationsFor(section: CalorimetrySection): StationInfo[] {
  return section === "metal" ? METAL_STATIONS : BIOMASS_STATIONS;
}

/**
 * How a sample is drawn on the Unity bench. Sent as-is, so a new material
 * only needs an entry here, not a Unity change.
 */
export interface MaterialLook {
  /** Base colour of the sample's model. */
  color: string;
  /** 0..1, URP Lit metallic. */
  metallic: number;
  /** 0..1, URP Lit smoothness. */
  smoothness: number;
}

/** A pickable material shown in the bench inventory for a section. */
export interface MaterialInfo {
  id: string;
  label: string;
  /** Inventory picture, rendered from the Unity model in this material's look. */
  icon: string;
  look: MaterialLook;
  /** What the balance reads with this sample on the pan, in grams. */
  massGrams: number;
  /** Metals only: specific heat capacity, J/(g·°C). */
  specificHeat?: number;
  /** Biomass only: approximate heat of combustion, kJ/g. */
  heatOfCombustion?: number;
}

// The three metal samples are the same size puck, so their masses follow
// their densities (Zn 7.14, Al 2.70, Sn 7.27 g/cm³).
export const METAL_MATERIALS: MaterialInfo[] = [
  {
    id: "zinc",
    label: "Zinc (Zn)",
    icon: "/images/calorimetry/zinc.png",
    look: { color: "#8f9ba6", metallic: 0.6, smoothness: 0.55 },
    massGrams: 26.48,
    specificHeat: 0.388,
  },
  {
    id: "aluminum",
    label: "Aluminum (Al)",
    icon: "/images/calorimetry/aluminum.png",
    look: { color: "#d6dadf", metallic: 0.5, smoothness: 0.6 },
    massGrams: 10.01,
    specificHeat: 0.897,
  },
  {
    id: "tin",
    label: "Tin (Sn)",
    icon: "/images/calorimetry/tin.png",
    look: { color: "#b8b2a3", metallic: 0.55, smoothness: 0.45 },
    massGrams: 26.96,
    specificHeat: 0.227,
  },
];

export const BIOMASS_MATERIALS: MaterialInfo[] = [
  {
    id: "wood-chips",
    label: "Wood Chips / Splints",
    icon: "/images/calorimetry/wood-chips.png",
    look: { color: "#8a5a32", metallic: 0, smoothness: 0.25 },
    massGrams: 2.35,
    heatOfCombustion: 18,
  },
  {
    id: "dried-grass",
    label: "Dried Grass / Corn Stalks",
    icon: "/images/calorimetry/dried-grass.png",
    look: { color: "#b3a24f", metallic: 0, smoothness: 0.2 },
    massGrams: 1.84,
    heatOfCombustion: 16,
  },
];

export function findMaterial(id: string | null): MaterialInfo | undefined {
  if (!id) return undefined;
  return [...METAL_MATERIALS, ...BIOMASS_MATERIALS].find((m) => m.id === id);
}

/**
 * Everything the student has done on the bench. React owns it; Unity only
 * draws what this says (see unityState.ts).
 */
export interface CalorimetryBench {
  /**
   * Which sample sits on each station, per section: station id to material
   * id. A station missing from the map is empty. A sample is in at most one
   * place — on one station or back in the inventory — so moving it to the
   * next station means removing it from the one it is on first.
   */
  placements: Record<CalorimetrySection, Record<string, string>>;
  waterColor: string;
  /** Beaker on the hot water bath, 0..1. */
  beakerFill: number;
  /** Flask in the tin can calorimeter, 0..1. */
  flaskFill: number;
}

export const INITIAL_BENCH: CalorimetryBench = {
  placements: { metal: {}, biomass: {} },
  waterColor: "#9eccf28c",
  beakerFill: 0.6,
  flaskFill: 0.55,
};

/** The sample on a station, or undefined when the station is empty. */
export function sampleAt(
  bench: CalorimetryBench,
  section: CalorimetrySection,
  stationId: string,
): MaterialInfo | undefined {
  return findMaterial(bench.placements[section][stationId] ?? null);
}

/** Ids of every sample out of the inventory in a section. */
export function samplesInUse(bench: CalorimetryBench, section: CalorimetrySection): string[] {
  return Object.values(bench.placements[section]);
}

/** What the balance shows, formatted like its two-decimal LCD. */
export function scaleReading(bench: CalorimetryBench, section: CalorimetrySection): string {
  return (sampleAt(bench, section, "balance")?.massGrams ?? 0).toFixed(2);
}

export function getMaterialsFor(section: CalorimetrySection): MaterialInfo[] {
  return section === "metal" ? METAL_MATERIALS : BIOMASS_MATERIALS;
}
