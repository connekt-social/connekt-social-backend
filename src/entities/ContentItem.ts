import {
  Table,
  Column,
  Model,
  DataType,
  ForeignKey,
  BelongsTo,
} from "sequelize-typescript";
import { User } from "./User";
import type {
  CreationOptional,
  InferAttributes,
  InferCreationAttributes,
} from "sequelize";
import { ContentFormat } from "./ContentFormat";

export enum ContentItemSize {
  SQUARE = "SQUARE",
  LANDSCAPE = "LANDSCAPE",
  PORTRAIT = "PORTRAIT",
}
// Define your content item sizes here

@Table
export class ContentItem extends Model<
  InferAttributes<ContentItem>,
  InferCreationAttributes<ContentItem>
> {
  @ForeignKey(() => User)
  @Column(DataType.INTEGER)
  userId!: number;

  @ForeignKey(() => ContentFormat)
  @Column(DataType.STRING)
  contentFormatCode!: string;

  @Column(DataType.JSON)
  data!: object;

  @Column(DataType.STRING)
  title!: string;

  @Column(DataType.STRING)
  caption?: string;

  @Column(DataType.STRING)
  thumbnail?: string;

  @Column(DataType.ENUM(...Object.values(ContentItemSize)))
  size!: ContentItemSize;

  @BelongsTo(() => ContentFormat)
  contentFormat!: CreationOptional<ContentFormat>;

  @BelongsTo(() => User)
  user!: CreationOptional<User>;
}

declare module "sequelize-typescript" {
  export interface DefinedModels {
    ContentItem: typeof ContentItem;
  }
}
