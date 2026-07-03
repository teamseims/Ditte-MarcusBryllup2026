import { describe, expect, it } from 'vitest';
import { content } from '../data/content';
import type { SiteContent, Milestone } from '../data/content';
import { validateContent, hasPlaceholderContent } from '../lib/validateContent';

/** Deep-clone the shipped content so fixtures can be broken deliberately. */
const clone = (): SiteContent => structuredClone(content);
const find = (c: SiteContent, id: string): Milestone =>
  c.milestones.find((m) => m.id === id)!;

describe('shipped placeholder content', () => {
  it('passes validation', () => {
    expect(() => validateContent(content)).not.toThrow();
  });

  it('still carries the [PLACEHOLDER] markers', () => {
    expect(hasPlaceholderContent(content)).toBe(true);
  });

  it('ships equal her/him milestone counts (8 + 8)', () => {
    const her = content.milestones.filter((m) => m.track === 'her');
    const him = content.milestones.filter((m) => m.track === 'him');
    expect(her.length).toBe(8);
    expect(him.length).toBe(8);
  });
});

describe('validateContent catches broken fixtures', () => {
  it('rejects unequal her/him counts', () => {
    const c = clone();
    c.milestones = c.milestones.filter((m) => m.id !== 'her-04-koret');
    expect(() => validateContent(c)).toThrow(/LIGE mange/);
  });

  it('rejects a missing meeting milestone', () => {
    const c = clone();
    c.meetingId = 'findes-ikke';
    expect(() => validateContent(c)).toThrow(/meetingId/);
  });

  it('rejects a wedding that is not the maximum year', () => {
    const c = clone();
    find(c, 'brylluppet').year = 2024;
    expect(() => validateContent(c)).toThrow(/seneste år/);
  });

  it('rejects shared milestones outside meeting→wedding', () => {
    const c = clone();
    find(c, 'shared-02-faelles-adresse').year = 2019;
    expect(() => validateContent(c)).toThrow(/mellem mødet/);
  });

  it('rejects her/him milestones after the meeting', () => {
    const c = clone();
    find(c, 'her-08-egen-lejlighed').year = 2023;
    expect(() => validateContent(c)).toThrow(/efter mødet/);
  });

  it('rejects galleries with fewer than 5 images', () => {
    const c = clone();
    find(c, 'moedet').gallery = find(c, 'moedet').gallery.slice(0, 3);
    expect(() => validateContent(c)).toThrow(/5–10/);
  });

  it('rejects galleries with more than 10 images', () => {
    const c = clone();
    const g = find(c, 'moedet').gallery;
    find(c, 'moedet').gallery = [...g, ...g];
    expect(() => validateContent(c)).toThrow(/5–10/);
  });

  it('rejects duplicate ids', () => {
    const c = clone();
    find(c, 'her-02-skolestart').id = 'her-01-foedsel';
    expect(() => validateContent(c)).toThrow(/unikke/);
  });

  it('rejects non-kebab-case ids', () => {
    const c = clone();
    find(c, 'her-02-skolestart').id = 'Her_Skolestart';
    expect(() => validateContent(c)).toThrow(/kebab-case/);
  });

  it('rejects years that go backwards within a track', () => {
    const c = clone();
    find(c, 'him-05-sejlerskolen').year = 2001;
    expect(() => validateContent(c)).toThrow(/baglæns/);
  });

  it('rejects a childId that matches no milestone', () => {
    const c = clone();
    c.childId = 'findes-ikke';
    expect(() => validateContent(c)).toThrow(/childId/);
  });

  it('rejects a child milestone outside the shared track', () => {
    const c = clone();
    c.childId = 'her-08-egen-lejlighed';
    expect(() => validateContent(c)).toThrow(/'shared'/);
  });

  it('accepts content without a childId', () => {
    const c = clone();
    delete c.childId;
    expect(() => validateContent(c)).not.toThrow();
  });
});
