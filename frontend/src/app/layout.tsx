import type { Metadata } from 'next';
import { Inter } from "next/font/google";
import "./globals.css";
import ClientLayout from "./ClientLayout";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "ConvoAi Dashboard",
  description: "Manage your ConvoAi agents and sites efficiently.",
  icons: {
    icon: '/logo.png',
  },
  openGraph: {
    title: "ConvoAi Dashboard",
    description: "Manage your ConvoAi agents and sites efficiently.",
    images: [
      {
        url: "/banner.png",
        width: 1200,
        height: 630,
        alt: "ConvoAi Banner",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    images: ["/banner.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} min-h-screen flex flex-col antialiased`}>
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}
