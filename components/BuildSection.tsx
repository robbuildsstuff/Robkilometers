import { build } from '@/content';
import styles from './BuildSection.module.css';

export default function BuildSection() {
  return (
    <section className="block" id="build">
      <div className="wrap" style={{ padding: 0 }}>
        <div className="blockHead">
          <div>
            <span className="mono num">03 / Build</span>
            <h2 className="display">Build</h2>
          </div>
        </div>

        <div className={styles.circuit}>
          {build.projects.map((project) => (
            <div key={project.name} className={styles.circuitCard}>
              <div className={`display ${styles.circuitTitle}`}>{project.name}</div>
              {project.description ? (
                <p>{project.description}</p>
              ) : (
                <p className="placeholder">{project.placeholder}</p>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
