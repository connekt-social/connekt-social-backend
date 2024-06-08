import {
  Table,
  Column,
  Model,
  DataType,
  BelongsTo,
  ForeignKey,
} from "sequelize-typescript";

import type {
  CreationOptional,
  InferAttributes,
  InferCreationAttributes,
} from "sequelize";
import { Plugin } from "./Plugin";
import { ContentFormat } from "./ContentFormat";

@Table
export class ContentType extends Model<
  InferAttributes<ContentType>,
  InferCreationAttributes<ContentType>
> {
  @ForeignKey(() => ContentFormat)
  @Column(DataType.STRING)
  code!: string;

  @Column(DataType.STRING)
  key!: string;

  @Column(DataType.STRING)
  name!: string;

  @Column(DataType.STRING)
  description?: string;

  @Column(DataType.JSON)
  schema?: object;

  @Column(DataType.JSON)
  uiSchema?: object;

  @Column(DataType.STRING)
  titlePath?: string;

  @Column(DataType.STRING)
  thumbnailPath?: string;

  @Column(DataType.STRING)
  captionPath?: string;

  @ForeignKey(() => Plugin)
  @Column(DataType.INTEGER)
  pluginId!: number;

  @BelongsTo(() => Plugin)
  plugin!: CreationOptional<Plugin>;
}

declare module "sequelize-typescript" {
  export interface DefinedModels {
    ContentType: typeof ContentType;
  }
}
