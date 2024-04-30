import fp from "fastify-plugin";
import cookie, { FastifyCookieOptions } from "@fastify/cookie";

export default fp<FastifyCookieOptions>(async (fastify) => {
  fastify.register(cookie);
});
