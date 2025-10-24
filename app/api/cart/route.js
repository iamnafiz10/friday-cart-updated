// Local Storage Cart Logic Working By Frontend

// import {getCurrentUser} from "@/lib/serverAuth";
// import prisma from "@/lib/prisma";

// import {NextResponse} from "next/server";
//
// // Update user cart
// export async function POST(request) {
//     try {
//         const user = await getCurrentUser(request);
//
//         if (!user) {
//             return NextResponse.json({error: "Not authorized"}, {status: 401});
//         }
//
//         const {cart} = await request.json();
//
//         // Update the existing user cart
//         await prisma.user.update({
//             where: {id: user.id},
//             data: {cart: cart || {}}, // fallback to empty object
//         });
//
//         return NextResponse.json({message: "Cart updated successfully"});
//     } catch (error) {
//         console.error("Cart POST error:", error);
//         return NextResponse.json({error: error.message}, {status: 400});
//     }
// }
//
// // Get user cart
// export async function GET(request) {
//     try {
//         const user = await getCurrentUser(request);
//
//         if (!user) {
//             return NextResponse.json({error: "Not authorized"}, {status: 401});
//         }
//
//         // Return empty cart if missing
//         const cart = user.cart || {};
//
//         return NextResponse.json({cart});
//     } catch (error) {
//         console.error("Cart GET error:", error);
//         return NextResponse.json({error: error.message}, {status: 400});
//     }
// }