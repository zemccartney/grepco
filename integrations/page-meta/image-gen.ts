import type { Element } from "hast";

import * as Astro from "astro";
import Fs from "node:fs/promises";
import Path from "node:path";
import Puppeteer from "puppeteer";
import RehypeParse from "rehype-parse";
import { unified as Unified } from "unified";
import { visit as Visit } from "unist-util-visit";

const browser = await Puppeteer.launch();

// root
// outdir

/*
    For each static page with image generation enabled

    1. generate the image (go to astro dev server, take screenshot)
*/

// dev needed so og integration page still set
const astroServer = await Astro.dev({
    devToolbar: {
        // otherwise shows up in screenshots
        enabled: false
    },
    logLevel: "warn",
    mode: "development",
    // Use a different port to avoid conflicts with regular dev server
    server: { port: 4322 }
});

const pages = [
    { pathname: "404/" },
    { pathname: "about/" },
    { pathname: "blog/ts-log-init/" },
    { pathname: "blog/requiem-for-a-seltzer/" },
    { pathname: "blog/" },
    { pathname: "projects/nbastt/" },
    { pathname: "projects/wine-cellar/" },
    { pathname: "projects/" },
    { pathname: "" }
];

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
const imgVary = [{ pattern: "/blog/[slug]", rx: /^\/blog\/([^/]+?)\/?$/ }];

const normalizePathname = (pathname: string) => {
    const normalized = pathname.replace(/\/$/, "");
    return normalized.startsWith("/") ? normalized : `/${normalized}`;
};

try {
    await Fs.rm(ogImageDir, { force: true, recursive: true });
    await Fs.mkdir(ogImageDir);

    const page = await browser.newPage();

    for (const pg of pages) {
        const normalizedPath = normalizePathname(pg.pathname);
        const varyPath = imgVary.find((pat) => pat.rx.test(normalizedPath));
        const pathImgTpl = varyPath ? normalizedPath : "/"; // default to root; TODO allow setting different default?

        const cleanedPath = normalizedPath.replace(/^\//, "");

        console.log({ cleanedPath, pathImgTpl, varyPath });

        let filepath;
        if (cleanedPath === "/") {
            filepath = "index.html";
        } else if (STATUS_PAGES.has(cleanedPath)) {
            filepath = `${cleanedPath}.html`;
        } else {
            filepath = Path.join(cleanedPath, "index.html");
        }

        const outFile = Path.resolve(outDir, filepath);
        const built = await Fs.readFile(outFile, { encoding: "utf8" });

        const ogImgDimensions = {
            height: 630,
            width: 1200
        };

        const tree = await Unified().use(RehypeParse).parse(built);

        Visit(tree, "element", (node: Element) => {
            // Visit "element" nodes
            if (node.tagName === "meta" && node.properties) {
                const property = node.properties.property;
                const content = node.properties.content;

                if (
                    property === "og:image:width" &&
                    typeof content === "string"
                ) {
                    const width = Number.parseInt(content, 10);
                    if (!Number.isNaN(width)) {
                        ogImgDimensions.width = width;
                    }
                } else if (
                    property === "og:image:height" &&
                    typeof content === "string"
                ) {
                    const height = Number.parseInt(content, 10);
                    if (!Number.isNaN(height)) {
                        ogImgDimensions.height = height;
                    }
                }
            }
        });

        console.log(`Dimensions for ${pg.pathname}:`, ogImgDimensions); // You can log to verify

        const searchParams = new URLSearchParams();
        // TODO do better? needed b/c og route expects route (loosen that expectation / normalize away?)
        // TODO normalizing on required leading slash, but no trailing (or optional trailing) i.e. patternRegex semantics
        // seems useful; seems exactly what og-tpl-astro expects
        searchParams.append("route", pathImgTpl);

        const url = new URL("/og?" + searchParams.toString(), baseUrl);

        // TODO better way to translate slugs to filenames?
        // TODO filename limit?
        // TODO provide way to configure?
        const filename =
            pathImgTpl === "/" ?
                "base" // TODO allow configuring default name (typescript tpl for url safe?)
            :   pathImgTpl.replace(/^\//, "").replace("/", "-"); // TODO explain

        console.log({ filename });

        await page.goto(url.href);
        await page.setViewport(ogImgDimensions);
        await page.screenshot({
            path: Path.join(ogImageDir, `${filename}.png`),
            type: "png"
        });
    }
} finally {
    await browser?.close();
    await astroServer?.stop();
}
