import { Static, Type } from "@sinclair/typebox";
import Ajv from "ajv";
import { FastifyPluginAsync } from "fastify";

const pluginSettings: FastifyPluginAsync = async (
  fastify,
  opts
): Promise<void> => {
  fastify.get<{
    Params: {
      id: string;
    };
  }>("/", async function (request, reply) {
    const { id: idString } = request.params;
    const id = parseInt(idString);
    const plugin = await fastify.sequelize.models.Plugin.findOne({
      where: {
        id,
      },
    });

    if (!plugin) {
      return reply.notFound("Plugin not found");
    }

    return plugin?.settings ?? {};
  });

  const pluginSettingsUpdateSchema = Type.Object({
    data: Type.Any(),
  });
  type pluginSettingsUpdateType = Static<typeof pluginSettingsUpdateSchema>;
  fastify.put<{
    Params: {
      id: string;
    };
    Body: pluginSettingsUpdateType;
  }>("/", async function (request, reply) {
    const { id: idString } = request.params;
    const id = parseInt(idString);
    const plugin = await fastify.sequelize.models.Plugin.findOne({
      where: {
        id,
      },
    });

    if (!plugin) {
      return reply.notFound("Plugin not found");
    }

    if (!plugin.settingsSchema) {
      return reply.badRequest("The plugin does not require settings");
    }

    let { data } = request.body;

    data = Object.assign({}, plugin.settings, data);

    const validate = new Ajv().compile(plugin.settingsSchema as any);
    const valid = validate(data);

    if (!valid) {
      return reply.badRequest("Invalid data");
    }

    await plugin.update({
      settings: data as any,
    });

    return plugin?.settings;
  });
};

export default pluginSettings;
