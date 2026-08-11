import type { Metadata } from 'next';
import Image from 'next/image';
import { Toaster } from 'sonner';
import './globals.css';

export const metadata: Metadata = {
  title: 'RoomBook — Meeting Room Booking',
  description: 'Book a meeting room in seconds.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-secondary/40 font-sans antialiased">
        {children}
        <footer className="fixed inset-x-0 bottom-0 z-40">
          <div className="container flex max-w-7xl items-center justify-between py-3">
            <Image
              src="/images/skydeck_logo.png"
              alt="Skydeck logo"
              width={160}
              height={80}
              className="h-10 w-auto object-contain"
            />
            <Image
              src="/images/website_logo.png"
              alt="WeCare logo"
              width={160}
              height={80}
              className="h-[2.125rem] w-auto object-contain"
            />
          </div>
        </footer>
        <Toaster richColors position="top-center" />
      </body>
    </html>
  );
}
