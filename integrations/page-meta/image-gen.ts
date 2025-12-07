import type { Options } from "rehype-meta";

import * as Astro from "astro";
import Fs from "node:fs/promises";
import Path from "node:path";
import Puppeteer from "puppeteer";
// import ImageService from "astro/assets/services/sharp"

export default async function generateOgImages(
    routesMeta: Map<
        string,
        { imagePath: string; meta: Options; ogImgProp: string }
    >
    // imageService: string
) {
    // TODO For img service config, would need to check if external
    // service, fall back to local

    // TODO

    // root
    // outdir

    /*
    For each static page with image generation enabled

    1. generate the image (go to astro dev server, take screenshot)
*/

    let browser;
    let astroServer;

    try {
        // dev needed so og integration page still set
        browser = await Puppeteer.launch();

        astroServer = await Astro.dev({
            devToolbar: {
                // otherwise toolbar shows up in screenshots
                enabled: false
            },
            logLevel: "warn",
            mode: "development",
            // Use a different port to avoid conflicts with regular dev server
            // TODO make configurable
            server: { port: 4322 }
        });

        const outDir = Path.resolve(process.cwd(), "dist");
        const protocol = "http"; // Astro dev server typically runs on http
        const host = astroServer.address.address;
        const port = astroServer.address.port;

        // Check if it's an IPv6 address
        const baseUrl =
            host.includes(":") ?
                `${protocol}://[${host}]:${port}`
            :   `${protocol}://${host}:${port}`;

        const ogImageDir = Path.join(outDir, "og-images/");

        const STATUS_PAGES = new Set(["404", "500"]);

        // by default, will generate images for all paths
        // but can optimize by telling generator how images vary
        const imgVary = [
            { pattern: "/blog/[slug]", rx: /^\/blog\/([^/]+?)\/?$/ }
        ];

        const normalizePathname = (pathname: string) => {
            const normalized = pathname.replace(/\/$/, "");
            return normalized.startsWith("/") ? normalized : `/${normalized}`;
        };

        await Fs.rm(ogImageDir, { force: true, recursive: true });
        await Fs.mkdir(ogImageDir);

        const page = await browser.newPage();

        for (const [pathname, config] of routesMeta.entries()) {
            const normalizedPath = normalizePathname(pathname);

            console.log({ normalizedPath, pathname });

            const varyPath = imgVary.find((pat) => pat.rx.test(normalizedPath));

            // TODO Need to implement unique images per page by default
            const pathImgTpl = varyPath ? normalizedPath : "/"; // default to root; TODO allow setting different default?

            const cleanedPath = normalizedPath.replace(/^\//, "");

            console.log({ cleanedPath, pathImgTpl, varyPath });

            if (STATUS_PAGES.has(cleanedPath)) {
                continue;
            }

            // TODO Add defaults
            const ogImgDimensions = {
                /* @ts-expect-error -- TODO fix later */
                height: config.meta.image.height,
                /* @ts-expect-error -- TODO fix later */
                width: config.meta.image.width
            };

            const searchParams = new URLSearchParams();
            // TODO do better? needed b/c og route expects route (loosen that expectation / normalize away?)
            // TODO normalizing on required leading slash, but no trailing (or optional trailing) i.e. patternRegex semantics
            // seems useful; seems exactly what og-tpl-astro expects
            searchParams.append("route", pathImgTpl);

            const url = new URL("/og?" + searchParams.toString(), baseUrl);

            const finalOutPath = Path.join(
                ogImageDir,
                config.imagePath.replace(/^\//, "")
            );

            await page.goto(url.href);
            await page.setViewport(ogImgDimensions);
            await page.screenshot({
                path: finalOutPath,
                type: "png"
            });

            // TODO optimize images w/ service
            /* await ImageService.transform(

            ) */
        }
    } finally {
        await browser?.close();
        await astroServer?.stop();
    }
}
