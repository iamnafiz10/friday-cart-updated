import {PrismaClient} from "@prisma/client";
import {PrismaNeon} from "@prisma/adapter-neon";
import {neonConfig} from "@neondatabase/serverless";
import ws from "ws";

// ✅ Required for Vercel Edge or Serverless
neonConfig.webSocketConstructor = ws;
neonConfig.poolQueryViaFetch = true;

const connectionString = process.env.DATABASE_URL;

// ✅ Use Neon adapter for pooled connection
const adapter = new PrismaNeon({connectionString});
const prismaClient = new PrismaClient({adapter});

// ✅ Prevent multiple client instances during dev
const globalForPrisma = globalThis;
export const prisma = globalForPrisma.prisma || prismaClient;

if (process.env.NODE_ENV !== "production") {
    globalForPrisma.prisma = prisma;
}

export default prisma;