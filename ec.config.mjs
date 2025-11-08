import { pluginLineNumbers } from "@expressive-code/plugin-line-numbers";
import { defineEcConfig } from "astro-expressive-code";

export default defineEcConfig({
    plugins: [pluginLineNumbers()],
    styleOverrides: {
        codeFontFamily: "var(--font-mono)",
        codeFontWeight: "500",
        lineNumbers: {
            foreground: "#04c4fec5"
        }
    }
});
