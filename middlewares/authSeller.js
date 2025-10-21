import prisma from "@/lib/prisma";

const authSeller = async (user) => {
    try {
        if (!user?.id) return false;

        const dbUser = await prisma.user.findUnique({
            where: {id: user.id},
            include: {store: true},
        });

        // Check if user has an approved store
        if (dbUser?.store && dbUser.store.status === "approved") {
            return dbUser.store.id;
        }

        return false;
    } catch (error) {
        console.error("authSeller error:", error);
        return false;
    }
};

export default authSeller;