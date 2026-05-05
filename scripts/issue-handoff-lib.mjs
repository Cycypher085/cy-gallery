const HANDOFF_BEGIN = '<!-- FLOW_HANDOFF_BEGIN -->';
const HANDOFF_END = '<!-- FLOW_HANDOFF_END -->';

const REQUIRED_FIELDS = [
  'Issue',
  'Flow-State',
  'From-Agent',
  'To-Agent',
  'Status',
];

const SECTION_NAMES = ['Summary', 'Inputs', 'Acceptance', 'Artifacts', 'Risks', 'Next-Actions'];

function toList(value) {
  if (!value) return [];
  if (Array.isArray(value)) {
    return value.map((item) => String(item).trim()).filter(Boolean);
  }
  return String(value)
    .split('||')
    .map((item) => item.trim())
    .filter(Boolean);
}

function listToBullets(items) {
  const rows = toList(items);
  if (rows.length === 0) {
    return ['- N/A'];
  }
  return rows.map((item) => `- ${item}`);
}

export function buildHandoffComment(payload) {
  const updatedAt = payload.updatedAt || new Date().toISOString();
  const lines = [
    HANDOFF_BEGIN,
    `Issue: ${payload.issueId}`,
    `Flow-State: ${payload.flowState}`,
    `From-Agent: ${payload.fromAgent}`,
    `To-Agent: ${payload.toAgent}`,
    `Status: ${payload.status}`,
    `Updated-At: ${updatedAt}`,
    '',
    'Summary:',
    ...listToBullets(payload.summary),
    '',
    'Inputs:',
    ...listToBullets(payload.inputs),
    '',
    'Acceptance:',
    ...listToBullets(payload.acceptance),
    '',
    'Artifacts:',
    ...listToBullets(payload.artifacts),
    '',
    'Risks:',
    ...listToBullets(payload.risks),
    '',
    'Next-Actions:',
    ...listToBullets(payload.nextActions),
    HANDOFF_END,
  ];

  return `${lines.join('\n')}\n`;
}

export function extractHandoffBlock(rawText) {
  const start = rawText.indexOf(HANDOFF_BEGIN);
  if (start === -1) {
    throw new Error('FLOW_HANDOFF_BEGIN marker not found');
  }

  const end = rawText.indexOf(HANDOFF_END, start);
  if (end === -1) {
    throw new Error('FLOW_HANDOFF_END marker not found');
  }

  return rawText.slice(start, end + HANDOFF_END.length);
}

function pushListValue(target, section, line) {
  if (!line.startsWith('- ')) return false;
  target[section].push(line.slice(2).trim());
  return true;
}

export function parseHandoffComment(rawText) {
  const block = extractHandoffBlock(rawText);
  const lines = block.split('\n').map((line) => line.trim());

  const fields = {};
  const sections = {
    Summary: [],
    Inputs: [],
    Acceptance: [],
    Artifacts: [],
    Risks: [],
    'Next-Actions': [],
  };

  let activeSection = null;

  for (const line of lines) {
    if (!line || line === HANDOFF_BEGIN || line === HANDOFF_END) continue;

    const sectionName = SECTION_NAMES.find((name) => line === `${name}:`);
    if (sectionName) {
      activeSection = sectionName;
      continue;
    }

    const headerMatch = line.match(/^([A-Za-z-]+):\s*(.+)$/);
    if (headerMatch) {
      activeSection = null;
      fields[headerMatch[1]] = headerMatch[2];
      continue;
    }

    if (activeSection && pushListValue(sections, activeSection, line)) {
      continue;
    }

    if (activeSection) {
      sections[activeSection].push(line);
    }
  }

  return {
    issueId: fields.Issue,
    flowState: fields['Flow-State'],
    fromAgent: fields['From-Agent'],
    toAgent: fields['To-Agent'],
    status: fields.Status,
    updatedAt: fields['Updated-At'],
    summary: sections.Summary,
    inputs: sections.Inputs,
    acceptance: sections.Acceptance,
    artifacts: sections.Artifacts,
    risks: sections.Risks,
    nextActions: sections['Next-Actions'],
  };
}

export function validateHandoffComment(rawText) {
  const errors = [];
  let parsed;

  try {
    parsed = parseHandoffComment(rawText);
  } catch (error) {
    return {
      valid: false,
      errors: [String(error.message || error)],
      parsed: null,
    };
  }

  const fieldMap = {
    Issue: parsed.issueId,
    'Flow-State': parsed.flowState,
    'From-Agent': parsed.fromAgent,
    'To-Agent': parsed.toAgent,
    Status: parsed.status,
  };

  for (const field of REQUIRED_FIELDS) {
    if (!fieldMap[field]) {
      errors.push(`Missing required header: ${field}`);
    }
  }

  if (!parsed.summary || parsed.summary.length === 0 || parsed.summary.every((item) => item === 'N/A')) {
    errors.push('Summary must contain at least one bullet item');
  }

  return {
    valid: errors.length === 0,
    errors,
    parsed,
  };
}

export const HANDOFF_MARKERS = {
  begin: HANDOFF_BEGIN,
  end: HANDOFF_END,
};
