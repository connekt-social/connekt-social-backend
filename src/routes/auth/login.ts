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
      console.log(request.url);
      const user = await fastify.sequelize.models.User.findOne({
        where: {
          email: request.body.email,
        },
      });

      if (!user || !user.validatePassword(request.body.password)) {
        return reply.unauthorized("Invalid credentials");
      }

      const token = user.createJwt(fastify);

      // console.log(".token", token);
      reply.setCookie("token", token, {
        httpOnly: true,
        expires: dayjs().add(1, "day").toDate(),
        secure: true,
        path: "/",
        sameSite: "none",
      });

      return {
        success: true,
      };
    }
  );

  fastify.get("/", async function (request) {
    console.log(request.hostname, request.url);

    return "hello world";
  });
};

export default userLogin;
