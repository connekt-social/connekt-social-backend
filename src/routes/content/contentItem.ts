import { Static, Type } from "@sinclair/typebox";
import Ajv from "ajv";
import dayjs from "dayjs";
import { FastifyPluginAsync } from "fastify";
import { safeGet } from "../../utils/safeGet";
import { ContentItemSize } from "../../entities/ContentItem";

const contentItem: FastifyPluginAsync = async (
  fastify,
  opts
): Promise<void> => {
  /*
  Create a new content item
  The content title, caption and thumbnail are gotten from the data object. 
  TODO: Add a way to change the property that gives the title, caption and thumbnail based on the content type
  */
  const itemUploadSchema = Type.Object({
    contentFormatCode: Type.String(),
    data: Type.Any(),
    size: Type.Optional(Type.String()),
  });
  type itemUploadType = Static<typeof itemUploadSchema>;

  fastify.post<{
    Body: itemUploadType;
  }>("/", async function (request, reply) {
    const { contentFormatCode, data, size } = request.body;

    const { user } = request;
    if (!user) {
      return reply.unauthorized();
    }

    const contentFormat = await fastify.sequelize.models.ContentFormat.findOne({
      where: {
        code: contentFormatCode,
      },
    });

    if (!contentFormat) {
      return reply.notFound("Content format not found");
    }

    if (contentFormat.schema) {
      const validate = new Ajv().compile(contentFormat.schema as any);
      const valid = validate(data);

      if (!valid) {
        return reply.badRequest("Invalid data");
      }
    }

    const item = await fastify.sequelize.models.ContentItem.create({
      userId: user.id,
      data,
      title: safeGet(
        data,
        contentFormat.titlePath,
        `${dayjs().format("YYYY-MM-DD HH:mm:ss")} Upload`
      ),
      caption: safeGet(data, contentFormat.captionPath),
      thumbnail: safeGet(data, contentFormat.thumbnailPath),
      size: (size ?? "SQUARE") as ContentItemSize,
      contentFormatCode: contentFormat.code,
    });

    return reply.send(item);
  });

  fastify.get("/", async function (request, reply) {
    const items = await fastify.sequelize.models.ContentItem.findAll({
      order: [["createdAt", "desc"]],
    });

    return items;
  });

  fastify.get<{
    Params: {
      id: string;
    };
  }>("/:id", async function (request, reply) {
    const { id: idString } = request.params;

    const id = parseInt(idString);

    const item = await fastify.sequelize.models.ContentItem.findOne({
      where: {
        id,
      },
    });

    return item;
  });
};

export default contentItem;
