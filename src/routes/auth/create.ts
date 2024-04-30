import { Type, Static } from "@sinclair/typebox";
import dayjs from "dayjs";
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

      const token = user.createJwt();

      reply.setCookie("token", token, {
        httpOnly: true,
        expires: dayjs().add(1, "day").toDate(),
        secure: fastify.config.NODE_ENV === "production",
      });
      return {
        success: true,
      };
    }
  );
};

export default userCreate;
