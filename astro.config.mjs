// @ts-check
import { defineConfig } from "astro/config";

import inoxToolsContentUtils from "@inox-tools/content-utils";

// https://astro.build/config
export default defineConfig({
  integrations: [inoxToolsContentUtils()]
});