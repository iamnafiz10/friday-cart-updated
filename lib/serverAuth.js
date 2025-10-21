import jwt from "jsonwebtoken";
import prisma from "./prisma";

const JWT_SECRET = process.env.JWT_SECRET;

// SERVER-SIDE ONLY
export async function getCurrentUser(req) {
    try {
        let token;

        // Next.js App Router cookies
        if (req?.cookies?.get) {
            token = req.cookies.get("token")?.value;
        }

        // Fallback: Authorization header or cookie header
        if (!token && req?.headers?.get) {
            const authHeader = req.headers.get("Authorization") || "";
            if (authHeader.startsWith("Bearer ")) {
                token = authHeader.split(" ")[1];
            } else {
                const cookieHeader = req.headers.get("cookie") || "";
                const match = cookieHeader.match(/token=([^;]+)/);
                token = match ? match[1] : null;
            }
        }

        if (!token) return null;

        // Verify JWT
        const payload = jwt.verify(token, JWT_SECRET);

        // Fetch user (include isAdmin)
        const user = await prisma.user.findUnique({
            where: {id: payload.id},
            select: {
                id: true,
                name: true,
                email: true,
                image: true,
                isAdmin: true, // ✅ added
            },
        });

        return user || null;
    } catch (err) {
        console.error("getCurrentUser error:", err);
        return null;
    }
}