import { NextResponse } from "next/server";

export async function POST() {
    try {
        const response = new NextResponse(
            JSON.stringify({ message: "Logged out successfully" }),
            {
                status: 200,
                headers: { "Content-Type": "application/json" },
            }
        );

        response.cookies.set("token", "", {
            path: "/",
            httpOnly: true,
            expires: new Date(0),
            sameSite: "lax",
            secure: process.env.NODE_ENV === "production",
        });

        return response;
    } catch (err) {
        console.error("Logout error:", err);
        return NextResponse.json({ error: "Failed to logout" }, { status: 500 });
    }
}