/* eslint-disable import/default */
import "./lib/logger";
import type { FastifyPluginAsync } from "fastify";
import { join } from "path";

import type { AutoloadPluginOptions } from "@fastify/autoload";
import AutoLoad from "@fastify/autoload";

import { initTgBot } from "./bot";
import type { ModuleContext } from "./types/context";
import { registerModules } from "./modules/loader";
import { hook } from "./lib/plugin";
import { registerLogger } from "./lib/logger";

export type AppOptions = {
  // Place your custom options for app below here.
} & Partial<AutoloadPluginOptions>;

const app: FastifyPluginAsync<AppOptions> = async (
  fastify,
  opts,
): Promise<void> => {
  // Place here your custom code!

  const tgBot = initTgBot();

  const moduleContext: ModuleContext = {
    tgBot,
    server: fastify,
  };

  registerLogger();
  await registerModules();
  await hook.runAsyncWaterfall(moduleContext);

  // Do not touch the following lines

  // This loads all plugins defined in plugins
  // those should be support plugins that are reused
  // through your application
  void fastify.register(AutoLoad, {
    dir: join(__dirname, "plugins"),
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
