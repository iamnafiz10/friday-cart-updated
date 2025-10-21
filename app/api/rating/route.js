import {getCurrentUser} from "@/lib/serverAuth";
import prisma from "@/lib/prisma";
import {NextResponse} from "next/server";

// Add new rating
export async function POST(request) {
    try {
        const user = await getCurrentUser(request);
        if (!user) {
            return NextResponse.json({error: "Unauthorized"}, {status: 401});
        }

        const {orderId, productId, rating, review} = await request.json();

        // Check if order belongs to user
        const order = await prisma.order.findUnique({where: {id: orderId}});
        if (!order || order.userId !== user.id) {
            return NextResponse.json({error: "Order not found"}, {status: 404});
        }

        // Check if product already rated
        const isAlreadyRated = await prisma.rating.findFirst({
            where: {productId, orderId}
        });
        if (isAlreadyRated) {
            return NextResponse.json({error: "Product already rated"}, {status: 400});
        }

        const response = await prisma.rating.create({
            data: {
                userId: user.id,
                productId,
                rating,
                review,
                orderId
            }
        });

        return NextResponse.json({message: "Rating added successfully", rating: response});
    } catch (error) {
        console.error(error);
        return NextResponse.json({error: error.message || "Failed to add rating"}, {status: 400});
    }
}

// Get all ratings for a user
export async function GET(request) {
    try {
        const user = await getCurrentUser(request);
        if (!user) {
            return NextResponse.json({error: "Unauthorized"}, {status: 401});
        }

        const ratings = await prisma.rating.findMany({
            where: {userId: user.id}
        });

        return NextResponse.json({ratings});
    } catch (error) {
        console.error(error);
        return NextResponse.json({error: error.message || "Failed to fetch ratings"}, {status: 400});
    }
}