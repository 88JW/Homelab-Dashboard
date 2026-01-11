import "./globals.css";
import Providers from "@/components/Providers";

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
          {children}
        </Providers>
      </body>
    </html>
  );
}