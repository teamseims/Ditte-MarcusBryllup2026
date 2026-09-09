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
  // [PLACEHOLDER] Marcus' fødselsår er gættet — ret det når du ved det.
  him: { name: 'Marcus', birthYear: 1992 },
  weddingDate: '12. september 2026',
  weddingYear: 2026,
  heroLine: '[PLACEHOLDER] To tråde, vævet af hver sin begyndelse.',

  milestones: [
    // ═══════════════════════ DITTES TRÅD ═══════════════════════
    // Fra Simons tabel. Datoer mærket [PLACEHOLDER] er gættet ud fra
    // rækkefølgen og skal rettes.
    {
      id: 'ditte-01-foedsel',
      track: 'her',
      year: 1994,
      dateLabel: '14. marts 1994',
      title: 'Ditte kommer til verden',
      text: 'Den 14. marts 1994 begynder den rosenrøde tråd sin vej gennem vævningen.',
      icon: 'flower',
    },
    {
      id: 'ditte-02-vuggestue',
      track: 'her',
      year: 1995,
      dateLabel: '[PLACEHOLDER] ca. 1995',
      title: 'Ditte starter i vuggestue',
      text: 'De første morgener uden mor og far — og de første venner, hvis navne ingen længere husker.',
      icon: 'sparkle',
    },
    {
      id: 'ditte-03-barnets-hus',
      track: 'her',
      year: 1997,
      dateLabel: '[PLACEHOLDER] ca. 1997',
      title: 'Ditte starter i Barnets Hus i Rødovre',
      text: 'Børnehaveår i Rødovre, hvor dagene var lange og legepladsen var hele verden.',
      icon: 'sun',
    },
    {
      id: 'ditte-04-kongens-lyngby',
      track: 'her',
      year: 2000,
      dateLabel: '[PLACEHOLDER] ca. 2000',
      title: 'Ditte flytter til Kongens Lyngby',
      text: 'Familien pakker sammen og flytter nordpå. Nyt kvarter, nye veje at lære udenad.',
      icon: 'house',
    },
    {
      id: 'ditte-05-trongaardsskolen',
      track: 'her',
      year: 2001,
      dateLabel: '2001',
      title: 'Ditte starter på Trongårdsskolen',
      text: 'Skoletasken er større end hende selv, og skoledagen begynder.',
      icon: 'book',
    },
    {
      id: 'ditte-06-bagsvaerd-kostskole',
      track: 'her',
      year: 2008,
      dateLabel: '2008',
      title: 'Ditte skifter til Bagsværd Kostskole',
      text: 'Nyt skoleskift — og en hverdag med kammerater døgnet rundt.',
      icon: 'anchor',
    },
    {
      id: 'ditte-07-folkeskolen',
      track: 'her',
      year: 2010,
      dateLabel: '[PLACEHOLDER] 2010',
      title: 'Ditte færdiggør folkeskolen',
      text: 'Sidste skoledag i folkeskolen. Mange års kapitler lukkes på én eftermiddag.',
      icon: 'star',
    },
    {
      id: 'ditte-08-leo-pharma',
      track: 'her',
      year: 2010,
      dateLabel: '[PLACEHOLDER] 2010',
      title: 'Ditte får job hos Leo Pharma',
      text: 'Første rigtige lønseddel, første kollegaer, første fornemmelse af arbejdsliv.',
      icon: 'briefcase',
    },
    {
      id: 'ditte-09-asien',
      track: 'her',
      year: 2011,
      dateLabel: '[PLACEHOLDER] 2011',
      title: 'Ditte tager på sabbatårstur rundt i Asien med Alberte',
      text: 'Rygsæk, nattog og en veninde ved siden af: Asien rundt sammen med Alberte.',
      longText:
        '[PLACEHOLDER] Her er plads til den længere fortælling om rejsen — landene, menneskene og alt det, der ikke kan være i to linjer.',
      icon: 'plane',
    },
    {
      id: 'ditte-10-naerum-gymnasium',
      track: 'her',
      year: 2011,
      dateLabel: '2011',
      title: 'Ditte starter på Nærum Gymnasium',
      text: 'Gymnasiet begynder — nye fag, nye mennesker, nye planer.',
      icon: 'mountain',
    },
    {
      id: 'ditte-11-student',
      track: 'her',
      year: 2014,
      dateLabel: '2014',
      title: 'Ditte bliver student',
      text: 'Hvid hue, hæse hurraråb og en sommer uden ende.',
      icon: 'graduation-cap',
    },
    {
      id: 'ditte-12-hjemmefra',
      track: 'her',
      year: 2014,
      dateLabel: '[PLACEHOLDER] 2014',
      title: 'Ditte flytter hjemmefra',
      text: 'Egne nøgler, egen adresse og et køkken hun selv skulle fylde op.',
      icon: 'house',
    },
    {
      id: 'ditte-13-paedagogik',
      track: 'her',
      year: 2015,
      dateLabel: '2015',
      title: 'Ditte starter på pædagogikstudiet',
      text: 'Studiet begynder, og retningen falder på plads.',
      icon: 'book',
    },

    // ═══════════════════════ MARCUS TRÅD ═══════════════════════
    // ALT HERUNDER ER PLACEHOLDER. Strukturen spejler Dittes liv, så den
    // er nem at udfylde: ret titel, tekst, dato og år — eller slet de
    // linjer der ikke passer. Trådene må højst være 2 milepæle fra
    // hinanden, så hvis Marcus ender med færre, så slet nogle af Dittes
    // mindre vigtige (eller behold antallet ved at slå nogle sammen).
    {
      id: 'marcus-01-foedsel',
      track: 'him',
      year: 1992,
      dateLabel: '[PLACEHOLDER] 1992',
      title: '[PLACEHOLDER] Marcus kommer til verden',
      text: '[PLACEHOLDER] Skriv et par linjer om dagen den indigoblå tråd begyndte.',
      icon: 'star',
    },
    {
      id: 'marcus-02-vuggestue',
      track: 'him',
      year: 1993,
      dateLabel: '[PLACEHOLDER] ca. 1993',
      title: '[PLACEHOLDER] Marcus starter i vuggestue',
      text: '[PLACEHOLDER] Skriv et par linjer her.',
      icon: 'sparkle',
    },
    {
      id: 'marcus-03-boernehave',
      track: 'him',
      year: 1995,
      dateLabel: '[PLACEHOLDER] ca. 1995',
      title: '[PLACEHOLDER] Marcus starter i børnehave',
      text: '[PLACEHOLDER] Skriv et par linjer her.',
      icon: 'sun',
    },
    {
      id: 'marcus-04-flytter',
      track: 'him',
      year: 1998,
      dateLabel: '[PLACEHOLDER] ca. 1998',
      title: '[PLACEHOLDER] Marcus flytter til …',
      text: '[PLACEHOLDER] Skriv et par linjer her.',
      icon: 'house',
    },
    {
      id: 'marcus-05-skolestart',
      track: 'him',
      year: 1999,
      dateLabel: '[PLACEHOLDER] ca. 1999',
      title: '[PLACEHOLDER] Marcus starter i skole',
      text: '[PLACEHOLDER] Skriv et par linjer her.',
      icon: 'book',
    },
    {
      id: 'marcus-06-skoleskift',
      track: 'him',
      year: 2006,
      dateLabel: '[PLACEHOLDER] ca. 2006',
      title: '[PLACEHOLDER] Marcus skifter skole',
      text: '[PLACEHOLDER] Skriv et par linjer her.',
      icon: 'anchor',
    },
    {
      id: 'marcus-07-folkeskolen',
      track: 'him',
      year: 2008,
      dateLabel: '[PLACEHOLDER] ca. 2008',
      title: '[PLACEHOLDER] Marcus færdiggør folkeskolen',
      text: '[PLACEHOLDER] Skriv et par linjer her.',
      icon: 'star',
    },
    {
      id: 'marcus-08-foerste-job',
      track: 'him',
      year: 2009,
      dateLabel: '[PLACEHOLDER] ca. 2009',
      title: '[PLACEHOLDER] Marcus får sit første job',
      text: '[PLACEHOLDER] Skriv et par linjer her.',
      icon: 'briefcase',
    },
    {
      id: 'marcus-09-rejse',
      track: 'him',
      year: 2009,
      dateLabel: '[PLACEHOLDER] ca. 2009',
      title: '[PLACEHOLDER] Marcus rejser ud',
      text: '[PLACEHOLDER] Skriv et par linjer her.',
      icon: 'plane',
    },
    {
      id: 'marcus-10-gymnasium',
      track: 'him',
      year: 2009,
      dateLabel: '[PLACEHOLDER] ca. 2009',
      title: '[PLACEHOLDER] Marcus starter på gymnasiet',
      text: '[PLACEHOLDER] Skriv et par linjer her.',
      icon: 'mountain',
    },
    {
      id: 'marcus-11-student',
      track: 'him',
      year: 2012,
      dateLabel: '[PLACEHOLDER] ca. 2012',
      title: '[PLACEHOLDER] Marcus bliver student',
      text: '[PLACEHOLDER] Skriv et par linjer her.',
      icon: 'graduation-cap',
    },
    {
      id: 'marcus-12-hjemmefra',
      track: 'him',
      year: 2012,
      dateLabel: '[PLACEHOLDER] ca. 2012',
      title: '[PLACEHOLDER] Marcus flytter hjemmefra',
      text: '[PLACEHOLDER] Skriv et par linjer her.',
      icon: 'house',
    },
    {
      id: 'marcus-13-studiet',
      track: 'him',
      year: 2013,
      dateLabel: '[PLACEHOLDER] ca. 2013',
      title: '[PLACEHOLDER] Marcus starter på studiet',
      text: '[PLACEHOLDER] Skriv et par linjer her.',
      icon: 'book',
    },

    // ═══════════════════════ MØDET ═══════════════════════
    {
      id: 'moedet-frederiksberg',
      track: 'shared',
      // Skal ligge EFTER Roskilde 2019 (se nearMisses nederst) — de var
      // begge der og mødtes ikke. Ret til det rigtige år.
      year: 2020,
      dateLabel: '[PLACEHOLDER] ca. 2020',
      title: 'En gåtur i Frederiksberg Have',
      text: 'En gåtur gennem haven — og to tråde, der ikke slap hinanden igen.',
      longText:
        '[PLACEHOLDER] Her kan historien om selve mødet foldes ud: hvem der spurgte, hvem der tøvede, og hvordan turen endte med at blive begyndelsen.',
      icon: 'sparkle',
    },

    // ═══════════════════════ BEGGE ═══════════════════════
    {
      id: 'faerdiguddannede',
      track: 'shared',
      year: 2021,
      dateLabel: '22. januar & 22. juni 2021',
      title: 'Begge bliver færdiguddannede',
      text: 'Et halvt år fra hinanden bliver de begge færdige — den 22. januar og den 22. juni.',
      icon: 'graduation-cap',
    },
    {
      id: 'singapore',
      track: 'shared',
      year: 2022,
      dateLabel: 'Maj 2022 – januar 2023',
      title: 'Udstationering i Singapore',
      text: 'Et helt liv pakket ned og sat op igen på den anden side af jorden.',
      longText:
        '[PLACEHOLDER] Her er plads til den længere fortælling om månederne i Singapore — hverdagen, varmen og alt det, de tog med hjem.',
      icon: 'plane',
    },
    {
      id: 'blaue-blume',
      track: 'shared',
      year: 2023,
      dateLabel: 'Onsdag den 1. marts 2023',
      title: 'Første Blaue Blume-koncert',
      text: 'En onsdag aften i marts, og den første af flere koncerter sammen.',
      icon: 'music-note',
    },
    {
      id: 'babymoon',
      track: 'shared',
      year: 2024,
      dateLabel: '[PLACEHOLDER] 2024',
      title: '[PLACEHOLDER] Babymoon i …',
      text: '[PLACEHOLDER] Den sidste rejse som to. Skriv hvor I var.',
      icon: 'sun',
    },
    {
      // Carls tråd: herfra løber en tredje, mindre tråd mellem de to
      // (se childId nederst).
      id: 'carl-foedes',
      track: 'shared',
      year: 2025,
      dateLabel: '2025',
      title: 'Carl bliver født',
      text: 'Carl kommer til verden, og en helt ny, lille tråd væves ind mellem deres to.',
      longText:
        '[PLACEHOLDER] Her er plads til historien om Carl — dagen, natten, navnet og de første uger.',
      icon: 'sprout',
    },
    {
      id: 'frieriet-frankrig',
      track: 'shared',
      year: 2025,
      dateLabel: '[PLACEHOLDER] 2025',
      title: 'Marcus frier til Ditte i Frankrig',
      text: 'Et spørgsmål stillet i Frankrig — og et svar, der gjorde resten til planlægning.',
      longText:
        '[PLACEHOLDER] Her er plads til hele frieriets historie — stedet, planen, nerverne og øjeblikket.',
      icon: 'heart',
    },
    {
      id: 'brylluppet',
      track: 'shared',
      year: 2026,
      dateLabel: 'Lørdag den 12. september 2026',
      title: 'Marcus og Ditte bliver gift',
      text: 'I dag bindes hjertet — foran alle jer, der er en del af vævningen.',
      longText:
        '[PLACEHOLDER] En sidste hilsen til gæsterne kan stå her.',
      icon: 'rings',
    },
  ],

  // Øjeblikke hvor trådene var tæt på hinanden uden at mødes (0–3).
  // Begge år skal ligge før mødet — det er hele pointen.
  nearMisses: [
    { year: 2012, label: 'Roskilde Festival — samme plads, mødtes aldrig' },
    { year: 2019, label: 'Roskilde igen — og stadig ikke hinanden' },
  ],

  meetingId: 'moedet-frederiksberg',
  weddingId: 'brylluppet',
  childId: 'carl-foedes',
};
