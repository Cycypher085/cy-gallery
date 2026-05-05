import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import test from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';

import {
  HANDOFF_MARKERS,
  buildHandoffComment,
  parseHandoffComment,
  validateHandoffComment,
} from '../issue-handoff-lib.mjs';

const cliPath = path.resolve(process.cwd(), 'scripts/issue-handoff.mjs');

test('build + parse handoff comment should round-trip key fields', () => {
  const text = buildHandoffComment({
    issueId: 'SQU-6',
    flowState: 'CODE_READY',
    fromAgent: 'planner',
    toAgent: 'coder',
    status: 'IN_PROGRESS',
    summary: ['Add workflow section'],
    inputs: ['Design spec v1'],
    acceptance: ['Section visible'],
    artifacts: ['docs/spec.md'],
    risks: ['Low'],
    nextActions: ['Implement section'],
    updatedAt: '2026-05-05T00:00:00.000Z',
  });

  assert.ok(text.includes(HANDOFF_MARKERS.begin));
  assert.ok(text.includes(HANDOFF_MARKERS.end));

  const parsed = parseHandoffComment(text);
  assert.equal(parsed.issueId, 'SQU-6');
  assert.equal(parsed.flowState, 'CODE_READY');
  assert.equal(parsed.fromAgent, 'planner');
  assert.equal(parsed.toAgent, 'coder');
  assert.equal(parsed.status, 'IN_PROGRESS');
  assert.deepEqual(parsed.summary, ['Add workflow section']);
});

test('validate should fail when required headers are missing', () => {
  const invalid = `${HANDOFF_MARKERS.begin}
Flow-State: TEST_READY
Status: DONE
Summary:
- Done
${HANDOFF_MARKERS.end}
`;

  const result = validateHandoffComment(invalid);
  assert.equal(result.valid, false);
  assert.ok(result.errors.some((error) => error.includes('Missing required header: Issue')));
  assert.ok(result.errors.some((error) => error.includes('Missing required header: From-Agent')));
  assert.ok(result.errors.some((error) => error.includes('Missing required header: To-Agent')));
});

test('cli emit -> validate -> extract json flow should work', () => {
  const tempDir = mkdtempSync(path.join(tmpdir(), 'handoff-test-'));
  const outFile = path.join(tempDir, 'handoff.md');

  const emit = spawnSync(
    process.execPath,
    [
      cliPath,
      'emit',
      '--issue',
      'SQU-6',
      '--flow',
      'TEST_READY',
      '--from',
      'coder',
      '--to',
      'tester',
      '--status',
      'IN_PROGRESS',
      '--summary',
      'Workflow section implemented',
      '--inputs',
      'PR#4',
      '--acceptance',
      'Workflow Test block visible',
      '--artifacts',
      'src/pages/index.astro',
      '--risks',
      'Low',
      '--next',
      'Run Playwright checks',
      '--out',
      outFile,
    ],
    { encoding: 'utf8' },
  );

  assert.equal(emit.status, 0, emit.stderr);
  const generated = readFileSync(outFile, 'utf8');
  assert.ok(generated.includes('Issue: SQU-6'));

  const validate = spawnSync(process.execPath, [cliPath, 'validate', '--in', outFile], { encoding: 'utf8' });
  assert.equal(validate.status, 0, validate.stderr);
  assert.ok(validate.stdout.includes('VALID'));

  const extract = spawnSync(process.execPath, [cliPath, 'extract', '--in', outFile, '--json'], {
    encoding: 'utf8',
  });
  assert.equal(extract.status, 0, extract.stderr);
  const parsed = JSON.parse(extract.stdout);
  assert.equal(parsed.issueId, 'SQU-6');
  assert.equal(parsed.toAgent, 'tester');

  rmSync(tempDir, { recursive: true, force: true });
});

test('cli validate should exit non-zero for invalid comment', () => {
  const tempDir = mkdtempSync(path.join(tmpdir(), 'handoff-invalid-'));
  const invalidFile = path.join(tempDir, 'invalid.md');
  writeFileSync(
    invalidFile,
    `${HANDOFF_MARKERS.begin}
Issue: SQU-6
Flow-State: TEST_READY
From-Agent: tester
To-Agent: planner
Status: DONE
Summary:
- N/A
${HANDOFF_MARKERS.end}
`,
    'utf8',
  );

  const validate = spawnSync(process.execPath, [cliPath, 'validate', '--in', invalidFile], { encoding: 'utf8' });
  assert.equal(validate.status, 2);
  assert.ok(validate.stdout.includes('INVALID'));

  rmSync(tempDir, { recursive: true, force: true });
});
