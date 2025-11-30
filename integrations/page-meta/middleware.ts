import type { APIContext } from "astro";
import type { Options as MetaOptions } from "rehype-meta";

import { resolveMeta } from "@page-meta/add";
import { defineMiddleware, sequence } from "astro:middleware";
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

const isPage = (ctx: APIContext, response: Response) => {
    return (
        ctx.routePattern &&
        ctx.routePattern !== "/og" && // TODO configurable endpoint path
        response.headers.get("content-type")?.includes("text/html") // excludes /_image, TODO but would catch server islands ...
    );
};

export const preview = defineMiddleware(async (context, next) => {
    const response = await next();
    // TODO this is insufficient, falls down for server islands, need to verify that;
    // TODO if bundling routes integration, would need to document how to opt out of types augmentation / injection? i.e. ignore visible side-effect
    // TODO for rewrites, handle in transforms, i think the only possible way (tho on rewrite, wouldn't you want canonical url set to pre-rewrite?)
    if (!isPage(context, response)) {
        return response;
    }

    const isPreview = context.url.searchParams.has("og-img");

    if (!isPreview) {
        return response;
    }

    const searchParams = new URLSearchParams();
    searchParams.append("route", context.url.pathname);

    return context.rewrite("/og?" + searchParams.toString());
});

export const process = defineMiddleware(async (context, next) => {
    const response = await next();
    // TODO this is insufficient, falls down for server islands, need to verify that;
    // TODO if bundling routes integration, would need to document how to opt out of types augmentation / injection? i.e. ignore visible side-effect
    // TODO for rewrites, handle in transforms, i think the only possible way (tho on rewrite, wouldn't you want canonical url set to pre-rewrite?)
    if (!isPage(context, response)) {
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
    const meta = resolveMeta(context);

    // TODO Differentiate meta undefined vs. globally defined
    if (!meta) {
        return response;
    }

    const opts: MetaOptions = {
        ...meta,
        pathname: context.url.pathname // TODO Test how this ends up formatted against origin set e.g. warnings about trailing slashes (warn w/ typescript, template literal?)
    };

    const html = await response.text();

    const processed = await rehype().use(rehypeMeta, opts).process(html);

    // TODO What does this do?
    return new Response(String(processed), response);
});

export const onRequest = sequence(preview, process);
