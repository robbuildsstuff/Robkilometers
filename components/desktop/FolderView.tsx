'use client';

import { Fragment, useState } from 'react';
import type { Banner, Bookshelf as Shelf, Item, TravelCountry, Wardrobe as WardrobeData } from '@/content';
import Bookshelf, { bookCount } from './Bookshelf';
import DistanceCounter from './DistanceCounter';
import RunnerBanner from './RunnerBanner';
import Travel from './Travel';
import Wardrobe from './Wardrobe';
import IconButton from './IconButton';
import { MenuBar, typeIcon } from './viewers';

type Props = {
  trail: string[]; // folder names from the desktop down, e.g. ['Food', 'City Guides']
  link: string; // deep link, e.g. 'food.city-guides'
  blurb?: string;
  banner?: Banner;
  bookshelf?: Shelf;
  wardrobe?: WardrobeData;
  travel?: TravelCountry[];
  onOpenPath?: (path: string[]) => void;
  pick?: string; // a book to have pulled out when the shelf opens
  onPick?: (id: string | null) => void;
  items: Item[];
  onOpenItem: (it: Item) => void;
  onBack?: () => void; // go up to the parent folder; missing at the top level
};

export default function FolderView({ trail, link, blurb, banner, bookshelf, wardrobe, travel, onOpenPath, pick, onPick, items, onOpenItem, onBack }: Props) {
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
      {travel ? (
        <Travel travel={travel} pick={pick} onPick={onPick ?? (() => {})} onOpenPath={onOpenPath ?? (() => {})} />
      ) : (
        <>
      <div className="sunken scroll">
        {banner && <RunnerBanner title={banner.title} lines={banner.lines} />}
        {bookshelf && <Bookshelf shelf={bookshelf} pick={pick} onPick={onPick ?? (() => {})} />}
        {wardrobe && <Wardrobe data={wardrobe} pick={pick} onPick={onPick ?? (() => {})} />}
        {blurb && !bookshelf && !wardrobe && <div className="blurb">{blurb}</div>}
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
        {banner ? (
          <DistanceCounter metresPerSecond={banner.metresPerSecond ?? 3} />
        ) : (
          <span>
            {bookshelf
              ? `${bookCount(bookshelf)} books`
              : wardrobe
                ? `${wardrobe.categories.reduce((n, c) => n + c.items.filter((x) => !x.placeholder).length, 0)} things`
                : `${items.length} object(s)`}
          </span>
        )}
        <span>robkilometers.ca/#{link}</span>
      </div>
        </>
      )}
    </>
  );
}
