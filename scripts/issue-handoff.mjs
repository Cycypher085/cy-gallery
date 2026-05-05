#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';

import {
  buildHandoffComment,
  parseHandoffComment,
  validateHandoffComment,
} from './issue-handoff-lib.mjs';

function printUsage() {
  console.error(`Usage:
  node scripts/issue-handoff.mjs emit --issue SQU-6 --flow TEST_READY --from planner --to coder --status IN_PROGRESS [options]
  node scripts/issue-handoff.mjs extract --in handoff-comment.md [--json]
  node scripts/issue-handoff.mjs validate --in handoff-comment.md [--json]

Emit options:
  --summary "item1||item2"
  --inputs "item1||item2"
  --acceptance "item1||item2"
  --artifacts "item1||item2"
  --risks "item1||item2"
  --next "item1||item2"
  --out ./handoff.md
`);
}

function parseArgs(argv) {
  if (argv.length === 0) {
    throw new Error('Missing command');
  }

  const command = argv[0];
  const options = {};

  const booleanFlags = new Set(['json']);
  for (let i = 1; i < argv.length; i += 1) {
    const token = argv[i];
    if (!token.startsWith('--')) {
      throw new Error(`Unexpected argument: ${token}`);
    }
    const key = token.slice(2);
    const value = argv[i + 1];
    if (booleanFlags.has(key) && (!value || value.startsWith('--'))) {
      options[key] = 'true';
      continue;
    }
    if (!value || value.startsWith('--')) {
      throw new Error(`Missing value for --${key}`);
    }
    options[key] = value;
    i += 1;
  }

  return { command, options };
}

function readInputContent(inFile) {
  if (!inFile) {
    throw new Error('Missing required option --in');
  }
  const filePath = path.resolve(inFile);
  return fs.readFileSync(filePath, 'utf8');
}

function splitList(raw) {
  if (!raw) return [];
  return raw
    .split('||')
    .map((item) => item.trim())
    .filter(Boolean);
}

function ensureRequired(optionMap, keys) {
  for (const key of keys) {
    if (!optionMap[key]) {
      throw new Error(`Missing required option --${key}`);
    }
  }
}

function writeOutput(content, outFile) {
  if (!outFile) {
    process.stdout.write(content);
    return;
  }

  const outPath = path.resolve(outFile);
  fs.writeFileSync(outPath, content, 'utf8');
  process.stdout.write(`Wrote handoff comment to ${outPath}\n`);
}

function runEmit(options) {
  ensureRequired(options, ['issue', 'flow', 'from', 'to', 'status']);

  const comment = buildHandoffComment({
    issueId: options.issue,
    flowState: options.flow,
    fromAgent: options.from,
    toAgent: options.to,
    status: options.status,
    summary: splitList(options.summary),
    inputs: splitList(options.inputs),
    acceptance: splitList(options.acceptance),
    artifacts: splitList(options.artifacts),
    risks: splitList(options.risks),
    nextActions: splitList(options.next),
    updatedAt: new Date().toISOString(),
  });

  writeOutput(comment, options.out);
}

function runExtract(options) {
  const content = readInputContent(options.in);
  const parsed = parseHandoffComment(content);
  if (options.json) {
    process.stdout.write(`${JSON.stringify(parsed, null, 2)}\n`);
    return;
  }
  process.stdout.write(`Issue: ${parsed.issueId}\n`);
  process.stdout.write(`Flow-State: ${parsed.flowState}\n`);
  process.stdout.write(`From-Agent: ${parsed.fromAgent}\n`);
  process.stdout.write(`To-Agent: ${parsed.toAgent}\n`);
  process.stdout.write(`Status: ${parsed.status}\n`);
  process.stdout.write(`Updated-At: ${parsed.updatedAt}\n`);
}

function runValidate(options) {
  const content = readInputContent(options.in);
  const result = validateHandoffComment(content);
  if (options.json) {
    process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
    process.exit(result.valid ? 0 : 2);
  }

  if (result.valid) {
    process.stdout.write('VALID: handoff comment structure is correct.\n');
    return;
  }

  process.stdout.write('INVALID: handoff comment structure has errors.\n');
  for (const error of result.errors) {
    process.stdout.write(`- ${error}\n`);
  }
  process.exit(2);
}

function main() {
  let command;
  let options;

  try {
    ({ command, options } = parseArgs(process.argv.slice(2)));
  } catch (error) {
    printUsage();
    console.error(`\nError: ${error.message}`);
    process.exit(1);
  }

  try {
    if (command === 'emit') {
      runEmit(options);
      return;
    }
    if (command === 'extract') {
      runExtract(options);
      return;
    }
    if (command === 'validate') {
      runValidate(options);
      return;
    }

    printUsage();
    console.error(`\nError: unsupported command "${command}"`);
    process.exit(1);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
}

main();
