// Harness types — the contract for eval definitions.
// Deliberately SDK-free: eval definitions import only from runtime.ts, and
// everything they touch is defined here in plain TS. This is what keeps SDK
// knowledge in one place, so a version bump has one blast radius.

export interface ScenarioDefinition {
  name: string;
  sandbox?: {
    /** Directory copied into the fresh temp sandbox (resolved relative to the eval file's cwd if relative). */
    fixtures?: string;
  };
  agent: {
    model: string;
    systemPrompt?: string;
    /** Base toolset for the in-loop agent. Default: ['Bash', 'Read']. */
    tools?: string[];
    /**
     * Skills exposed to the in-loop agent: an explicit list, or 'all' to expose
     * every skill discoverable from the loaded plugins. Omit for none.
     *
     * Use this — not `systemPrompt` — when the thing under test is how an agent
     * MEETS your system. Priming by preamble tests a surface the real operator
     * never sees.
     */
    skills?: string[] | "all";
    /**
     * Local plugin directories loaded into the in-loop session, e.g.
     * `[{ type: 'local', path: pluginDir }]`. Mirrors the SDK's SdkPluginConfig.
     */
    plugins?: PluginConfig[];
    /** Runaway brake: max agentic turns. Maps to SDK maxTurns — see G3, it is a WHOLE-SESSION brake. */
    maxTurnsPerMessage?: number;
    /** Runaway brake: max spend for the whole scenario. */
    maxBudgetUsd?: number;
  };
  turns: TurnDef[];
  /** Stop sending further turns after a turn whose gate failed. Default: false (run all turns). */
  haltOnGateFailure?: boolean;
  /** Overall scenario wall-clock timeout in ms. Default: 5 minutes. */
  timeoutMs?: number;
  /** Optional LLM-as-judge slot; receives the full raw transcript. */
  grade?: (transcript: CapturedMessage[]) => Promise<GradeVerdict>;
}

/** Local plugin to load into the in-loop session (structural mirror of SdkPluginConfig). */
export interface PluginConfig {
  type: "local";
  path: string;
}

export interface TurnDef {
  user: string;
  /** Runs after the agent finishes responding to this turn. Assertions are collected, never thrown. */
  gate?: (ctx: GateContext) => void | Promise<void>;
}

export interface GateContext {
  /** Absolute path into the sandbox. */
  sandboxPath(rel: string): string;
  /** Parsed view of the just-finished turn. */
  lastTurn: TurnView;
  /** Every SDK message captured so far, ordered. */
  transcript: CapturedMessage[];
  /** Record a labeled pass/fail outcome. */
  assert(cond: boolean, label: string): void;
  /** Record an unconditional failure. */
  fail(label: string): void;
  /**
   * Run a subprocess in the sandbox — for state introspection (sqlite queries,
   * CLI reads) and for any gate needing a REAL exit code, which the SDK does not
   * expose (E4).
   */
  exec(cmd: string): Promise<{ stdout: string; stderr: string; exitCode: number }>;
}

/** One SDK message as captured: opaque payload plus capture metadata. */
export interface CapturedMessage {
  seq: number;
  ts: string; // ISO timestamp at capture
  message: unknown; // the raw SDK message, JSON-serializable
}

export interface ToolCall {
  id: string;
  name: string;
  input: unknown;
}

export interface ToolResult {
  toolUseId: string;
  content: string;
  isError: boolean;
  /** Bash exit code where derivable — see E4; this is inferred, not reported. */
  exitCode?: number;
}

/** Parsed view of one user-turn round trip. */
export interface TurnView {
  index: number; // 0-based
  user: string;
  assistantText: string;
  toolCalls: ToolCall[];
  /** Commands extracted from Bash tool_use inputs, in order. */
  bashCommands: string[];
  toolResults: ToolResult[];
  /** From the turn's result message. */
  numTurns: number;
  costUsd: number;
  durationMs: number;
  usage: { inputTokens: number; outputTokens: number; cacheReadInputTokens: number; cacheCreationInputTokens: number };
  resultSubtype: string; // 'success' | error subtypes
  isError: boolean;
}

export interface GateResult {
  turn: number; // 0-based turn index; -1 for the grade
  label: string;
  pass: boolean;
}

export interface Stats {
  turns: number;
  agentTurnsPerMessage: number[];
  toolCallCount: number;
  bashCommandCount: number;
  /** Tally of Bash exit codes where derivable, e.g. { "0": 5, "1": 1 }. */
  bashExitCodes: Record<string, number>;
  totalInputTokens: number;
  totalOutputTokens: number;
  totalCacheReadTokens: number;
  totalCacheCreationTokens: number;
  totalCostUsd: number;
  wallClockMsPerTurn: number[];
  wallClockMsTotal: number;
  /** Sandbox listing before the session vs after (G2). */
  sandboxBefore: string[];
  sandboxAfter: string[];
}

export interface GradeVerdict {
  pass: boolean;
  [key: string]: unknown;
}

export interface ScenarioResult {
  pass: boolean;
  gates: GateResult[];
  stats: Stats;
  artifactsDir: string;
  transcript: CapturedMessage[];
  turns: TurnView[];
  gradeVerdict?: GradeVerdict;
  /** Fatal runtime error (timeout, SDK failure, missing credential), if any. */
  error?: string;
}
