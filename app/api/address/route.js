import prisma from "@/lib/prisma";
import {NextResponse} from "next/server";
import {getCurrentUser} from "@/lib/serverAuth";

// 🟩 Add new address
export async function POST(request) {
    try {
        // 🔹 Get current logged-in user
        const user = await getCurrentUser(request);
        if (!user) {
            return NextResponse.json(
                {error: "Please login your account first"},
                {status: 401}
            );
        }

        const {address} = await request.json();
        address.userId = user.id;

        const newAddress = await prisma.address.create({
            data: address,
        });

        return NextResponse.json({
            newAddress,
            message: "Address added successfully",
        });
    } catch (error) {
        console.error(error);
        return NextResponse.json(
            {error: error.code || error.message},
            {status: 400}
        );
    }
}

// 🟦 Get all address for a user
export async function GET(request) {
    try {
        // 🔹 Get current logged-in user
        const user = await getCurrentUser(request);
        if (!user) {
            return NextResponse.json(
                {error: "Unauthorized"},
                {status: 401}
            );
        }

        const addresses = await prisma.address.findMany({
            where: {userId: user.id},
        });

        return NextResponse.json({addresses});
    } catch (error) {
        console.error(error);
        return NextResponse.json(
            {error: error.code || error.message},
            {status: 400}
        );
    }
}