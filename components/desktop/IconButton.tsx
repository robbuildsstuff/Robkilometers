'use client';

import type { IconName } from '@/content';
import { Icon } from './icons';

type Props = {
  className: 'dicon' | 'ficon';
  icon: IconName;
  label: string;
  selected: boolean;
  onSelect: () => void;
  onOpen: () => void;
  thumb?: string; // a photo to show instead of the pixel icon
};

// Desktop behaviour: click selects, double-click opens.
// Phones (no hover) open on tap; keyboard Enter/Space opens too (click with detail 0).
export default function IconButton({ className, icon, label, selected, onSelect, onOpen, thumb }: Props) {
  return (
    <button
      type="button"
      className={`${className}${selected ? ' sel' : ''}`}
      onClick={(e) => {
        onSelect();
        if (e.detail === 0 || window.matchMedia('(hover: none)').matches) onOpen();
      }}
      onDoubleClick={onOpen}
    >
      {thumb ? (
        // eslint-disable-next-line @next/next/no-img-element -- tiny local thumbnail
        <img className="thumb" src={thumb} alt="" />
      ) : (
        <Icon name={icon} />
      )}
      <span>{label}</span>
    </button>
  );
}
