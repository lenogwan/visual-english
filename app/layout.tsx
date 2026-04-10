import type { Metadata } from "next";
import { Geist, Geist_Mono, Playfair_Display } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import SessionExpiredToast from "@/components/SessionExpiredToast";
import { AuthProvider } from "@/lib/auth-context";
import OnboardingWrapper from "@/components/OnboardingWrapper";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL('https://queryi.com'),
  title: {
    default: "Visual English - Learn English Through Images",
    template: "%s | Visual English"
  },
  description: "Break the translation habit. Connect English directly to images and scenarios. Build native intuition through visual memory.",
  keywords: ["learn english", "visual learning", "english vocabulary", "language learning", "english through images"],
  authors: [{ name: "Visual English Team" }],
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://queryi.com",
    title: "Visual English - Learn English Through Images",
    description: "Connect English directly to images and scenarios. Break the translation habit forever.",
    siteName: "Visual English",
    images: [{
      url: "/og-image.png",
      width: 1200,
      height: 630,
      alt: "Visual English Learning Platform"
    }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Visual English - Learn English Through Images",
    description: "Build native intuition through visual memory. Stop translating, start visualizing.",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${playfair.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <AuthProvider>
          <Navbar />
          <SessionExpiredToast />
          <OnboardingWrapper>
            <main className="flex-1">{children}</main>
          </OnboardingWrapper>
        </AuthProvider>
      </body>
    </html>
  );
}
