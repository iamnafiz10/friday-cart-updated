import {NextResponse} from "next/server";
import prisma from "@/lib/prisma";
import authSeller from "@/middlewares/authSeller";
import {getCurrentUser} from "@/lib/serverAuth";

export async function GET(req) {
    try {
        const user = await getCurrentUser(req);
        if (!user) return NextResponse.json({dashboardData: null});

        const storeId = await authSeller(user);
        if (!storeId) return NextResponse.json({dashboardData: null, error: "You do not have a store"}, {status: 403});

        const orders = await prisma.order.findMany({where: {storeId}});
        const products = await prisma.product.findMany({where: {storeId}});
        const ratings = await prisma.rating.findMany({
            where: {productId: {in: products.map(p => p.id)}},
            include: {user: true, product: true}
        });

        const dashboardData = {
            ratings,
            totalOrders: orders.length,
            totalEarnings: Math.round(orders.reduce((acc, o) => acc + o.total, 0)),
            totalProducts: products.length
        };

        return NextResponse.json({dashboardData});
    } catch (err) {
        console.error(err);
        return NextResponse.json({dashboardData: null});
    }
}