'use client';

import { useState } from 'react';
import { unlock } from './unlock';

// The Win98 log-in box used by Make Your Own and the locked recipe links.
export default function PasswordForm({ title, children, onUnlocked }: { title: string; children: React.ReactNode; onUnlocked: () => void }) {
  const [pw, setPw] = useState('');
  const [busy, setBusy] = useState(false);
  const [wrong, setWrong] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    const ok = await unlock(pw);
    setBusy(false);
    if (ok) onUnlocked();
    else setWrong(true);
  };

  return (
    <form className="mo mo-login" onSubmit={submit}>
      <div className="mo-key" aria-hidden="true">
        🔑
      </div>
      <div>
        {children}
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
              <span>{title}</span>
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
