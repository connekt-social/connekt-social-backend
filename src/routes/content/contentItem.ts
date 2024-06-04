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
    teamId: Type.Optional(Type.Number()),
    contentTypeId: Type.Number(),
    data: Type.Any(),
    size: Type.Optional(Type.String()),
  });
  type itemUploadType = Static<typeof itemUploadSchema>;

  fastify.post<{
    Body: itemUploadType;
  }>("/", async function (request, reply) {
    const { teamId, contentTypeId, data, size } = request.body;

    const { user } = request;
    if (!user) {
      return reply.unauthorized();
    }
    const teams = await fastify.sequelize.models.Team.findAll({
      where: {
        id: teamId,
      },
      include: [
        {
          model: this.sequelize.models.User,
          where: {
            id: user.id,
          },
        },
      ],
    });

    console.log("teams", teams);

    const contentType = await fastify.sequelize.models.ContentType.findOne({
      where: {
        id: contentTypeId,
      },
    });

    if (!contentType) {
      return reply.notFound("Content type not found");
    }

    if (contentType.schema) {
      const validate = new Ajv().compile(contentType.schema as any);
      const valid = validate(data);

      if (!valid) {
        return reply.badRequest("Invalid data");
      }
    }

    const item = await fastify.sequelize.models.ContentItem.create({
      userId: user.id,
      contentTypeId: contentType.id,
      data,
      title: safeGet(
        data,
        contentType.titlePath,
        `${dayjs().format("YYYY-MM-DD HH:mm:ss")} Upload`
      ),
      caption: safeGet(data, contentType.captionPath),
      thumbnail: safeGet(data, contentType.thumbnailPath),
      size: (size ?? "SQUARE") as ContentItemSize,
    });

    return reply.send(item);
  });
};

export default contentItem;
