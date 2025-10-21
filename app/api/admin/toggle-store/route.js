import {getCurrentUser} from "@/lib/serverAuth";
import {NextResponse} from "next/server";
import prisma from "@/lib/prisma";

// Toggle store isActive
export async function POST(request) {
    try {
        const user = await getCurrentUser(request);

        // Check if user is admin
        if (!user?.isAdmin) {
            return NextResponse.json({error: 'Not authorized'}, {status: 401});
        }

        const {storeId} = await request.json();
        if (!storeId) {
            return NextResponse.json({error: 'Missing storeId'}, {status: 400});
        }

        // Find the store
        const store = await prisma.store.findUnique({where: {id: storeId}});
        if (!store) {
            return NextResponse.json({error: 'Store not found'}, {status: 400});
        }

        await prisma.store.update({
            where: {id: storeId},
            data: {isActive: !store.isActive},
        });

        return NextResponse.json({message: 'Store updated successfully'});
    } catch (error) {
        console.error(error);
        return NextResponse.json({error: error.code || error.message}, {status: 400});
    }
}