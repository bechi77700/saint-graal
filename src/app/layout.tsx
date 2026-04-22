import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Saint Graal — Market Research Generator',
  description: 'AI-powered market research for e-commerce brands running Meta Ads cold traffic',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body>{children}</body>
    </html>
  );
}
