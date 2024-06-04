import { FastifyInstance } from "fastify";

export async function pluginComponentCleanup(
  fastify: FastifyInstance,
  pluginId: number
) {
  await fastify.sequelize.models.FrontendComponent.destroy({
    where: {
      pluginId,
    },
  });
  await fastify.sequelize.models.PluginComponent.destroy({
    where: {
      pluginId,
    },
  });

  await fastify.sequelize.models.ContentType.destroy({
    where: {
      pluginId,
    },
  });
}

export async function pluginCleanup(
  fastify: FastifyInstance,
  pluginId: number
) {
  // await pluginComponentCleanup(fastify, pluginId); //Ideally this should be handled by the database CASCADE delete functionality

  await fastify.sequelize.models.Plugin.destroy({
    where: {
      id: pluginId,
    },
    cascade: true,
  });
}
