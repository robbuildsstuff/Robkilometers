import { nav } from '@/content';
import styles from './Header.module.css';

export default function Header() {
  return (
    <div className={styles.topbar}>
      <div className={styles.mark}>ROBKILOMETERS</div>
      <nav className={styles.nav}>
        {nav.map((item) => (
          <a key={item.href} href={item.href} className={styles.navLink}>
            {item.label}
          </a>
        ))}
      </nav>
    </div>
  );
}
