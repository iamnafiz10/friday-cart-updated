import {NextResponse} from "next/server";
import jwt from "jsonwebtoken";
import prisma from "@/lib/prisma";

const JWT_SECRET = process.env.JWT_SECRET;

export async function GET(req) {
    try {
        // Read token from cookie
        const cookie = req.cookies.get("token")?.value;
        if (!cookie) {
            return NextResponse.json({user: null}, {status: 200});
        }

        // Verify JWT
        let payload;
        try {
            payload = jwt.verify(cookie, JWT_SECRET);
        } catch (err) {
            return NextResponse.json({user: null}, {status: 401});
        }

        // Fetch user from DB
        const user = await prisma.user.findUnique({
            where: {id: payload.id},
            select: {
                id: true,
                name: true,
                email: true,
                image: true,
                isAdmin: true, // ✅ IMPORTANT: include this!
            },
        });

        if (!user) return NextResponse.json({user: null}, {status: 404});

        return NextResponse.json({user}, {status: 200});
    } catch (err) {
        console.error("[ME_ERROR]", err);
        return NextResponse.json({user: null}, {status: 500});
    }
}