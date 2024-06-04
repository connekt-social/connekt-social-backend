/*
  Warnings:

  - You are about to drop the `PluginDocument` table. If the table is not empty, all the data it contains will be lost.

*/
-- AlterEnum
ALTER TYPE "PluginFunction" ADD VALUE 'PLUGIN_REST_API';

-- DropForeignKey
ALTER TABLE "PluginDocument" DROP CONSTRAINT "PluginDocument_pluginId_fkey";

-- DropTable
DROP TABLE "PluginDocument";
