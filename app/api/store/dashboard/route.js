import {NextResponse} from "next/server";
import prisma from "@/lib/prisma";
import authSeller from "@/middlewares/authSeller";
import {getCurrentUser} from "@/lib/serverAuth";

// Get dashboard data for seller (All orders, total earnings, total products)
export async function GET(request) {
    try {
        const user = await getCurrentUser(request);
        if (!user) {
            return NextResponse.json({error: "Unauthorized"}, {status: 401});
        }

        const storeId = await authSeller(user.id);
        if (!storeId) {
            return NextResponse.json({error: "You do not have a store"}, {status: 403});
        }

        // Get all orders for the seller
        const orders = await prisma.order.findMany({where: {storeId}});

        // Get all products for the seller
        const products = await prisma.product.findMany({where: {storeId}});

        // Get ratings for seller's products
        const ratings = await prisma.rating.findMany({
            where: {productId: {in: products.map(product => product.id)}},
            include: {user: true, product: true}
        });

        const dashboardData = {
            ratings,
            totalOrders: orders.length,
            totalEarnings: Math.round(orders.reduce((acc, order) => acc + order.total, 0)),
            totalProducts: products.length
        };

        return NextResponse.json({dashboardData});
    } catch (error) {
        console.error(error);
        return NextResponse.json({error: error.message || "Failed to fetch dashboard"}, {status: 400});
    }
}