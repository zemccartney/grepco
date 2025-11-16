// @ts-check
import inoxToolsContentUtils from "@inox-tools/content-utils";
import expressiveCode from "astro-expressive-code";
import { defineConfig } from "astro/config";

// https://astro.build/config
export default defineConfig({
    integrations: [
        inoxToolsContentUtils({
            staticOnlyCollections: ["posts"]
        }),
        expressiveCode({
            themes: ["night-owl"]
        })
    ]
});
