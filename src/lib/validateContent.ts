import type { SiteContent } from '../data/content';

/**
 * Content validation (§3). Runs at startup in dev and inside the Vitest
 * suite. Throws with a message that tells Simon exactly what to fix.
 */

const KEBAB_CASE = /^[a-z0-9]+(-[a-z0-9]+)*$/;

export function validateContent(content: SiteContent): void {
  const problems: string[] = [];
  const { milestones, meetingId, weddingId } = content;

  const her = milestones.filter((m) => m.track === 'her');
  const him = milestones.filter((m) => m.track === 'him');
  const shared = milestones.filter((m) => m.track === 'shared');

  // 1. Equal her/him counts — hard requirement from the couple's brief.
  if (her.length !== him.length) {
    problems.push(
      `Der skal være LIGE mange 'her'- og 'him'-milepæle. Lige nu: ` +
        `her=${her.length}, him=${him.length}. Tilføj eller fjern milepæle så tallene er ens.`,
    );
  }

  // 2. Meeting and wedding.
  const meeting = milestones.find((m) => m.id === meetingId);
  const wedding = milestones.find((m) => m.id === weddingId);

  if (!meeting) {
    problems.push(
      `meetingId='${meetingId}' matcher ingen milepæl. Sæt meetingId til id'et på mødet-milepælen.`,
    );
  } else if (meeting.track !== 'shared') {
    problems.push(
      `Mødet-milepælen ('${meetingId}') skal have track: 'shared', ikke '${meeting.track}'.`,
    );
  }

  if (!wedding) {
    problems.push(
      `weddingId='${weddingId}' matcher ingen milepæl. Sæt weddingId til id'et på bryllups-milepælen.`,
    );
  } else if (wedding.track !== 'shared') {
    problems.push(
      `Bryllups-milepælen ('${weddingId}') skal have track: 'shared', ikke '${wedding.track}'.`,
    );
  }

  if (meeting && wedding) {
    const maxYear = Math.max(...milestones.map((m) => m.year));
    if (wedding.year < maxYear) {
      problems.push(
        `Brylluppet (${wedding.year}) skal være det seneste år i historien — der findes en milepæl i ${maxYear}.`,
      );
    }
    const between = shared.filter(
      (m) => m.id !== meetingId && m.id !== weddingId,
    );
    for (const m of between) {
      if (m.year < meeting.year || m.year > wedding.year) {
        problems.push(
          `Den fælles milepæl '${m.id}' (${m.year}) skal ligge mellem mødet (${meeting.year}) og brylluppet (${wedding.year}).`,
        );
      }
    }
    // Meeting precedes all other shared milestones.
    for (const m of between) {
      if (m.year < meeting.year) {
        problems.push(
          `Mødet (${meeting.year}) skal komme før den fælles milepæl '${m.id}' (${m.year}).`,
        );
      }
    }
    // Pre-meeting tracks must not run past the meeting.
    for (const m of [...her, ...him]) {
      if (m.year > meeting.year) {
        problems.push(
          `Milepælen '${m.id}' (${m.year}, track '${m.track}') ligger efter mødet (${meeting.year}). ` +
            `Alt efter mødet skal have track: 'shared'.`,
        );
      }
    }
  }

  // 3. Galleries and ids.
  const seenIds = new Set<string>();
  for (const m of milestones) {
    if (m.gallery.length < 5 || m.gallery.length > 10) {
      problems.push(
        `Galleriet for '${m.id}' har ${m.gallery.length} billeder — der skal være 5–10.`,
      );
    }
    if (!KEBAB_CASE.test(m.id)) {
      problems.push(
        `id'et '${m.id}' er ikke kebab-case (kun a-z, 0-9 og bindestreger, fx 'her-01-foedsel').`,
      );
    }
    if (seenIds.has(m.id)) {
      problems.push(`id'et '${m.id}' bruges af mere end én milepæl — id'er skal være unikke.`);
    }
    seenIds.add(m.id);
  }

  // 4. Years non-decreasing within each track (array order = story order).
  for (const [track, list] of [
    ['her', her],
    ['him', him],
    ['shared', shared],
  ] as const) {
    for (let i = 1; i < list.length; i++) {
      if (list[i].year < list[i - 1].year) {
        problems.push(
          `Årstallene i '${track}'-sporet går baglæns: '${list[i].id}' (${list[i].year}) ` +
            `kommer efter '${list[i - 1].id}' (${list[i - 1].year}). Sortér milepælene kronologisk.`,
        );
      }
    }
  }

  if (problems.length > 0) {
    throw new Error(
      `content.ts er ikke gyldig — ret følgende:\n\n` +
        problems.map((p, i) => `  ${i + 1}. ${p}`).join('\n'),
    );
  }
}

/** True while any guest-visible string still carries the placeholder marker. */
export function hasPlaceholderContent(content: SiteContent): boolean {
  const texts: (string | undefined)[] = [
    content.heroLine,
    ...content.milestones.flatMap((m) => [
      m.title,
      m.text,
      m.longText,
      ...m.gallery.map((g) => g.caption),
    ]),
    ...content.nearMisses.map((n) => n.label),
  ];
  return texts.some((t) => t?.includes('[PLACEHOLDER]'));
}
