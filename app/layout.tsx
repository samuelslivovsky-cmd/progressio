import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import { Toaster } from "sonner";
import { Providers } from "@/components/providers";
import { PwaRegister } from "@/components/pwa-register";
import { TooltipProvider } from "@/components/ui/tooltip";
import "./globals.css";

const font = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "Progressio",
  description: "Fitness tracker pre trénerov a klientov",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Progressio",
  },
};

export const viewport = {
  themeColor: "#080c09",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover" as const,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${font.variable} font-sans antialiased`}>
        <Providers>
          <PwaRegister />
          <TooltipProvider>{children}</TooltipProvider>
          <Toaster richColors position="top-center" />
        </Providers>
      </body>
    </html>
  );
}
