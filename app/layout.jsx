import {Outfit} from "next/font/google";
import {Toaster} from "react-hot-toast";
import StoreProvider from "@/app/StoreProvider";
import AuthModal from "@/components/AuthModal";
import {AuthProvider} from "@/app/context/AuthContext";
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
        <AuthProvider>
            <StoreProvider>
                <Toaster/>
                <ScrollHandler/>
                {children}
                <AuthModal/>
            </StoreProvider>
        </AuthProvider>
        </body>
        </html>
    );
}