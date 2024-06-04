import { FastifyInstance } from "fastify";
import { PluginFunction } from "../../entities/PluginComponent";

export default async function installationSwitch(
  fastify: FastifyInstance,
  component: { data: any; function: PluginFunction },
  pluginId: number,
  componentId: number
) {
  switch (component.function) {
    case "CONTENTTYPE":
      await fastify.sequelize.models.ContentType.create({
        ...component.data,
        pluginId,
      });
      break;

    case "PLUGIN_SETTINGS_TAB":
      await fastify.sequelize.models.FrontendComponent.create({
        componentName: component.data.componentName,
        entryPoint: component.data.entryPoint,
        pluginComponentId: componentId,
        propSchema: component.data.propSchema,
        pluginId,
      });
      break;

    default:
      break;
  }
}
