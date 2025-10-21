import {NextResponse} from "next/server";
import prisma from "@/lib/prisma";
import {getCurrentUser} from "@/lib/serverAuth"; // server-side auth

// Add new coupon
export async function POST(request) {
    try {
        const user = await getCurrentUser(request);
        if (!user?.isAdmin) {
            return NextResponse.json({error: "Not authorized"}, {status: 401});
        }

        const {coupon} = await request.json();
        coupon.code = coupon.code.toUpperCase();

        await prisma.coupon.create({data: coupon});

        return NextResponse.json({message: "Coupon added successfully"});
    } catch (error) {
        console.error(error);
        return NextResponse.json({error: error.code || error.message}, {status: 400});
    }
}

// Delete coupon
export async function DELETE(request) {
    try {
        const user = await getCurrentUser(request);
        if (!user?.isAdmin) {
            return NextResponse.json({error: "Not authorized"}, {status: 401});
        }

        const {searchParams} = request.nextUrl;
        const code = searchParams.get('code');
        if (!code) {
            return NextResponse.json({error: "Coupon code is required"}, {status: 400});
        }

        await prisma.coupon.delete({where: {code}});
        return NextResponse.json({message: "Coupon deleted successfully"});
    } catch (error) {
        console.error(error);
        return NextResponse.json({error: error.code || error.message}, {status: 400});
    }
}

// Get all coupons
export async function GET(request) {
    try {
        const user = await getCurrentUser(request);
        if (!user?.isAdmin) {
            return NextResponse.json({error: "Not authorized"}, {status: 401});
        }

        const coupons = await prisma.coupon.findMany({});
        return NextResponse.json({coupons});
    } catch (error) {
        console.error(error);
        return NextResponse.json({error: error.code || error.message}, {status: 400});
    }
}