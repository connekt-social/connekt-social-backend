import { FastifyPluginAsync } from "fastify";

const getContentTypes: FastifyPluginAsync = async (
  fastify,
  opts
): Promise<void> => {
  fastify.get<{
    Querystring: {
      code?: string;
    };
  }>("/", async function (request, reply) {
    const { code } = request.query;
    const contentTypes = await fastify.sequelize.models.ContentType.findAll({
      where: code
        ? {
            code,
          }
        : undefined,
      include: [
        {
          model: fastify.sequelize.models.Plugin,
          where: {
            enabled: true,
          },
          attributes: ["id", "name", "version"],
        },
      ],
    });
    return contentTypes;
  });
};

export default getContentTypes;
