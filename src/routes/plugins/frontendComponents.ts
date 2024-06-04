import { PluginFunction } from "@prisma/client";
import { FastifyPluginAsync } from "fastify";
import { readFileSync } from "fs";

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
      const frontendComponents = await fastify.prisma.pluginComponent.findMany({
        where: {
          function: functionType,
          pluginId,
        },
        include: {
          frontendComponent: true,
        },
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
    const frontendComponent = await fastify.prisma.frontendComponent.findFirst({
      where: {
        id,
      },
      include: {
        pluginComponent: true,
      },
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
