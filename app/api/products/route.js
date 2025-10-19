import prisma from "@/lib/prisma";
import {NextResponse} from "next/server";

export async function GET() {
    try {
        let products = await prisma.product.findMany({
            where: {inStock: true},
            include: {
                rating: {
                    select: {
                        createdAt: true,
                        rating: true,
                        review: true,
                        user: {select: {name: true, image: true}},
                    },
                },
                store: true,
            },
            orderBy: {createdAt: "desc"},
        });

        // ✅ Filter safely (avoid TypeError if store is null)
        products = (products || []).filter(
            (product) => product.store?.isActive
        );

        // ✅ Always return an array
        return NextResponse.json({products});
    } catch (error) {
        console.error("❌ Error fetching products:", error);
        // ✅ Prevent frontend crash
        return NextResponse.json({products: []}, {status: 200});
    }
}