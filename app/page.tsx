import Desktop from '@/components/desktop/Desktop';
import { site, visibleFolders } from '@/content';

export default function Home() {
  return (
    <>
      {/* The desktop is drawn in the browser, so this gives search engines (and screen readers) real words up front. */}
      <div className="sr-only">
        <h1>robkilometers</h1>
        <h2>{site.readme.heading}</h2>
        {site.readme.body.split('\n\n').map((p, i) => (
          <p key={i}>{p}</p>
        ))}
        <ul>
          {visibleFolders
            .filter((f) => f.id !== 'recycle')
            .map((f) => (
              <li key={f.id}>
                {f.name}
                {f.blurb ? `: ${f.blurb}` : ''}
              </li>
            ))}
        </ul>
      </div>
      <Desktop />
    </>
  );
}
