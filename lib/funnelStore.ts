import { promises as fs } from "fs";
import path from "path";

export type FunnelStage = "lp_visit" | "line_register" | "meeting_done";

export interface FunnelEvent {
  stage: FunnelStage;
  timestamp: string;
  lineUserId?: string;
}

const DATA_DIR = path.join(process.cwd(), "data");
const DATA_FILE = path.join(DATA_DIR, "funnel-events.json");

async function readEvents(): Promise<FunnelEvent[]> {
  try {
    const raw = await fs.readFile(DATA_FILE, "utf-8");
    return JSON.parse(raw) as FunnelEvent[];
  } catch {
    return [];
  }
}

async function writeEvents(events: FunnelEvent[]): Promise<void> {
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(DATA_FILE, JSON.stringify(events, null, 2), "utf-8");
}

export async function recordEvent(stage: FunnelStage, lineUserId?: string): Promise<void> {
  const events = await readEvents();
  events.push({ stage, timestamp: new Date().toISOString(), lineUserId });
  await writeEvents(events);
}

export interface FunnelSummary {
  lpVisits: number;
  lineRegistrations: number;
  meetingsDone: number;
  lpToLineRate: number | null;
  lineToMeetingRate: number | null;
  lpToMeetingRate: number | null;
}

export async function getSummary(): Promise<FunnelSummary> {
  const events = await readEvents();
  const lpVisits = events.filter((e) => e.stage === "lp_visit").length;
  const lineRegistrations = events.filter((e) => e.stage === "line_register").length;
  const meetingsDone = events.filter((e) => e.stage === "meeting_done").length;

  return {
    lpVisits,
    lineRegistrations,
    meetingsDone,
    lpToLineRate: lpVisits > 0 ? lineRegistrations / lpVisits : null,
    lineToMeetingRate: lineRegistrations > 0 ? meetingsDone / lineRegistrations : null,
    lpToMeetingRate: lpVisits > 0 ? meetingsDone / lpVisits : null,
  };
}
