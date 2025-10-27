import {NextResponse} from "next/server";
import {getCurrentUser} from "@/lib/serverAuth";
import authSeller from "@/middlewares/authSeller";
import imageKit from "@/configs/imageKit";
import prisma from "@/lib/prisma";

// Add new product
export async function POST(request) {
    try {
        const user = await getCurrentUser(request);
        if (!user) {
            return NextResponse.json({error: "Not authorized"}, {status: 401});
        }

        const storeId = await authSeller(user);
        if (!storeId) {
            return NextResponse.json({error: "Not authorized"}, {status: 401});
        }

        // Get the data from the form
        const formData = await request.formData();
        const name = formData.get("name");
        const description = formData.get("description");
        const mrp = Number(formData.get("mrp"));
        const price = Number(formData.get("price"));
        const category = formData.get("category");
        const images = formData.getAll("images");

        if (!name || !description || !mrp || !price || !category || images.length < 1) {
            return NextResponse.json({error: "Missing product details"}, {status: 400});
        }

        // Upload images to ImageKit
        const imagesUrl = await Promise.all(images.map(async (image) => {
            const buffer = Buffer.from(await image.arrayBuffer());
            const response = await imageKit.upload({
                file: buffer,
                fileName: image.name,
                folder: "products",
            });
            return imageKit.url({
                path: response.filePath,
                transformation: [
                    {quality: 'auto'},
                    {format: 'webp'},
                    {width: '1024'},
                ]
            });
        }));

        await prisma.product.create({
            data: {
                name,
                description,
                mrp,
                price,
                category,
                images: imagesUrl,
                storeId
            }
        });

        return NextResponse.json({message: "Product added successfully"});
    } catch (error) {
        console.error(error);
        return NextResponse.json({error: error.message || "Failed to add product"}, {status: 400});
    }
}

// Get all products for a seller
export async function GET(request) {
    try {
        const user = await getCurrentUser(request);
        if (!user) {
            return NextResponse.json({error: "Not authorized"}, {status: 401});
        }

        const storeId = await authSeller(user);
        if (!storeId) {
            return NextResponse.json({error: "Not authorized"}, {status: 401});
        }

        const products = await prisma.product.findMany({where: {storeId}});
        return NextResponse.json({products});
    } catch (error) {
        console.error(error);
        return NextResponse.json({error: error.message || "Failed to fetch products"}, {status: 400});
    }
}

// Delete product
export async function DELETE(request) {
    try {
        const user = await getCurrentUser(request);
        if (!user) {
            return NextResponse.json({error: "Not authorized"}, {status: 401});
        }

        const storeId = await authSeller(user);
        if (!storeId) {
            return NextResponse.json({error: "Not authorized"}, {status: 401});
        }

        const {searchParams} = new URL(request.url);
        const productId = searchParams.get("id");

        if (!productId) {
            return NextResponse.json({error: "Product ID required"}, {status: 400});
        }

        // Check if product belongs to current seller store
        const product = await prisma.product.findUnique({
            where: {id: productId},
        });

        if (!product || product.storeId !== storeId) {
            return NextResponse.json({error: "Product not found or unauthorized"}, {status: 404});
        }

        await prisma.product.delete({where: {id: productId}});

        return NextResponse.json({message: "Product deleted successfully"});
    } catch (error) {
        console.error(error);
        return NextResponse.json({error: error.message || "Failed to delete product"}, {status: 500});
    }
}