import { ContentItemSize } from "@prisma/client";
import { Static, Type } from "@sinclair/typebox";
import Ajv from "ajv";
import { FastifyPluginAsync } from "fastify";

const contentItem: FastifyPluginAsync = async (
  fastify,
  opts
): Promise<void> => {
  const itemUploadSchema = Type.Object({
    teamId: Type.Optional(Type.Number()),
    contentTypeId: Type.Number(),
    data: Type.Object({}),
    title: Type.String(),
    size: Type.Optional(Type.String()),
  });
  type itemUploadType = Static<typeof itemUploadSchema>;

  fastify.post<{
    Body: itemUploadType;
  }>("/", async function (request, reply) {
    const { teamId, contentTypeId, data, title, size } = request.body;

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
        title,
        size: (size ?? "SQUARE") as ContentItemSize,
      },
    });

    return reply.send(item);
  });
};

export default contentItem;
