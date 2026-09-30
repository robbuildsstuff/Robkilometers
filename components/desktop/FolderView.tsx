'use client';

import { useState } from 'react';
import type { Folder, Item } from '@/content';
import IconButton from './IconButton';
import { MenuBar, typeIcon } from './viewers';

export default function FolderView({ folder, onOpenItem }: { folder: Folder; onOpenItem: (it: Item) => void }) {
  const [selected, setSelected] = useState<string | null>(null);
  return (
    <>
      <MenuBar items={['File', 'Edit', 'View', 'Help']} />
      <div className="addr">
        <span>Address</span>
        <div className="sunken">C:\Rob\{folder.name}</div>
      </div>
      <div className="sunken scroll">
        {folder.blurb && <div className="blurb">{folder.blurb}</div>}
        <div className="fgrid">
          {folder.items.map((it) => (
            <IconButton
              key={it.id}
              className="ficon"
              icon={typeIcon[it.type]}
              label={it.title}
              selected={selected === it.id}
              onSelect={() => setSelected(it.id)}
              onOpen={() => onOpenItem(it)}
            />
          ))}
        </div>
      </div>
      <div className="status">
        <span>{folder.items.length} object(s)</span>
        <span>robkilometers.ca/#{folder.id}</span>
      </div>
    </>
  );
}
