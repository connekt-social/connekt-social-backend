import { FastifyPluginAsync } from "fastify";

const pluginApiSwitch: FastifyPluginAsync = async (fastify): Promise<void> => {
  fastify.route<{
    Params: {
      name: string;
      version: string;
    };
  }>({
    url: "/*",
    method: ["GET", "POST", "PUT", "DELETE"],
    handler: async function (request, reply) {
      if (!request.user) {
        return reply.unauthorized("User not found");
      }
      const { url } = request;
      const { name, version } = request.params;

      console.log("url", url);
      console.log("name", name);
      console.log("version", version);

      const pluginComponentRecord =
        await fastify.sequelize.models.PluginComponent.findOne({
          where: {
            name,
            function: "PLUGIN_REST_API",
          },
          include: {
            model: fastify.sequelize.models.Plugin,
            where: {
              version,
            },
          },
        });

      if (!pluginComponentRecord) {
        return reply.notFound("Plugin not found");
      }

      const plugin = await import(
        pluginComponentRecord?.name
        // "../../../../cs-meta-plugin/dist/index.js"
      );
      const component: any = plugin.default.default.config.components.find(
        (component: any) => component.function === "PLUGIN_REST_API"
      );

      if (!component || !component.handler) {
        return reply.notFound("Plugin Component not found");
      }
      const path = url.replace(`/plugins/${name}/${version}/api`, "");

      const response = await component.handler?.({
        request,
        reply,
        fastify,
        path,
        method: request.method,
      });
      return response;
    },
  });
};

export default pluginApiSwitch;
