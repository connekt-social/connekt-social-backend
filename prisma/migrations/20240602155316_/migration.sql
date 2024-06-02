-- AlterEnum
ALTER TYPE "PluginFunction" ADD VALUE 'PLUGIN_SETTINGS_TAB';

-- AlterTable
ALTER TABLE "ContentType" ADD COLUMN     "captionPath" TEXT,
ADD COLUMN     "thumbnailPath" TEXT,
ADD COLUMN     "titlePath" TEXT;

-- CreateTable
CREATE TABLE "PluginDocument" (
    "id" SERIAL NOT NULL,
    "pluginId" INTEGER NOT NULL,
    "pluginVersion" TEXT,
    "documentType" TEXT,
    "data" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PluginDocument_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "PluginDocument" ADD CONSTRAINT "PluginDocument_pluginId_fkey" FOREIGN KEY ("pluginId") REFERENCES "Plugin"("id") ON DELETE CASCADE ON UPDATE CASCADE;
