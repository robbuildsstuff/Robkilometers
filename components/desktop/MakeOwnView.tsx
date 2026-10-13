'use client';

import { useState } from 'react';
import PasswordForm from './PasswordForm';
import { MAKE_OWN_KEY, readUnlocked } from './unlock';

// "Make Your Own.exe": a Win98 log-in box. The right password unlocks a how-to for getting
// your own corner of the internet like this one. The server checks the password and sends the how-to.
type Unlocked = { pitch: string; deploy: string; intro?: string[]; steps: string[]; prompt: string; repo: string };

export default function MakeOwnView() {
  // remembered for this visit (windows only open in the browser, so sessionStorage is there)
  const [data, setData] = useState<Unlocked | null>(() => readUnlocked<Unlocked>(MAKE_OWN_KEY));
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    if (!data) return;
    try {
      await navigator.clipboard.writeText(data.prompt);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {}
  };

  if (data)
    return (
      <div className="mo">
        <p className="mo-head">{data.pitch}</p>
        <a className="mo-deploy" href={data.deploy} target="_blank" rel="noopener noreferrer">
          {/* eslint-disable-next-line @next/next/no-img-element -- Vercel's own button */}
          <img src="https://vercel.com/button" alt="Deploy with Vercel" />
        </a>
        {data.intro && (
          <ul className="mo-tips sunken">
            {data.intro.map((t) => (
              <li key={t}>{t}</li>
            ))}
          </ul>
        )}
        <ol className="mo-steps">
          {data.steps.map((s) => (
            <li key={s}>{s}</li>
          ))}
        </ol>
        <div className="mo-prompt">
          <div className="mo-prompt-bar">
            <span>The prompt</span>
            <button type="button" className="bevel" onClick={copy}>
              {copied ? 'Copied!' : 'Copy'}
            </button>
          </div>
          <pre className="sunken">{data.prompt}</pre>
        </div>
        <a className="mo-repo" href={data.repo} target="_blank" rel="noopener noreferrer">
          See the code on GitHub ↗
        </a>
      </div>
    );

  return (
    <PasswordForm title="Make Your Own.exe" onUnlocked={() => setData(readUnlocked<Unlocked>(MAKE_OWN_KEY))}>
      <p className="mo-head">Want to build your own corner of the internet like this?</p>
      <p>Type the password to get started.</p>
    </PasswordForm>
  );
}
