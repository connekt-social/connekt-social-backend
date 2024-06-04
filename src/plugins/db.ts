import { PrismaClient } from "@prisma/client";
import fp from "fastify-plugin";

// The use of fastify-plugin is required to be able
// to export the decorators to the outer scope
export default fp(async (fastify, opts) => {
  const prisma = new PrismaClient();
  fastify.decorate("prisma", prisma);
  fastify.addHook("onClose", async (server) => {
    await server.prisma.$disconnect();
  });
});

// When using .decorate you have to specify added properties for Typescript
declare module "fastify" {
  export interface FastifyInstance {
    prisma: PrismaClient;
  }
}
