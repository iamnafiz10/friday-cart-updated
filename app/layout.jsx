import {Outfit} from "next/font/google";
import {Toaster} from "react-hot-toast";
import StoreProvider from "@/app/StoreProvider";
import "./globals.css";
import ScrollHandler from "@/components/ScrollHandler";

const outfit = Outfit({
    subsets: ["latin"],
    weight: ["400", "500", "600"],
    display: "swap",
});

export const metadata = {
    title: "FridayCart Updated. - Shop smarter",
    description: "FridayCart Updated. - Shop smarter",
};

export default function RootLayout({children}) {
    return (
        <html lang="en">
        <body className={`${outfit.className} antialiased`}>
        <StoreProvider>
            <Toaster/>
            <ScrollHandler/>
            {children}
        </StoreProvider>
        </body>
        </html>
    );
}