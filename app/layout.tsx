import type { Metadata, Viewport } from 'next';
import './globals.css';

const description = "My corner of the internet: food, travel, books, sport and whatever else I'm into this week.";

export const metadata: Metadata = {
  metadataBase: new URL('https://www.robkilometers.ca'),
  title: 'robkilometers',
  description,
  alternates: { canonical: '/' },
  openGraph: { title: 'robkilometers', description, url: '/', siteName: 'robkilometers', type: 'website' },
  twitter: { card: 'summary', title: 'robkilometers', description },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: '#2a7a78',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Caveat:wght@600&family=Pixelify+Sans:wght@400;600&family=VT323&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
