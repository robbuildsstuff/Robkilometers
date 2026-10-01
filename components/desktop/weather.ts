import type { WeatherIcon } from './weatherArt';

// Live Toronto weather from Open-Meteo (free, no key). Cached for 15 minutes per visitor.
const URL =
  'https://api.open-meteo.com/v1/forecast?latitude=43.65&longitude=-79.38&timezone=America%2FToronto' +
  '&current=temperature_2m,apparent_temperature,weather_code,wind_speed_10m,is_day' +
  '&daily=weather_code,temperature_2m_max,temperature_2m_min&forecast_days=6';
const KEY = 'robos-weather';
const MAX_AGE = 15 * 60 * 1000;

export type Weather = {
  temp: number;
  feels: number;
  wind: number;
  code: number;
  isDay: boolean;
  days: { date: string; code: number; hi: number; lo: number }[];
};

type Raw = {
  current: { temperature_2m: number; apparent_temperature: number; weather_code: number; wind_speed_10m: number; is_day: number };
  daily: { time: string[]; weather_code: number[]; temperature_2m_max: number[]; temperature_2m_min: number[] };
};

let pending: Promise<Weather> | null = null;

export function getWeather(): Promise<Weather> {
  try {
    const hit = JSON.parse(localStorage.getItem(KEY) ?? 'null');
    if (hit && Date.now() - hit.at < MAX_AGE) return Promise.resolve(hit.w as Weather);
  } catch {}
  pending ??= fetch(URL)
    .then((r) => (r.ok ? (r.json() as Promise<Raw>) : Promise.reject(new Error(String(r.status)))))
    .then((d) => {
      const w: Weather = {
        temp: d.current.temperature_2m,
        feels: d.current.apparent_temperature,
        wind: d.current.wind_speed_10m,
        code: d.current.weather_code,
        isDay: d.current.is_day === 1,
        days: d.daily.time.map((date, i) => ({
          date,
          code: d.daily.weather_code[i],
          hi: d.daily.temperature_2m_max[i],
          lo: d.daily.temperature_2m_min[i],
        })),
      };
      try {
        localStorage.setItem(KEY, JSON.stringify({ at: Date.now(), w }));
      } catch {}
      return w;
    })
    .finally(() => {
      pending = null;
    });
  return pending;
}

// WMO weather codes -> words and a picture.
export function describe(code: number, isDay = true): { label: string; icon: WeatherIcon } {
  if (code === 0) return { label: 'Clear', icon: isDay ? 'sun' : 'moon' };
  if (code <= 2) return { label: 'Partly cloudy', icon: isDay ? 'partly' : 'cloud' };
  if (code === 3) return { label: 'Cloudy', icon: 'cloud' };
  if (code <= 48) return { label: 'Fog', icon: 'fog' };
  if (code <= 57) return { label: 'Drizzle', icon: 'rain' };
  if (code <= 67) return { label: 'Rain', icon: 'rain' };
  if (code <= 77) return { label: 'Snow', icon: 'snow' };
  if (code <= 82) return { label: 'Showers', icon: 'rain' };
  if (code <= 86) return { label: 'Snow showers', icon: 'snow' };
  return { label: 'Thunderstorm', icon: 'storm' };
}

export const deg = (t: number) => `${Math.round(t)}°`;
