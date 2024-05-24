/*
  Warnings:

  - You are about to drop the column `enabled` on the `PluginComponent` table. All the data in the column will be lost.

*/
-- AlterEnum
ALTER TYPE "PluginFunction" ADD VALUE 'CONTENTTYPE';

-- AlterTable
ALTER TABLE "Plugin" ADD COLUMN     "enabled" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE "PluginComponent" DROP COLUMN "enabled";

-- CreateTable
CREATE TABLE "ContentType" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "schema" JSONB,
    "uiSchema" JSONB,
    "pluginId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ContentType_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "ContentType" ADD CONSTRAINT "ContentType_pluginId_fkey" FOREIGN KEY ("pluginId") REFERENCES "Plugin"("id") ON DELETE SET NULL ON UPDATE CASCADE;
