import type { Metadata } from "next";
import { Inter, Cormorant_Garamond } from "next/font/google";
import "./globals.css";
import { UserProvider } from "./context/UserContext";
import MagicNav from "@/components/MagicNav";
import SmoothScroll from "@/components/SmoothScroll";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "UrbanClay Studio",
  description: "Clay-material inspiration engine",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${cormorant.variable} antialiased`}
      >
        <SmoothScroll>
          <UserProvider>
            {children}
            <MagicNav />
          </UserProvider>
        </SmoothScroll>
      </body>
    </html>
  );
}
