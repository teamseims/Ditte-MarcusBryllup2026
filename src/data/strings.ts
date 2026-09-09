/**
 * Guest-facing UI strings (§3) — Danish by default. No language switcher;
 * to serve English instead, change the last line to `export const strings = en;`.
 */

export interface UiStrings {
  scrollCue: string;
  close: string;
  /** affordance on a milestone that has a fuller telling */
  readMore: string;
  storyLabel: (title: string) => string;
  closingLine: string;
  qrHeading: string;
  qrScanCue: string;
  placeholderRibbon: string;
  progressLabel: string;
}

const da: UiStrings = {
  scrollCue: 'Rul for at begynde',
  close: 'Luk',
  readMore: 'Læs mere',
  storyLabel: (title) => `Fortælling: ${title}`,
  closingLine: '[PLACEHOLDER] …og her begynder resten.',
  qrHeading: 'Følg trådene',
  qrScanCue: 'Scan for at følge trådene',
  placeholderRibbon: 'PLACEHOLDER-INDHOLD',
  progressLabel: 'Hvor langt du er i fortællingen',
};

// English stub — kept beside the Danish so switching is a one-line change.
const en: UiStrings = {
  scrollCue: 'Scroll to begin',
  close: 'Close',
  readMore: 'Read more',
  storyLabel: (title) => `Story: ${title}`,
  closingLine: '[PLACEHOLDER] …and here begins the rest.',
  qrHeading: 'Follow the threads',
  qrScanCue: 'Scan to follow the threads',
  placeholderRibbon: 'PLACEHOLDER CONTENT',
  progressLabel: 'How far you are in the story',
};
void en; // referenced so TS keeps it honest; swap the export to use it

export const strings: UiStrings = da;
