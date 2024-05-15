import { FastifyPluginAsync } from "fastify";

const uploadFile: FastifyPluginAsync = async (fastify, opts): Promise<void> => {
  fastify.post("/", async function (request, reply) {
    const data = await request.file();
    console.log(data);
    if (!data) {
      return reply.badRequest("No file received");
    }

    const buff = await data.toBuffer();

    const fileUploadPlugin = await fastify.prisma.pluginComponent.findFirst({
      where: {
        function: "FILESTORAGE",
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

      //This should be loaded from the plugin configuration
      {
        serviceKeyPath: "",
        storageBucket: "",
      }
    );

    return { url };
  });
};

export default uploadFile;
