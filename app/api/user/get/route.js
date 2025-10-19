import {NextResponse} from "next/server";
import prisma from "@/lib/prisma";

export async function POST(req) {
    try {
        const {id} = await req.json();

        if (!id) {
            return NextResponse.json({error: "User ID is required"}, {status: 400});
        }

        const user = await prisma.user.findUnique({
            where: {id},
        });

        if (!user) {
            return NextResponse.json({error: "User not found"}, {status: 404});
        }

        return NextResponse.json({user}, {status: 200});
    } catch (error) {
        console.error("Error fetching user:", error);
        return NextResponse.json({error: "Server error"}, {status: 500});
    }
}