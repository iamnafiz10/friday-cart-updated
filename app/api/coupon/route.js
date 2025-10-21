import {getCurrentUser} from "@/lib/serverAuth";
import prisma from "@/lib/prisma";
import {NextResponse} from "next/server";

// Verify coupon
export async function POST(request) {
    try {
        const user = await getCurrentUser(request);

        const {code} = await request.json();
        if (!code) {
            return NextResponse.json({error: "Coupon code is required"}, {status: 400});
        }

        const coupon = await prisma.coupon.findUnique({
            where: {code: code.toUpperCase()},
        });

        if (!coupon) {
            return NextResponse.json({error: "Coupon not found"}, {status: 404});
        }

        // Check expiration
        if (coupon.expiresAt && new Date(coupon.expiresAt) < new Date()) {
            return NextResponse.json({error: "Coupon expired"}, {status: 400});
        }

        // For new users
        if (coupon.forNewUser) {
            if (!user) {
                return NextResponse.json({error: "Please login to use this coupon"}, {status: 401});
            }
            const userOrders = await prisma.order.findMany({where: {userId: user.id}});
            if (userOrders.length > 0) {
                return NextResponse.json({error: "Coupon valid for new users only"}, {status: 400});
            }
        }

        return NextResponse.json({coupon});
    } catch (error) {
        console.error(error);
        return NextResponse.json({error: error.message || "Failed to verify coupon"}, {status: 400});
    }
}