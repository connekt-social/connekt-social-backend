import { FastifyPluginAsync } from "fastify";

const getContentTypes: FastifyPluginAsync = async (
  fastify,
  opts
): Promise<void> => {
  fastify.get("/", async function (request, reply) {
    const contentTypes = await fastify.sequelize.models.ContentType.findAll();
    return contentTypes;
  });
};

export default getContentTypes;
