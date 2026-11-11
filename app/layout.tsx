import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'KineticForge - Kinetic Typography Motion Studio',
  description: 'Design and export kinetic typography animations.',
};

const FONTS =
  'https://fonts.googleapis.com/css2?family=Anton&family=Bebas+Neue&family=Bungee&family=Cinzel:wght@600;900&family=Montserrat:wght@400;700;900&family=Outfit:wght@400;700;900&family=Playfair+Display:ital,wght@0,600;0,900;1,700&family=Righteous&family=Space+Grotesk:wght@500;700&family=Syne:wght@700;800&family=Inter:wght@400;500;600;700&display=swap';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* Canvas needs named font families, so fonts are loaded via stylesheet rather than next/font */}
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link href={FONTS} rel="stylesheet" />
      </head>
      <body className="bg-studio-950 text-gray-200 min-h-dvh lg:h-dvh flex flex-col font-sans select-none lg:overflow-hidden">
        {children}
      </body>
    </html>
  );
}
