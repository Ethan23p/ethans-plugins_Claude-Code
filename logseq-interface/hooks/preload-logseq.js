#!/usr/bin/env node
'use strict';

// PreToolUse hook, scoped by hooks.json's `if: "Skill(logseq-interface)"` to
// fire only when that skill is invoked. Runs the two commands the skill used
// to tell Claude to call by hand (`logseq skill show`, `logseq graph list`)
// and returns their output as additionalContext, so Claude sees them in the
// same turn instead of spending two tool calls on it.
//
// Fails open: any error here (logseq missing, timeout, bad stdin) exits 0
// with no output rather than blocking the skill invocation.

const { execFileSync } = require('child_process');

const TIMEOUT_MS = 10000;

function run(args) {
  try {
    // shell: true so `logseq` resolves through its .cmd/.ps1 shim on
    // Windows, where execFileSync otherwise can't exec it directly (ENOENT).
    return execFileSync('logseq', args, {
      timeout: TIMEOUT_MS,
      encoding: 'utf8',
      windowsHide: true,
      shell: true,
    });
  } catch (e) {
    return `(\`logseq ${args.join(' ')}\` failed: ${e.message})`;
  }
}

function main() {
  let raw = '';
  process.stdin.on('data', (c) => (raw += c));
  process.stdin.on('end', () => {
    let input;
    try {
      input = JSON.parse(raw);
    } catch (e) {
      process.exit(0);
    }

    const skill = input && input.tool_input && input.tool_input.skill;
    if (skill !== 'logseq-interface') {
      process.exit(0);
    }

    const skillShow = run(['skill', 'show']);
    const graphList = run(['graph', 'list']);

    const additionalContext =
      '## `logseq skill show`\n\n' +
      skillShow.trim() +
      '\n\n## `logseq graph list`\n\n' +
      graphList.trim();

    process.stdout.write(
      JSON.stringify({
        hookSpecificOutput: {
          hookEventName: 'PreToolUse',
          permissionDecision: 'abstain',
          additionalContext,
        },
      })
    );
    process.exit(0);
  });
}

if (require.main === module) main();

module.exports = { run };
