import StoreLayout from "@/components/store/StoreLayout";
import ClientStoreGate from "@/components/store/ClientStoreGate";

export default function RootStoreLayout({ children }) {
    return (
        <StoreLayout>
            <ClientStoreGate>
                {children}
            </ClientStoreGate>
        </StoreLayout>
    );
}

export const metadata = {
    title: "FridayCart. - Store Dashboard",
    description: "FridayCart. - Store Dashboard",
};