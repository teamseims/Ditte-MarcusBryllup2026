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

  it('ships the real wedding date', () => {
    expect(content.weddingDate).toBe('12. september 2026');
    expect(content.weddingYear).toBe(2026);
    const wedding = content.milestones.find((m) => m.id === content.weddingId)!;
    expect(wedding.dateLabel).toContain('12. september 2026');
  });

  it('ships balanced her/him milestone counts (13 + 13)', () => {
    const her = content.milestones.filter((m) => m.track === 'her');
    const him = content.milestones.filter((m) => m.track === 'him');
    expect(her.length).toBe(13);
    expect(him.length).toBe(13);
  });

  it("flags Marcus' thread as entirely unwritten", () => {
    // every 'him' entry is still a placeholder awaiting his real story
    const him = content.milestones.filter((m) => m.track === 'him');
    expect(him.every((m) => m.title.includes('[PLACEHOLDER]'))).toBe(true);
  });

  it("has Ditte's real dates where the table supplied them", () => {
    const byId = new Map(content.milestones.map((m) => [m.id, m]));
    expect(byId.get('ditte-01-foedsel')!.dateLabel).toBe('14. marts 1994');
    expect(byId.get('ditte-05-trongaardsskolen')!.dateLabel).toBe('2001');
    expect(byId.get('ditte-11-student')!.dateLabel).toBe('2014');
    expect(byId.get('blaue-blume')!.dateLabel).toBe('Onsdag den 1. marts 2023');
  });
});

describe('validateContent catches broken fixtures', () => {
  it('tolerates a small her/him imbalance but rejects a large one', () => {
    const one = clone();
    one.milestones = one.milestones.filter((m) => m.id !== 'ditte-04-kongens-lyngby');
    expect(() => validateContent(one)).not.toThrow(); // off by one: warns only

    const many = clone();
    const drop = ['ditte-04-kongens-lyngby', 'ditte-05-trongaardsskolen', 'ditte-06-bagsvaerd-kostskole'];
    many.milestones = many.milestones.filter((m) => !drop.includes(m.id));
    expect(() => validateContent(many)).toThrow(/for ulige/);
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
    find(c, 'singapore').year = 2016; // before the meeting
    expect(() => validateContent(c)).toThrow(/mellem mødet/);
  });

  it('rejects her/him milestones after the meeting', () => {
    const c = clone();
    find(c, 'ditte-13-paedagogik').year = 2023;
    expect(() => validateContent(c)).toThrow(/efter mødet/);
  });




  it('rejects duplicate ids', () => {
    const c = clone();
    find(c, 'ditte-02-vuggestue').id = 'ditte-01-foedsel';
    expect(() => validateContent(c)).toThrow(/unikke/);
  });

  it('rejects non-kebab-case ids', () => {
    const c = clone();
    find(c, 'ditte-02-vuggestue').id = 'Her_Skolestart';
    expect(() => validateContent(c)).toThrow(/kebab-case/);
  });

  it('rejects years that go backwards within a track', () => {
    const c = clone();
    find(c, 'marcus-05-skolestart').year = 1990; // before the entry above it
    expect(() => validateContent(c)).toThrow(/baglæns/);
  });

  it('rejects a childId that matches no milestone', () => {
    const c = clone();
    c.childId = 'findes-ikke';
    expect(() => validateContent(c)).toThrow(/childId/);
  });

  it('rejects a child milestone outside the shared track', () => {
    const c = clone();
    c.childId = 'ditte-13-paedagogik';
    expect(() => validateContent(c)).toThrow(/'shared'/);
  });

  it('accepts content without a childId', () => {
    const c = clone();
    delete c.childId;
    expect(() => validateContent(c)).not.toThrow();
  });
});
