import yaml from 'js-yaml';

/**
 * Parse YAML content using js-yaml.
 * Replaces the custom parseYaml that only handled flat key-value pairs.
 */
export function parseYaml(content: string): Record<string, unknown> {
  const result = yaml.load(content);
  if (typeof result !== 'object' || result === null) {
    return {};
  }
  return result as Record<string, unknown>;
}

/**
 * Serialize an object to YAML.
 */
export function dumpYaml(data: Record<string, unknown>): string {
  return yaml.dump(data, {
    indent: 2,
    lineWidth: 120,
    noRefs: true,
    sortKeys: false,
  });
}
