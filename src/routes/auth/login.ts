import { Type, Static } from "@sinclair/typebox";
import dayjs from "dayjs";
import { FastifyPluginAsync } from "fastify";

const userLogin: FastifyPluginAsync = async (fastify, opts) => {
  const loginSchema = Type.Object({
    email: Type.String({
      format: "email",
    }),
    password: Type.String(),
  });
  type loginType = Static<typeof loginSchema>;
  fastify.post<{ Body: loginType }>(
    "/",
    {
      schema: {
        body: loginSchema,
      },
    },
    async function (request, reply) {
      const user = await fastify.User.findFirst({
        where: {
          email: request.body.email,
        },
      });

      if (!user || !user.validatePassword(request.body.password)) {
        return reply.unauthorized("Invalid credentials");
      }

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

export default userLogin;
