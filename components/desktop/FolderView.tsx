'use client';

import { useState } from 'react';
import type { Item } from '@/content';
import IconButton from './IconButton';
import { MenuBar, typeIcon } from './viewers';

type Props = {
  trail: string[]; // folder names from the desktop down, e.g. ['Food', 'City Guides']
  link: string; // deep link, e.g. 'food.city-guides'
  blurb?: string;
  items: Item[];
  onOpenItem: (it: Item) => void;
};

export default function FolderView({ trail, link, blurb, items, onOpenItem }: Props) {
  const [selected, setSelected] = useState<string | null>(null);
  return (
    <>
      <MenuBar items={['File', 'Edit', 'View', 'Help']} />
      <div className="addr">
        <span>Address</span>
        <div className="sunken">C:\Rob\{trail.join('\\')}</div>
      </div>
      <div className="sunken scroll">
        {blurb && <div className="blurb">{blurb}</div>}
        <div className="fgrid">
          {items.map((it) => (
            <IconButton
              key={it.id}
              className="ficon"
              icon={it.icon ?? typeIcon[it.type]}
              label={it.title}
              selected={selected === it.id}
              onSelect={() => setSelected(it.id)}
              onOpen={() => onOpenItem(it)}
            />
          ))}
        </div>
      </div>
      <div className="status">
        <span>{items.length} object(s)</span>
        <span>robkilometers.ca/#{link}</span>
      </div>
    </>
  );
}
