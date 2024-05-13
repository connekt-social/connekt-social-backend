import fastifyPlugin from "fastify-plugin";
import { UserInstance } from "../entities/user";
import { FastifyReply, FastifyRequest } from "fastify";
import { User } from "@prisma/client";

export default fastifyPlugin(async function (fastify, opts) {
  fastify.decorateRequest("user", undefined);
  fastify.decorate(
    "userAuth",
    async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
      const token = request.cookies.token;

      console.log("token", token);
      if (!token) {
        reply.unauthorized("Unauthorized");
        return;
      }

      let user: UserInstance | null;

      try {
        user = await fastify.User.findByToken(token);
      } catch (error) {
        reply.unauthorized("Unauthorized");
        return;
      }

      if (user) {
        request.user = user.user;
      } else {
        reply.unauthorized("Unauthorized");
      }
    }
  );
});

declare module "fastify" {
  interface FastifyInstance {
    userAuth: (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
  }

  interface FastifyRequest {
    user?: User;
  }
}
