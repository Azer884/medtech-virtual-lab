"use client";

import dynamic from "next/dynamic";
import type { ComponentType } from "react";
import SimLoader from "./shared/SimLoader";

const CollisionSim = dynamic(() => import("./laws-of-collisions/CollisionSim"), {
  ssr: false,
  loading: SimLoader,
});
const CoulombsLawSim = dynamic(() => import("./coulombs-law/CoulombsLawSim"), {
  ssr: false,
  loading: SimLoader,
});
const StandingWavesSim = dynamic(
  () => import("./standing-waves/StandingWavesSim"),
  { ssr: false, loading: SimLoader },
);
const HydrocarbonsSim = dynamic(
  () => import("./identification-of-hydrocarbons/HydrocarbonsSim"),
  { ssr: false, loading: SimLoader },
);
const CalorimetrySim = dynamic(() => import("./calorimetry/CalorimetrySim"), {
  ssr: false,
  loading: SimLoader,
});

export const labSimRegistry: Record<string, ComponentType> = {
  "laws-of-collisions": CollisionSim,
  "coulombs-law": CoulombsLawSim,
  "standing-waves": StandingWavesSim,
  "identification-of-hydrocarbons": HydrocarbonsSim,
  calorimetry: CalorimetrySim,
};
