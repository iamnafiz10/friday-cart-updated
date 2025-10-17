import {PrismaClient} from "@prisma/client";
import {PrismaNeon} from "@prisma/adapter-neon";
import {neonConfig} from "@neondatabase/serverless";
import ws from "ws";

// ✅ Configure Neon for WebSocket + Fetch
neonConfig.webSocketConstructor = ws;
neonConfig.poolQueryViaFetch = true;

const connectionString = process.env.DATABASE_URL;

// ✅ Initialize Neon adapter
const adapter = new PrismaNeon({connectionString});

// ✅ Create Prisma client with adapter
const prismaClient = new PrismaClient({adapter});

// ✅ Prevent multiple instances during development (Next.js HMR)
const globalForPrisma = globalThis;
export const prisma = globalForPrisma.prisma || prismaClient;

if (process.env.NODE_ENV !== "production") {
    globalForPrisma.prisma = prisma;
}

export default prisma;