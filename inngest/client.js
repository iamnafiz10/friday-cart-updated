import {Inngest} from "inngest";

// Create the Inngest client (required for Clerk webhooks & function auth)
export const inngest = new Inngest({
    id: "FridayCartUpdated",
    eventKey: process.env.INNGEST_EVENT_KEY, // 👈 add this line
});