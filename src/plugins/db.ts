import fp from "fastify-plugin";
import dotenv from "dotenv";
import { Model, ModelCtor, Sequelize } from "sequelize-typescript";
import path from "path";

dotenv.config();

export const sequelize = new Sequelize(process.env.DATABASE_URL!, {
  models: [path.join(__dirname, "../entities")], // or [Player, Team],
});

export default fp(async (fastify, opts) => {
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
