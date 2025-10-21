import {NextResponse} from "next/server";
import prisma from "@/lib/prisma";
import {getCurrentUser} from "@/lib/serverAuth";

// Place an order
export async function POST(request) {
    try {
        const user = await getCurrentUser(request);
        if (!user) {
            return NextResponse.json({error: "Not authorized"}, {status: 401});
        }

        const {addressId, items, couponCode, paymentMethod} = await request.json();

        // Validate input
        if (!addressId || !paymentMethod || !items || !Array.isArray(items) || items.length === 0) {
            return NextResponse.json({error: "Missing order details"}, {status: 400});
        }

        let coupon = null;
        if (couponCode) {
            coupon = await prisma.coupon.findUnique({
                where: {code: couponCode.toUpperCase()},
            });
            if (!coupon) {
                return NextResponse.json({error: "Coupon not found"}, {status: 400});
            }
        }

        // Coupon for new users
        if (coupon?.forNewUser) {
            const userOrders = await prisma.order.findMany({where: {userId: user.id}});
            if (userOrders.length > 0) {
                return NextResponse.json({error: "Coupon valid for new users only"}, {status: 400});
            }
        }

        // Group items by store
        const ordersByStore = new Map();
        for (const item of items) {
            const product = await prisma.product.findUnique({where: {id: item.id}});
            if (!product) continue;
            const storeId = product.storeId;
            if (!ordersByStore.has(storeId)) ordersByStore.set(storeId, []);
            ordersByStore.get(storeId).push({...item, price: product.price});
        }

        let isShippingFeeAdded = false;

        // Create orders per store
        for (const [storeId, sellerItems] of ordersByStore.entries()) {
            let total = sellerItems.reduce((acc, item) => acc + item.price * item.quantity, 0);

            if (coupon) total -= (total * coupon.discount) / 100;

            // Add shipping fee once
            if (!isShippingFeeAdded) {
                total += 5; // shipping fee
                isShippingFeeAdded = true;
            }

            await prisma.order.create({
                data: {
                    user: {connect: {id: user.id}},
                    store: {connect: {id: storeId}},
                    address: {connect: {id: addressId}},
                    total: parseFloat(total.toFixed(2)),
                    paymentMethod,
                    isCouponUsed: !!coupon,
                    coupon: coupon || {},
                    orderItems: {
                        create: sellerItems.map(item => ({
                            product: {connect: {id: item.id}},
                            quantity: item.quantity,
                            price: item.price,
                        })),
                    },
                },
            });
        }

        // Clear cart
        await prisma.user.update({
            where: {id: user.id},
            data: {cart: {}},
        });

        return NextResponse.json({message: "Order placed successfully"});
    } catch (error) {
        console.error(error);
        return NextResponse.json({error: error.message || "Failed to place order"}, {status: 400});
    }
}

// Get orders for current user
export async function GET(request) {
    try {
        const user = await getCurrentUser(request);
        if (!user) {
            return NextResponse.json({error: "Not authorized"}, {status: 401});
        }

        const orders = await prisma.order.findMany({
            where: {userId: user.id},
            include: {
                orderItems: {include: {product: true}},
                address: true,
            },
            orderBy: {createdAt: "desc"},
        });

        return NextResponse.json({orders});
    } catch (error) {
        console.error(error);
        return NextResponse.json({error: error.message || "Failed to fetch orders"}, {status: 400});
    }
}