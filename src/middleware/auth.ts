import fastifyPlugin from "fastify-plugin";
import { FastifyReply, FastifyRequest } from "fastify";
import { User } from "../entities/User";

export default fastifyPlugin(async function (fastify, opts) {
  fastify.decorateRequest("user", undefined);
  fastify.decorate(
    "userAuth",
    async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
      const token = request.cookies.token;

      console.log("userToken", token);
      if (!token) {
        reply.unauthorized("Unauthorized");
        return;
      }

      let user: User | null;

      try {
        user = await fastify.sequelize.models.User.findByToken(token, fastify);
      } catch (error) {
        reply.unauthorized("Unauthorized");
        return;
      }

      if (user) {
        request.user = user;
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
