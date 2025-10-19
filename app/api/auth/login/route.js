import {NextResponse} from "next/server";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import prisma from "@/lib/prisma";

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d";

export async function POST(req) {
    try {
        const {email, password} = await req.json();

        if (!email || !password) {
            return NextResponse.json({error: "Missing fields"}, {status: 400});
        }

        const user = await prisma.user.findUnique({where: {email}});

        if (!user || !user.password) {
            return NextResponse.json({error: "No user found"}, {status: 404});
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return NextResponse.json({error: "Invalid credentials"}, {status: 401});
        }

        const token = jwt.sign({id: user.id, email: user.email}, JWT_SECRET, {
            expiresIn: JWT_EXPIRES_IN,
        });

        const res = NextResponse.json({
            message: "Logged in",
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                image: user.image,
            },
        });

        res.cookies.set({
            name: "token",
            value: token,
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            path: "/",
            maxAge: 60 * 60 * 24 * 7,
        });

        return res;
    } catch (err) {
        console.error("[LOGIN_ERROR]", err);
        return NextResponse.json({error: "Server error"}, {status: 500});
    }
}
