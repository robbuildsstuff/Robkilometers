'use client';

import { useState } from 'react';
import PasswordForm from './PasswordForm';
import { readUnlocked, RECIPES_KEY } from './unlock';

// "Original recipe" for a recipe whose link is locked: asks for the password once, then it's a normal link.
export default function RecipeSource({ id }: { id: string }) {
  const [url, setUrl] = useState<string | null>(() => readUnlocked<Record<string, string>>(RECIPES_KEY)?.[id] ?? null);
  const [asking, setAsking] = useState(false);

  if (url)
    return (
      <a href={url} target="_blank" rel="noopener noreferrer">
        Original recipe
      </a>
    );
  return (
    <>
      <button type="button" className="recipe-lock" onClick={() => setAsking(true)} title="Locked: needs the password">
        🔒 Original recipe
      </button>
      {asking && (
        <div className="recipe-lock-wrap" onClick={() => setAsking(false)}>
          <div className="recipe-lock-box bevel" onClick={(e) => e.stopPropagation()}>
            <div className="wd-card-bar">
              <span>Original recipe</span>
              <button type="button" className="bevel wd-x" onClick={() => setAsking(false)} aria-label="Close">
                ×
              </button>
            </div>
            <PasswordForm
              title="Original recipe"
              onUnlocked={() => {
                setUrl(readUnlocked<Record<string, string>>(RECIPES_KEY)?.[id] ?? null);
                setAsking(false);
              }}
            >
              <p>The original is locked. Type the password to open it.</p>
            </PasswordForm>
          </div>
        </div>
      )}
    </>
  );
}
