import { FastifyInstance } from "fastify";

export async function pluginComponentCleanup(
  fastify: FastifyInstance,
  pluginId: number
) {
  await fastify.prisma.pluginComponent.deleteMany({
    where: {
      pluginId,
    },
  });

  await fastify.prisma.contentTypeSupportedPlugins.deleteMany({
    where: {
      pluginId,
    },
  });
}

export async function pluginCleanup(
  fastify: FastifyInstance,
  pluginId: number
) {
  await pluginComponentCleanup(fastify, pluginId);

  await fastify.prisma.plugin.delete({
    where: {
      id: pluginId,
    },
  });
}
