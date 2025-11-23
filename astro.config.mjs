// @ts-check
import inoxToolsContentUtils from "@inox-tools/content-utils";
import expressiveCode from "astro-expressive-code";
import { defineConfig } from "astro/config";

import pageMeta from "./integrations/page-meta/integration";

// https://astro.build/config
export default defineConfig({
    integrations: [
        inoxToolsContentUtils(),
        expressiveCode({
            themes: ["night-owl"]
        }),
        pageMeta()
    ],
    site: "https://grepco.net"
});
