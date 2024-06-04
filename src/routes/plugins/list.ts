import { FastifyPluginAsync } from "fastify";

const listPlugins: FastifyPluginAsync = async (
  fastify,
  opts
): Promise<void> => {
  fastify.get("/", async function (request, reply) {
    const plugins = await fastify.prisma.plugin.findMany();
    return plugins;
  });

  fastify.get<{
    Params: {
      id: string;
    };
  }>("/:id", async function (request, reply) {
    const { id: idString } = request.params;
    const id = parseInt(idString);
    const plugin = await fastify.prisma.plugin.findFirst({
      where: {
        id,
      },
      include: {
        components: {
          include: {
            frontendComponent: true,
          },
        },
      },
    });
    return plugin;
  });
};

export default listPlugins;
