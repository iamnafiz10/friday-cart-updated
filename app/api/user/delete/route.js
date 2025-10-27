// app/api/user/delete/route.js
import {NextResponse} from "next/server";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(req) {
    try {
        const body = await req.json();
        const {id, password} = body;

        if (!id || !password) {
            return NextResponse.json(
                {error: "User ID and password required"},
                {status: 400}
            );
        }

        // 1️⃣ Fetch user
        const user = await prisma.user.findUnique({where: {id}});
        if (!user) {
            return NextResponse.json(
                {error: "User not found"},
                {status: 404}
            );
        }

        // 2️⃣ Check password
        const match = await bcrypt.compare(password, user.password || "");
        if (!match) {
            return NextResponse.json(
                {error: "Incorrect password"},
                {status: 401}
            );
        }

        // 3️⃣ Hard delete related data
        try {
            // Delete Ratings by this user
            await prisma.rating.deleteMany({where: {userId: id}});

            // Delete Orders where this user is the buyer
            const buyerOrders = await prisma.order.findMany({where: {userId: id}});
            for (const order of buyerOrders) {
                // Delete OrderItems first
                await prisma.orderItem.deleteMany({where: {orderId: order.id}});
            }
            await prisma.order.deleteMany({where: {userId: id}});

            // Delete Addresses
            await prisma.address.deleteMany({where: {userId: id}});

            // Delete the store if exists
            const store = await prisma.store.findUnique({where: {userId: id}});
            if (store) {
                // Delete Products in the store
                await prisma.product.deleteMany({where: {storeId: store.id}});

                // Delete Orders related to this store
                const storeOrders = await prisma.order.findMany({where: {storeId: store.id}});
                for (const order of storeOrders) {
                    await prisma.orderItem.deleteMany({where: {orderId: order.id}});
                }
                await prisma.order.deleteMany({where: {storeId: store.id}});

                // Finally delete the store
                await prisma.store.delete({where: {id: store.id}});
            }

            // 4️⃣ Finally delete the user
            await prisma.user.delete({where: {id}});

        } catch (deleteError) {
            console.error("Error deleting related data:", deleteError);
            return NextResponse.json(
                {error: deleteError.message || "Failed to delete account due to related data"},
                {status: 500}
            );
        }

        return NextResponse.json({
            success: true,
            message: "Account and all related data deleted successfully",
        });

    } catch (error) {
        console.error("Error deleting user:", error);
        return NextResponse.json(
            {error: "Failed to delete account"},
            {status: 500}
        );
    }
}