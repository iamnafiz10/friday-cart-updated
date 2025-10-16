import {getAuth} from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";
import {NextResponse} from "next/server";

// 🟩 Add new address
export async function POST(request) {
    try {
        const {userId} = getAuth(request);

        if (!userId) {
            return NextResponse.json(
                {error: "Please login your account first"},
                {status: 401}
            );
        }

        const {address} = await request.json();
        address.userId = userId;

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
        const {userId} = getAuth(request);

        const addresses = await prisma.address.findMany({
            where: {userId},
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