/*
  Warnings:

  - You are about to drop the column `pluginId` on the `ContentType` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "ContentType" DROP CONSTRAINT "ContentType_pluginId_fkey";

-- AlterTable
ALTER TABLE "ContentType" DROP COLUMN "pluginId";

-- CreateTable
CREATE TABLE "ContentTypeSupportedPlugins" (
    "contentTypeId" INTEGER NOT NULL,
    "pluginId" INTEGER NOT NULL,

    CONSTRAINT "ContentTypeSupportedPlugins_pkey" PRIMARY KEY ("contentTypeId","pluginId")
);

-- AddForeignKey
ALTER TABLE "ContentTypeSupportedPlugins" ADD CONSTRAINT "ContentTypeSupportedPlugins_contentTypeId_fkey" FOREIGN KEY ("contentTypeId") REFERENCES "ContentType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContentTypeSupportedPlugins" ADD CONSTRAINT "ContentTypeSupportedPlugins_pluginId_fkey" FOREIGN KEY ("pluginId") REFERENCES "Plugin"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
