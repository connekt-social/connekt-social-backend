import { compareSync, hashSync } from "bcrypt";
import { FastifyInstance } from "fastify";
import { sign, verify, JwtPayload } from "jsonwebtoken";
import fp from "fastify-plugin";
import {
  Column,
  CreatedAt,
  DataType,
  HasMany,
  Model,
  Table,
  Unique,
  UpdatedAt,
} from "sequelize-typescript";
import { InferAttributes } from "sequelize";

type CreateUserWithEmailParams = {
  email: string;
  name?: string;
  password: string;
};

@Table
export class User extends Model<InferAttributes<User>> {
  @Column(DataType.STRING)
  name?: string;

  @Unique
  @Column(DataType.STRING)
  email?: string;

  @Unique
  @Column(DataType.STRING)
  phone?: string;

  @Column(DataType.STRING)
  password?: string;

  @Column(DataType.STRING)
  ssoToken?: string;

  @CreatedAt
  @Column(DataType.DATE)
  createdAt!: Date;

  @UpdatedAt
  @Column(DataType.DATE)
  updatedAt!: Date;

  @HasMany(() => Team)
  teams!: Team[];

  @HasMany(() => ContentItem)
  contentItems!: ContentItem[];

  static async createWithEmailAndPassword(
    { email, name, password }: CreateUserWithEmailParams,
    teamId?: number
  ) {
    const user = await User.create({
      email,
      name,
      password: hashSync(password, 10),

      teamId,
    });

    return user;
  }

  validatePassword(password: string) {
    if (!this.password) return false;
    return compareSync(password, this.password);
  }

  createJwt(fastify: FastifyInstance) {
    return sign({ userId: this.id }, fastify.config.JWT_SECRET, {
      expiresIn: "1d",
    });
  }

  static async findByToken(token: string, fastify: FastifyInstance) {
    try {
      const decoded = verify(
        token,
        fastify.config.JWT_SECRET
      ) as JwtPayload as { userId: number };
      if (!decoded) return null;
      return await User.findOne({ where: { id: decoded.userId } });
    } catch (error) {
      console.log("error", error);
      throw error;
    }
  }
}

export type UserInstance = InstanceType<typeof User>;
export default fp(async (fastify, opts) => {
  fastify.decorate("User", User);
});

// declare module "fastify" {
//   export interface FastifyInstance {
//     User: typeof User;
//   }
// }

declare module "sequelize-typescript" {
  export interface Sequelize {
    models: {
      User: typeof User;
    };
  }
}
