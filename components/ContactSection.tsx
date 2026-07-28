import { contact } from '@/content';
import styles from './ContactSection.module.css';

export default function ContactSection() {
  return (
    <section className={styles.contact} id="contact">
      <span className="mono eyebrow">{contact.eyebrow}</span>
      <h2 className="display">Let&apos;s talk.</h2>
      <a
        href={`mailto:${contact.email}`}
        className={`${styles.cta} placeholder`}
        style={{ borderStyle: 'dashed' }}
      >
        {contact.email}
      </a>
    </section>
  );
}
