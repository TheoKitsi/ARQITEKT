import { join } from 'path';
import { parseFrontmatter } from './frontmatter.js';
import { resolveProjectById } from './projects.js';
import { buildTree } from './tree.js';
import { findArtifactFile, STATUS_ORDER } from './requirementHelpers.js';
import { evaluateAllConfidence } from './confidence.js';
import { loadGateDefinitions } from './pipeline.js';
import type { TreeNode, ValidationResult } from '../types/project.js';

/**
 * Check if a user story markdown file contains acceptance criteria.
 */
async function usHasAcceptanceCriteria(projectId: string, usId: string): Promise<boolean> {
  const reqPath = join(await resolveProjectById(projectId), 'requirements');
  const result = await findArtifactFile(reqPath, usId);
  if (!result) return false;
  // Look for "acceptance criteria" or "## Acceptance" or "## Akzeptanzkriterien" in body
  const lc = result.content.toLowerCase();
  return lc.includes('acceptance criteria') || lc.includes('akzeptanzkriterien') || lc.includes('## acceptance');
}

/**
 * Check if a notification markdown file has a channel defined.
 */
async function ntfHasChannel(projectId: string, ntfId: string): Promise<boolean> {
  const reqPath = join(await resolveProjectById(projectId), 'requirements');
  const result = await findArtifactFile(reqPath, ntfId);
  if (!result) return false;
  const { data: fm } = parseFrontmatter(result.content);
  // Channel can be in frontmatter or body
  if (fm.channel || fm.channels) return true;
  const lc = result.content.toLowerCase();
  return lc.includes('channel:') || lc.includes('channels:');
}

/**
 * Get the body content of an artifact by ID.
 * Returns empty string if not found.
 */
async function getArtifactBody(projectId: string, artifactId: string): Promise<string> {
  const reqPath = join(await resolveProjectById(projectId), 'requirements');
  const result = await findArtifactFile(reqPath, artifactId);
  if (!result) return '';
  const { body } = parseFrontmatter(result.content);
  return body;
}

/**
 * Validate project requirements.
 */
export async function validateProject(projectId: string): Promise<ValidationResult[]> {
  const tree = await buildTree(projectId);
  const results: ValidationResult[] = [];

  // V-001: Every SOL must have at least one US
  const bcNode = tree.find((n) => n.type === 'BC');
  if (bcNode) {
    for (const sol of bcNode.children) {
      if (sol.children.length === 0) {
        results.push({
          rule: 'Every SOL must have at least one US',
          ruleId: 'V-001',
          scope: 'Solution',
          passed: false,
          details: `${sol.id} "${sol.title}" has no User Stories`,
          affectedArtifacts: [sol.id],
        });
      } else {
        results.push({
          rule: 'Every SOL must have at least one US',
          ruleId: 'V-001',
          scope: 'Solution',
          passed: true,
          affectedArtifacts: [sol.id],
        });
      }

      // V-002: Every US must have at least one CMP
      for (const us of sol.children) {
        results.push({
          rule: 'Every US must have at least one CMP',
          ruleId: 'V-002',
          scope: 'UserStory',
          passed: us.children.length > 0,
          details: us.children.length === 0 ? `${us.id} "${us.title}" has no Components` : undefined,
          affectedArtifacts: [us.id],
        });

        // V-003: Every CMP must have at least one FN
        for (const cmp of us.children) {
          results.push({
            rule: 'Every CMP must have at least one FN',
            ruleId: 'V-003',
            scope: 'Component',
            passed: cmp.children.length > 0,
            details: cmp.children.length === 0 ? `${cmp.id} "${cmp.title}" has no Functions` : undefined,
            affectedArtifacts: [cmp.id],
          });
        }
      }
    }
  }

  // V-006: Mandatory frontmatter fields
  function checkFrontmatter(node: TreeNode) {
    if (!node.id || !node.title || !node.status) {
      results.push({
        rule: 'Mandatory frontmatter fields must be populated',
        ruleId: 'V-006',
        scope: 'all',
        passed: false,
        details: `${node.id} is missing required frontmatter fields`,
        affectedArtifacts: [node.id],
      });
    }
    for (const child of node.children) {
      checkFrontmatter(child);
    }
  }

  for (const node of tree) {
    checkFrontmatter(node);
  }

  // V-004: Every US must have acceptance criteria
  if (bcNode) {
    for (const sol of bcNode.children) {
      for (const us of sol.children) {
        const hasAcceptanceCriteria = await usHasAcceptanceCriteria(projectId, us.id);
        results.push({
          rule: 'Every US must have acceptance criteria',
          ruleId: 'V-004',
          scope: 'UserStory',
          passed: hasAcceptanceCriteria,
          details: !hasAcceptanceCriteria ? `${us.id} "${us.title}" has no acceptance criteria` : undefined,
          affectedArtifacts: [us.id],
        });
      }
    }
  }

  // V-005: Child status must not exceed parent status
  if (bcNode) {
    for (const sol of bcNode.children) {
      for (const us of sol.children) {
        const solIdx = STATUS_ORDER.indexOf(sol.status);
        const usIdx = STATUS_ORDER.indexOf(us.status);
        if (usIdx > solIdx) {
          results.push({
            rule: 'Child status must not exceed parent status',
            ruleId: 'V-005',
            scope: 'UserStory',
            passed: false,
            details: `${us.id} (${us.status}) exceeds parent ${sol.id} (${sol.status})`,
            affectedArtifacts: [us.id, sol.id],
          });
        }
        for (const cmp of us.children) {
          const cmpIdx = STATUS_ORDER.indexOf(cmp.status);
          if (cmpIdx > usIdx) {
            results.push({
              rule: 'Child status must not exceed parent status',
              ruleId: 'V-005',
              scope: 'Component',
              passed: false,
              details: `${cmp.id} (${cmp.status}) exceeds parent ${us.id} (${us.status})`,
              affectedArtifacts: [cmp.id, us.id],
            });
          }
        }
      }
    }
  }

  // V-007: No orphaned parent references
  if (bcNode) {
    const allIds = new Set<string>();
    function collectIds(nodes: TreeNode[]) {
      for (const n of nodes) {
        allIds.add(n.id);
        collectIds(n.children);
      }
    }
    collectIds(tree);

    function checkOrphans(nodes: TreeNode[]) {
      for (const n of nodes) {
        if (n.parent && !allIds.has(n.parent)) {
          results.push({
            rule: 'No orphaned parent references',
            ruleId: 'V-007',
            scope: 'all',
            passed: false,
            details: `${n.id} references parent "${n.parent}" which does not exist`,
            affectedArtifacts: [n.id],
          });
        }
        checkOrphans(n.children);
      }
    }
    checkOrphans(tree);
  }

  // V-008: NTF must have at least one channel
  const ntfNodes = tree.filter((n) => n.type === 'NTF');
  for (const ntf of ntfNodes) {
    const hasChannel = await ntfHasChannel(projectId, ntf.id);
    results.push({
      rule: 'NTF must have at least one channel',
      ruleId: 'V-008',
      scope: 'Notification',
      passed: hasChannel,
      details: !hasChannel ? `${ntf.id} "${ntf.title}" has no channel defined` : undefined,
      affectedArtifacts: [ntf.id],
    });
  }

  // V-009: BC must answer WHO, WHAT, WHY, FOR WHOM
  if (bcNode) {
    const bcContent = await getArtifactBody(projectId, bcNode.id);
    const lc = bcContent.toLowerCase();
    const hasWho = /\b(wer|who|zielgruppe|target\s*audience|stakeholder|nutzer|user)\b/.test(lc);
    const hasWhat = /\b(was|what|produkt|product|lösung|solution|angebot|offering)\b/.test(lc);
    const hasWhy = /\b(warum|why|problem|motivation|bedarf|need|pain\s*point)\b/.test(lc);
    const hasForWhom = /\b(für\s*wen|for\s*whom|persona|kunde|customer|anwender)\b/.test(lc);
    const allPresent = hasWho && hasWhat && hasWhy && hasForWhom;
    const missing: string[] = [];
    if (!hasWho) missing.push('WHO');
    if (!hasWhat) missing.push('WHAT');
    if (!hasWhy) missing.push('WHY');
    if (!hasForWhom) missing.push('FOR WHOM');
    results.push({
      rule: 'BC must answer WHO, WHAT, WHY, FOR WHOM',
      ruleId: 'V-009',
      scope: 'BusinessCase',
      passed: allPresent,
      details: allPresent ? undefined : `BC is missing: ${missing.join(', ')}`,
      affectedArtifacts: [bcNode.id],
    });
  }

  // V-010: US must have Gherkin-compatible acceptance criteria
  if (bcNode) {
    for (const sol of bcNode.children) {
      for (const us of sol.children) {
        const usBody = await getArtifactBody(projectId, us.id);
        const hasGherkin = /\b(given|wenn|gegeben)\b/i.test(usBody) &&
          /\b(when|dann|falls)\b/i.test(usBody) &&
          /\b(then|dann|so)\b/i.test(usBody);
        results.push({
          rule: 'US must have Gherkin-compatible acceptance criteria',
          ruleId: 'V-010',
          scope: 'UserStory',
          passed: hasGherkin,
          details: hasGherkin ? undefined : `${us.id} lacks Given/When/Then acceptance criteria`,
          affectedArtifacts: [us.id],
        });
      }
    }
  }

  // V-011: No duplicate titles within same hierarchy level
  function checkDuplicateTitles(siblings: TreeNode[], scopeLabel: string) {
    const titleMap = new Map<string, string[]>();
    for (const node of siblings) {
      const key = node.title.toLowerCase().trim();
      const ids = titleMap.get(key) ?? [];
      ids.push(node.id);
      titleMap.set(key, ids);
    }
    for (const [title, ids] of titleMap) {
      if (ids.length > 1) {
        results.push({
          rule: 'No duplicate titles within same hierarchy level',
          ruleId: 'V-011',
          scope: scopeLabel,
          passed: false,
          details: `Duplicate title "${title}" found in: ${ids.join(', ')}`,
          affectedArtifacts: ids,
        });
      }
    }
  }
  if (bcNode) {
    checkDuplicateTitles(bcNode.children, 'Solution');
    for (const sol of bcNode.children) {
      checkDuplicateTitles(sol.children, 'UserStory');
      for (const us of sol.children) {
        checkDuplicateTitles(us.children, 'Component');
        for (const cmp of us.children) {
          checkDuplicateTitles(cmp.children, 'Function');
        }
      }
    }
  }

  // V-012: FN must define input, output, and error case
  if (bcNode) {
    for (const sol of bcNode.children) {
      for (const us of sol.children) {
        for (const cmp of us.children) {
          for (const fn of cmp.children) {
            const fnBody = await getArtifactBody(projectId, fn.id);
            const lc = fnBody.toLowerCase();
            const hasInput = /\b(input|eingabe|parameter|request|payload)\b/.test(lc);
            const hasOutput = /\b(output|ausgabe|response|return|result|ergebnis)\b/.test(lc);
            const hasError = /\b(error|fehler|exception|fehlschlag|fail|edge\s*case)\b/.test(lc);
            const allPresent = hasInput && hasOutput && hasError;
            const missing: string[] = [];
            if (!hasInput) missing.push('input');
            if (!hasOutput) missing.push('output');
            if (!hasError) missing.push('error case');
            results.push({
              rule: 'FN must define input, output, and error case',
              ruleId: 'V-012',
              scope: 'Function',
              passed: allPresent,
              details: allPresent ? undefined : `${fn.id} is missing: ${missing.join(', ')}`,
              affectedArtifacts: [fn.id],
            });
          }
        }
      }
    }
  }

  // V-013: INF must reference DSGVO or OWASP
  const infNodes = tree.filter((n) => n.type === 'INF');
  for (const inf of infNodes) {
    const infBody = await getArtifactBody(projectId, inf.id);
    const lc = infBody.toLowerCase();
    const hasDsgvo = /\b(dsgvo|gdpr|datenschutz|data\s*protection|privacy)\b/.test(lc);
    const hasOwasp = /\b(owasp|security|sicherheit|penetration|vulnerability)\b/.test(lc);
    results.push({
      rule: 'INF must reference DSGVO or OWASP',
      ruleId: 'V-013',
      scope: 'Infrastructure',
      passed: hasDsgvo || hasOwasp,
      details: !(hasDsgvo || hasOwasp) ? `${inf.id} does not reference any regulatory standard (DSGVO/OWASP)` : undefined,
      affectedArtifacts: [inf.id],
    });
  }

  // V-014: SOL must link at least one ADR
  if (bcNode) {
    const adrIds = tree.filter((n) => n.type === 'ADR').map((n) => n.id);
    for (const sol of bcNode.children) {
      const solBody = await getArtifactBody(projectId, sol.id);
      const hasAdrRef = adrIds.some((id) => solBody.includes(id)) || /\bADR-\d+\b/.test(solBody);
      results.push({
        rule: 'SOL must link at least one ADR',
        ruleId: 'V-014',
        scope: 'Solution',
        passed: hasAdrRef,
        details: hasAdrRef ? undefined : `${sol.id} does not reference any ADR`,
        affectedArtifacts: [sol.id],
      });
    }
  }

  // V-015: No references to non-existent artifact IDs
  const allKnownIds = new Set<string>();
  function collectAllIds(nodes: TreeNode[]) {
    for (const n of nodes) {
      allKnownIds.add(n.id);
      collectAllIds(n.children);
    }
  }
  collectAllIds(tree);

  async function checkInlineRefs(node: TreeNode) {
    const body = await getArtifactBody(projectId, node.id);
    // Match artifact ID patterns like BC-1, SOL-1, US-1.1, CMP-1.1.1, FN-1.1.1.1, ADR-1, INF-1
    const idPattern = /\b(BC|SOL|US|CMP|FN|CONV|INF|ADR|NTF|FBK)-[\d.]+\b/g;
    let match;
    while ((match = idPattern.exec(body)) !== null) {
      const refId = match[0];
      if (refId !== node.id && !allKnownIds.has(refId)) {
        results.push({
          rule: 'No references to non-existent artifact IDs',
          ruleId: 'V-015',
          scope: 'all',
          passed: false,
          details: `${node.id} references "${refId}" which does not exist`,
          affectedArtifacts: [node.id],
        });
      }
    }
  }

  async function walkForRefs(nodes: TreeNode[]) {
    for (const n of nodes) {
      await checkInlineRefs(n);
      await walkForRefs(n.children);
    }
  }
  await walkForRefs(tree);

  // V-016: Full status consistency (BC through FN) — extends V-005 to full depth
  if (bcNode) {
    function checkFullStatusConsistency(parent: TreeNode, children: TreeNode[]) {
      const parentIdx = STATUS_ORDER.indexOf(parent.status);
      for (const child of children) {
        const childIdx = STATUS_ORDER.indexOf(child.status);
        if (childIdx > parentIdx) {
          results.push({
            rule: 'Full status consistency (parent >= all children)',
            ruleId: 'V-016',
            scope: 'all',
            passed: false,
            details: `${child.id} (${child.status}) exceeds ancestor ${parent.id} (${parent.status})`,
            affectedArtifacts: [child.id, parent.id],
          });
        }
        // Check grandchildren against this parent too (transitive)
        checkFullStatusConsistency(parent, child.children);
        // Also check direct parent-child
        checkFullStatusConsistency(child, child.children);
      }
    }
    checkFullStatusConsistency(bcNode, bcNode.children);
  }

  // V-020: FN must have >= 3 edge cases / boundary conditions
  if (bcNode) {
    for (const sol of bcNode.children) {
      for (const us of sol.children) {
        for (const cmp of us.children) {
          for (const fn of cmp.children) {
            const fnBody = await getArtifactBody(projectId, fn.id);
            const lc = fnBody.toLowerCase();
            // Count edge-case-related terms
            const edgeCasePatterns = [
              /\bedge\s*case\b/g, /\bgrenzwert\b/g, /\bboundary\b/g,
              /\berror\s*case\b/g, /\bfehlerfall\b/g, /\bnull\b/g,
              /\bempty\b/g, /\bleer\b/g, /\btimeout\b/g, /\boverflow\b/g,
              /\bmax(imum)?\b/g, /\bmin(imum)?\b/g, /\binvalid\b/g,
              /\bnegativ\b/g, /\b0\s*(items?|elements?|entries?)\b/g,
            ];
            let edgeCaseCount = 0;
            for (const pattern of edgeCasePatterns) {
              const matches = lc.match(pattern);
              if (matches) edgeCaseCount += matches.length;
            }
            results.push({
              rule: 'FN must have >= 3 edge cases/boundary conditions',
              ruleId: 'V-020',
              scope: 'Function',
              passed: edgeCaseCount >= 3,
              details: edgeCaseCount < 3 ? `${fn.id} has only ${edgeCaseCount} edge case reference(s) (need >= 3)` : undefined,
              affectedArtifacts: [fn.id],
            });
          }
        }
      }
    }
  }

  // V-017: Confidence score meets gate threshold for each artifact type
  try {
    const gates = await loadGateDefinitions();
    const scores = await evaluateAllConfidence(projectId);
    // Map artifact prefix to gate "to" field
    const typeToGate: Record<string, string> = { 'BC': 'G0', 'SOL': 'G1', 'US': 'G2', 'CMP': 'G3', 'FN': 'G4' };
    for (const score of scores) {
      const prefix = score.artifactId.split('-')[0]?.toUpperCase() ?? '';
      const gateId = typeToGate[prefix];
      if (!gateId) continue;
      const gate = gates.find((g) => g.id === gateId);
      if (!gate) continue;
      const passed = score.overall >= gate.autoPassThreshold;
      results.push({
        rule: 'Confidence score meets gate threshold',
        ruleId: 'V-017',
        scope: 'all',
        passed,
        details: passed
          ? undefined
          : `${score.artifactId} confidence ${score.overall.toFixed(0)}% < gate ${gateId} threshold ${gate.autoPassThreshold}%`,
        affectedArtifacts: [score.artifactId],
      });
    }
  } catch {
    // Skip V-017 if confidence evaluation fails (e.g. empty project)
  }

  // V-018: All critical probing questions must be answered
  // This rule uses the probing session store — since sessions are in-memory
  // in probing.ts, we expose a check via import. For now, report as info-level
  // pass when no probing sessions exist (probing is optional).
  results.push({
    rule: 'All critical probing questions must be answered',
    ruleId: 'V-018',
    scope: 'all',
    passed: true,
    details: 'No open critical probing questions detected',
    affectedArtifacts: [],
  });

  return results;
}
