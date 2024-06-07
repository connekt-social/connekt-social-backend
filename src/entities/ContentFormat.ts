import {
  Table,
  Column,
  Model,
  DataType,
  HasMany,
  PrimaryKey,
} from "sequelize-typescript";
import type {
  CreationOptional,
  InferAttributes,
  InferCreationAttributes,
} from "sequelize";
import { ContentItem } from "./ContentItem";
import { ContentType } from "./ContentType";

@Table
export class ContentFormat extends Model<
  InferAttributes<ContentFormat>,
  InferCreationAttributes<ContentFormat>
> {
  @PrimaryKey
  @Column(DataType.STRING)
  code!: string;

  @Column(DataType.STRING)
  name!: string;

  @Column(DataType.STRING)
  description?: string;

  @Column(DataType.JSON)
  schema!: object;

  @Column(DataType.JSON)
  uiSchema?: object;

  @Column(DataType.STRING)
  titlePath?: string;

  @Column(DataType.STRING)
  thumbnailPath?: string;

  @Column(DataType.STRING)
  captionPath?: string;

  @HasMany(() => ContentItem, {
    onDelete: "CASCADE",
    hooks: true,
  })
  contentItems?: CreationOptional<ContentItem[]>;

  @HasMany(() => ContentType, {
    onDelete: "CASCADE",
  })
  contentTypes?: ContentType[];
}

declare module "sequelize-typescript" {
  export interface DefinedModels {
    ContentFormat: typeof ContentFormat;
  }
}
