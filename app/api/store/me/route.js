import {NextResponse} from "next/server";
import prisma from "@/lib/prisma";
import {getCurrentUser} from "@/lib/serverAuth";

export async function GET(req) {
    try {
        const user = await getCurrentUser(req);
        if (!user) return NextResponse.json({store: null});

        const store = await prisma.store.findFirst({
            where: {userId: user.id, status: "approved"},
        });

        return NextResponse.json({store});
    } catch (err) {
        console.error(err);
        return NextResponse.json({store: null});
    }
}