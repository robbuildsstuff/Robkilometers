'use client';

import { Fragment, useState } from 'react';
import type { Banner, Item } from '@/content';
import DistanceCounter from './DistanceCounter';
import RunnerBanner from './RunnerBanner';
import IconButton from './IconButton';
import { MenuBar, typeIcon } from './viewers';

type Props = {
  trail: string[]; // folder names from the desktop down, e.g. ['Food', 'City Guides']
  link: string; // deep link, e.g. 'food.city-guides'
  blurb?: string;
  banner?: Banner;
  items: Item[];
  onOpenItem: (it: Item) => void;
  onBack?: () => void; // go up to the parent folder; missing at the top level
};

export default function FolderView({ trail, link, blurb, banner, items, onOpenItem, onBack }: Props) {
  const [selected, setSelected] = useState<string | null>(null);
  return (
    <>
      <MenuBar items={['File', 'Edit', 'View', 'Help']} />
      <div className="addr">
        <button type="button" className="bevel backbtn" onClick={onBack} disabled={!onBack} aria-label="Back to the folder above" title="Back">
          <svg viewBox="0 0 10 10" shapeRendering="crispEdges" aria-hidden="true">
            <path d="M4 1h1v2h5v4H5v2H4V8H3V7H2V6H1V4h1V3h1V2h1z" fill="currentColor" />
          </svg>
          Back
        </button>
        <span>Address</span>
        <div className="sunken">C:\Rob\{trail.join('\\')}</div>
      </div>
      <div className="sunken scroll">
        {banner && <RunnerBanner title={banner.title} lines={banner.lines} />}
        {blurb && <div className="blurb">{blurb}</div>}
        <div className="fgrid" hidden={!items.length}>
          {items.map((it) => (
            <Fragment key={it.id}>
              {it.newRow && <div className="rowbreak" />}
              <IconButton
                className="ficon"
                icon={it.icon ?? typeIcon[it.type]}
                label={it.title}
                selected={selected === it.id}
                onSelect={() => setSelected(it.id)}
                onOpen={() => onOpenItem(it)}
                thumb={it.type === 'image' ? (it.thumb ?? it.src) : undefined}
              />
            </Fragment>
          ))}
        </div>
      </div>
      <div className="status">
        {banner ? <DistanceCounter metresPerSecond={banner.metresPerSecond ?? 3} /> : <span>{items.length} object(s)</span>}
        <span>robkilometers.ca/#{link}</span>
      </div>
    </>
  );
}
