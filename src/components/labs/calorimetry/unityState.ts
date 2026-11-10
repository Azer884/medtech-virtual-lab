import {
  CalorimetryBench,
  CalorimetrySection,
  MaterialInfo,
  bathBoil,
  bathReading,
  bathSteam,
  cupHasMetal,
  cupSteam,
  currentLook,
  flaskBoil,
  flaskSteam,
  flameStrength,
  sampleAt,
  scaleReading,
} from "./types";

/**
 * The wire format between the calorimetry lab and its Unity bench. React
 * decides everything and sends a full snapshot on every change; Unity only
 * draws it.
 *
 * Keep this in step with WorkbenchStateDto / CalorimetryDto in the Unity
 * project (Assets/MedtechVirtualLab/Scripts/Web/WorkbenchState.cs).
 * JsonUtility matches fields by name, so every field must be present.
 */
export interface UnitySampleLook {
  /** Material id. Empty for none. */
  id: string;
  color: string;
  metallic: number;
  smoothness: number;
}

export interface UnityCalorimetryState {
  /** The sample on the station being shown; an empty id leaves it bare. */
  sample: UnitySampleLook;
  /** Text on the scale's LCD. */
  scaleReadout: string;
  waterColor: string;
  beakerFill: number;
  flaskFill: number;
  /** Lights the hot plate's red button. */
  heaterOn: boolean;
  /** Text on the hot plate's display: the bath temperature. */
  heaterReadout: string;
  /** How hard the bath water bubbles, 0..1. */
  boil: number;
  /** How hard the biomass on the tin can calorimeter's dish burns, 0..1. */
  flame: number;
  /** Puts the tin can, flask and thermometer over the dish. */
  covered: boolean;
  /** Flask water temperature, °C, for the thermometer in it to read. */
  flaskTemp: number;
  /** How hard the flask water bubbles, 0..1. */
  flaskBoil: number;
  /** Coffee cup water level, 0..1. */
  cupFill: number;
  /** Coffee cup water temperature, °C, for the thermometer in it to read. */
  cupTemp: number;
  /** Whether the metal is in the cup, which lowers the thermometer into it. */
  cupProbe: boolean;
  /** Steam off the cup while a hot metal sits in the water, 0..1. */
  cupSteam: number;
  /** Steam off the bath, 0..1: starts at half boil, full at a rolling boil. */
  bathSteam: number;
  /** Steam off the flask, 0..1: starts at a good simmer, full at a rolling boil. */
  flaskSteam: number;
}

export interface UnityCalorimetrySnapshot {
  section: CalorimetrySection;
  station: string;
  calorimetry: UnityCalorimetryState;
}

/**
 * Rounds a value to the step Unity can actually show. The bench ticks many
 * times a second, and most ticks move a temperature by less than the
 * thermometer can draw; rounded, those ticks give an identical snapshot, which
 * is never sent.
 */
function quantize(value: number, step: number): number {
  return Math.round(value / step) * step;
}

/** Thermometers, °C. */
const TEMP_STEP = 0.1;
/** Boil, flame and steam strengths, 0..1. */
const LEVEL_STEP = 0.02;

const NO_SAMPLE: UnitySampleLook = { id: "", color: "#ffffff", metallic: 0, smoothness: 0.5 };

function toLook(bench: CalorimetryBench, material: MaterialInfo | undefined): UnitySampleLook {
  if (!material) return NO_SAMPLE;
  return { id: material.id, ...currentLook(bench, material) };
}

export function toUnitySnapshot(
  bench: CalorimetryBench,
  section: CalorimetrySection,
  station: string,
): UnityCalorimetrySnapshot {
  return {
    section,
    station,
    calorimetry: {
      sample: toLook(bench, sampleAt(bench, section, station)),
      scaleReadout: scaleReading(bench, section),
      waterColor: bench.waterColor,
      beakerFill: bench.beakerFill,
      flaskFill: bench.flaskFill,
      heaterOn: bench.heaterOn,
      heaterReadout: bathReading(bench),
      boil: quantize(bathBoil(bench), LEVEL_STEP),
      flame: quantize(flameStrength(bench), LEVEL_STEP),
      covered: bench.covered,
      flaskTemp: quantize(bench.flaskTemp, TEMP_STEP),
      flaskBoil: quantize(flaskBoil(bench), LEVEL_STEP),
      cupFill: bench.cupFill,
      cupTemp: quantize(bench.cupTemp, TEMP_STEP),
      cupProbe: cupHasMetal(bench),
      cupSteam: quantize(cupSteam(bench), LEVEL_STEP),
      bathSteam: quantize(bathSteam(bench), LEVEL_STEP),
      flaskSteam: quantize(flaskSteam(bench), LEVEL_STEP),
    },
  };
}
