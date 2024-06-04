import { PluginFunction } from "@prisma/client";
import { FastifyInstance } from "fastify";

export default async function installationSwitch(
  fastify: FastifyInstance,
  component: { data: any; function: PluginFunction },
  pluginId: number,
  componentId: number
) {
  switch (component.function) {
    case "CONTENTTYPE":
      await fastify.prisma.contentType.create({
        data: {
          ...component.data,
        },
      });
      break;

    case "PLUGIN_SETTINGS_TAB":
      await fastify.prisma.frontendComponent.create({
        data: {
          componentName: component.data.componentName,
          entryPoint: component.data.entryPoint,
          pluginComponentId: componentId,
          propSchema: component.data.propSchema,
        },
      });
      break;

    default:
      break;
  }
}
