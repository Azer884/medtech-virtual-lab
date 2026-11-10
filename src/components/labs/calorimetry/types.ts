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
    id: "tin-can-calorimeter",
    label: "Tin Can Calorimeter",
    description:
      "Set the biomass on the dish and light it. The tin can and water flask go over it: record the maximum temperature.",
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
  /** Biomass only: seconds it burns for once lit. */
  burnSeconds?: number;
  /** Biomass only: fraction of its mass left as ash and char after burning. */
  residueFraction?: number;
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
    look: { color: "#ffffff", metallic: 0, smoothness: 0.25 },
    massGrams: 2.35,
    heatOfCombustion: 18,
    burnSeconds: 40,
    residueFraction: 0.12,
  },
  {
    id: "dried-grass",
    label: "Dried Grass / Corn Stalks",
    icon: "/images/calorimetry/dried-grass.png",
    look: { color: "#ffffff", metallic: 0, smoothness: 0.2 },
    massGrams: 1.84,
    heatOfCombustion: 16,
    burnSeconds: 25,
    residueFraction: 0.08,
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
  /** Whether the hot plate under the water bath is switched on. */
  heaterOn: boolean;
  /** Water bath temperature, °C. */
  bathTemp: number;
  /** The biomass sample alight on the burn plate, or null when nothing burns. */
  burning: string | null;
  /** Seconds the burning sample has been alight. */
  burnTime: number;
  /** Biomass samples already burnt down to ash. They can't be lit again. */
  burnt: string[];
  /** Whether the tin can, with the water flask on it, stands over the dish. */
  covered: boolean;
  /** Water in the flask on the tin can, °C. */
  flaskTemp: number;
  /** The highest the flask water has reached since it was last filled, °C. */
  flaskMax: number;
  /** Coffee cup, 0..1. */
  cupFill: number;
  /** Cold water in the coffee cup, °C. */
  cupTemp: number;
  /** What the cup water settles at with the metal in it, °C. */
  cupTarget: number;
  /** Temperature the metal had when it went into the cup, °C. */
  cupMetalTemp: number;
  /**
   * Each metal sample's own temperature, °C, by material id. One missing from
   * the map is at room temperature. A metal warms towards the bath while
   * sitting in it, cools slowly in air anywhere else, and in the cup trades
   * heat with the water. Moving it between stations keeps its temperature.
   */
  metalTemps: Record<string, number>;
}

/** Lab room temperature, °C: where the bath starts and cools back to. */
export const ROOM_TEMP = 22;
/** The bath can't get hotter than boiling water, °C. */
export const BOILING_POINT = 100;
/** Hot plate heating, °C/s, before losses to the room. */
const HEATER_POWER = 2.5;
/** Newton's-law loss to the room, per second. */
const COOLING_RATE = 0.012;
/** The water starts to bubble a little from here, °C. */
const SIMMER_FROM = 70;
/** A lit sample takes this long to catch fully, s. */
const CATCH_SECONDS = 3;
/** And dies down over this long at the end, s. */
const DIE_DOWN_SECONDS = 8;
/** Water in the flask on the tin can, g. */
export const FLASK_WATER_GRAMS = 100;
/** Specific heat of water, J/(g·°C). */
const WATER_SPECIFIC_HEAT = 4.184;
/**
 * Share of a burning sample's heat that reaches the flask water. A tin can
 * calorimeter loses most of it to the can, the air and the smoke.
 */
const CAN_EFFICIENCY = 0.25;
/** Newton's-law loss from the flask water to the room, per second. */
const FLASK_COOLING_RATE = 0.002;
/** The metal is dropped into the cold water of this station. */
export const CUP_STATION = "coffee-cup-calorimeter";
/** The cup's water starts cold, °C. */
export const CUP_COLD_TEMP = 10;
/** Water in the coffee cup, g. */
export const CUP_WATER_GRAMS = 20;
/** How fast the cup water closes on its final temperature, per second. */
const CUP_SETTLE_RATE = 0.3;
/** Below this gap the cup water counts as settled, °C. */
const CUP_SETTLED_GAP = 0.05;
/** The metal is heated in the beaker on this station. */
export const BATH_STATION = "hot-water-bath";
/** How fast the metal closes on the bath temperature while in it, per second. */
const METAL_BATH_RATE = 0.25;
/** How fast the metal loses heat to the room in air, per second. */
const METAL_AIR_RATE = 0.004;
/** Below this gap the metal counts as at its surroundings' temperature, °C. */
const METAL_SETTLED_GAP = 0.005;
/**
 * Steam only comes off the cup while the metal is hot enough to flash water
 * it touches: none below CUP_STEAM_FROM, full from CUP_STEAM_FULL, °C. A cold
 * or room-temperature metal never steams.
 */
const CUP_STEAM_FROM = 60;
const CUP_STEAM_FULL = 95;
/** Steam rises off the bath from this much boil, 0..1. */
const BATH_STEAM_FROM = 0.5;
/** Steam rises off the flask from this much boil, 0..1. */
const FLASK_STEAM_FROM = 0.6;
/** Biomass burns on the tin can calorimeter's dish. */
const BURN_STATION = "tin-can-calorimeter";
/** What a burnt sample looks like: ash and char. */
const ASH_LOOK: MaterialLook = { color: "#2e2a27", metallic: 0, smoothness: 0.1 };

export const INITIAL_BENCH: CalorimetryBench = {
  placements: { metal: {}, biomass: {} },
  waterColor: "#9eccf28c",
  beakerFill: 0.6,
  flaskFill: 0.55,
  heaterOn: false,
  bathTemp: ROOM_TEMP,
  burning: null,
  burnTime: 0,
  burnt: [],
  covered: false,
  flaskTemp: ROOM_TEMP,
  flaskMax: ROOM_TEMP,
  cupFill: 0.65,
  cupTemp: CUP_COLD_TEMP,
  cupTarget: CUP_COLD_TEMP,
  cupMetalTemp: ROOM_TEMP,
  metalTemps: {},
};

/** A metal sample's temperature now, °C. */
export function metalTempOf(bench: CalorimetryBench, materialId: string): number {
  return bench.metalTemps[materialId] ?? ROOM_TEMP;
}

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

/** A sample's mass now: what is left of it once burnt. */
export function currentMass(bench: CalorimetryBench, material: MaterialInfo): number {
  if (!bench.burnt.includes(material.id)) return material.massGrams;
  return material.massGrams * (material.residueFraction ?? 0);
}

/** How a sample looks now: ash once it has burnt. */
export function currentLook(bench: CalorimetryBench, material: MaterialInfo): MaterialLook {
  return bench.burnt.includes(material.id) ? ASH_LOOK : material.look;
}

/** What the balance shows, formatted like its two-decimal LCD. */
export function scaleReading(bench: CalorimetryBench, section: CalorimetrySection): string {
  const sample = sampleAt(bench, section, "balance");
  return (sample ? currentMass(bench, sample) : 0).toFixed(2);
}

/**
 * Whether the sample on the calorimeter's dish can be lit: there, unburnt,
 * and nothing already alight.
 */
export function canIgnite(bench: CalorimetryBench): boolean {
  const sample = sampleAt(bench, "biomass", BURN_STATION);
  return !!sample && bench.burning === null && !bench.burnt.includes(sample.id);
}

/** Lights the sample on the dish and puts the can, flask and thermometer over it. */
export function ignite(bench: CalorimetryBench): CalorimetryBench {
  if (!canIgnite(bench)) return bench;
  return { ...bench, burning: bench.placements.biomass[BURN_STATION], burnTime: 0, covered: true };
}

/**
 * Lifts the can off the dish and swaps in a flask of fresh water at room
 * temperature, ready for the next sample. Never while one is burning.
 */
export function uncover(bench: CalorimetryBench): CalorimetryBench {
  if (bench.burning !== null) return bench;
  return { ...bench, covered: false, flaskTemp: ROOM_TEMP, flaskMax: ROOM_TEMP };
}

function burnSecondsOf(material: MaterialInfo): number {
  return material.burnSeconds ?? 30;
}

/**
 * How hard a sample burns t seconds after it was lit, 0..1: it catches over
 * the first few seconds, burns steadily, then dies down as the fuel runs out.
 */
function flameAt(material: MaterialInfo, t: number): number {
  const catching = Math.min(1, t / CATCH_SECONDS);
  const dying = Math.min(1, Math.max(0, burnSecondsOf(material) - t) / DIE_DOWN_SECONDS);
  return Math.max(0.05, Math.min(catching, dying));
}

/** ∫ flameAt dt over a whole burn, so the heat given off sums to the sample's full share. */
const flameTotals = new Map<string, number>();
function flameTotal(material: MaterialInfo): number {
  let total = flameTotals.get(material.id);
  if (total === undefined) {
    const step = 0.05;
    total = 0;
    for (let t = 0; t < burnSecondsOf(material); t += step) total += flameAt(material, t + step / 2) * step;
    flameTotals.set(material.id, total);
  }
  return total;
}

/** Heat the burning sample gives the flask water per second right now, J/s. */
function heatIntoFlask(bench: CalorimetryBench, material: MaterialInfo): number {
  if (!bench.covered) return 0;
  const joules = material.massGrams * (material.heatOfCombustion ?? 0) * 1000 * CAN_EFFICIENCY;
  return (joules * flameAt(material, bench.burnTime)) / flameTotal(material);
}

/**
 * Advances the tin can by dt seconds: the sample burns down, turning to ash
 * once it has burnt for its time, its heat warms the flask water, and the
 * water always loses a little to the room.
 */
export function stepFlask(bench: CalorimetryBench, dt: number): CalorimetryBench {
  const material = findMaterial(bench.burning);
  const heating = material ? heatIntoFlask(bench, material) / (FLASK_WATER_GRAMS * WATER_SPECIFIC_HEAT) : 0;
  const rate = heating - FLASK_COOLING_RATE * (bench.flaskTemp - ROOM_TEMP);
  const flaskTemp = Math.min(BOILING_POINT, Math.max(ROOM_TEMP, bench.flaskTemp + rate * dt));
  const next = { ...bench, flaskTemp, flaskMax: Math.max(bench.flaskMax, flaskTemp) };

  if (!material) return next;
  const burnTime = bench.burnTime + dt;
  if (burnTime < burnSecondsOf(material)) return { ...next, burnTime };
  return { ...next, burning: null, burnTime: 0, burnt: [...bench.burnt, material.id] };
}

/** True once the tin can has nothing left to do: nothing alight and the water back at room temperature. */
export function flaskSettled(bench: CalorimetryBench): boolean {
  return bench.burning === null && bench.flaskTemp <= ROOM_TEMP;
}

/**
 * Re-reads the metal in the coffee cup. Dropping a metal in sets the
 * temperature both will settle at, from the heat the metal carries in;
 * taking it out swaps in fresh cold water. The metal keeps its own
 * temperature either way.
 */
export function syncCup(bench: CalorimetryBench): CalorimetryBench {
  const metal = sampleAt(bench, "metal", CUP_STATION);
  if (!metal) {
    return { ...bench, cupTemp: CUP_COLD_TEMP, cupTarget: CUP_COLD_TEMP };
  }

  const metalTemp = metalTempOf(bench, metal.id);
  const waterHeat = CUP_WATER_GRAMS * WATER_SPECIFIC_HEAT;
  const metalHeat = metal.massGrams * (metal.specificHeat ?? 0);
  const cupTarget = (waterHeat * bench.cupTemp + metalHeat * metalTemp) / (waterHeat + metalHeat);
  return { ...bench, cupTarget, cupMetalTemp: metalTemp };
}

/** Moves temp towards target by dt seconds at rate, snapping once within gap. */
function relax(temp: number, target: number, rate: number, dt: number, gap: number): number {
  const diff = target - temp;
  if (Math.abs(diff) <= gap) return target;
  return temp + diff * (1 - Math.exp(-rate * dt));
}

/**
 * Advances the cup by dt seconds. With a metal in it, the water and the
 * metal close on their shared final temperature at the same rate, so the heat
 * the water gains is the heat the metal loses: the metal cools by warming the
 * water. Without one, the water only drifts to its target.
 */
export function stepCup(bench: CalorimetryBench, dt: number): CalorimetryBench {
  const cupTemp = relax(bench.cupTemp, bench.cupTarget, CUP_SETTLE_RATE, dt, CUP_SETTLED_GAP);
  const metal = sampleAt(bench, "metal", CUP_STATION);
  if (!metal) return { ...bench, cupTemp };
  const metalTemp = relax(metalTempOf(bench, metal.id), bench.cupTarget, CUP_SETTLE_RATE, dt, CUP_SETTLED_GAP);
  return { ...bench, cupTemp, metalTemps: { ...bench.metalTemps, [metal.id]: metalTemp } };
}

/** True once the cup water, and the metal in it if any, have reached their final temperature. */
export function cupSettled(bench: CalorimetryBench): boolean {
  if (bench.cupTemp !== bench.cupTarget) return false;
  const metal = sampleAt(bench, "metal", CUP_STATION);
  return !metal || metalTempOf(bench, metal.id) === bench.cupTarget;
}

/** What a metal outside the cup is closing on, °C, and how fast, per second. */
function metalSurroundings(bench: CalorimetryBench, materialId: string): { temp: number; rate: number } {
  return bench.placements.metal[BATH_STATION] === materialId
    ? { temp: bench.bathTemp, rate: METAL_BATH_RATE }
    : { temp: ROOM_TEMP, rate: METAL_AIR_RATE };
}

/**
 * Advances every metal's temperature by dt seconds wherever it is outside the
 * cup: the one in the bath warms towards it, the rest cool slowly in air
 * towards the room, on a station or back in the inventory. In the cup,
 * stepCup owns it.
 */
export function stepMetal(bench: CalorimetryBench, dt: number): CalorimetryBench {
  const inCup = bench.placements.metal[CUP_STATION];
  let metalTemps = bench.metalTemps;
  for (const { id } of METAL_MATERIALS) {
    if (id === inCup) continue;
    const { temp, rate } = metalSurroundings(bench, id);
    const now = metalTempOf(bench, id);
    const next = relax(now, temp, rate, dt, METAL_SETTLED_GAP);
    if (next === now) continue;
    if (metalTemps === bench.metalTemps) metalTemps = { ...metalTemps };
    metalTemps[id] = next;
  }
  return metalTemps === bench.metalTemps ? bench : { ...bench, metalTemps };
}

/** True once stepMetal has nothing to do: every metal outside the cup is at its surroundings' temperature. */
export function metalSettled(bench: CalorimetryBench): boolean {
  const inCup = bench.placements.metal[CUP_STATION];
  return METAL_MATERIALS.every(
    ({ id }) => id === inCup || metalTempOf(bench, id) === metalSurroundings(bench, id).temp,
  );
}

/**
 * Advances the whole bench by dt seconds: the bath, the tin can, the cup and
 * the metals, each only while it has something left to do. Returns the same
 * bench when nothing moved, so an idle bench costs no render.
 */
export function stepBench(bench: CalorimetryBench, dt: number): CalorimetryBench {
  let next = stepBath(bench, dt);
  if (!flaskSettled(next)) next = stepFlask(next, dt);
  if (!cupSettled(next)) next = stepCup(next, dt);
  return stepMetal(next, dt);
}

/** True once nothing on the bench is changing, so its clock can stop. */
export function benchSettled(bench: CalorimetryBench): boolean {
  return bathSettled(bench) && flaskSettled(bench) && cupSettled(bench) && metalSettled(bench);
}

/**
 * Steam off the cup, 0..1: a hot metal just dropped into cold water makes
 * the most, dying away as it cools in the water. None without a metal, and
 * none from a cold one.
 */
export function cupSteam(bench: CalorimetryBench): number {
  const metal = sampleAt(bench, "metal", CUP_STATION);
  if (!metal) return 0;
  return clamp01((metalTempOf(bench, metal.id) - CUP_STEAM_FROM) / (CUP_STEAM_FULL - CUP_STEAM_FROM));
}

/** Steam off the bath, 0..1: none below half boil, full at a rolling boil. */
export function bathSteam(bench: CalorimetryBench): number {
  return clamp01((bathBoil(bench) - BATH_STEAM_FROM) / (1 - BATH_STEAM_FROM));
}

/** Steam off the flask, 0..1: none below a good simmer, full at a rolling boil. */
export function flaskSteam(bench: CalorimetryBench): number {
  return clamp01((flaskBoil(bench) - FLASK_STEAM_FROM) / (1 - FLASK_STEAM_FROM));
}

function clamp01(x: number): number {
  return Math.min(1, Math.max(0, x));
}

/** Whether a metal is in the cup, which is when the thermometer goes in. */
export function cupHasMetal(bench: CalorimetryBench): boolean {
  return !!sampleAt(bench, "metal", CUP_STATION);
}

/**
 * How hard the flask water bubbles, 0..1. Not at once when the can goes on:
 * the water has to warm first, so bubbles build up with its temperature, a
 * little stronger while the flame is still under it, and die away as it cools.
 * Only with the can on.
 */
export function flaskBoil(bench: CalorimetryBench): number {
  if (!bench.covered) return 0;
  const warm = Math.min(1, Math.max(0, (bench.flaskTemp - ROOM_TEMP - 4) / 22));
  return Math.min(1, warm * (0.7 + 0.3 * flameStrength(bench)));
}

/** Seconds of burning left, or 0 when nothing is alight. */
export function burnRemaining(bench: CalorimetryBench): number {
  const material = findMaterial(bench.burning);
  if (!material) return 0;
  return Math.max(0, burnSecondsOf(material) - bench.burnTime);
}

/** How hard the sample on the calorimeter's dish is burning, 0..1. */
export function flameStrength(bench: CalorimetryBench): number {
  const material = findMaterial(bench.burning);
  return material ? flameAt(material, bench.burnTime) : 0;
}

/**
 * Advances the bath's temperature by dt seconds: the plate heats it while on,
 * it always loses heat to the room, and it holds at boiling once there.
 */
export function stepBath(bench: CalorimetryBench, dt: number): CalorimetryBench {
  const power = bench.heaterOn ? HEATER_POWER : 0;
  const rate = power - COOLING_RATE * (bench.bathTemp - ROOM_TEMP);
  const bathTemp = Math.min(BOILING_POINT, Math.max(ROOM_TEMP, bench.bathTemp + rate * dt));
  return bathTemp === bench.bathTemp ? bench : { ...bench, bathTemp };
}

/** True once the bath has nothing left to do: plate off and back at room temperature. */
export function bathSettled(bench: CalorimetryBench): boolean {
  return !bench.heaterOn && bench.bathTemp <= ROOM_TEMP;
}

/**
 * How hard the bath bubbles, 0..1: a few bubbles from SIMMER_FROM, a rolling
 * boil at BOILING_POINT. Only while the plate is on, since water taken off the
 * heat stops boiling at once.
 */
export function bathBoil(bench: CalorimetryBench): number {
  if (!bench.heaterOn) return 0;
  const t = (bench.bathTemp - SIMMER_FROM) / (BOILING_POINT - SIMMER_FROM);
  return Math.min(1, Math.max(0, t));
}

/** The bath temperature as the hot plate's display shows it. */
export function bathReading(bench: CalorimetryBench): string {
  return `${bench.bathTemp.toFixed(1)}°C`;
}

export function getMaterialsFor(section: CalorimetrySection): MaterialInfo[] {
  return section === "metal" ? METAL_MATERIALS : BIOMASS_MATERIALS;
}
