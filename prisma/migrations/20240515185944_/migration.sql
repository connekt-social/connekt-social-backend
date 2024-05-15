-- CreateEnum
CREATE TYPE "PluginInstallationStatus" AS ENUM ('PENDING', 'INSTALLED', 'FAILED');

-- CreateEnum
CREATE TYPE "PluginType" AS ENUM ('FRONTEND', 'BACKEND');

-- CreateEnum
CREATE TYPE "PluginFunction" AS ENUM ('FILESTORAGE');

-- CreateTable
CREATE TABLE "Plugin" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "version" TEXT NOT NULL,
    "url" TEXT,
    "installationStatus" "PluginInstallationStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Plugin_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PluginComponent" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "type" "PluginType" NOT NULL,
    "function" "PluginFunction" NOT NULL,
    "pluginId" INTEGER NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PluginComponent_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "PluginComponent" ADD CONSTRAINT "PluginComponent_pluginId_fkey" FOREIGN KEY ("pluginId") REFERENCES "Plugin"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
