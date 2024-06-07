import { Static, Type } from "@sinclair/typebox";
import { FastifyPluginAsync } from "fastify";

const contentFormats: FastifyPluginAsync = async (
  fastify,
  opts
): Promise<void> => {
  fastify.get("/", async function (request, reply) {
    const formats = await fastify.sequelize.models.ContentFormat.findAll();
    return formats;
  });

  const ContentFormatSchema = Type.Object({
    code: Type.String(),
    name: Type.String(),
    description: Type.Optional(Type.String()),
    schema: Type.Any(), // JSON can be represented as any object
    uiSchema: Type.Optional(Type.Any()), // Optional JSON object
    titlePath: Type.Optional(Type.String()),
    thumbnailPath: Type.Optional(Type.String()),
    captionPath: Type.Optional(Type.String()),
  });

  type ContentFormatType = Static<typeof ContentFormatSchema>;
  fastify.post<{
    Body: ContentFormatType;
  }>(
    "/",
    {
      schema: {
        body: ContentFormatSchema,
      },
    },
    async function (request, reply) {
      const result = await fastify.sequelize.models.ContentFormat.create(
        request.body
      );

      return result;
    }
  );
};

export default contentFormats;
