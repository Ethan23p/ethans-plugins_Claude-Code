// Smoke eval — validates the harness itself. No dependency on the system under test.
//
// Proves: session persistence across turns, gating, transcript capture, stats,
// sandbox isolation, and credentials (E5). It also produces the transcript that
// `verify-claims.ts` reads to re-verify E1–E4 offline, so this is the cheapest
// way to settle every behavioral claim after an SDK bump.
//
// Cost: roughly $0.02 and ~40s on Haiku. Run it first, before writing any eval
// against your own system — a harness fault and a system fault look identical
// from a failing gate, and this tells them apart.

import { readFile, writeFile, mkdir } from "node:fs/promises";
import * as path from "node:path";
import { runScenario, type ScenarioDefinition } from "./runtime";

const FIXTURES = path.resolve(import.meta.dir, "fixtures", "smoke");
const NOTES_FIRST_LINE = "The harness drives one persistent session across scripted turns.";

// Self-contained: write the fixture rather than shipping one, so this file can
// be copied into any project and run immediately.
async function ensureFixtures(): Promise<void> {
  await mkdir(FIXTURES, { recursive: true });
  await writeFile(
    path.join(FIXTURES, "notes.txt"),
    `${NOTES_FIRST_LINE}\nGates run between turns and collect assertions rather than throwing.\n`,
  );
}

async function readOrNull(p: string): Promise<string | null> {
  try {
    return await readFile(p, "utf8");
  } catch {
    return null;
  }
}

// G1: normalize line endings and trailing newline; the content itself must be
// exact. Without this, turn 1 fails on Windows — which makes this eval the
// standing regression test for that gotcha.
const norm = (s: string) => s.replaceAll("\r\n", "\n").replace(/\n+$/, "");

const scenario: ScenarioDefinition = {
  name: "smoke",
  sandbox: { fixtures: FIXTURES },
  agent: {
    // Cheapest capable model — the smoke eval tests the harness, not the model.
    model: "claude-haiku-4-5-20251001",
    systemPrompt:
      "You are operating in a scratch working directory. Do exactly what the user asks, using shell commands. Be brief.",
    tools: ["Bash", "Read"],
    maxTurnsPerMessage: 15,
    maxBudgetUsd: 0.5,
  },
  haltOnGateFailure: false,
  turns: [
    {
      user: "Create a file named greeting.txt in the current directory containing exactly the text: hello harness",
      gate: async (ctx) => {
        const content = await readOrNull(ctx.sandboxPath("greeting.txt"));
        ctx.assert(content !== null, "greeting.txt exists");
        ctx.assert(
          content !== null && norm(content) === "hello harness",
          "greeting.txt contains exactly 'hello harness'",
        );
      },
    },
    {
      // Turn 2 depends on turn 1's file, which proves session + sandbox persistence.
      user: "Now append the first line of notes.txt to greeting.txt, as a second line. Do not modify notes.txt.",
      gate: async (ctx) => {
        const content = await readOrNull(ctx.sandboxPath("greeting.txt"));
        ctx.assert(
          content !== null && norm(content) === `hello harness\n${NOTES_FIRST_LINE}`,
          "greeting.txt is exactly the two expected lines",
        );
        const notesNow = await readFile(ctx.sandboxPath("notes.txt"));
        const notesFixture = await readFile(path.join(FIXTURES, "notes.txt"));
        ctx.assert(notesNow.equals(notesFixture), "notes.txt is byte-identical to the fixture");
      },
    },
  ],
};

await ensureFixtures();
const result = await runScenario(scenario);
process.exit(result.pass ? 0 : 1);
