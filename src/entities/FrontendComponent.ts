import {
  Table,
  Column,
  Model,
  DataType,
  ForeignKey,
  BelongsTo,
  Unique,
} from "sequelize-typescript";
import { PluginComponent } from "./PluginComponent";
import type {
  CreationOptional,
  InferAttributes,
  InferCreationAttributes,
} from "sequelize";
import { Plugin } from "./Plugin";

@Table
export class FrontendComponent extends Model<
  InferAttributes<FrontendComponent>,
  InferCreationAttributes<FrontendComponent>
> {
  @Column(DataType.STRING)
  entryPoint!: string;

  @Column(DataType.STRING)
  componentName!: string;

  @Column(DataType.JSON)
  propSchema?: object;

  @Unique
  @ForeignKey(() => PluginComponent)
  @Column(DataType.INTEGER)
  pluginComponentId!: number;

  @ForeignKey(() => Plugin)
  @Column(DataType.INTEGER)
  pluginId!: number;

  @BelongsTo(() => PluginComponent)
  pluginComponent!: CreationOptional<PluginComponent>;

  @BelongsTo(() => Plugin)
  plugin!: CreationOptional<Plugin>;
}

declare module "sequelize-typescript" {
  export interface DefinedModels {
    FrontendComponent: typeof FrontendComponent;
  }
}
