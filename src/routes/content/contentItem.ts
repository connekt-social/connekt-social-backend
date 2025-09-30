import { Static, Type } from "@sinclair/typebox";
import Ajv from "ajv";
import dayjs from "dayjs";
import { FastifyPluginAsync } from "fastify";
import { safeGet } from "../../utils/safeGet";
import { ContentItem, ContentItemSize } from "../../entities/ContentItem";
import { InferCreationAttributes } from "sequelize";

const contentItem: FastifyPluginAsync = async (
  fastify,
  opts
): Promise<void> => {
  /*
  Create a new content item
  The content title, caption and thumbnail are gotten from the data object. 
  */
  const itemUploadSchema = Type.Object({
    contentFormatCode: Type.String(),
    data: Type.Any(),
    size: Type.Optional(Type.String()),
  });
  type itemUploadType = Static<typeof itemUploadSchema>;

  fastify.post<{
    Body: itemUploadType;
  }>(
    "/",
    {
      schema: {
        body: itemUploadSchema,
      },
    },
    async function (request, reply) {
      const { contentFormatCode, data, size } = request.body;

      const { user } = request;
      if (!user) {
        return reply.unauthorized();
      }

      const contentFormat =
        await fastify.sequelize.models.ContentFormat.findOne({
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
    }
  );

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

  const itemUpdateSchema = Type.Object({
    contentFormatCode: Type.Optional(Type.String()),
    data: Type.Optional(Type.Any()),
    size: Type.Optional(Type.String()),
  });
  type itemUpdateType = Static<typeof itemUpdateSchema>;
  fastify.put<{
    Body: itemUpdateType;
    Params: {
      id: string;
    };
  }>(
    "/:id",
    {
      schema: {
        body: itemUpdateSchema,
      },
    },
    async function (request, reply) {
      const { id: idString } = request.params;

      const { contentFormatCode, data, size } = request.body;

      const id = parseInt(idString);

      const { ContentFormat } = fastify.sequelize.models;

      const item = await fastify.sequelize.models.ContentItem.findOne({
        where: {
          id,
        },
      });

      if (!item) {
        return reply.notFound("Content item not found");
      }

      let itemDetails: Partial<InferCreationAttributes<ContentItem>> = {
        contentFormatCode,
        size: size as ContentItemSize | undefined,
      };

      const contentFormat = await ContentFormat.findOne({
        where: {
          code: contentFormatCode ?? item.contentFormatCode,
        },
      });

      if (!contentFormat) {
        return reply.badRequest("Invalid content format");
      }

      if (data) {
        itemDetails = {
          ...itemDetails,
          data,
          title: safeGet(data, contentFormat.titlePath, item.title),
          caption: safeGet(data, contentFormat.captionPath, item.caption),
          thumbnail: safeGet(data, contentFormat.thumbnailPath, item.thumbnail),
        };
      }

      await item.update(itemDetails);

      return item.toJSON();
    }
  );

  fastify.delete<{
    Params: {
      id: string;
    };
  }>("/:id", async function (request, reply) {
    const { id: idString } = request.params;

    const id = parseInt(idString);

    const items = await fastify.sequelize.models.ContentItem.destroy({
      where: {
        id,
      },
    });

    return { count: items, message: "Deleted successfully" };
  });

  const itemPublishSchema = Type.Object({
    data: Type.Optional(Type.Any()),
    contentTypes: Type.Array(Type.Number()),
  });
  type itemPublishType = Static<typeof itemPublishSchema>;

  fastify.post<{
    Params: {
      id: string;
    };
    Body: itemPublishType;
  }>(
    "/:id/publish",
    {
      schema: {
        body: itemPublishSchema,
      },
    },
    async function (request, reply) {
      const { id: idString } = request.params;
      const { contentTypes: contentTypeIds } = request.body;
      const id = parseInt(idString);

      const { ContentItem, ContentType, PluginComponent, Plugin } =
        fastify.sequelize.models;
      const item = await ContentItem.findOne({
        where: {
          id,
        },
      });

      const contentTypes = await ContentType.findAll({
        where: {
          id: contentTypeIds,
        },
        include: [
          {
            model: Plugin,
            where: {
              enabled: true,
            },
            include: [
              {
                model: PluginComponent,
                where: {
                  function: "CONTENT_PUBLISH",
                },
              },
            ],
          },
        ],
      });

      if (!contentTypes.length) {
        return reply.status(400).send({
          message: "Content types not found",
        });
      }
      console.log("publishing to ", contentTypes);

      const promises: Promise<any>[] = [];

      for (const contentType of contentTypes) {
        const pluginComponentRecord = contentType.plugin?.components[0];

        const plugin = await import(
          pluginComponentRecord?.name
          // "../../../../cs-meta-plugin/dist/index.js"
        );
        const component: any = plugin.default.default.config.components.find(
          (component: any) => component.function === "CONTENT_PUBLISH"
        );

        if (component && component.handler) {
          promises.push(
            component.handler({
              contentItem: item,
              fastify,
              contentType,
              config: pluginComponentRecord.plugin?.settings,
            })
          );
        }
      }

      const results = await Promise.all(promises);

      console.log("publish results", results);

      return {
        message: "Success",
      };
    }
  );
};

export default contentItem;
