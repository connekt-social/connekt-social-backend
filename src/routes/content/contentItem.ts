import { ContentItemSize } from "@prisma/client";
import { Static, Type } from "@sinclair/typebox";
import Ajv from "ajv";
import dayjs from "dayjs";
import { FastifyPluginAsync } from "fastify";

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
    const teams = await fastify.prisma.team.findMany({
      where: {
        id: teamId,
        members: {
          some: {
            id: user.id,
          },
        },
      },
    });

    console.log("teams", teams);

    const contentType = await fastify.prisma.contentType.findUnique({
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

    const item = await fastify.prisma.contentItem.create({
      data: {
        teamId: teamId ?? teams[0]?.id,
        userId: user.id,
        contentTypeId: contentType.id,
        data,
        title: data.title ?? `${dayjs().format("YYYY-MM-DD HH:mm:ss")} Upload`,
        caption: data.caption,
        thumbnail: data.thumbnail,
        size: (size ?? "SQUARE") as ContentItemSize,
      },
    });

    return reply.send(item);
  });
};

export default contentItem;
