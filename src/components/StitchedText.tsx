/**
 * Stitched display lettering (§4): solid ink fill with a fine dashed gilt
 * overlay stroke — embroidery, not calligraphy. Real text stays in the DOM
 * for screen readers; the SVG pair is decorative.
 */

interface StitchedTextProps {
  her: string;
  him: string;
  as?: 'h1' | 'h2';
  className?: string;
}

export function StitchedNames({ her, him, as = 'h1', className }: StitchedTextProps) {
  const Tag = as;
  const line = (cls: string) => (
    <text className={cls} x="50%" y="54%">
      {her}
      <tspan className="stitched-amp"> &amp; </tspan>
      {him}
    </text>
  );
  return (
    <Tag className={`stitched-names ${className ?? ''}`}>
      <span className="visually-hidden">
        {her} &amp; {him}
      </span>
      <svg aria-hidden="true" focusable="false">
        {line('stitched-fill')}
        {line('stitched-over')}
      </svg>
    </Tag>
  );
}
