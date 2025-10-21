import {NextResponse} from "next/server";
import prisma from "@/lib/prisma";
import authAdmin from "@/middlewares/authAdmin";
import {getCurrentUser} from "@/lib/serverAuth";

// Approve or reject a store
export async function POST(request) {
    try {
        // 🔹 Get current user
        const user = await getCurrentUser(request);
        if (!user) {
            return NextResponse.json({error: 'Unauthorized'}, {status: 401});
        }

        // 🔹 Check if current user is admin
        const isAdmin = await authAdmin(user.id);
        if (!isAdmin) {
            return NextResponse.json({error: 'Not authorized'}, {status: 401});
        }

        const {storeId, status} = await request.json();

        if (status === 'approved') {
            await prisma.store.update({
                where: {id: storeId},
                data: {status: "approved", isActive: true},
            });
        } else if (status === 'rejected') {
            await prisma.store.update({
                where: {id: storeId},
                data: {status: "rejected"},
            });
        }

        return NextResponse.json({message: status + 'Successfully'});
    } catch (error) {
        console.error(error);
        return NextResponse.json({error: error.code || error.message}, {status: 400});
    }
}

// Get all pending and rejected stores
export async function GET(request) {
    try {
        // 🔹 Get current user
        const user = await getCurrentUser(request);
        if (!user) {
            return NextResponse.json({error: 'Unauthorized'}, {status: 401});
        }

        // 🔹 Check admin
        const isAdmin = await authAdmin(user.id);
        if (!isAdmin) {
            return NextResponse.json({error: 'Not authorized'}, {status: 401});
        }

        const stores = await prisma.store.findMany({
            where: {status: {in: ["pending", "rejected"]}},
            include: {user: true},
        });

        return NextResponse.json({stores});
    } catch (error) {
        console.error(error);
        return NextResponse.json({error: error.code || error.message}, {status: 400});
    }
}