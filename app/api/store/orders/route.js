import {NextResponse} from "next/server";
import {getCurrentUser} from "@/lib/serverAuth";
import authSeller from "@/middlewares/authSeller";
import prisma from "@/lib/prisma";

// Update seller orders status
export async function POST(request) {
    try {
        const user = await getCurrentUser(request);
        if (!user) {
            return NextResponse.json({error: 'Not authorized'}, {status: 401});
        }

        const storeId = await authSeller(user); // ✅ pass user object
        if (!storeId) {
            return NextResponse.json({error: 'Not authorized'}, {status: 401});
        }

        const {orderId, status} = await request.json();
        if (!orderId || !status) {
            return NextResponse.json({error: 'Missing orderId or status'}, {status: 400});
        }

        await prisma.order.update({
            where: {id: orderId},
            data: {status}
        });

        return NextResponse.json({message: "Order status updated"});
    } catch (error) {
        console.error(error);
        return NextResponse.json({error: error.message || "Failed to update order"}, {status: 400});
    }
}

// Get all orders for seller
export async function GET(request) {
    try {
        const user = await getCurrentUser(request);
        if (!user) {
            return NextResponse.json({error: 'Not authorized'}, {status: 401});
        }

        const storeId = await authSeller(user); // ✅ pass user object
        if (!storeId) {
            return NextResponse.json({error: 'Not authorized'}, {status: 401});
        }

        const orders = await prisma.order.findMany({
            where: {storeId},
            include: {
                user: true,
                address: true,
                orderItems: {include: {product: true}}
            },
            orderBy: {createdAt: 'desc'}
        });

        return NextResponse.json({orders});
    } catch (error) {
        console.error(error);
        return NextResponse.json({error: error.message || "Failed to fetch orders"}, {status: 400});
    }
}