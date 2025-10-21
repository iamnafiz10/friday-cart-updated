import {NextResponse} from "next/server";
import {getCurrentUser} from "@/lib/serverAuth";
import authSeller from "@/middlewares/authSeller";
import prisma from "@/lib/prisma";

// Toggle stock of a product
export async function POST(request) {
    try {
        const user = await getCurrentUser(request);
        if (!user) {
            return NextResponse.json({error: "Unauthorized"}, {status: 401});
        }

        const {productId} = await request.json();
        if (!productId) {
            return NextResponse.json(
                {error: "Missing details: productId"},
                {status: 400}
            );
        }

        const storeId = await authSeller(user);
        if (!storeId) {
            return NextResponse.json({error: "Not authorized"}, {status: 401});
        }

        // Check if product exists
        const product = await prisma.product.findFirst({
            where: {id: productId, storeId},
        });

        if (!product) {
            return NextResponse.json({error: "No product found"}, {status: 404});
        }

        await prisma.product.update({
            where: {id: productId},
            data: {inStock: !product.inStock},
        });

        return NextResponse.json({message: "Product stock updated successfully"});
    } catch (error) {
        console.error("Toggle stock error:", error);
        return NextResponse.json(
            {error: error.message || "Failed to update stock"},
            {status: 400}
        );
    }
}