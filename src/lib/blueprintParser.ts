// Blueprint Parser (Phase 1)
// Supports: JSON structure, Markdown indented tree (using spaces), future YAML.
// Normalized shape: ExportNode

export type ExportNode = { name: string; type: 'dir' | 'file'; children?: ExportNode[]; template?: 'readme'|'index'|'none' };
export interface ParseResult { root: ExportNode[]; warnings: string[]; format: 'json' | 'markdown' | 'unknown'; }

// Detect format and parse accordingly
export function parseBlueprint(raw: string): ParseResult {
  const trimmed = raw.trim();
  // Try JSON
  try {
    const json = JSON.parse(trimmed);
    const root = normalizeFromJson(json);
    return { root, warnings: [], format: 'json' };
  } catch {/* fallthrough */}

  // Try Markdown tree
  if (/^[\-\* ]+\w+/m.test(trimmed) || /^[A-Za-z0-9_\-\/\.]+$/m.test(trimmed)) {
    const { nodes, warnings } = parseMarkdownTree(trimmed);
    return { root: nodes, warnings, format: 'markdown' };
  }

  return { root: [], warnings: ['Unrecognized blueprint format'], format: 'unknown' };
}

function normalizeFromJson(input: any): ExportNode[] {
  if (Array.isArray(input)) return input.flatMap(normalizeFromJson);
  if (typeof input === 'object' && input) {
    // Accept { name, type, children }
    if (input.name && input.type) {
      const node: ExportNode = { name: String(input.name), type: input.type === 'dir' ? 'dir' : 'file' };
      if (input.children) node.children = normalizeFromJson(input.children);
      return [node];
    }
    // Accept object map: { folder: { ... }, file: null }
    return Object.entries(input).map(([key, value]) => {
      if (value === null) return { name: key, type: inferType(key) } as ExportNode;
      if (Array.isArray(value) || typeof value === 'object') {
        return { name: key, type: 'dir', children: normalizeFromJson(value) } as ExportNode;
      }
      return { name: key, type: inferType(key) } as ExportNode;
    });
  }
  return [];
}

function inferType(name: string): 'dir' | 'file' { return name.includes('.') ? 'file' : 'dir'; }

interface LineToken { level: number; name: string; }

function parseMarkdownTree(raw: string): { nodes: ExportNode[]; warnings: string[] } {
  const warnings: string[] = [];
  const lines = raw.split(/\r?\n/).map(l => l.replace(/^[\s\-\*]+/, m => m.replace(/[-*]/g,' ').replace(/\s+/g,' ')));
  const tokens: LineToken[] = [];
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    const match = line.match(/^(\s*)(.+)$/);
    if (!match) continue;
    const indent = match[1].length;
    const name = match[2].trim();
    if (!name) continue;
    tokens.push({ level: Math.floor(indent / 2), name });
  }
  const rootStack: { node: ExportNode; level: number }[] = [];
  const roots: ExportNode[] = [];
  for (const t of tokens) {
    const node: ExportNode = { name: t.name, type: inferType(t.name) };
    while (rootStack.length && rootStack[rootStack.length - 1].level >= t.level) rootStack.pop();
    if (!rootStack.length) {
      roots.push(node);
    } else {
      const parent = rootStack[rootStack.length - 1].node;
      parent.children = parent.children || [];
      parent.children.push(node);
      if (parent.type !== 'dir') warnings.push(`Parent coerced to dir: ${parent.name}`);
      parent.type = 'dir';
    }
    rootStack.push({ node, level: t.level });
  }
  return { nodes: roots, warnings };
}

export interface ExportPlan { create: ExportNode[]; overwrite: ExportNode[]; skip: ExportNode[]; }

export function planExport(desired: ExportNode[], existing: Set<string>): ExportPlan {
  const create: ExportNode[] = []; const overwrite: ExportNode[] = []; const skip: ExportNode[] = [];
  const walk = (nodes: ExportNode[], path: string[] = []) => {
    for (const n of nodes) {
      const full = [...path, n.name].join('/');
      if (existing.has(full)) {
        // For now treat existing files/dirs as skip unless we mark templates (future improvement)
        skip.push(n);
      } else {
        create.push(n);
      }
      if (n.children) walk(n.children, [...path, n.name]);
    }
  };
  walk(desired);
  return { create, overwrite, skip };
}

// Placeholder apply (non-FS side effect in browser env)
export async function applyExport(plan: ExportPlan): Promise<{ created: number }> {
  // Real implementation would create directories / files (Node or backend service).
  return { created: plan.create.length };
}
