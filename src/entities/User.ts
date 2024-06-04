import { compareSync, hashSync } from "bcrypt";
import { FastifyInstance } from "fastify";
import { sign, verify, JwtPayload } from "jsonwebtoken";
import {
  Column,
  DataType,
  HasMany,
  Model,
  Table,
  Unique,
} from "sequelize-typescript";
import { InferAttributes, InferCreationAttributes } from "sequelize";
import { ContentItem } from "./ContentItem";

//This is here because syncDb script will not work without it
import "../plugins/env";

type CreateUserWithEmailParams = {
  email: string;
  name?: string;
  password: string;
};

@Table
export class User extends Model<
  InferAttributes<User>,
  InferCreationAttributes<User>
> {
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

  @HasMany(() => ContentItem, {
    onDelete: "CASCADE",
    hooks: true,
  })
  contentItems?: ContentItem[];

  static async createWithEmailAndPassword({
    email,
    name,
    password,
  }: CreateUserWithEmailParams) {
    const user = await User.create({
      email,
      name,
      password: hashSync(password, 10),
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

declare module "sequelize-typescript" {
  export interface DefinedModels {
    User: typeof User;
  }
}
