import { useMemo } from 'react';
import type { SiteContent } from '../data/content';
import { strings } from '../data/strings';
import type { TapestryGeometry } from '../lib/geometry';
import { hashString } from '../lib/geometry/random';
import { MilestoneMarker } from './MilestoneMarker';
import { Sprig } from './Sprig';

/**
 * Positions markers, cards and near-miss labels on the tapestry body (§7–8).
 *
 * Cards: HER cards sit left of her thread, HIS right of his; shared cards
 * alternate sides of the braid. On mobile every card becomes a full-width
 * block below its marker. The wedding milestone gets no side card — the
 * medallion itself is the button and the finale carries the words (see
 * DECISIONS.md); a small "Se billeder" chip sits beneath it instead.
 */

export type CardSide = 'left' | 'right' | 'below';

interface MilestoneLayerProps {
  geometry: TapestryGeometry;
  content: SiteContent;
  /** ids of milestones whose needle has passed (Phase 4 drives this) */
  inkedIds: ReadonlySet<string>;
  /** marker to pulse after a deep-link arrival (§8) */
  pulseId?: string | null;
  onOpen: (id: string) => void;
  markerRef?: (id: string, el: HTMLButtonElement | null) => void;
}

const CARD_WIDTH = 300;
const CARD_GAP = 52;

export function MilestoneLayer({
  geometry,
  content,
  inkedIds,
  pulseId,
  onOpen,
  markerRef,
}: MilestoneLayerProps) {
  const mobile = geometry.cfg.widthPx < 720;

  const items = useMemo(() => {
    const byId = new Map(content.milestones.map((m) => [m.id, m]));
    let sharedFlip = false;
    return geometry.anchors.map((anchor) => {
      const milestone = byId.get(anchor.id)!;
      let side: CardSide;
      if (mobile) side = 'below';
      else if (anchor.isWedding) side = 'below';
      else if (anchor.track === 'her') side = 'left';
      else if (anchor.track === 'him') side = 'right';
      else {
        side = sharedFlip ? 'right' : 'left';
        sharedFlip = !sharedFlip;
      }
      return { anchor, milestone, side };
    });
  }, [geometry, content, mobile]);

  return (
    <div className="milestone-layer">
      {items.map(({ anchor, milestone, side }) => {
        const inked = inkedIds.has(milestone.id);
        return (
          <div key={milestone.id}>
            <MilestoneMarker
              milestone={milestone}
              anchor={anchor}
              inked={inked}
              pulsing={pulseId === milestone.id}
              isChild={milestone.id === content.childId}
              onOpen={onOpen}
              buttonRef={
                markerRef ? (el) => markerRef(milestone.id, el) : undefined
              }
            />
            {anchor.isWedding ? (
              <div
                className={`wedding-cue chip ${inked ? 'is-inked' : 'is-ghost'}`}
                style={{ left: anchor.x, top: anchor.y + 252 }}
              >
                {milestone.gallery.length > 0
                  ? strings.seeImages
                  : strings.readMore}
              </div>
            ) : (
              <MilestoneCard
                milestone={milestone}
                anchor={anchor}
                side={side}
                inked={inked}
                onOpen={onOpen}
                gap={
                  anchor.track === 'shared'
                    ? // clear the braid: widest local amplitude within the
                      // card's height, plus breathing room
                      Math.max(
                        geometry.amplitudeAt(anchor.y),
                        geometry.amplitudeAt(anchor.y + 230),
                      ) + 46
                    : CARD_GAP
                }
              />
            )}
          </div>
        );
      })}

      {/* Near-miss whisper labels (§5.2) — revealed when the needle passes.
          Centered on the bow's own (slightly off-axis) gap, nudged a touch. */}
      {geometry.nearMisses.map((nm, i) => (
        <p
          key={i}
          className={`nearmiss-label ${
            inkedIds.has(`nearmiss-${i}`) ? 'is-inked' : 'is-ghost'
          }`}
          style={{
            left: nm.x + ((hashString(nm.label) % 13) - 6),
            top: nm.y,
          }}
        >
          {nm.label}
        </p>
      ))}

      {/* Sprigs concentrate slightly around the meeting (§5.3) */}
      <Sprig
        kind="flower"
        size={44}
        style={{
          position: 'absolute',
          left: 30,
          top: geometry.layout.yMeet - 130,
          opacity: 0.4,
        }}
      />
      <Sprig
        kind="berry"
        size={44}
        style={{
          position: 'absolute',
          right: 30,
          top: geometry.layout.yMeet + 40,
          opacity: 0.4,
          transform: 'scaleX(-1)',
        }}
      />
    </div>
  );
}

interface CardProps {
  milestone: SiteContent['milestones'][number];
  anchor: TapestryGeometry['anchors'][number];
  side: CardSide;
  inked: boolean;
  onOpen: (id: string) => void;
  /** horizontal distance from anchor to the card's near edge */
  gap: number;
}

function MilestoneCard({
  milestone,
  anchor,
  side,
  inked,
  onOpen,
  gap,
}: CardProps) {
  // seeded vertical stagger so the gilt rules stop aligning like ruled
  // paper (organic pass)
  const cardY = anchor.y - 38 + (hashString(milestone.id) % 25);
  const style: React.CSSProperties =
    side === 'below'
      ? { left: 20, right: 20, top: anchor.y + 46 }
      : side === 'left'
        ? { left: anchor.x - gap - CARD_WIDTH, top: cardY, width: CARD_WIDTH }
        : { left: anchor.x + gap, top: cardY, width: CARD_WIDTH };

  return (
    <div
      className={`card card-${side} card-${anchor.track} ${
        inked ? 'is-inked' : 'is-ghost'
      }`}
      style={style}
      onClick={() => onOpen(milestone.id)}
    >
      <p className="chip card-date">{milestone.dateLabel}</p>
      <h3 className="card-title">{milestone.title}</h3>
      <p className="card-text">{milestone.text}</p>
      {/* Only promise what's actually behind the tap: photos if there are
          any, otherwise the longer story — and nothing at all when the card
          already holds everything (the marker still opens its story card). */}
      {milestone.gallery.length > 0 ? (
        <p className="card-more chip">{strings.seeImages} →</p>
      ) : milestone.longText ? (
        <p className="card-more chip">{strings.readMore} →</p>
      ) : null}
    </div>
  );
}
