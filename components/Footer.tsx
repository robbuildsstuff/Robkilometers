import { footer } from '@/content';
import styles from './Footer.module.css';

export default function Footer() {
  return (
    <div className={`${styles.footerBar} mono`}>
      <div>{footer.copyright}</div>
      <div>{footer.location}</div>
    </div>
  );
}
