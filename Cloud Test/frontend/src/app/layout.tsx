
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Nav from "./components/Nav";
import Providers from "./components/Providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});



export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
    <html lang="en">
      

      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased m-3`}
      >
        <Providers>
            <Nav />
            {children}

      </Providers>
      </body>
    </html>
    </>
  );
}
