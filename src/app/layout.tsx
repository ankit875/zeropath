import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'ZeroPath - Crypto Hidato Game',
  description: 'A Hidato puzzle game with zero-knowledge proofs',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}