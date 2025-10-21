import {getCurrentUser} from "@/lib/serverAuth";
import {NextResponse} from "next/server";
import prisma from "@/lib/prisma";

// Get all approved stores
export async function GET(request) {
    try {
        const user = await getCurrentUser(request);

        // Check if user is admin
        if (!user?.isAdmin) {
            return NextResponse.json({error: 'Not authorized'}, {status: 401});
        }

        const stores = await prisma.store.findMany({
            where: {status: 'approved'},
            include: {user: true}
        });

        return NextResponse.json({stores});
    } catch (error) {
        console.error(error);
        return NextResponse.json({error: error.code || error.message}, {status: 400});
    }
}