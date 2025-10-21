import {NextResponse} from "next/server";
import prisma from "@/lib/prisma";
import {getCurrentUser} from "@/lib/serverAuth"; // your custom auth

// Get dashboard data for admin (Total orders, total stores, total products, total revenue)
export async function GET(request) {
    try {
        const user = await getCurrentUser(request);
        const isAdmin = user?.isAdmin;
        if (!isAdmin) {
            return NextResponse.json({error: 'Not authorized'}, {status: 401});
        }

        // Get total orders
        const orders = await prisma.order.count();

        // Get total stores
        const stores = await prisma.store.count();

        // Get all orders (createdAt and total) to calculate total revenue
        const allOrders = await prisma.order.findMany({
            select: {
                createdAt: true,
                total: true,
            }
        });

        const totalRevenue = allOrders.reduce((sum, order) => sum + order.total, 0);
        const revenue = totalRevenue.toFixed(2);

        // Total products
        const products = await prisma.product.count();

        const dashboardData = {
            orders,
            stores,
            products,
            revenue,
            allOrders
        };

        return NextResponse.json({dashboardData});
    } catch (error) {
        console.error(error);
        return NextResponse.json({error: error.code || error.message}, {status: 400});
    }
}