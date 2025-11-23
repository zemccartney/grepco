import {
    addVirtualImports,
    createResolver,
    defineIntegration
} from "astro-integration-kit";
import * as Fs from "node:fs/promises";

// TODO Add option to set defaults (can still override per page)
// TODO Does Symbol work in virtual module? need to use UUID?
// TODO How do we type addPageMeta? follow same typing as rehype meta options
// TODO Add option, transform, to handle global cases e.g. add separator on subpages
// TODO Somehow require site on astro config?
// TODO Eventually write your own rehype plugin, apply own opinions, really
// don't like rehype-meta api, too many side-effects
// TODO expose transformation as global option
// TODO typing (have an option for lax mode i.e. where no requirements enforced, opinions ignored); users pass own schema, set via injectTypes?
// TODO Possible to lint if addPageMeta not called?

export default defineIntegration({
    name: "@page-meta",
    setup: ({ name }) => {
        const { resolve } = createResolver(import.meta.url);

        return {
            hooks: {
                "astro:config:setup": (params) => {
                    addVirtualImports(params, {
                        imports: [
                            {
                                content: `
                                        export const localsKey = Symbol("page-meta::add");

                                        export const addPageMeta = (ctx, data) => {

                                            ctx.locals[localsKey] = {
                                                ...data,
                                                origin: '${params.config.site || ""}'
                                            };
                                        };
                                    `,
                                context: "server",
                                id: `${name}/add`
                            }
                        ],
                        name
                    });

                    params.addMiddleware({
                        entrypoint: resolve("./middleware"),
                        order: "post"
                    });
                },
                // eslint-disable-next-line perfectionist/sort-objects
                "astro:config:done": async (params) => {
                    params.injectTypes({
                        content: await Fs.readFile(resolve("./virtual.d.ts"), {
                            encoding: "utf8"
                        }),
                        filename: "page-meta.d.ts"
                    });
                }
            }
        };
    }
});
