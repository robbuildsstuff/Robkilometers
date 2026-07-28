'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { hero, nav } from '@/content';
import styles from './Header.module.css';

export default function Header() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  return (
    <>
      <div className={styles.topbar}>
        <Link href="/" className={styles.mark}>
          ROBKILOMETERS
        </Link>
        <button
          type="button"
          className={styles.menuButton}
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-label={open ? 'Close menu' : 'Open menu'}
        >
          {open ? 'Close' : 'Menu'}
          <span className={styles.burger}>
            <span />
            <span />
            <span />
          </span>
        </button>
      </div>

      {open && (
        <div className={styles.overlay}>
          <nav className={styles.overlayList}>
            {nav.map((item, i) => (
              <div key={item.href} className={styles.overlayItem}>
                <span className={styles.overlayIndex}>{String(i + 1).padStart(2, '0')}</span>
                <Link href={item.href} className={styles.overlayLink}>
                  {item.label}
                </Link>
              </div>
            ))}
          </nav>

          <div className={styles.overlayFooter}>
            <div>{hero.coords[0]}</div>
            <div>Toronto, ON</div>
          </div>
        </div>
      )}
    </>
  );
}
