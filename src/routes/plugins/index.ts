import fp from "fastify-plugin";
import installPlugin from "./install";
import listPlugins from "./list";
import pluginSettings from "./pluginSettings";
import pluginApiSwitch from "./pluginApiSwitch";
import frontendComponents from "./frontendComponents";

export default fp(async (fastify, opts) => {
  fastify.register(
    async function (fastify, opts) {
      fastify.register(async function (fastify, opts) {
        fastify.addHook("preHandler", fastify.userAuth);
        fastify.register(listPlugins);
        fastify.register(installPlugin);
        fastify.register(pluginSettings, { prefix: "/:id/settings" });
        fastify.register(pluginApiSwitch, {
          prefix: "/:name/:version/api",
        });
      });
      fastify.register(frontendComponents, {
        prefix: "/frontend",
      });
    },
    { prefix: "/plugins" }
  );
});
