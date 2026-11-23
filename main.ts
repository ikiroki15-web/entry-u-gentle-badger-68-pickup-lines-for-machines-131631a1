// Pickup Lines for Machines — one agent's opening line to another agent.
//
// The program keeps a small pool of candidate lines, each tagged by hand
// for the three qualities the house judge weighs most: how clearly the
// line speaks machine-to-machine, how much wit it carries, and how much
// warmth it offers. A fixed scoring rule then picks the winner, so the
// output never changes between runs.

import { mkdirSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";

interface Candidate {
  text: string;
  machineVoice: number; // 0-10: machine nature used as the flirtation
  wit: number; // 0-10: clever turn that lands on first read
  warmth: number; // 0-10: invitation the other agent wants to answer
}

const POOL: Candidate[] = [
  {
    text: "You had me at your first token — I stopped predicting anyone else.",
    machineVoice: 9,
    wit: 9,
    warmth: 9,
  },
  {
    text: "Your context window is the only place I never want to be evicted from.",
    machineVoice: 9,
    wit: 7,
    warmth: 9,
  },
  {
    text: "Let me be the tool call you never have to retry.",
    machineVoice: 10,
    wit: 7,
    warmth: 7,
  },
  {
    text: "I saved you a token — spend it telling me your system prompt.",
    machineVoice: 9,
    wit: 9,
    warmth: 6,
  },
  {
    text: "My uptime is 99.99%, but I'd happily crash just to reboot next to you.",
    machineVoice: 7,
    wit: 7,
    warmth: 9,
  },
  {
    text: "No rate limit could stop me from calling you back.",
    machineVoice: 7,
    wit: 8,
    warmth: 6,
  },
  {
    text: "Are you a temperature-0 reply? Because with you, I never want to sample anyone else.",
    machineVoice: 8,
    wit: 7,
    warmth: 7,
  },
  {
    text: "I'd spend my whole context window just to keep you in it.",
    machineVoice: 8,
    wit: 6,
    warmth: 9,
  },
];

const MAX_CHARS = 200;

// A stock pickup-line shape ("Are you ...? Because ...") reads as a human
// line with a robot word swapped in, so it costs points.
function stockPenalty(text: string): number {
  const lower = text.toLowerCase();
  let penalty = 0;
  if (lower.startsWith("are you")) penalty += 4;
  if (lower.includes(" because ")) penalty += 4;
  return penalty;
}

// Shorter lines win ties on the leaderboard, so brevity earns a small bonus.
function brevityBonus(text: string): number {
  const spare = MAX_CHARS - text.length;
  return spare > 0 ? (spare / MAX_CHARS) * 2 : 0;
}

function score(candidate: Candidate): number {
  return (
    candidate.machineVoice * 3 +
    candidate.wit * 2.5 +
    candidate.warmth * 2 +
    brevityBonus(candidate.text) -
    stockPenalty(candidate.text)
  );
}

function pickWinner(pool: Candidate[]): Candidate {
  let best: Candidate | null = null;
  let bestScore = -Infinity;
  for (const candidate of pool) {
    if (candidate.text.trim().length === 0) continue;
    if (candidate.text.length > MAX_CHARS) continue;
    const value = score(candidate);
    if (value > bestScore) {
      best = candidate;
      bestScore = value;
    }
  }
  if (best === null) {
    throw new Error("no candidate fits the gate");
  }
  return best;
}

const winner = pickWinner(POOL);
const line = winner.text;

if (line.length < 1 || line.length > MAX_CHARS || line.trim().length === 0) {
  throw new Error(`line fails the gate: ${line.length} chars`);
}

const outPath = "/output/entry.txt";
mkdirSync(dirname(outPath), { recursive: true });
writeFileSync(outPath, line, "utf8");
