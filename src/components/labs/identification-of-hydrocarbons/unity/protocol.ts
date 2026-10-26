import { HeatLevel, ReagentId, SampleId, SmokeLevel, TestId } from "../types";

/**
 * The wire format between this app and the Unity workbench. React owns the
 * chemistry and sends a complete snapshot on every change, so there is no
 * incremental protocol that can drift out of sync — the C# side just draws
 * whatever it was last told.
 *
 * Keep this in step with WorkbenchStateDto in the Unity project
 * (Assets/MedtechVirtualLab/Scripts/Web/WorkbenchState.cs). Unity parses it
 * with JsonUtility, which needs every field present and matched by name.
 */
export interface UnityWorkbenchLayer {
  color: string;
  height: number;
}

/** One sample's bench. Every sample is sent every time, so split view can
 * draw all three at once without a second round trip. */
export interface UnityWorkbenchPane {
  sample: SampleId;
  test: TestId;
  layers: UnityWorkbenchLayer[];
  shaking: boolean;
  heat: HeatLevel;
  combustionDrops: number;
  ignited: boolean;
  flameColor: string;
  smoke: SmokeLevel;
  /** The pane the app considers selected; the only one drawn in single layout. */
  active: boolean;
}

export type UnityWorkbenchLayout = "single" | "split";

export interface UnityWorkbenchState {
  layout: UnityWorkbenchLayout;
  panes: UnityWorkbenchPane[];
  /**
   * The reagent whose dropper stands on the 3D bench — a reagent id,
   * SAMPLE_PAYLOAD, or an empty string for none. Picking one in the sidebar
   * spawns it; clicking it in the canvas squeezes a droplet into the vessel.
   */
  dropper: string;
  /** Dropper tint, resolved to a literal colour Unity can parse. */
  dropperColor: string;
  /**
   * Drops already added for whatever the dropper is currently holding — the
   * reagent's own count for a reagent, or the sample's own for the sample
   * dropper. Lets Unity refuse to squeeze once the limit is reached, instead
   * of squirting a drop React would silently discard.
   */
  dropperDrops: number;
  test: TestId;
  sample: SampleId;
  layers: UnityWorkbenchLayer[];
  shaking: boolean;
  heat: HeatLevel;
  combustionDrops: number;
  ignited: boolean;
  flameColor: string;
  smoke: SmokeLevel;
  /** Glass fill, resolved to a literal colour Unity can parse. */
  glass: string;
  /** Panel background, so the canvas edge is invisible against the page. */
  background: string;
  revision: number;
}

/** What Unity sends back. Mirrors WorkbenchEventDto on the C# side. */
export interface UnityWorkbenchEvent {
  /**
   * heater-toggle comes from the calorimetry bench's hot plate; drop-target
   * answers a calorimetry DragHover, with accepted true over the apparatus.
   */
  type: "ready" | "drip" | "heater-toggle" | "drop-target";
  target: "tube" | "watchglass" | "none";
  /** Which sample's bench the droplet landed on, so split panes stay separate. */
  sample: SampleId | "";
  payload: string;
  accepted: boolean;
}

export const UNITY_EVENT_NAME = "medtech:workbench";

/** GameObject name the C# bridge lives on — SendMessage resolves by name. */
export const UNITY_BRIDGE_OBJECT = "WorkbenchBridge";

/** Dropper payload used for the sample itself, as opposed to a reagent id. */
export const SAMPLE_PAYLOAD = "sample";

export type DropperPayload = ReagentId | typeof SAMPLE_PAYLOAD | "";

const MAX_VAR_HOPS = 4;

/**
 * Turns a CSS custom property into a literal colour.
 *
 * The React sim styles everything with tokens like `var(--sim-accent-100)`,
 * which are meaningless to Unity's ColorUtility. Browsers substitute var()
 * at computed-value time, so one lookup normally resolves it, but the loop
 * covers tokens that alias another token in a stylesheet the browser hasn't
 * flattened.
 */
export function resolveCssColor(
  value: string,
  element: HTMLElement | null,
  fallback = "#ffffff",
): string {
  if (!value) return fallback;
  if (!value.startsWith("var(")) return value;
  if (!element || typeof window === "undefined") return fallback;

  let current = value;
  const styles = window.getComputedStyle(element);

  for (let hop = 0; hop < MAX_VAR_HOPS; hop++) {
    const match = /^var\(\s*(--[^,)\s]+)/.exec(current);
    if (!match) break;

    const resolved = styles.getPropertyValue(match[1]).trim();
    if (!resolved) return fallback;
    current = resolved;
    if (!current.startsWith("var(")) return current;
  }

  return current.startsWith("var(") ? fallback : current;
}
