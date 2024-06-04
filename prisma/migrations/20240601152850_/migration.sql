/*
  Warnings:

  - Added the required column `code` to the `ContentType` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "ContentTypeSupportedPlugins" DROP CONSTRAINT "ContentTypeSupportedPlugins_contentTypeId_fkey";

-- DropForeignKey
ALTER TABLE "ContentTypeSupportedPlugins" DROP CONSTRAINT "ContentTypeSupportedPlugins_pluginId_fkey";

-- DropForeignKey
ALTER TABLE "PluginComponent" DROP CONSTRAINT "PluginComponent_pluginId_fkey";

-- AlterTable
ALTER TABLE "ContentType" ADD COLUMN     "code" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Plugin" ADD COLUMN     "settings" JSONB,
ADD COLUMN     "settingsSchema" JSONB;

-- AddForeignKey
ALTER TABLE "PluginComponent" ADD CONSTRAINT "PluginComponent_pluginId_fkey" FOREIGN KEY ("pluginId") REFERENCES "Plugin"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContentTypeSupportedPlugins" ADD CONSTRAINT "ContentTypeSupportedPlugins_contentTypeId_fkey" FOREIGN KEY ("contentTypeId") REFERENCES "ContentType"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContentTypeSupportedPlugins" ADD CONSTRAINT "ContentTypeSupportedPlugins_pluginId_fkey" FOREIGN KEY ("pluginId") REFERENCES "Plugin"("id") ON DELETE CASCADE ON UPDATE CASCADE;
