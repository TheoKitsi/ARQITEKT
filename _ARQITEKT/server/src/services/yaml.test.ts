import { parseYaml, dumpYaml } from './yaml.js';

describe('parseYaml', () => {
  it('parses simple YAML key-value pairs', () => {
    const yaml = 'name: ARQITEKT\nversion: 2.0.0\nenabled: true\n';

    const result = parseYaml(yaml);

    expect(result.name).toBe('ARQITEKT');
    expect(result.version).toBe('2.0.0');
    expect(result.enabled).toBe(true);
  });

  it('parses nested objects', () => {
    const yaml = [
      'project:',
      '  name: Social',
      '  config:',
      '    port: 3000',
      '    debug: false',
    ].join('\n');

    const result = parseYaml(yaml);

    expect(result.project).toEqual({
      name: 'Social',
      config: {
        port: 3000,
        debug: false,
      },
    });
  });

  it('parses arrays', () => {
    const yaml = [
      'tags:',
      '  - auth',
      '  - security',
      '  - oauth',
    ].join('\n');

    const result = parseYaml(yaml);

    expect(result.tags).toEqual(['auth', 'security', 'oauth']);
  });

  it('parses inline arrays', () => {
    const yaml = 'tags: [one, two, three]\n';

    const result = parseYaml(yaml);

    expect(result.tags).toEqual(['one', 'two', 'three']);
  });

  it('returns empty object for null content', () => {
    const result = parseYaml('null');

    expect(result).toEqual({});
  });

  it('returns empty object for a plain string value', () => {
    const result = parseYaml('hello');

    expect(result).toEqual({});
  });

  it('returns empty object for a number value', () => {
    const result = parseYaml('42');

    expect(result).toEqual({});
  });

  it('returns empty object for empty string', () => {
    const result = parseYaml('');

    expect(result).toEqual({});
  });

  it('parses complex nested structure', () => {
    const yaml = [
      'branding:',
      '  primaryColor: "#FF5733"',
      '  mode: dark',
      'github:',
      '  repo: TheoKitsi/ARQITEKT',
      '  url: https://github.com/TheoKitsi/ARQITEKT',
    ].join('\n');

    const result = parseYaml(yaml);

    expect(result.branding).toEqual({
      primaryColor: '#FF5733',
      mode: 'dark',
    });
    expect(result.github).toEqual({
      repo: 'TheoKitsi/ARQITEKT',
      url: 'https://github.com/TheoKitsi/ARQITEKT',
    });
  });
});

describe('dumpYaml', () => {
  it('produces valid YAML that can be roundtripped', () => {
    const original = {
      name: 'TestProject',
      version: '1.0.0',
      tags: ['alpha', 'beta'],
    };

    const yamlStr = dumpYaml(original);
    const parsed = parseYaml(yamlStr);

    expect(parsed).toEqual(original);
  });

  it('handles nested structures', () => {
    const data = {
      project: {
        name: 'Social',
        config: {
          port: 3000,
          features: ['chat', 'feed'],
        },
      },
    };

    const yamlStr = dumpYaml(data);
    const parsed = parseYaml(yamlStr);

    expect(parsed).toEqual(data);
  });

  it('returns a string', () => {
    const result = dumpYaml({ key: 'value' });

    expect(typeof result).toBe('string');
  });

  it('produces YAML containing key names', () => {
    const yamlStr = dumpYaml({ name: 'Hello', count: 5 });

    expect(yamlStr).toContain('name:');
    expect(yamlStr).toContain('count:');
  });

  it('handles empty object', () => {
    const yamlStr = dumpYaml({});
    const parsed = parseYaml(yamlStr);

    expect(parsed).toEqual({});
  });

  it('handles boolean and null values', () => {
    const data = { enabled: true, disabled: false, empty: null };

    const yamlStr = dumpYaml(data as Record<string, unknown>);
    const parsed = parseYaml(yamlStr);

    expect(parsed.enabled).toBe(true);
    expect(parsed.disabled).toBe(false);
    expect(parsed.empty).toBeNull();
  });
});
