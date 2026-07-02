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
 *  2. Milestones: keep the number of 'her' and 'him' milestones EQUAL
 *     (the build refuses to run otherwise). Order within a track must be
 *     chronological (non-decreasing years). `year` drives vertical ordering
 *     on the tapestry; `dateLabel` is free display text ('Forår 1994' is
 *     fine — no parsing happens).
 *
 *  3. Photos: for each milestone, drop 5–10 images into
 *     `public/images/<milestone-id>/` and list them in `gallery` below.
 *     Export discipline (the code never resizes — it trusts you):
 *       • 1600px long edge
 *       • ~72% JPEG quality  (≈ 250–400 KB per image)
 *     Captions are optional; when present they double as alt text.
 *
 *  4. `id` must be kebab-case (a-z, 0-9, hyphens), unique, and STABLE:
 *     it names the image folder and the deep link (#milestone-id).
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

export type Track = 'her' | 'him' | 'shared';

export interface GalleryImage {
  src: string; // e.g. '/images/her-01-foedsel/01.jpg'
  caption?: string; // shown under the image; doubles as alt text
}

export interface Milestone {
  id: string; // kebab-case, stable — image folder + deep link
  track: Track;
  year: number; // drives vertical ordering
  dateLabel: string; // display string, free text
  title: string; // short, e.g. 'Ida kommer til verden'
  text: string; // 1–3 sentences shown in the card
  longText?: string; // optional extra paragraph inside the gallery modal
  icon: IconName;
  gallery: GalleryImage[]; // 5–10 images
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
}

/** Helper: placeholder gallery of n images for milestone `id`. */
const gallery = (id: string, n: number): GalleryImage[] =>
  Array.from({ length: n }, (_, i) => ({
    src: `/images/${id}/${String(i + 1).padStart(2, '0')}.svg`,
    caption: `[PLACEHOLDER] Billedtekst ${i + 1}`,
  }));

export const content: SiteContent = {
  her: { name: 'Ida', birthYear: 1994 },
  him: { name: 'Jonas', birthYear: 1992 },
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
      title: '[PLACEHOLDER] Ida kommer til verden',
      text: '[PLACEHOLDER] En forårsmorgen begynder en rosenrød tråd sin vej gennem vævningen.',
      icon: 'flower',
      gallery: gallery('her-01-foedsel', 5),
    },
    {
      id: 'her-02-skolestart',
      track: 'her',
      year: 2000,
      dateLabel: 'August 2000',
      title: '[PLACEHOLDER] Første skoledag',
      text: '[PLACEHOLDER] Med ny skoletaske og sommerfugle i maven — det første af mange kapitler.',
      icon: 'book',
      gallery: gallery('her-02-skolestart', 6),
    },
    {
      id: 'her-03-hunden-bella',
      track: 'her',
      year: 2003,
      dateLabel: 'Sommer 2003',
      title: '[PLACEHOLDER] Bella flytter ind',
      text: '[PLACEHOLDER] Fire poter, én våd snude og et venskab for livet.',
      icon: 'paw',
      gallery: gallery('her-03-hunden-bella', 5),
    },
    {
      id: 'her-04-koret',
      track: 'her',
      year: 2008,
      dateLabel: '2008',
      title: '[PLACEHOLDER] Stemmen finder koret',
      text: '[PLACEHOLDER] Onsdage bliver ugens bedste dag, og musikken flytter ind for altid.',
      icon: 'music-note',
      gallery: gallery('her-04-koret', 6),
    },
    {
      id: 'her-05-studenterhue',
      track: 'her',
      year: 2012,
      dateLabel: 'Juni 2012',
      title: '[PLACEHOLDER] Studenterhuen',
      text: '[PLACEHOLDER] Hvid hue, hæse hurraråb og en sommer uden ende.',
      icon: 'graduation-cap',
      gallery: gallery('her-05-studenterhue', 6),
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
      gallery: gallery('her-06-jorden-rundt', 8),
    },
    {
      id: 'her-07-foerste-job',
      track: 'her',
      year: 2017,
      dateLabel: 'Januar 2017',
      title: '[PLACEHOLDER] Første rigtige job',
      text: '[PLACEHOLDER] Nye kollegaer, egen kaffekop og følelsen af at være landet.',
      icon: 'briefcase',
      gallery: gallery('her-07-foerste-job', 5),
    },
    {
      id: 'her-08-egen-lejlighed',
      track: 'her',
      year: 2019,
      dateLabel: 'Marts 2019',
      title: '[PLACEHOLDER] Egne nøgler',
      text: '[PLACEHOLDER] To værelser, skæve gulve og en udsigt hun aldrig blev træt af.',
      icon: 'house',
      gallery: gallery('her-08-egen-lejlighed', 6),
    },

    // ─────────────────────────── HANS TRÅD ───────────────────────────
    {
      id: 'him-01-foedsel',
      track: 'him',
      year: 1992,
      dateLabel: 'Vinter 1992',
      title: '[PLACEHOLDER] Jonas kommer til verden',
      text: '[PLACEHOLDER] En vinternat begynder en indigoblå tråd sin vej gennem vævningen.',
      icon: 'star',
      gallery: gallery('him-01-foedsel', 5),
    },
    {
      id: 'him-02-foerste-fodboldkamp',
      track: 'him',
      year: 1999,
      dateLabel: '1999',
      title: '[PLACEHOLDER] Første fodboldkamp',
      text: '[PLACEHOLDER] For store benskinner, græsplet på knæet og et mål han stadig taler om.',
      icon: 'football',
      gallery: gallery('him-02-foerste-fodboldkamp', 6),
    },
    {
      id: 'him-03-spejderlejr',
      track: 'him',
      year: 2004,
      dateLabel: 'Sommer 2004',
      title: '[PLACEHOLDER] Sommerlejr i fjeldet',
      text: '[PLACEHOLDER] Første gang under åben himmel — og begyndelsen på kærligheden til bjergene.',
      icon: 'mountain',
      gallery: gallery('him-03-spejderlejr', 6),
    },
    {
      id: 'him-04-studenterhue',
      track: 'him',
      year: 2010,
      dateLabel: 'Juni 2010',
      title: '[PLACEHOLDER] Studenterhuen',
      text: '[PLACEHOLDER] Hornmusik i carporten og en hue, der hurtigt fik mærker af det hele.',
      icon: 'graduation-cap',
      gallery: gallery('him-04-studenterhue', 5),
    },
    {
      id: 'him-05-sejlerskolen',
      track: 'him',
      year: 2013,
      dateLabel: '2013',
      title: '[PLACEHOLDER] Til søs',
      text: '[PLACEHOLDER] Salt i håret og ro i maven — sejlerskolen blev et andet hjem.',
      icon: 'anchor',
      gallery: gallery('him-05-sejlerskolen', 6),
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
      gallery: gallery('him-06-udlandssemester', 7),
    },
    {
      id: 'him-07-foerste-job',
      track: 'him',
      year: 2016,
      dateLabel: '2016',
      title: '[PLACEHOLDER] Første rigtige job',
      text: '[PLACEHOLDER] Skjorten var strøget, kaffen var dårlig, og alting var nyt.',
      icon: 'briefcase',
      gallery: gallery('him-07-foerste-job', 5),
    },
    {
      id: 'him-08-marathon',
      track: 'him',
      year: 2018,
      dateLabel: 'Maj 2018',
      title: '[PLACEHOLDER] De sidste 42 kilometer',
      text: '[PLACEHOLDER] Regn fra kilometer tre, krampe fra kilometer fyrre — og en medalje, der vejede det hele op.',
      icon: 'sparkle',
      gallery: gallery('him-08-marathon', 6),
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
      gallery: gallery('moedet', 7),
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
      gallery: gallery('shared-01-foerste-rejse', 6),
    },
    {
      id: 'shared-02-faelles-adresse',
      track: 'shared',
      year: 2022,
      dateLabel: 'April 2022',
      title: '[PLACEHOLDER] Fælles adresse',
      text: '[PLACEHOLDER] Flyttekasser, kompromisser om reoler og det første "hjemme hos os".',
      icon: 'house',
      gallery: gallery('shared-02-faelles-adresse', 6),
    },
    {
      id: 'shared-03-hvalpen-viggo',
      track: 'shared',
      year: 2023,
      dateLabel: '2023',
      title: '[PLACEHOLDER] Viggo på fire poter',
      text: '[PLACEHOLDER] Han tyggede en sofa og stjal to hjerter.',
      icon: 'paw',
      gallery: gallery('shared-03-hvalpen-viggo', 6),
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
      gallery: gallery('shared-04-frieriet', 7),
    },
    {
      id: 'shared-05-forberedelserne',
      track: 'shared',
      year: 2025,
      dateLabel: '2025',
      title: '[PLACEHOLDER] Alting bliver til »vi«',
      text: '[PLACEHOLDER] Prøvesmagninger, gæstelister og en fælles kalender, der aldrig har været så fuld — eller så glad.',
      icon: 'sun',
      gallery: gallery('shared-05-forberedelserne', 6),
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
      gallery: gallery('brylluppet', 8),
    },
  ],

  // Moments the threads almost touched (0–3). Empty array is fine.
  nearMisses: [
    { year: 2013, label: '[PLACEHOLDER] Samme festival — mødtes aldrig' },
    { year: 2016, label: '[PLACEHOLDER] Samme café, en time imellem' },
  ],

  meetingId: 'moedet',
  weddingId: 'brylluppet',
};
