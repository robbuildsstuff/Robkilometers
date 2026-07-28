import { work } from '@/content';
import styles from './WorkSection.module.css';

export default function WorkSection() {
  return (
    <section className="block" id="work">
      <div className="wrap" style={{ padding: 0 }}>
        <div className="blockHead">
          <div>
            <span className="mono num">01 / Work</span>
            <h2 className="display">Work</h2>
          </div>
          <span className="mono status">{work.status}</span>
        </div>

        <div className={styles.metaGrid}>
          {work.metaGrid.map((cell) => (
            <div key={cell.label} className={styles.metaCell}>
              <span className={`mono ${styles.metaLabel}`}>{cell.label}</span>
              <p>{cell.body}</p>
            </div>
          ))}
        </div>

        <div className={styles.roleList}>
          {work.roles.map((role) => (
            <div key={role.company} className={styles.role}>
              <div className={`mono ${styles.when}`}>
                {role.when}
                <span className={styles.co}>{role.company}</span>
              </div>
              <div>
                <span className={`mono ${styles.roleTitle}`}>{role.title}</span>
                {role.description ? <p>{role.description}</p> : <p className="placeholder">{role.placeholder}</p>}
              </div>
            </div>
          ))}
        </div>

        <p className={`placeholder ${styles.whatsNext}`}>{work.whatsNextPlaceholder}</p>
      </div>
    </section>
  );
}
