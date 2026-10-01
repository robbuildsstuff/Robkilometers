'use client';

import { useEffect, useState } from 'react';
import { GridIcon } from './icons';
import { MenuBar } from './viewers';
import { deg, describe, getWeather, type Weather } from './weather';
import { weatherArt } from './weatherArt';

const dayName = (date: string, i: number) =>
  i === 0 ? 'Today' : new Date(`${date}T12:00:00`).toLocaleDateString('en-CA', { weekday: 'short' });

export default function WeatherView() {
  const [w, setW] = useState<Weather | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    getWeather().then(setW, () => setFailed(true));
  }, []);

  if (!w) {
    return <div className="sunken scroll wx-msg">{failed ? 'Could not reach the weather service. Try again later.' : 'Checking the sky…'}</div>;
  }
  const now = describe(w.code, w.isDay);
  const today = w.days[0];
  return (
    <>
      <MenuBar items={['File', 'View', 'Help']} />
      <div className="sunken scroll wx">
        <div className="wx-now">
          <GridIcon grid={weatherArt[now.icon]} className="wx-big" />
          <div>
            <div className="wx-temp">{deg(w.temp)}C</div>
            <div className="wx-label">{now.label}</div>
          </div>
          <dl className="wx-facts">
            <dt>Feels like</dt>
            <dd>{deg(w.feels)}</dd>
            <dt>Wind</dt>
            <dd>{Math.round(w.wind)} km/h</dd>
            {today && (
              <>
                <dt>High / low</dt>
                <dd>
                  {deg(today.hi)} / {deg(today.lo)}
                </dd>
              </>
            )}
          </dl>
        </div>
        <ol className="wx-days">
          {w.days.slice(1, 6).map((d, i) => (
            <li key={d.date}>
              <b>{dayName(d.date, i + 1)}</b>
              <GridIcon grid={weatherArt[describe(d.code).icon]} />
              <span>
                {deg(d.hi)} <small>{deg(d.lo)}</small>
              </span>
            </li>
          ))}
        </ol>
      </div>
      <div className="status">
        <span>Toronto, ON</span>
        <span>Open-Meteo</span>
      </div>
    </>
  );
}

// The little tray readout next to the clock. Hidden if the weather can't be fetched.
export function WeatherTray({ onOpen }: { onOpen: () => void }) {
  const [w, setW] = useState<Weather | null>(null);
  useEffect(() => {
    const load = () => getWeather().then(setW, () => setW(null));
    load();
    const id = setInterval(load, 15 * 60 * 1000);
    return () => clearInterval(id);
  }, []);
  if (!w) return null;
  const now = describe(w.code, w.isDay);
  return (
    <button type="button" className="wx-tray" onClick={onOpen} title={`Toronto: ${now.label}, ${deg(w.temp)}C`}>
      <GridIcon grid={weatherArt[now.icon]} />
      {deg(w.temp)}
    </button>
  );
}
