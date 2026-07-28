import { life } from '@/content';
import styles from './LifeSection.module.css';

export default function LifeSection() {
  return (
    <section className="block" id="life">
      <div className="wrap" style={{ padding: 0 }}>
        <div className="blockHead">
          <div>
            <span className="mono num">04 / Life</span>
            <h2 className="display">Life</h2>
          </div>
        </div>
        <div className={styles.stub}>
          {life.cards.map((card) => (
            <div key={card.label} className={styles.stubCard}>
              <span className={`mono ${styles.stubLabel}`}>{card.label}</span>
              <p className="placeholder">{card.placeholder}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
