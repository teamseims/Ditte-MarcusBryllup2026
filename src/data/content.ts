/**
 * ═══════════════════════════════════════════════════════════════════════════
 *  THE WEDDING TAPESTRY — CONTENT (§3)
 *  The single source of truth for everything guests read.
 *
 *  HOW TO FILL IN THE REAL STORY (Simon, read this):
 *
 *  1. Replace every string carrying the `[PLACEHOLDER]` marker below.
 *     While any marker remains, a small "PLACEHOLDER" ribbon shows on the
 *     hero so fake content can never sneak into the real event unnoticed.
 *
 *  2. This is a TEXT tapestry — there are no photographs anywhere. Each
 *     milestone is a marker on the thread with a small card beside it:
 *     date, title, and one to three sentences. Give a milestone a
 *     `longText` and its marker also opens a story card — the emblem
 *     stitched large on linen with the fuller telling. Without `longText`
 *     the card is the whole thing and the marker is quiet.
 *
 *  3. Adding milestones is the main job. One entry per moment:
 *
 *       {
 *         id: 'him-04-studenterhue',   // kebab-case, unique, stable
 *         track: 'him',                // 'her' = Ditte, 'him' = Marcus,
 *                                      // 'shared' = the two of them
 *         year: 2010,                  // drives vertical order
 *         dateLabel: 'Juni 2010',      // free text, shown on the card
 *         title: 'Studenterhuen',
 *         text: 'One to three sentences.',
 *         longText: 'Optional — the fuller story, in the story card.',
 *         icon: 'graduation-cap',
 *       },
 *
 *     Order within a track must be chronological (non-decreasing years).
 *     Keep the 'her' and 'him' counts close: a difference of one or two
 *     only warns, but more than that stops the build, because one visibly
 *     denser thread reads as though somebody was left out.
 *
 *  4. `id` must be kebab-case (a-z, 0-9, hyphens), unique, and STABLE:
 *     it is the deep link (#milestone-id) printed on anything you share.
 *
 *  5. The meeting milestone (track 'shared') is where the two threads touch
 *     for the first time; the wedding milestone is the final one (the knot).
 *     Point `meetingId` / `weddingId` at them. All other 'shared' milestones
 *     must fall strictly between those two years.
 *
 *  6. Icons available (see src/lib/icons/iconPaths.js to add more):
 *     flower · star · book · graduation-cap · plane · football · music-note
 *     house · paw · briefcase · mountain · heart · sparkle · rings · anchor
 *     sun
 * ═══════════════════════════════════════════════════════════════════════════
 */

import type { IconName } from '../lib/icons/iconPaths';

/**
 * The site's canonical URL — used by the /qr poster (§12).
 * Simon: after the first Vercel deploy, put the real URL here and reprint.
 */
export const SITE_URL = 'https://REPLACE-ME.vercel.app';

export type Track = 'her' | 'him' | 'shared';

export interface Milestone {
  id: string; // kebab-case, stable — the deep link (#milestone-id)
  track: Track;
  year: number; // drives vertical ordering
  dateLabel: string; // display string, free text
  title: string; // short, e.g. 'Ditte kommer til verden'
  text: string; // 1–3 sentences shown in the card
  /**
   * Optional fuller telling. When present the marker becomes tappable and
   * opens a story card — the emblem stitched large on linen above the
   * date, title and this text. Without it the card says everything and
   * the marker stays quiet rather than opening a dead end.
   */
  longText?: string;
  icon: IconName;
}

export interface NearMiss {
  year: number;
  label: string; // e.g. 'Samme festival — mødtes aldrig'
}

export interface SiteContent {
  her: { name: string; birthYear: number };
  him: { name: string; birthYear: number };
  weddingDate: string; // display string
  weddingYear: number;
  heroLine: string; // one poetic line under the names
  milestones: Milestone[]; // ALL milestones, all tracks, any order
  nearMisses: NearMiss[]; // 0–3 moments the threads almost touched
  meetingId: string; // id of the milestone where the tracks converge
  weddingId: string; // id of the final shared milestone
  /**
   * Optional: the milestone where a child arrives. From that point a third,
   * smaller thread — in a blend of the two thread colors — runs down the
   * center of the braid and nestles behind the medallion inside the heart.
   * Must be a 'shared' milestone between the meeting and the wedding.
   * Omit (or set to undefined) if not wanted.
   */
  childId?: string;
}

export const content: SiteContent = {
  her: { name: 'Ditte', birthYear: 1994 },
  him: { name: 'Marcus', birthYear: 1992 },
  weddingDate: '15. august 2026',
  weddingYear: 2026,
  heroLine: '[PLACEHOLDER] To tråde, vævet af hver sin begyndelse.',

  milestones: [
    // ─────────────────────────── HENDES TRÅD ───────────────────────────
    {
      id: 'her-01-foedsel',
      track: 'her',
      year: 1994,
      dateLabel: 'Forår 1994',
      title: '[PLACEHOLDER] Ditte kommer til verden',
      text: '[PLACEHOLDER] En forårsmorgen begynder en rosenrød tråd sin vej gennem vævningen.',
      longText:
        '[PLACEHOLDER] Her kan historien om hendes allerførste tid stå — stedet, årstiden, hvem der ventede. Denne milepæl har med vilje ingen billeder: den åbner som et fortællekort.',
      icon: 'flower',
    },
    {
      id: 'her-02-skolestart',
      track: 'her',
      year: 2000,
      dateLabel: 'August 2000',
      title: '[PLACEHOLDER] Første skoledag',
      text: '[PLACEHOLDER] Med ny skoletaske og sommerfugle i maven — det første af mange kapitler.',
      icon: 'book',
    },
    {
      id: 'her-03-hunden-bella',
      track: 'her',
      year: 2003,
      dateLabel: 'Sommer 2003',
      title: '[PLACEHOLDER] Bella flytter ind',
      text: '[PLACEHOLDER] Fire poter, én våd snude og et venskab for livet.',
      icon: 'paw',
    },
    {
      id: 'her-04-koret',
      track: 'her',
      year: 2008,
      dateLabel: '2008',
      title: '[PLACEHOLDER] Stemmen finder koret',
      text: '[PLACEHOLDER] Onsdage bliver ugens bedste dag, og musikken flytter ind for altid.',
      icon: 'music-note',
    },
    {
      id: 'her-05-studenterhue',
      track: 'her',
      year: 2012,
      dateLabel: 'Juni 2012',
      title: '[PLACEHOLDER] Studenterhuen',
      text: '[PLACEHOLDER] Hvid hue, hæse hurraråb og en sommer uden ende.',
      icon: 'graduation-cap',
    },
    {
      id: 'her-06-jorden-rundt',
      track: 'her',
      year: 2014,
      dateLabel: 'Efterår 2014',
      title: '[PLACEHOLDER] Med rygsæk om jorden',
      text: '[PLACEHOLDER] Otte måneder, tre kontinenter og en kuffert fuld af historier.',
      longText:
        '[PLACEHOLDER] Her er plads til en længere fortælling, som kun vises inde i billedgalleriet — et afsnit eller to om rejsen, menneskene og alt det, der ikke kunne være i det korte kort.',
      icon: 'plane',
    },
    {
      id: 'her-07-foerste-job',
      track: 'her',
      year: 2017,
      dateLabel: 'Januar 2017',
      title: '[PLACEHOLDER] Første rigtige job',
      text: '[PLACEHOLDER] Nye kollegaer, egen kaffekop og følelsen af at være landet.',
      icon: 'briefcase',
    },
    {
      id: 'her-08-egen-lejlighed',
      track: 'her',
      year: 2019,
      dateLabel: 'Marts 2019',
      title: '[PLACEHOLDER] Egne nøgler',
      text: '[PLACEHOLDER] To værelser, skæve gulve og en udsigt hun aldrig blev træt af.',
      icon: 'house',
    },

    // ─────────────────────────── HANS TRÅD ───────────────────────────
    {
      id: 'him-01-foedsel',
      track: 'him',
      year: 1992,
      dateLabel: 'Vinter 1992',
      title: '[PLACEHOLDER] Marcus kommer til verden',
      text: '[PLACEHOLDER] En vinternat begynder en indigoblå tråd sin vej gennem vævningen.',
      longText:
        '[PLACEHOLDER] Her kan historien om hans allerførste tid stå — stedet, årstiden, hvem der ventede. Denne milepæl har med vilje ingen billeder: den åbner som et fortællekort.',
      icon: 'star',
    },
    {
      id: 'him-02-foerste-fodboldkamp',
      track: 'him',
      year: 1999,
      dateLabel: '1999',
      title: '[PLACEHOLDER] Første fodboldkamp',
      text: '[PLACEHOLDER] For store benskinner, græsplet på knæet og et mål han stadig taler om.',
      icon: 'football',
    },
    {
      id: 'him-03-spejderlejr',
      track: 'him',
      year: 2004,
      dateLabel: 'Sommer 2004',
      title: '[PLACEHOLDER] Sommerlejr i fjeldet',
      text: '[PLACEHOLDER] Første gang under åben himmel — og begyndelsen på kærligheden til bjergene.',
      icon: 'mountain',
    },
    {
      id: 'him-04-studenterhue',
      track: 'him',
      year: 2010,
      dateLabel: 'Juni 2010',
      title: '[PLACEHOLDER] Studenterhuen',
      text: '[PLACEHOLDER] Hornmusik i carporten og en hue, der hurtigt fik mærker af det hele.',
      icon: 'graduation-cap',
    },
    {
      id: 'him-05-sejlerskolen',
      track: 'him',
      year: 2013,
      dateLabel: '2013',
      title: '[PLACEHOLDER] Til søs',
      text: '[PLACEHOLDER] Salt i håret og ro i maven — sejlerskolen blev et andet hjem.',
      icon: 'anchor',
    },
    {
      id: 'him-06-udlandssemester',
      track: 'him',
      year: 2015,
      dateLabel: 'Forår 2015',
      title: '[PLACEHOLDER] Et semester under sydens sol',
      text: '[PLACEHOLDER] Et halvt år væk hjemmefra, der føltes som ti minutter og et helt liv på én gang.',
      longText:
        '[PLACEHOLDER] Her er plads til en længere fortælling, som kun vises inde i billedgalleriet — mere om byen, vennerne og alt det, der ikke kunne være i det korte kort.',
      icon: 'sun',
    },
    {
      id: 'him-07-foerste-job',
      track: 'him',
      year: 2016,
      dateLabel: '2016',
      title: '[PLACEHOLDER] Første rigtige job',
      text: '[PLACEHOLDER] Skjorten var strøget, kaffen var dårlig, og alting var nyt.',
      icon: 'briefcase',
    },
    {
      id: 'him-08-marathon',
      track: 'him',
      year: 2018,
      dateLabel: 'Maj 2018',
      title: '[PLACEHOLDER] De sidste 42 kilometer',
      text: '[PLACEHOLDER] Regn fra kilometer tre, krampe fra kilometer fyrre — og en medalje, der vejede det hele op.',
      icon: 'sparkle',
    },

    // ─────────────────────────── MØDET ───────────────────────────
    {
      id: 'moedet',
      track: 'shared',
      year: 2020,
      dateLabel: 'Sankthans 2020',
      title: '[PLACEHOLDER] Trådene mødes',
      text: '[PLACEHOLDER] Ved et bål en midsommeraften krydser to tråde hinanden — og slipper aldrig igen.',
      longText:
        '[PLACEHOLDER] Her kan historien om selve mødet foldes ud: hvem der sagde hvad, hvem der ikke turde, og hvordan det hele alligevel begyndte.',
      icon: 'sparkle',
    },

    // ─────────────────────────── FÆLLES TRÅD ───────────────────────────
    {
      id: 'shared-01-foerste-rejse',
      track: 'shared',
      year: 2021,
      dateLabel: 'Sommer 2021',
      title: '[PLACEHOLDER] Første rejse sammen',
      text: '[PLACEHOLDER] Ét kort over byen, to holdninger til at følge det.',
      icon: 'plane',
    },
    {
      id: 'shared-02-faelles-adresse',
      track: 'shared',
      year: 2022,
      dateLabel: 'April 2022',
      title: '[PLACEHOLDER] Fælles adresse',
      text: '[PLACEHOLDER] Flyttekasser, kompromisser om reoler og det første "hjemme hos os".',
      icon: 'house',
    },
    {
      id: 'shared-03-hvalpen-viggo',
      track: 'shared',
      year: 2023,
      dateLabel: '2023',
      title: '[PLACEHOLDER] Viggo på fire poter',
      text: '[PLACEHOLDER] Han tyggede en sofa og stjal to hjerter.',
      icon: 'paw',
    },
    {
      id: 'shared-04-frieriet',
      track: 'shared',
      year: 2024,
      dateLabel: 'Nytår 2024',
      title: '[PLACEHOLDER] Et spørgsmål under fyrværkeriet',
      text: '[PLACEHOLDER] Midt mellem raketterne blev der helt stille — og svaret var ja.',
      longText:
        '[PLACEHOLDER] Her er plads til hele frieriets historie — planen, nerverne og øjeblikket, som kun de to kender helt.',
      icon: 'heart',
    },
    {
      // The child (see childId below): from this milestone a third, smaller
      // thread joins the weave and runs between the two down to the heart.
      id: 'shared-05-barnet',
      track: 'shared',
      year: 2025,
      dateLabel: '[PLACEHOLDER] Først i 2025',
      title: '[PLACEHOLDER] Verdens mindste tråd',
      text: '[PLACEHOLDER] I begyndelsen af 2025 væves en helt ny, lille tråd ind mellem deres to.',
      longText:
        '[PLACEHOLDER] Her er plads til historien om det lille menneske — navnet, natten, de første dage og alt det, der ikke kan siges kort.',
      icon: 'sprout',
    },
    {
      id: 'shared-06-forberedelserne',
      track: 'shared',
      year: 2025,
      dateLabel: '2025',
      title: '[PLACEHOLDER] Alting bliver til »vi«',
      text: '[PLACEHOLDER] Prøvesmagninger, gæstelister og en fælles kalender, der aldrig har været så fuld — eller så glad.',
      icon: 'sun',
    },

    // ─────────────────────────── KNUDEN ───────────────────────────
    {
      id: 'brylluppet',
      track: 'shared',
      year: 2026,
      dateLabel: '15. august 2026',
      title: '[PLACEHOLDER] Brylluppet',
      text: '[PLACEHOLDER] I dag bindes knuden — foran alle jer, der er en del af vævningen.',
      icon: 'rings',
    },
  ],

  // Moments the threads almost touched (0–3). Empty array is fine.
  nearMisses: [
    { year: 2013, label: '[PLACEHOLDER] Samme festival — mødtes aldrig' },
    { year: 2016, label: '[PLACEHOLDER] Samme café, en time imellem' },
  ],

  meetingId: 'moedet',
  weddingId: 'brylluppet',
  childId: 'shared-05-barnet',
};
