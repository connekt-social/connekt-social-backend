import { FastifyPluginAsync } from "fastify";
import { readFileSync } from "fs";
import { PluginFunction } from "../../entities/PluginComponent";

const frontendComponents: FastifyPluginAsync = async (
  fastify,
  opts
): Promise<void> => {
  fastify.get<{
    Querystring: {
      function: PluginFunction;
      pluginId?: number;
    };
  }>(
    "/",
    {
      schema: {
        querystring: {
          type: "object",
          properties: {
            function: {
              type: "string",
            },
            pluginId: {
              type: "number",
            },
          },
          required: ["function"],
        },
      },
    },
    async function (request, reply) {
      const { function: functionType, pluginId } = request.query;
      const frontendComponents =
        await fastify.sequelize.models.PluginComponent.findAll({
          where: {
            function: functionType,
            pluginId,
          },
          include: fastify.sequelize.models.FrontendComponent,
        });
      return frontendComponents;
    }
  );

  fastify.get<{
    Params: {
      id: string;
    };
  }>("/:id", async function (request, reply) {
    const { id: idString } = request.params;
    const id = parseInt(idString);
    const frontendComponent =
      await fastify.sequelize.models.FrontendComponent.findOne({
        where: {
          id,
        },
        include: fastify.sequelize.models.PluginComponent,
      });

    if (!frontendComponent) {
      return reply.notFound("Frontend Component not found");
    }

    const src = readFileSync(frontendComponent.entryPoint, "utf-8");

    return reply
      .header("Content-Type", "application/javascript; charset=utf-8")
      .send(src);
  });
};

export default frontendComponents;
