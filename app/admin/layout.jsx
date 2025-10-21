import AdminLayout from "@/components/admin/AdminLayout";
import AdminRedirectGate from "@/components/admin/AdminRedirectGate";

export const metadata = {
    title: "FridayCart. - Admin",
    description: "FridayCart. - Admin",
};

export default function RootAdminLayout({children}) {
    return (
        <AdminLayout>
            <AdminRedirectGate>
                {children}
            </AdminRedirectGate>
        </AdminLayout>
    );
}