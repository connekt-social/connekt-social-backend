import fp from "fastify-plugin";
import userCreate from "./create";

export default fp(async (fastify, opts) => {
  fastify.register(userCreate, { prefix: "/users/create" });
});
