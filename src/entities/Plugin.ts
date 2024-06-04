import {
  Table,
  Column,
  Model,
  DataType,
  Default,
  HasMany,
} from "sequelize-typescript";
import type {
  CreationOptional,
  InferAttributes,
  InferCreationAttributes,
} from "sequelize";
import { PluginComponent } from "./PluginComponent";
import { ContentType } from "./ContentType";
import { FrontendComponent } from "./FrontendComponent";

export enum PluginInstallationStatus {
  PENDING = "PENDING",
  INSTALLED = "INSTALLED",
  FAILED = "FAILED",
  // Add other statuses here
}

@Table
export class Plugin extends Model<
  InferAttributes<Plugin>,
  InferCreationAttributes<Plugin>
> {
  @Column(DataType.STRING)
  name!: string;

  @Column(DataType.STRING)
  description?: string;

  @Column(DataType.STRING)
  version!: string;

  @Column(DataType.STRING)
  url?: string;

  @Default(PluginInstallationStatus.PENDING)
  @Column(DataType.ENUM(...Object.values(PluginInstallationStatus)))
  installationStatus!: CreationOptional<PluginInstallationStatus>;

  @Default(true)
  @Column(DataType.BOOLEAN)
  enabled!: boolean; // Whether the plugin is enabled

  @Column(DataType.STRING)
  logoUrl?: string;

  @Column(DataType.JSON)
  settings?: object;

  @Column(DataType.JSON)
  settingsSchema?: object;

  @HasMany(() => PluginComponent, {
    onDelete: "CASCADE",
    hooks: true,
  })
  components!: CreationOptional<PluginComponent[]>;

  @HasMany(() => ContentType, {
    onDelete: "CASCADE",
    hooks: true,
  })
  contentTypes?: ContentType[];

  @HasMany(() => FrontendComponent, {
    onDelete: "CASCADE",
    hooks: true,
  })
  frontendComponents?: FrontendComponent[];
}

declare module "sequelize-typescript" {
  export interface DefinedModels {
    Plugin: typeof Plugin;
  }
}
