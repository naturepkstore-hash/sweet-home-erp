import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Pakistan Bait-ul-Maal Sweet Home Multan | ERP Portal",
  description: "Enterprise Resource Planning (ERP) System for Pakistan Bait-ul-Maal Sweet Home Multan - Managing Child Welfare, Staff & Duties, Hostel, Education, Inventory, Mess, Medical, Finance & Procurement.",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-50 text-slate-900 antialiased selection:bg-emerald-600 selection:text-white">
        {children}
      </body>
    </html>
  );
}
