import type { Metadata } from "next";
import { Inter, Germania_One } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import QueryProvider from "@/providers/QueryProvider"; // <--- Import
import { GeolocationProvider } from "@/context/GeolocationContext";
import { Nav } from "@/components/Nav";

const inter = Inter({ subsets: ["latin"] });
const germaniaOne = Germania_One({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-germania-one",
});

export const metadata: Metadata = {
  title: "PubQuest",
  description: "Gamified exploration of London",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} ${germaniaOne.variable}`}>
        <Nav />
        <AuthProvider>
          <QueryProvider>
            <GeolocationProvider>{children}</GeolocationProvider>
          </QueryProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
