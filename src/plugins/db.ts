import fp from "fastify-plugin";
import dotenv from "dotenv";
import { Model, ModelCtor, Sequelize } from "sequelize-typescript";
import path from "path";

dotenv.config();

export const sequelize = new Sequelize(process.env.DATABASE_URL!, {
  models: [path.join(__dirname, "../entities")], // or [Player, Team],
});

// The use of fastify-plugin is required to be able
// to export the decorators to the outer scope
export default fp(async (fastify, opts) => {
  // const prisma = new PrismaClient();
  // fastify.decorate("prisma", prisma);
  // fastify.addHook("onClose", async (server) => {
  //   await server.prisma.$disconnect();
  // });

  // const sequelize = new Sequelize({
  //   database: process.env.DB_NAME!,
  //   dialect:  'postgres',
  //   username: process.env.DB_USER!,
  //   password: process.env.DB_PASSWORD!,

  //   models: [__dirname + "/models"], // or [Player, Team],
  // });

  fastify.decorate("sequelize", sequelize);
});

// When using .decorate you have to specify added properties for Typescript
declare module "fastify" {
  export interface FastifyInstance {
    // prisma: PrismaClient;
    sequelize: Sequelize;
  }
}

declare module "sequelize-typescript" {
  interface GenericModelsInterface {
    [key: string]: ModelCtor<Model<any, any>>;
  }
  export interface DefinedModels extends GenericModelsInterface {}
  export interface Sequelize {
    models: DefinedModels;
  }
}
