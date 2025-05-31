import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import ClientProviders from "@/components/global/ClientProviders";
import { Toaster } from "sonner";

const tajawal = localFont({
    src: [
        { path: "./fonts/Tajawal-Regular.ttf", weight: "400" },
        { path: "./fonts/Tajawal-Bold.ttf", weight: "700" },
        { path: "./fonts/Tajawal-ExtraBold.ttf", weight: "800" },
        { path: "./fonts/Tajawal-Black.ttf", weight: "900" },
    ],
    variable: "--font-tajawal",
    display: "swap",
});

export const metadata: Metadata = {
    title: "Palastine Emergency",
    description: "Comming for help when you need us",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body
                suppressHydrationWarning
                className={`${tajawal.variable} antialiased`}
            >
                <ClientProviders>{children}</ClientProviders>
                <Toaster richColors position="top-right" />
            </body>
        </html>
    );
}
