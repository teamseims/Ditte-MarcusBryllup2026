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

  // 1. Balance between the two threads. The brief asked for exactly equal
  //    counts; in practice one of them always has more material to hand, so
  //    a difference of one or two only warns. Beyond that one thread is
  //    visibly denser than the other and it reads as though somebody was
  //    left out — that still stops the build.
  const imbalance = Math.abs(her.length - him.length);
  if (imbalance > 2) {
    problems.push(
      `Trådene er for ulige: her=${her.length}, him=${him.length}. ` +
        `Forskellen må højst være 2 — ellers ser den ene tråd tydeligt tommere ud end den anden. ` +
        `Tilføj milepæle til den korte tråd, eller slå et par af den lange sammen.`,
    );
  } else if (imbalance > 0 && typeof console !== 'undefined') {
    console.warn(
      `[vævningen] Trådene er lidt ulige: her=${her.length}, him=${him.length}. ` +
        `Det er tilladt, men de står smukkest når de er lige lange.`,
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

  // 2b. The child milestone, if declared.
  if (content.childId !== undefined) {
    const child = milestones.find((m) => m.id === content.childId);
    if (!child) {
      problems.push(
        `childId='${content.childId}' matcher ingen milepæl. Sæt childId til id'et på barnets milepæl, eller fjern feltet.`,
      );
    } else {
      if (child.track !== 'shared') {
        problems.push(
          `Barnets milepæl ('${content.childId}') skal have track: 'shared', ikke '${child.track}'.`,
        );
      }
      if (child.id === meetingId || child.id === weddingId) {
        problems.push(
          `childId må ikke pege på mødet eller brylluppet — barnets tråd starter ved sin egen milepæl.`,
        );
      }
    }
  }

  // 3. Ids: unique and kebab-case (they are the deep links).
  const seenIds = new Set<string>();
  for (const m of milestones) {
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
    // dateLabel counts too: a guessed date is exactly the kind of thing
    // that must not reach the venue unnoticed
    ...content.milestones.flatMap((m) => [
      m.title,
      m.text,
      m.longText,
      m.dateLabel,
    ]),
    ...content.nearMisses.map((n) => n.label),
  ];
  return texts.some((t) => t?.includes('[PLACEHOLDER]'));
}
