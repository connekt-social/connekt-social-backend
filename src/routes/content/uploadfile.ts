import { FastifyPluginAsync } from "fastify";

const uploadFile: FastifyPluginAsync = async (fastify, opts): Promise<void> => {
  fastify.post("/", async function (request, reply) {
    const data = await request.file();
    if (!data) {
      return reply.badRequest("No file received");
    }

    const buff = await data.toBuffer();

    const fileUploadPlugin = await fastify.prisma.pluginComponent.findFirst({
      where: {
        function: "FILESTORAGE",
        plugin: {
          enabled: true,
        },
      },
      include: {
        plugin: true,
      },
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
