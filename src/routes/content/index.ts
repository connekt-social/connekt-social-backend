import fp from "fastify-plugin";
import uploadFile from "./uploadfile";
import getContentTypes from "./getContentTypes";
import contentItem from "./contentItem";
import contentFormats from "./contentFormats";

export default fp(async (fastify, opts) => {
  fastify.register(
    async function (fastify, opts) {
      fastify.addHook("preHandler", fastify.userAuth);
      fastify.register(uploadFile, { prefix: "/file" });
      fastify.register(getContentTypes, { prefix: "/types" });
      fastify.register(contentFormats, { prefix: "/formats" });
      fastify.register(contentItem, { prefix: "/items" });
    },
    { prefix: "/content" }
  );
});
