'use client';

import { useState } from 'react';

// "Make Your Own.exe": a Win98 log-in box. The right password unlocks a how-to for getting
// your own corner of the internet like this one. The server checks the password and sends the how-to.
type Unlocked = { pitch: string; deploy: string; steps: string[]; prompt: string; repo: string };
const KEY = 'make-own-unlocked';

export default function MakeOwnView() {
  const [pw, setPw] = useState('');
  const [busy, setBusy] = useState(false);
  const [wrong, setWrong] = useState(false);
  // remembered for this visit (windows only open in the browser, so sessionStorage is there)
  const [data, setData] = useState<Unlocked | null>(() => {
    try {
      const saved = sessionStorage.getItem(KEY);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [copied, setCopied] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    try {
      const res = await fetch('/api/make-own', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: pw }),
      });
      const json = await res.json();
      if (json.ok) {
        const unlocked: Unlocked = { pitch: json.pitch, deploy: json.deploy, steps: json.steps, prompt: json.prompt, repo: json.repo };
        setData(unlocked);
        try {
          sessionStorage.setItem(KEY, JSON.stringify(unlocked));
        } catch {}
      } else setWrong(true);
    } catch {
      setWrong(true);
    }
    setBusy(false);
  };

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
    <form className="mo mo-login" onSubmit={submit}>
      <div className="mo-key" aria-hidden="true">
        🔑
      </div>
      <div>
        <p className="mo-head">Want to build your own corner of the internet like this?</p>
        <p>Type the password to get started.</p>
        <label>
          <span>Password:</span>
          <input className="sunken" type="password" value={pw} onChange={(e) => setPw(e.target.value)} autoComplete="off" autoFocus />
        </label>
        <div className="mo-btns">
          <button type="submit" className="bevel" disabled={busy}>
            OK
          </button>
        </div>
      </div>
      {wrong && (
        <div className="mo-err-wrap">
          <div className="mo-err" role="alertdialog" aria-label="Error">
            <div className="wd-card-bar">
              <span>Make Your Own.exe</span>
            </div>
            <div className="mo-err-body">
              <span className="mo-x" aria-hidden="true">
                ✕
              </span>
              <p>
                That password has performed an illegal operation and will be shut down.
                <br />
                <small>(Ask Rob for the password.)</small>
              </p>
            </div>
            <button
              type="button"
              className="bevel"
              autoFocus
              onClick={() => {
                setWrong(false);
                setPw('');
              }}
            >
              OK
            </button>
          </div>
        </div>
      )}
    </form>
  );
}
