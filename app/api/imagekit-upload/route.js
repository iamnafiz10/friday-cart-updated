import {NextResponse} from "next/server";
import ImageKit from "imagekit";

export async function POST(req) {
    try {
        // Read the incoming multipart form data
        const formData = await req.formData();
        const file = formData.get("file");
        const userId = formData.get("userId");

        if (!file) {
            return NextResponse.json({error: "No file uploaded"}, {status: 400});
        }

        // Convert the file into a buffer
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        // Initialize ImageKit
        const imagekit = new ImageKit({
            publicKey: process.env.IMAGEKIT_PUBLIC_KIT,
            privateKey: process.env.IMAGEKIT_PRIVATE_KIT,
            urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT,
        });

        // Upload image to ImageKit
        const uploadResponse = await imagekit.upload({
            file: buffer, // actual file buffer
            fileName: `${userId}_${file.name}`,
            folder: "/user_profiles",
        });

        return NextResponse.json({url: uploadResponse.url}, {status: 200});
    } catch (err) {
        console.error("Image upload error:", err);
        return NextResponse.json(
            {error: err.message || "Image upload failed"},
            {status: 500}
        );
    }
}