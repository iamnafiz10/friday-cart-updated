import prisma from "@/lib/prisma";
import {NextResponse} from "next/server";

export async function GET(req) {
    const userId = req.nextUrl.searchParams.get("userId");
    if (!userId) return NextResponse.json({store: null});

    const store = await prisma.store.findUnique({
        where: {userId}
    });

    return NextResponse.json({store});
}