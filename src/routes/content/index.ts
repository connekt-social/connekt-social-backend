import fp from "fastify-plugin";
import uploadFile from "./upload";

export default fp(async (fastify, opts) => {
  fastify.register(
    async function (fastify, opts) {
      fastify.register(uploadFile, { prefix: "/file" });
    },
    { prefix: "/content" }
  );
});
