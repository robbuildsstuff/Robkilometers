import { eat } from '@/content';

export default function EatSection() {
  return (
    <section className="block" id="eat">
      <div className="wrap" style={{ padding: 0 }}>
        <div className="blockHead">
          <div>
            <span className="mono num">02 / Eat</span>
            <h2 className="display">Eat</h2>
          </div>
        </div>
        <p className="placeholder">{eat.placeholder}</p>
      </div>
    </section>
  );
}
