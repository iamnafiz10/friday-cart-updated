import {NextResponse} from "next/server";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(req) {
    try {
        const body = await req.json();
        const {id, password, confirmPassword} = body;

        if (!id || !password || !confirmPassword) {
            return NextResponse.json({error: "All fields required"}, {status: 400});
        }

        if (password !== confirmPassword) {
            return NextResponse.json({error: "Passwords do not match"}, {status: 400});
        }

        const hashed = await bcrypt.hash(password, 10);

        await prisma.user.update({
            where: {id},
            data: {password: hashed},
        });

        return NextResponse.json({
            success: true,
            message: "Password updated successfully",
        });
    } catch (error) {
        console.error("Error updating password:", error);
        return NextResponse.json({error: "Failed to update password"}, {status: 500});
    }
}
