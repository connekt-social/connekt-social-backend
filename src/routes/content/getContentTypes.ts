import { FastifyPluginAsync } from "fastify";

const getContentTypes: FastifyPluginAsync = async (
  fastify,
  opts
): Promise<void> => {
  fastify.get("/", async function (request, reply) {
    const contentTypes = await fastify.prisma.contentType.findMany({
      where: {
        plugin: {
          enabled: true,
        },
      },
    });
    return contentTypes;
  });
};

export default getContentTypes;
