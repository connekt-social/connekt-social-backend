import fp from "fastify-plugin";
import fastifyEnv from "@fastify/env";

// The use of fastify-plugin is required to be able
// to export the decorators to the outer scope
export default fp(async (fastify, opts) => {
  await fastify.register(fastifyEnv, {
    schema: {
      type: "object",
      properties: {
        PORT: {
          type: "string",
        },
        NODE_ENV: {
          type: "string",
        },
        FRONTEND_URL: {
          type: "string",
        },
        JWT_SECRET: {
          type: "string",
        },
      },
      required: ["PORT", "NODE_ENV", "FRONTEND_URL", "JWT_SECRET"],
    },
    dotenv: true,
  });
});

// When using .decorate you have to specify added properties for Typescript
declare module "fastify" {
  export interface FastifyInstance {
    config: {
      PORT: string;
      NODE_ENV: string;
      FRONTEND_URL: string;
      JWT_SECRET: string;
    };
  }
}
