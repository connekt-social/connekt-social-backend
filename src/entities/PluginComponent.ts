import {
  Table,
  Column,
  Model,
  DataType,
  ForeignKey,
  BelongsTo,
  HasOne,
} from "sequelize-typescript";
import { Plugin } from "./Plugin";
import type {
  CreationOptional,
  InferAttributes,
  InferCreationAttributes,
} from "sequelize";
import { FrontendComponent } from "./FrontendComponent";

export enum PluginType {
  FRONTEND = "FRONTEND",
  BACKEND = "BACKEND",
}
// Define your plugin types here

export enum PluginFunction {
  FILESTORAGE = "FILESTORAGE",
  CONTENTTYPE = "CONTENTTYPE",
  PLUGIN_SETTINGS_TAB = "PLUGIN_SETTINGS_TAB",
  PLUGIN_REST_API = "PLUGIN_REST_API",
  CONTENT_PUBLISH = "CONTENT_PUBLISH",
  STANDALONE_PAGE = "STANDALONE_PAGE", //pages shown outside of the dashboard layout
}
// Define your plugin functions here

@Table
export class PluginComponent extends Model<
  InferAttributes<PluginComponent>,
  InferCreationAttributes<PluginComponent>
> {
  @Column(DataType.STRING)
  name!: string;

  @Column(DataType.STRING)
  description?: string;

  @Column(DataType.ENUM(...Object.values(PluginType)))
  type!: PluginType;

  @Column(DataType.ENUM(...Object.values(PluginFunction)))
  function!: PluginFunction;

  @ForeignKey(() => Plugin)
  @Column(DataType.INTEGER)
  pluginId!: number;

  @BelongsTo(() => Plugin)
  plugin!: CreationOptional<Plugin>;

  @HasOne(() => FrontendComponent, {
    onDelete: "CASCADE",
    hooks: true,
  })
  frontendComponent?: FrontendComponent;
}

declare module "sequelize-typescript" {
  export interface DefinedModels {
    PluginComponent: typeof PluginComponent;
  }
}
