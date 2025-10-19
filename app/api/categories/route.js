import {NextResponse} from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
    try {
        const categories = await prisma.category.findMany({
            orderBy: {createdAt: "desc"},
        });

        // ✅ Always return a valid array
        return NextResponse.json({categories: categories || []});
    } catch (error) {
        console.error("❌ Error fetching categories:", error);
        // ✅ Return empty array instead of crashing frontend
        return NextResponse.json({categories: []}, {status: 200});
    }
}