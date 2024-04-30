import { Type, Static } from "@sinclair/typebox";
import { FastifyPluginAsync } from "fastify";

const userCreate: FastifyPluginAsync = async (fastify, opts) => {
  const createWithEmailSchema = Type.Object({
    email: Type.String({
      format: "email",
    }),
    password: Type.String(),
    name: Type.String(),
  });
  type createWithEmailType = Static<typeof createWithEmailSchema>;
  fastify.post<{ Body: createWithEmailType }>(
    "/withEmail",
    {
      schema: {
        body: createWithEmailSchema,
      },
    },
    async function (request, reply) {
      const user = await fastify.User.createWithEmailAndPassword(request.body);

      request.log.info(
        `New user created: ${user.user.email}, ${user.user.name}`
      );

      return {
        success: true,
      };
    }
  );
};

export default userCreate;
