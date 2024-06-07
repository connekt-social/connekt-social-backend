import { FastifyPluginAsync } from "fastify";

const uploadFile: FastifyPluginAsync = async (fastify, opts): Promise<void> => {
  fastify.post("/", async function (request, reply) {
    const data = await request.file();
    if (!data) {
      return reply.badRequest("No file received");
    }

    const buff = await data.toBuffer();

    const fileUploadPlugin =
      await fastify.sequelize.models.PluginComponent.findOne({
        where: {
          function: "FILESTORAGE",
        },
        include: [
          {
            model: fastify.sequelize.models.Plugin,
            where: {
              enabled: true,
            },
          },
        ],
      });

    if (!fileUploadPlugin) {
      return reply.badRequest("No file upload plugin found");
    }

    const plugin = await import(fileUploadPlugin.name);

    console.log(plugin.default.default);
    const url = await plugin.default.default.upload(
      {
        uploadPath: `testFiles/${data.filename}`,
        contents: buff,
      },
      fileUploadPlugin.plugin.settings
    );

    return { url };
  });
};

export default uploadFile;
