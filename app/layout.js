import { Bricolage_Grotesque, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const display = Bricolage_Grotesque({ subsets: ["latin"], variable: "--font-display", display: "swap" });
const body = Plus_Jakarta_Sans({ subsets: ["latin"], variable: "--font-body", display: "swap" });

export const metadata = {
  title: "LOKA - Toko digital dalam satu tautan",
  description: "Buat toko digital, jual e-book, template, kelas, dan jasa dari satu tautan.",
};
export const viewport = { width: "device-width", initialScale: 1, themeColor: "#2B9BE6" };

export default function RootLayout({ children }) {
  return (
    <html lang="id" className={`${display.variable} ${body.variable}`}>
      <body>{children}</body>
    </html>
  );
}
