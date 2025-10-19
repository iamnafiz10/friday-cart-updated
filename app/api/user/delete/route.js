import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(req) {
    try {
        const body = await req.json();
        const { id, password } = body;

        if (!id || !password) {
            return NextResponse.json({ error: "User ID and password required" }, { status: 400 });
        }

        const user = await prisma.user.findUnique({ where: { id } });
        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        // Compare password
        const match = await bcrypt.compare(password, user.password || "");
        if (!match) {
            return NextResponse.json({ error: "Incorrect password" }, { status: 401 });
        }

        await prisma.user.delete({ where: { id } });

        return NextResponse.json({ success: true, message: "Account deleted successfully" });
    } catch (error) {
        console.error("Error deleting user:", error);
        return NextResponse.json({ error: "Failed to delete account" }, { status: 500 });
    }
}
