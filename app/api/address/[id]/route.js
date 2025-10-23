import prisma from "@/lib/prisma";
import {NextResponse} from "next/server";
import {getCurrentUser} from "@/lib/serverAuth";

export async function DELETE(req, context) {
    try {
        const user = await getCurrentUser(req);
        if (!user) return NextResponse.json({error: "Unauthorized"}, {status: 401});
        const userId = user.id;

        const {id} = await context.params; // ✅ await params

        const address = await prisma.address.findUnique({where: {id}});
        if (!address) return NextResponse.json({error: "Address not found"}, {status: 404});
        if (address.userId !== userId)
            return NextResponse.json({error: "Forbidden"}, {status: 403});

        // 🔹 Check for active orders (ORDER_PLACED, CONFIRMED, SHIPPED)
        const activeOrder = await prisma.order.findFirst({
            where: {
                addressId: id,
                status: {in: ["ORDER_PLACED", "CONFIRMED", "SHIPPED"]},
            },
        });

        if (activeOrder)
            return NextResponse.json(
                {error: "This address is connected with an active order"},
                {status: 400}
            );

        // 🔹 Nullify addressId in CANCELLED or DELIVERED orders
        await prisma.order.updateMany({
            where: {
                addressId: id,
                status: {in: ["CANCELLED", "DELIVERED"]},
            },
            data: {addressId: null},
        });

        // ✅ Now safe to delete address
        await prisma.address.delete({where: {id}});

        return NextResponse.json({message: "Address deleted successfully"});
    } catch (error) {
        console.error("Delete address error:", error);
        return NextResponse.json(
            {error: error.message || "Failed to delete address"},
            {status: 500}
        );
    }
}