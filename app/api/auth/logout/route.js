import {NextResponse} from "next/server";

export async function POST(req) {
    try {
        const res = NextResponse.json({message: "Logged out successfully"});

        // Delete the cookie
        res.cookies.set({
            name: "token",
            value: "",
            path: "/",
            httpOnly: true,
            expires: new Date(0), // expire immediately
            sameSite: "lax",
            secure: process.env.NODE_ENV === "production",
        });

        return res;
    } catch (err) {
        console.error("Logout error:", err);
        return NextResponse.json({error: "Failed to logout"}, {status: 500});
    }
}