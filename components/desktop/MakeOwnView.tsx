'use client';

// "Make Your Own.exe": a tiny pitch for getting your own corner of the internet like this one.
const MAIL = 'mailto:hello@robkilometers.ca?subject=' + encodeURIComponent('Make my own');

export default function MakeOwnView() {
  return (
    <div className="mo">
      <p className="mo-head">Want your own corner of the internet like this?</p>
      <p>Your stuff, your friends, linked together. No feed, no algorithm, no timeline.</p>
      <a className="bevel mo-btn" href={MAIL}>
        Email me
      </a>
    </div>
  );
}
