export type Scenario =
  | "normal"
  | "high"
  | "recovering"
  | "fan-fault"
  | "stale"
  | "cascade"
  | "override"
  | "disconnected"
  | "valve-stuck"
  | "warm-water"
  | "feedback-lost";
export type Priority = "high" | "medium" | "low";
export interface Alarm {
  id: string;
  kind: "alarm" | "alert";
  priority: Priority;
  equipment: string;
  message: string;
  acknowledged: boolean;
  active: boolean;
}
export interface Override {
  priority: number;
  source: string;
  since: string;
  value: number;
}
export interface PointState {
  quality: "good" | "stale" | "unknown";
  override?: Override;
  ageSeconds?: number;
}
export interface WriteState {
  phase: "idle" | "requested" | "pending" | "accepted" | "rejected";
  requested?: number;
  message: string;
}
export interface LabSnapshot {
  actual: number;
  trend: number[];
  valveCommand: number;
  controlDemand: number;
  valvePosition: number | null;
  valveCommandAgeSeconds: number;
  enteringWater: number | null;
  leavingWater: number | null;
  fanCommand: boolean;
  fanProof: boolean;
  stale: boolean;
  question: string;
  evidence: string;
  artLimit: string;
  alarms: Alarm[];
  points: {
    supplyTemperature: PointState;
    coolingValve: PointState;
    valvePosition: PointState;
    enteringWater: PointState;
    leavingWater: PointState;
  };
  commState: "connected" | "disconnected";
  writeState: WriteState;
}
