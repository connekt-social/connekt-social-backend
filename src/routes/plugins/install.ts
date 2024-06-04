import { FastifyPluginAsync } from "fastify";
import * as tar from "tar";
import { appendFileSync, readFileSync, createWriteStream } from "fs";
import { exec } from "child_process";
import util from "util";
import { pipeline } from "stream";
import dayjs from "dayjs";
import installationSwitch from "../../utils/plugins/installationSwitch";
import { pluginComponentCleanup } from "../../utils/plugins/pluginCleanup";
import { PluginInstallationStatus } from "../../entities/Plugin";

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

    let [result, pluginCreated] =
      await fastify.sequelize.models.Plugin.findOrCreate({
        where: {
          name: packageJson.name,
        },
        defaults: {
          name: packageJson.name,
          version: packageJson.version,
          description: packageJson.description,
          enabled: true,
        },
      });

    if (!pluginCreated) {
      await result.update({
        name: packageJson.name,
        version: packageJson.version,
        description: packageJson.description,
        enabled: true,
      });
    }

    exec(
      `npm install ./csplugins/${data.filename}`,
      async (error, stdout, stderr) => {
        if (error) {
          console.log(error);
        }

        try {
          const plugin = await import(packageJson.name);

          //Load params that cannot be loaded from package.json

          result.update({
            logoUrl: plugin.default.default.config.logoUrl,
            settingsSchema: plugin.default.default.config.settingsSchema,
          });

          appendFileSync(
            "./temp/log.txt",
            `${dayjs().toISOString()}: Plugin imported successfully ${JSON.stringify(
              plugin,
              null,
              2
            )}\n`
          );

          if (!pluginCreated) {
            await pluginComponentCleanup(fastify, result.id);
          }

          const promises = plugin.default.default.config.components.map(
            async (component: any) => {
              const dbRecord =
                await fastify.sequelize.models.PluginComponent.create({
                  function: component.function,
                  type: component.type,
                  pluginId: result.id,
                  name: packageJson.name,
                  description: packageJson.description,
                });

              await installationSwitch(
                fastify,
                component,
                result.id,
                dbRecord.id
              );
            }
          );

          await Promise.all(promises);

          // await fastify.prisma.pluginComponent.createMany({
          //   data: plugin.default.default.config.components.map(
          //     (component: any): Prisma.PluginComponentCreateManyInput => ({
          //       function: component.function,
          //       type: component.type,
          //       pluginId: result.id,
          //       name: packageJson.name,
          //       description: packageJson.description,
          //     })
          //   ),
          // });
          // await Promise.all(
          //   plugin.default.default.config.components.map((component: any) =>
          //     installationSwitch(fastify, component, result.id)
          //   )
          // );

          if (plugin.default.default.config.models?.length) {
            fastify.sequelize.addModels(plugin.default.default.config.models);

            const promises: Promise<any>[] = [];

            for (const model of plugin.default.default.config.models) {
              appendFileSync(
                "./temp/log.txt",
                `${dayjs().toISOString()}: Creating model ${model.name}\n`
              );
              promises.push(
                fastify.sequelize.models[model.name].sync({
                  alter: true,
                  logging(sql, timing) {
                    appendFileSync(
                      "./temp/log.txt",
                      `${dayjs().toISOString()}: ${sql}\n`
                    );
                  },
                })
              );
            }

            await Promise.all(promises);
          }

          console.log("tete");
          console.log(Object.keys(fastify.sequelize.models));

          result.update({
            installationStatus: PluginInstallationStatus.INSTALLED,
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
