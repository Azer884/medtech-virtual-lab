"use client";

import { useCallback, useEffect, useRef } from "react";
import {
  UNITY_BRIDGE_OBJECT,
  UNITY_EVENT_NAME,
  UnityWorkbenchEvent,
} from "../identification-of-hydrocarbons/unity/protocol";
import { useUnityInstance } from "../identification-of-hydrocarbons/unity/useUnityInstance";
import { UnityCalorimetrySnapshot } from "./unityState";

const BUILD_URL = "/unity/calorimetry";
const BUILD_NAME = "calorimetry";

interface CalorimetryUnityProps {
  snapshot: UnityCalorimetrySnapshot;
}

/**
 * The Unity bench for the calorimetry lab. Unity only draws the apparatus:
 * each station page shows its own piece of equipment, picked from the
 * section and station sent here, along with the samples, readouts and water
 * React decides. Mirrors CalorimetryWorkbenchView on the C# side.
 */
export default function CalorimetryUnity({ snapshot }: CalorimetryUnityProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

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
    };

    window.addEventListener(UNITY_EVENT_NAME, handle);
    return () => window.removeEventListener(UNITY_EVENT_NAME, handle);
  }, [sendState]);

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
