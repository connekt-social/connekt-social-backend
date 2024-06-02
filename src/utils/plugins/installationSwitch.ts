import { PluginFunction } from "@prisma/client";
import { FastifyInstance } from "fastify";

export default async function installationSwitch(
  fastify: FastifyInstance,
  component: { data: any; function: PluginFunction },
  pluginId: number
) {
  switch (component.function) {
    case "CONTENTTYPE":
      await fastify.prisma.contentType.create({
        data: {
          ...component.data,
        },
      });
      break;
    default:
      break;
  }
}
