import {NextResponse} from "next/server";
import imageKit from "@/configs/imageKit";
import prisma from "@/lib/prisma";
import {getCurrentUser} from "@/lib/serverAuth";

// Create the store
export async function POST(request) {
    try {
        const user = await getCurrentUser(request);
        if (!user) {
            return NextResponse.json({error: "Unauthorized"}, {status: 401});
        }

        const formData = await request.formData();
        const name = formData.get("name");
        const username = formData.get("username");
        const description = formData.get("description");
        const email = formData.get("email");
        const contact = formData.get("contact");
        const address = formData.get("address");
        const image = formData.get("image");

        if (!name || !username || !description || !email || !contact || !address || !image) {
            return NextResponse.json({error: "Missing store info"}, {status: 400});
        }

        // Check if user already has a store
        const existingStore = await prisma.store.findFirst({where: {userId: user.id}});
        if (existingStore) {
            return NextResponse.json({status: existingStore.status});
        }

        // Check if username is already taken
        const isUsernameTaken = await prisma.store.findFirst({
            where: {username: username.toLowerCase()}
        });
        if (isUsernameTaken) {
            return NextResponse.json({error: "Username already taken"}, {status: 400});
        }

        // Upload image to ImageKit
        const buffer = Buffer.from(await image.arrayBuffer());
        const response = await imageKit.upload({
            file: buffer,
            fileName: image.name,
            folder: "logos"
        });
        const optimizedImage = imageKit.url({
            path: response.filePath,
            transformation: [
                {quality: 'auto'},
                {format: 'webp'},
                {width: '512'},
            ]
        });

        // Create new store
        const newStore = await prisma.store.create({
            data: {
                userId: user.id,
                name,
                description,
                username: username.toLowerCase(),
                email,
                contact,
                address,
                logo: optimizedImage
            }
        });

        // Link store to user
        await prisma.user.update({
            where: {id: user.id},
            data: {store: {connect: {id: newStore.id}}}
        });

        return NextResponse.json({message: "Applied, waiting for approval"});
    } catch (error) {
        console.error(error);
        return NextResponse.json({error: error.message || "Failed to create store"}, {status: 400});
    }
}

// Check if user already has a store
export async function GET(request) {
    try {
        const user = await getCurrentUser(request);
        if (!user) {
            return NextResponse.json({error: "Unauthorized"}, {status: 401});
        }

        const store = await prisma.store.findFirst({where: {userId: user.id}});
        if (store) {
            return NextResponse.json({status: store.status});
        }

        return NextResponse.json({status: "Not registered"});
    } catch (error) {
        console.error(error);
        return NextResponse.json({error: error.message || "Failed to fetch store status"}, {status: 400});
    }
}