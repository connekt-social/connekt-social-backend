import { User as UserParams } from "@prisma/client";
import { compareSync, hashSync } from "bcrypt";
import { FastifyInstance } from "fastify";
import { sign, decode } from "jsonwebtoken";
import fp from "fastify-plugin";

type CreateUserWithEmailParams = {
  email: string;
  name?: string;
  password: string;
};

export const userClass = (fastify: FastifyInstance) => {
  return class User {
    user: UserParams;
    constructor(user: Partial<UserParams>) {
      this.user = user as UserParams;
    }

    static async findFirst(
      ...value: Parameters<typeof fastify.prisma.user.findFirst>
    ) {
      const user = await fastify.prisma.user.findFirst(...value);
      if (!user) return null;
      return new User(user);
    }

    static async createWithEmailAndPassword(
      { email, name, password }: CreateUserWithEmailParams,
      teamId?: number
    ) {
      const user = await fastify.prisma.user.create({
        data: {
          email,
          name,
          password: hashSync(password, 10),
          teams: teamId ? { connect: { id: teamId } } : undefined,
        },
      });

      return new User(user);
    }

    validatePassword(password: string) {
      if (!this.user.password) return false;
      return compareSync(password, this.user.password);
    }

    createJwt() {
      return sign({ userId: this.user.id }, fastify.config.JWT_SECRET);
    }

    static async findByToken(token: string) {
      const decoded = decode(token) as { userId: number };
      if (!decoded) return null;
      return await User.findFirst({ where: { id: decoded.userId } });
    }
  };
};

export type UserInstance = InstanceType<ReturnType<typeof userClass>>;
export default fp(async (fastify, opts) => {
  const User = userClass(fastify);

  fastify.decorate("User", User);
});

declare module "fastify" {
  export interface FastifyInstance {
    User: ReturnType<typeof userClass>;
  }
}
