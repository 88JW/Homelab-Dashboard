import "./globals.css";
import Providers from "@/components/Providers";
import { PwaRegistration } from "@/components/pwa-registration";

export const metadata = {
  title: "Homelab Monitor",
  description: "Real-time system dashboard",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pl" className="dark">
      <body className="bg-zinc-950 text-white antialiased">
        <Providers>
          <PwaRegistration />
          {children}
        </Providers>
      </body>
    </html>
  );
}
