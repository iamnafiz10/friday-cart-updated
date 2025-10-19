import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(req) {
    try {
        const body = await req.json();
        const { id, name, email, image } = body;

        if (!id) {
            return NextResponse.json({ error: "User ID required" }, { status: 400 });
        }

        const updatedUser = await prisma.user.update({
            where: { id },
            data: {
                name,
                email,
                image,
            },
        });

        return NextResponse.json({ success: true, user: updatedUser });
    } catch (error) {
        console.error("Error updating user:", error);
        return NextResponse.json({ error: "Failed to update user" }, { status: 500 });
    }
}
