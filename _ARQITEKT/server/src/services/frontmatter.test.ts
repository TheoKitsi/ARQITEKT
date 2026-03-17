import { parseFrontmatter, parseFrontmatterTyped } from './frontmatter.js';

describe('parseFrontmatter', () => {
  it('parses valid frontmatter with id, title, type, status', () => {
    const content = [
      '---',
      'id: SOL-001',
      'title: Authentication Service',
      'type: Solution',
      'status: draft',
      '---',
      'Some body content',
    ].join('\n');

    const result = parseFrontmatter(content);

    expect(result.data.id).toBe('SOL-001');
    expect(result.data.title).toBe('Authentication Service');
    expect(result.data.type).toBe('Solution');
    expect(result.data.status).toBe('draft');
  });

  it('returns full body content after frontmatter', () => {
    const body = 'Line 1\n\nLine 3\n\n## Heading\n\nMore content.';
    const content = `---\nid: BC-001\ntitle: Test\n---\n${body}`;

    const result = parseFrontmatter(content);

    expect(result.body).toBe(body);
  });

  it('handles missing frontmatter and returns defaults with full content as body', () => {
    const content = 'This is just a plain markdown file.\n\nNo frontmatter here.';

    const result = parseFrontmatter(content);

    expect(result.data).toEqual({
      type: 'Solution',
      id: '',
      title: '',
      status: 'idea',
    });
    expect(result.body).toBe(content);
  });

  it('strips surrounding double quotes from values', () => {
    const content = [
      '---',
      'id: "US-042"',
      'title: "User Login Flow"',
      'status: "review"',
      '---',
      '',
    ].join('\n');

    const result = parseFrontmatter(content);

    expect(result.data.id).toBe('US-042');
    expect(result.data.title).toBe('User Login Flow');
    expect(result.data.status).toBe('review');
  });

  it('parses array values like [tag1, tag2]', () => {
    const content = [
      '---',
      'id: SOL-005',
      'tags: [auth, security, oauth]',
      '---',
      'Body',
    ].join('\n');

    const result = parseFrontmatter(content);

    expect(result.data.tags).toEqual(['auth', 'security', 'oauth']);
  });

  it('parses array values with quoted items', () => {
    const content = [
      '---',
      'id: SOL-005',
      'tags: ["auth", "security"]',
      '---',
      'Body',
    ].join('\n');

    const result = parseFrontmatter(content);

    expect(result.data.tags).toEqual(['auth', 'security']);
  });

  it('handles Windows CRLF line endings', () => {
    const content = '---\r\nid: CMP-010\r\ntitle: Dashboard Widget\r\ntype: Component\r\nstatus: approved\r\n---\r\nBody with CRLF';

    const result = parseFrontmatter(content);

    expect(result.data.id).toBe('CMP-010');
    expect(result.data.title).toBe('Dashboard Widget');
    expect(result.data.type).toBe('Component');
    expect(result.data.status).toBe('approved');
    expect(result.body).toBe('Body with CRLF');
  });

  it('returns empty body when nothing follows the closing delimiter', () => {
    const content = '---\nid: FN-001\ntitle: Test\n---\n';

    const result = parseFrontmatter(content);

    expect(result.data.id).toBe('FN-001');
    expect(result.body).toBe('');
  });

  it('handles values that contain colons', () => {
    const content = [
      '---',
      'id: US-001',
      'title: User Story: Login Flow',
      '---',
      'Body',
    ].join('\n');

    const result = parseFrontmatter(content);

    expect(result.data.title).toBe('User Story: Login Flow');
  });

  it('skips lines without a colon', () => {
    const content = [
      '---',
      'id: SOL-001',
      'this line has no key value pair',
      'title: Valid',
      '---',
      'Body',
    ].join('\n');

    const result = parseFrontmatter(content);

    expect(result.data.id).toBe('SOL-001');
    expect(result.data.title).toBe('Valid');
  });
});

describe('parseFrontmatterTyped', () => {
  it('returns a typed RequirementFrontmatter result', () => {
    const content = [
      '---',
      'id: US-007',
      'title: Password Reset',
      'type: UserStory',
      'status: idea',
      'parent: SOL-001',
      '---',
      'As a user I want to reset my password.',
    ].join('\n');

    const result = parseFrontmatterTyped(content);

    expect(result.data.id).toBe('US-007');
    expect(result.data.title).toBe('Password Reset');
    expect(result.data.type).toBe('UserStory');
    expect(result.data.status).toBe('idea');
    expect(result.data.parent).toBe('SOL-001');
    expect(result.body).toBe('As a user I want to reset my password.');
  });

  it('returns defaults when frontmatter is missing', () => {
    const result = parseFrontmatterTyped('No frontmatter');

    expect(result.data.id).toBe('');
    expect(result.data.title).toBe('');
    expect(result.data.status).toBe('idea');
    expect(result.body).toBe('No frontmatter');
  });
});
