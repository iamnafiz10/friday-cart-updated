import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import prisma from "@/lib/prisma";

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d";

export async function POST(req) {
    try {
        const body = await req.json();
        const { name, email, password } = body;

        if (!email || !password || !name) {
            return NextResponse.json({ error: "Missing fields" }, { status: 400 });
        }

        // check existing user
        const existing = await prisma.user.findUnique({ where: { email } });
        if (existing) {
            return NextResponse.json({ error: "User already exists please Login" }, { status: 409 });
        }

        // hash password
        const hashed = await bcrypt.hash(password, 10);

        // create user
        const user = await prisma.user.create({
            data: {
                name,
                email,
                password: hashed,
                provider: "credentials",
            },
        });

        // create token (don't put password in the token)
        const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, {
            expiresIn: JWT_EXPIRES_IN,
        });

        // set httpOnly cookie
        const res = NextResponse.json(
            { message: "User created", user: { id: user.id, name: user.name, email: user.email } },
            { status: 201 }
        );

        // cookie options: httpOnly, secure in prod, path=/, maxAge in seconds
        res.cookies.set({
            name: "token",
            value: token,
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            path: "/",
            maxAge: 60 * 60 * 24 * 7, // 7 days (match JWT_EXPIRES_IN if desired)
        });

        return res;
    } catch (err) {
        console.error("[SIGNUP_ERROR]", err);
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}