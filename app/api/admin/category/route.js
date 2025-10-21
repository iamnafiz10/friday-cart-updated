import {NextResponse} from "next/server";
import prisma from "@/lib/prisma";
import authAdmin from "@/middlewares/authAdmin";
import {getCurrentUser} from "@/lib/serverAuth";

// ✅ Add new category
export async function POST(request) {
    try {
        // 🔹 Get current user
        const user = await getCurrentUser(request);
        if (!user) {
            return NextResponse.json({error: "Unauthorized"}, {status: 401});
        }

        // 🔹 Check if user is admin
        const isAdmin = await authAdmin(user.id);
        if (!isAdmin) {
            return NextResponse.json({error: "Not authorized"}, {status: 401});
        }

        const {category} = await request.json();

        if (!category?.name) {
            return NextResponse.json({error: "Category name is required"}, {status: 400});
        }

        await prisma.category.create({
            data: {name: category.name},
        });

        return NextResponse.json({message: "Category added successfully"});
    } catch (error) {
        console.error(error);
        return NextResponse.json({error: error.code || error.message}, {status: 400});
    }
}

// ✅ Delete category
export async function DELETE(request) {
    try {
        // 🔹 Get current user
        const user = await getCurrentUser(request);
        if (!user) {
            return NextResponse.json({error: "Unauthorized"}, {status: 401});
        }

        // 🔹 Check admin
        const isAdmin = await authAdmin(user.id);
        if (!isAdmin) {
            return NextResponse.json({error: "Not authorized"}, {status: 401});
        }

        const {searchParams} = request.nextUrl;
        const id = searchParams.get("id");
        if (!id) {
            return NextResponse.json({error: "Category ID is required"}, {status: 400});
        }

        await prisma.category.delete({
            where: {id},
        });

        return NextResponse.json({message: "Category deleted successfully"});
    } catch (error) {
        console.error(error);
        return NextResponse.json({error: error.code || error.message}, {status: 400});
    }
}

// ✅ Get all categories
export async function GET(request) {
    try {
        // 🔹 Get current user
        const user = await getCurrentUser(request);
        if (!user) {
            return NextResponse.json({error: "Unauthorized"}, {status: 401});
        }

        // 🔹 Check admin
        const isAdmin = await authAdmin(user.id);
        if (!isAdmin) {
            return NextResponse.json({error: "Not authorized"}, {status: 401});
        }

        const categories = await prisma.category.findMany({
            orderBy: {createdAt: "desc"},
        });

        return NextResponse.json({categories});
    } catch (error) {
        console.error(error);
        return NextResponse.json({error: error.code || error.message}, {status: 400});
    }
}