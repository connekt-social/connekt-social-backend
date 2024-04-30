import fp from "fastify-plugin";
import cors, { FastifyCorsOptions } from "@fastify/cors";
import dotenv from "dotenv";

dotenv.config();

export default fp<FastifyCorsOptions>(async (fastify) => {
  fastify.log.info(
    "Registering CORS plugin, allowing requests from frontend URL. >> " +
      process.env.FRONTEND_URL
  );
  fastify.register(cors, {
    origin: process.env.FRONTEND_URL,
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  });
});
