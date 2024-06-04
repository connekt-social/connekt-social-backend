import { join } from "path";
import AutoLoad, { AutoloadPluginOptions } from "@fastify/autoload";
import { FastifyPluginAsync, FastifyServerOptions } from "fastify";
import { statSync, mkdirSync, readFileSync } from "fs";

export interface AppOptions
  extends FastifyServerOptions,
    Partial<AutoloadPluginOptions> {}
// Pass --options via CLI arguments in command to enable these options.
const options: AppOptions = {
  //@ts-ignore
  https: {
    key: readFileSync("private/localhost-key.pem"),
    cert: readFileSync("private/localhost.pem"),
  },
};

const app: FastifyPluginAsync<AppOptions> = async (
  fastify,
  opts
): Promise<void> => {
  // Place here your custom code!

  try {
    statSync("./temp");
  } catch (error: any) {
    if (error.code === "ENOENT") {
      console.log("Creating temp folder");
      mkdirSync("./temp");
    } else {
      console.log(error);
      throw new Error("Error while getting temp folder");
    }
  }

  try {
    statSync("./csplugins");
  } catch (error: any) {
    if (error.code === "ENOENT") {
      console.log("Creating csplugins folder");
      mkdirSync("./csplugins");
    } else {
      console.log(error);
      throw new Error("Error while getting temp folder");
    }
  }

  // Do not touch the following lines

  // This loads all plugins defined in plugins
  // those should be support plugins that are reused
  // through your application
  void fastify.register(AutoLoad, {
    dir: join(__dirname, "plugins"),
    options: opts,
  });

  // This loads all global middleware defined in middleware folder
  // they can be added to routes using decorators
  void fastify.register(AutoLoad, {
    dir: join(__dirname, "middleware"),
    options: opts,
  });

  // void fastify.register(
  //   fp<FastifyCorsOptions>(async (fastify) => {
  //     fastify.log.info(
  //       "Registering CORS plugin, allowing requests from frontend URL. >> " +
  //         fastify.config.FRONTEND_URL
  //     );
  //     fastify.register(cors, {
  //       origin: [fastify.config.FRONTEND_URL],
  //     });
  //   })
  // );

  // This loads all plugins defined in routes
  // define your routes in one of these
  void fastify.register(AutoLoad, {
    dir: join(__dirname, "entities"),
    options: opts,
  });

  // This loads all plugins defined in routes
  // define your routes in one of these
  void fastify.register(AutoLoad, {
    dir: join(__dirname, "routes"),
    options: opts,
  });
};

export default app;
export { app, options };
