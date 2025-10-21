import {NextResponse} from "next/server";

export async function GET(req) {
    try {
        // Get token from cookies
        const token = req.cookies.get("token")?.value || null;

        return NextResponse.json({token});
    } catch (err) {
        console.error("Failed to get token:", err);
        return NextResponse.json({token: null}, {status: 500});
    }
}