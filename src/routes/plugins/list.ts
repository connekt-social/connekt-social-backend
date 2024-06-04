import { FastifyPluginAsync } from "fastify";

const listPlugins: FastifyPluginAsync = async (
  fastify,
  opts
): Promise<void> => {
  fastify.get("/", async function (request, reply) {
    const plugins = await fastify.sequelize.models.Plugin.findAll();
    return plugins;
  });

  fastify.get<{
    Params: {
      id: string;
    };
  }>("/:id", async function (request, reply) {
    const { id: idString } = request.params;
    const id = parseInt(idString);
    const plugin = await fastify.sequelize.models.Plugin.findOne({
      where: {
        id,
      },
      include: [
        {
          model: fastify.sequelize.models.PluginComponent,
          include: [
            {
              model: fastify.sequelize.models.FrontendComponent,
            },
          ],
        },
      ],
    });
    return plugin;
  });
};

export default listPlugins;
