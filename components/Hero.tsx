import { hero } from '@/content';
import styles from './Hero.module.css';

export default function Hero() {
  return (
    <section className={styles.hero}>
      <div className="wrap" style={{ padding: 0 }}>
        <span className="mono eyebrow">{hero.eyebrow}</span>
        <h1 className={`display ${styles.heading}`}>
          {hero.headlineLines.map((line, i) => (
            <span key={line}>
              {line}
              {i < hero.headlineLines.length - 1 && <br />}
            </span>
          ))}
        </h1>
        <p className={styles.sub}>{hero.sub}</p>
        <div className={styles.tagWrap}>
          <span className="tag mono">{hero.tag}</span>
        </div>
      </div>
      <div className={`mono ${styles.coords}`}>
        {hero.coords.map((line) => (
          <div key={line} className={styles.coordLine}>
            {line}
          </div>
        ))}
      </div>
    </section>
  );
}
