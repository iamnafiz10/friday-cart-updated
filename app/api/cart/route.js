import {getAuth} from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";
import {NextResponse} from "next/server";

// Update user cart
export async function POST(request) {
    try {
        const {userId} = getAuth(request);

        if (!userId) {
            return NextResponse.json({error: "Not authorized"}, {status: 401});
        }

        const {cart} = await request.json();

        // Check if user exists
        const existingUser = await prisma.user.findUnique({
            where: {id: userId},
        });

        if (!existingUser) {
            // If user doesn't exist, create a new record with cart
            await prisma.user.create({
                data: {
                    id: userId,
                    email: "",
                    name: "",
                    image: "",
                    cart: cart || {}, // fallback empty object
                },
            });
        } else {
            // If user exists, just update the cart
            await prisma.user.update({
                where: {id: userId},
                data: {cart: cart || {}},
            });
        }

        return NextResponse.json({message: "Cart updated successfully"});
    } catch (error) {
        console.error("Cart POST error:", error);
        return NextResponse.json({error: error.message}, {status: 400});
    }
}

// Get user cart
export async function GET(request) {
    try {
        const {userId} = getAuth(request);

        if (!userId) {
            return NextResponse.json({error: "Not authorized"}, {status: 401});
        }

        const user = await prisma.user.findUnique({
            where: {id: userId},
        });

        // Return empty cart if user not found or cart missing
        if (!user || !user.cart) {
            return NextResponse.json({cart: {}});
        }

        return NextResponse.json({cart: user.cart});
    } catch (error) {
        console.error("Cart GET error:", error);
        return NextResponse.json({error: error.message}, {status: 400});
    }
}