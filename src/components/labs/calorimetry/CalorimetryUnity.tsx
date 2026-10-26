"use client";

import { RefObject, useCallback, useEffect, useRef } from "react";
import {
  UNITY_BRIDGE_OBJECT,
  UNITY_EVENT_NAME,
  UnityWorkbenchEvent,
} from "../identification-of-hydrocarbons/unity/protocol";
import { useUnityInstance } from "../identification-of-hydrocarbons/unity/useUnityInstance";
import { UnityCalorimetrySnapshot } from "./unityState";

const BUILD_URL = "/unity/calorimetry";
const BUILD_NAME = "calorimetry";

/**
 * Lets the canvas ask the 3D bench what is under the pointer while a sample is
 * dragged, since an HTML drag never reaches Unity's own input.
 */
export interface DropProbe {
  /**
   * Outlines the station's apparatus if the point is over it. True over the
   * apparatus, false elsewhere, null while the bench isn't running.
   */
  hover: (clientX: number, clientY: number) => boolean | null;
  /** Clears the outline. */
  end: () => void;
}

interface CalorimetryUnityProps {
  snapshot: UnityCalorimetrySnapshot;
  /** Filled in with the drop probe while the bench is running. */
  probeRef: RefObject<DropProbe | null>;
  /** The hot plate's red button was clicked in the 3D bench. */
  onHeaterToggle: () => void;
}

/**
 * The Unity bench for the calorimetry lab. Unity only draws the apparatus:
 * each station page shows its own piece of equipment, picked from the
 * section and station sent here, along with the samples, readouts and water
 * React decides. Mirrors CalorimetryWorkbenchView on the C# side.
 */
export default function CalorimetryUnity({ snapshot, probeRef, onHeaterToggle }: CalorimetryUnityProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  // Set by Unity's drop-target reply, which arrives synchronously inside the
  // DragHover SendMessage, so hover() can return it straight away.
  const hitRef = useRef(false);

  const { status, progress, error, instanceRef } = useUnityInstance(canvasRef, {
    buildUrl: BUILD_URL,
    buildName: BUILD_NAME,
    productName: "Calorimetry Workbench",
  });

  const sendState = useCallback(() => {
    const instance = instanceRef.current;
    if (!instance) return;
    instance.SendMessage(UNITY_BRIDGE_OBJECT, "SetState", JSON.stringify(snapshot));
  }, [instanceRef, snapshot]);

  // Push the snapshot whenever it changes, and once more as soon as the
  // instance reports ready, since the player boots after the first renders.
  useEffect(() => {
    if (status !== "ready") return;
    sendState();
  }, [sendState, status]);

  useEffect(() => {
    const handle = (event: Event) => {
      const detail = (event as CustomEvent<UnityWorkbenchEvent>).detail;
      if (detail?.type === "ready") sendState();
      else if (detail?.type === "heater-toggle") onHeaterToggle();
      else if (detail?.type === "drop-target") hitRef.current = detail.accepted;
    };

    window.addEventListener(UNITY_EVENT_NAME, handle);
    return () => window.removeEventListener(UNITY_EVENT_NAME, handle);
  }, [sendState, onHeaterToggle]);

  useEffect(() => {
    if (status !== "ready") return;

    probeRef.current = {
      hover: (clientX, clientY) => {
        const instance = instanceRef.current;
        const canvas = canvasRef.current;
        if (!instance || !canvas) return null;

        // Unity's screen space is bottom-up, so y is flipped here.
        const rect = canvas.getBoundingClientRect();
        const x = (clientX - rect.left) / rect.width;
        const y = 1 - (clientY - rect.top) / rect.height;
        hitRef.current = false;
        instance.SendMessage(UNITY_BRIDGE_OBJECT, "DragHover", `${x.toFixed(4)},${y.toFixed(4)}`);
        return hitRef.current;
      },
      end: () => instanceRef.current?.SendMessage(UNITY_BRIDGE_OBJECT, "DragEnd"),
    };

    return () => {
      probeRef.current = null;
    };
  }, [probeRef, instanceRef, status]);

  if (status === "error") {
    return (
      <p className="absolute top-2 left-2 right-2 text-[10px] leading-tight text-[var(--sim-neutral-600)]">
        3D bench unavailable. {error}
      </p>
    );
  }

  return (
    <div className="absolute inset-0">
      <canvas
        ref={canvasRef}
        // Unity's input layer looks the canvas back up by id, so it must have one.
        id="unity-canvas"
        className="block w-full h-full"
      />

      {status === "loading" && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-[var(--sim-panel-bg)]">
          <div className="h-1.5 w-40 overflow-hidden bg-[var(--sim-neutral-200)]">
            <div
              className="h-full bg-[var(--sim-accent-500)] transition-[width] duration-200"
              style={{ width: `${Math.round(progress * 100)}%` }}
            />
          </div>
          <p className="text-xs text-[var(--sim-neutral-600)]">Loading workbench…</p>
        </div>
      )}
    </div>
  );
}
