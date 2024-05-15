import fp from "fastify-plugin";
import installPlugin from "./install";

export default fp(async (fastify, opts) => {
  fastify.register(
    async function (fastify, opts) {
      fastify.register(installPlugin, { prefix: "/install" });
    },
    { prefix: "/plugins" }
  );
});
