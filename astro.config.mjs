// @ts-check
import inoxToolsContentUtils from "@inox-tools/content-utils";
import { defineConfig } from "astro/config";

// https://astro.build/config
export default defineConfig({
    integrations: [inoxToolsContentUtils()]
});
