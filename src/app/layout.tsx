import type {Metadata} from 'next';
import {Geist, Geist_Mono} from 'next/font/google';
import './globals.css';
import GlobalLayout from '@/components/global-layout';
import {DefaultMetaData} from '@/constant/metaData';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: DefaultMetaData.title,
  description: DefaultMetaData.description,
  keywords: DefaultMetaData.keywords,
  other: DefaultMetaData.other,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
    <body
      className={`${geistSans.variable} ${geistMono.variable} antialiased`}
    >
    <GlobalLayout>
      {children}
    </GlobalLayout>
      </body>
    </html>
  );
}
