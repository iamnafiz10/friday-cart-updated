import prisma from "@/lib/prisma";

// ✅ Check if a user is admin
const authAdmin = async (userId) => {
    try {
        if (!userId) return false;

        // 🔹 Fetch the user from your database
        const user = await prisma.user.findUnique({
            where: {id: userId},
        });

        // 🔹 Check if the user exists and is admin
        return user?.isAdmin === true;
    } catch (error) {
        console.error(error);
        return false;
    }
};

export default authAdmin;