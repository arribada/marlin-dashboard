import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navigation from "@/_components/Navigation";
import Logout from "@/_components/ui/logout";
import Footer from "@/_components/Footer";
import { getServerSession } from "next-auth";
import { authOptions } from "@/_lib/authOptions";
import SessionProviderWrapper from "@/_components/SessionProviderWrapper";
import SessionWatcher from "@/_components/SessionWatcher";
import SessionExpiryDialog from "@/_components/SessionExpiryDialog"
import { Toaster } from "sonner";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "MARLIN Dashboard",
  description: "Dashboard for monitoring vessel GPS tracking and bycatch events collected by MARLIN hardware.",
};

export const dynamic = 'force-dynamic';

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  let session = null;
  try {
    session = await getServerSession(authOptions);
  } catch (error) {
    console.error("Error fetching session:", error);
  }

  return (
    <html lang="en">
      <body
        suppressHydrationWarning
        id="root"
        className={`${inter.variable} antialiased flex flex-col min-h-screen text-center mx-auto`}
      >
        <SessionProviderWrapper>
          <SessionWatcher />
          {session && <SessionExpiryDialog />}
          <Navigation session={session} Logout={Logout}/>
          <main className="container mx-auto flex-grow py-6 space-y-6 xl:px-0 px-8">{children}</main>
          <Footer />
        </SessionProviderWrapper>
        <Toaster position="bottom-right" />
      </body>
    </html>
  );
}
