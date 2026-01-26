import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Contract System",
    description: "Digital Contract Approval System",
};

import { Providers } from "./components/Providers";

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body>
                <Providers>{children}</Providers>
            </body>
        </html>
    );
}

