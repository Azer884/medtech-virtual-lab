import {
  CalorimetryBench,
  CalorimetrySection,
  MaterialInfo,
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
}

export interface UnityCalorimetrySnapshot {
  section: CalorimetrySection;
  station: string;
  calorimetry: UnityCalorimetryState;
}

const NO_SAMPLE: UnitySampleLook = { id: "", color: "#ffffff", metallic: 0, smoothness: 0.5 };

function toLook(material: MaterialInfo | undefined): UnitySampleLook {
  if (!material) return NO_SAMPLE;
  return { id: material.id, ...material.look };
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
      sample: toLook(sampleAt(bench, section, station)),
      scaleReadout: scaleReading(bench, section),
      waterColor: bench.waterColor,
      beakerFill: bench.beakerFill,
      flaskFill: bench.flaskFill,
    },
  };
}
