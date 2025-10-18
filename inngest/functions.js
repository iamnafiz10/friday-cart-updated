import {inngest} from "./client";
import prisma from "@/lib/prisma";

export const syncUserCreation = inngest.createFunction(
    {id: "sync-user-create"},
    {event: "clerk/user.created"},
    async ({event}) => {
        console.log("🟢 Received event:", event.name);
        console.log("🟡 Raw event data:", JSON.stringify(event, null, 2));
        const {data} = event;

        // Add safe fallback values
        const email = data?.email_addresses?.[0]?.email_address || "";
        const name = `${data?.first_name || ""} ${data?.last_name || ""}`.trim();
        const image = data?.image_url || "";
        await prisma.user.create({
            data: {
                id: data.id,
                email,
                name,
                image,
            },
        });
    }
);

export const syncUserUpdation = inngest.createFunction(
    {id: "sync-user-update"},
    {event: "clerk/user.updated"},
    async ({event}) => {
        const {data} = event;

        const email = data?.email_addresses?.[0]?.email_address || "";
        const name = `${data?.first_name || ""} ${data?.last_name || ""}`.trim();
        const image = data?.image_url || "";

        await prisma.user.update({
            where: {id: data.id},
            data: {email, name, image},
        });
    }
);

export const syncUserDeletion = inngest.createFunction(
    {id: "sync-user-delete"},
    {event: "clerk/user.deleted"},
    async ({event}) => {
        const {data} = event;
        await prisma.user.delete({where: {id: data.id}});
    }
);

export const deleteCouponOnExpiry = inngest.createFunction(
    {id: 'delete-coupon-on-expiry'},
    {event: 'app/coupon.expired'},
    async ({event, step}) => {
        const {data} = event
        const expiryDate = new Date(data.expires_at)
        await step.sleepUntil('wait-for-expiry', expiryDate)
        await step.run('delete-coupon-from-database', async () => {
            await prisma.coupon.delete({
                where: {code: data.code}
            })
        })
    }
)