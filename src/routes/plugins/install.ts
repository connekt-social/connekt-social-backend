import { FastifyPluginAsync } from "fastify";
import * as tar from "tar";
import { appendFileSync, readFileSync, createWriteStream } from "fs";
import { exec } from "child_process";
import util from "util";
import { pipeline } from "stream";
import { Prisma } from "@prisma/client";
import dayjs from "dayjs";
import installationSwitch from "../../utils/plugins/installationSwitch";

const pump = util.promisify(pipeline);

const installPlugin: FastifyPluginAsync = async (fastify, opts) => {
  fastify.post("/", async function (request, reply) {
    const data = await request.file();

    if (!data) {
      return reply.badRequest("No file received");
    }

    await pump(data.file, createWriteStream(`./csplugins/${data.filename}`));

    // writeFileSync("./temp/plugin.tgz", request.body.plugin as Buffer);

    await tar.x({
      f: `./csplugins/${data.filename}`,
      C: "./temp",
    });

    const packageJson = JSON.parse(
      readFileSync("./temp/package/package.json", "utf-8")
    );

    const result = await fastify.prisma.plugin.create({
      data: {
        name: packageJson.name,
        version: packageJson.version,
        description: packageJson.description,
      },
    });

    exec(
      `npm install ./csplugins/${data.filename}`,
      async (error, stdout, stderr) => {
        if (error) {
          console.log(error);
        }

        try {
          const plugin = await import(packageJson.name);

          appendFileSync(
            "./temp/log.txt",
            `${dayjs().toISOString()}: Plugin imported successfully ${JSON.stringify(
              plugin
            )}\n`
          );

          await fastify.prisma.pluginComponent.createMany({
            data: plugin.default.default.config.components.map(
              (component: any): Prisma.PluginComponentCreateManyInput => ({
                function: component.function,
                type: component.type,
                pluginId: result.id,
                name: packageJson.name,
                description: packageJson.description,
              })
            ),
          });

          await Promise.all(
            plugin.default.default.config.components.map((component: any) =>
              installationSwitch(fastify, component, result.id)
            )
          );

          await fastify.prisma.plugin.update({
            data: {
              installationStatus: "INSTALLED",
            },
            where: {
              id: result.id,
            },
          });

          appendFileSync(
            "./temp/log.txt",
            `${dayjs().toISOString()}: Plugin installed successfully\n`
          );
        } catch (error) {
          appendFileSync(
            "./temp/log.txt",
            `${dayjs().toISOString()}: ${(error as any).message}\n`
          );
        }
      }
    );

    return {
      success: true,
      message: "Plugin received. Starting installation",
      packageJson,
    };
  });
};

export default installPlugin;
