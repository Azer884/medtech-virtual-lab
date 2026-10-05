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

/** A pickable material shown in the bench inventory for a section. */
export interface MaterialInfo {
  id: string;
  label: string;
}

export const METAL_MATERIALS: MaterialInfo[] = [
  { id: "zinc", label: "Zinc (Zn)" },
  { id: "aluminum", label: "Aluminum (Al)" },
  { id: "tin", label: "Tin (Sn)" },
];

export const BIOMASS_MATERIALS: MaterialInfo[] = [
  { id: "wood-chips", label: "Wood Chips / Splints" },
  { id: "dried-grass", label: "Dried Grass / Corn Stalks" },
];

export function getMaterialsFor(section: CalorimetrySection): MaterialInfo[] {
  return section === "metal" ? METAL_MATERIALS : BIOMASS_MATERIALS;
}
