-- CreateTable
CREATE TABLE "FrontendComponent" (
    "id" SERIAL NOT NULL,
    "entryPoint" TEXT NOT NULL,
    "componentName" TEXT NOT NULL,
    "propSchema" JSONB,
    "pluginComponentId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FrontendComponent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "FrontendComponent_pluginComponentId_key" ON "FrontendComponent"("pluginComponentId");

-- AddForeignKey
ALTER TABLE "FrontendComponent" ADD CONSTRAINT "FrontendComponent_pluginComponentId_fkey" FOREIGN KEY ("pluginComponentId") REFERENCES "PluginComponent"("id") ON DELETE CASCADE ON UPDATE CASCADE;
