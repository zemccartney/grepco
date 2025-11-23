import type { MiddlewareHandler } from "astro";
import type { Options as MetaOptions } from "rehype-meta";

import { localsKey } from "@page-meta/add";
import { rehype } from "rehype";
import rehypeMeta from "rehype-meta";

/*
    TESTS

    - no meta set, skipped
    - og:type output as website
    - link rel:canonical and og:url properly formatted
    - verify possible to reference astro-managed images and public assets as og:image

    - what happens if tags already set? overwritten, right? would need to document if published
*/

export const onRequest: MiddlewareHandler = async (context, next) => {
    const response = await next();
    // TODO this is insufficient, falls down for server islands, need to verify that;
    // TODO if bundling routes integration, would need to document how to opt out of types augmentation / injection? i.e. ignore visible side-effect
    // TODO for rewrites, handle in transforms, i think the only possible way (tho on rewrite, wouldn't you want canonical url set to pre-rewrite?)
    if (!response.headers.get("content-type")?.includes("text/html")) {
        return response;
    }

    // @ts-expect-error -- ts complaining about indexing with symbol; not going to augment Locals with a symbol index signature, this is fine
    const meta = context.locals[localsKey] as MetaOptions | undefined;

    if (!meta) {
        return response;
    }

    /*
        DON'T EXPOSE AS ARGS ON UTILITY
            - type
            - origin

        title : required
        description : required
        url : set via site parameter (document how this works, relation to rel="canonical"), don't expose setting
            https://yoast.com/rel-canonical/#when-canonical
            http://www.thesempost.com/using-rel-canonical-on-all-pages-for-duplicate-content-protection/
    */
    const opts: MetaOptions = {
        ...meta,
        og: true,
        pathname: context.url.pathname, // TODO Test how this ends up formatted against origin set e.g. warnings about trailing slashes (warn w/ typescript, template literal?)
        type: "website"
    };
    if (context.url.pathname !== "/") {
        opts.name = "GrepCo"; // TODO exclude site name and type from addPageMeta interface
        opts.separator = " | ";
        opts.ogNameInTitle = true;
    }

    const html = await response.text();

    const processed = await rehype().use(rehypeMeta, opts).process(html);

    // TODO What does this do?
    return new Response(String(processed), response);
};
