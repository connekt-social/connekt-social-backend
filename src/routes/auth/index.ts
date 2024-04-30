import fp from "fastify-plugin";
import userCreate from "./create";
import userLogin from "./login";

export default fp(async (fastify, opts) => {
  fastify.register(
    async function (fastify, opts) {
      fastify.register(userCreate, { prefix: "/create" });
      fastify.register(userLogin, { prefix: "/login" });
    },
    { prefix: "/auth" }
  );
});
