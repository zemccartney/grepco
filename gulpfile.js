import { deleteAsync } from "del";
import Gulp from "gulp";
import GulpIf from "gulp-if";
import * as GulpNunjucks from "gulp-nunjucks";
import { gulpPlugin as GulpPlugin } from "gulp-plugin-extras";
import Imagemin from "gulp-imagemin";
import ImageExtensions from "image-extensions" with { type: "json" };
import Lazypipe from "lazypipe";
import PngQuant from "imagemin-pngquant";
import PostCss from "gulp-postcss";
import PostCssBundler from "@csstools/postcss-bundler";
import PostCssMinify from "@csstools/postcss-minify";
import PostCssPresetEnv from "postcss-preset-env";
import Sharp from "sharp";
import Vinyl from "vinyl";

/*

WARNING: Currently depends on running with --no-experimental-require-module node flag
due to https://github.com/gulpjs/gulp-cli/issues/268

*/

/* Postcss usage pulled from https://github.com/csstools/postcss-plugins/tree/75e5ded5f37b641bec9bc45e9fcb7c5b51880673/postcss-recipes/minimal-setup */

function clean() {
    return deleteAsync("dist");
}

function isBabyCCarouselImage(file) {
    return file.relative.startsWith("images/babyc");
}

function BabyCResizer() {
    // https://web.dev/articles/serve-responsive-images
    // https://developer.chrome.com/docs/lighthouse/performance/uses-responsive-images
    return GulpPlugin("baby-c-resize", async (file) => {
        const resized = new Vinyl({
            cwd: file.cwd,
            base: file.base,
            path: file.path,
            contents: await Sharp(file.contents)
                .resize(252, 336) // see About page for hardcoded dimensions
                .toBuffer()
        });

        return resized;
    });
}

const BabyCPipeline = Lazypipe()
    .pipe(BabyCResizer)
    .pipe(Imagemin, [PngQuant({ quality: [0.65, 0.8] })], { verbose: true });

function images() {
    return Gulp.src(`src/**/*.{${ImageExtensions.join(",")}}`, {
        // ideally, figure out a way to pull all files into src, GulpIf to determine handling by file type; gap right now
        // is that we need to call encoding: false to read images as binary (and not gulp's default of converting to text, breaking images)
        encoding: false
    })
        .pipe(
            GulpIf(
                isBabyCCarouselImage, // skip pre-optimized images...
                BabyCPipeline(),
                Imagemin({ verbose: true }) // ... optimize only the lighter images, that don't take minutes to process (small gains)
            )
        )
        .pipe(Gulp.dest("dist/"));
}

function css() {
    const plugins =
        process.env.NODE_ENV === "production" ?
            // PostCssBundler: assumes every page only links one style sheet, importing dependencies
            // within that stylesheet via @import
            // Essentially this idea: https://stackoverflow.com/a/23175775
            [PostCssBundler(), PostCssPresetEnv(), PostCssMinify()]
        :   [PostCssPresetEnv()];

    return Gulp.src("src/**/*.css", { sourcemaps: true })
        .pipe(PostCss(plugins))
        .pipe(Gulp.dest("dist/", { sourcemaps: true }));
}

function tpl() {
    return Gulp.src(["src/**/*.html", "!src/layouts/**"])
        .pipe(GulpNunjucks.nunjucksCompile())
        .pipe(Gulp.dest("dist/"));
}

function others() {
    return Gulp.src("src/**/*.{txt}").pipe(Gulp.dest("dist/"));
}

export const build = Gulp.series(
    clean,
    Gulp.parallel(images, css, tpl, others)
);

export const local = Gulp.series(
    build,
    // TODO Possible to update only the file affected?
    () => {
        Gulp.watch("src/**/*.css", css);
        Gulp.watch("src/**/*.{txt}", others);
        // Watch layout, too, so changes trigger rebuild
        Gulp.watch(["src/**/*.html"], tpl);
    }
);

/*
Problem: image optimization can take a long time such that optimizing our images
during local dev e.g. as part of starting the dev server, would be insanity-inducing

I want 
a.) for local dev, optimized images, both to test optimized display and so pages load faster locally
b.) images stored in correct src locations, so can still serve the site with no build as desired
c.) clear how to regenerate images, if ever needed

At the time of writing, I'm running image optimization on the heavy carousel images in the build task

If ever needed, remove and pre-optimize images as follows:

- original images are stored in drive
- to (re)generate, pull images down and run the following, saving results in version control

*/
export function prepareBabyCGallery() {
    return Gulp.src("tmp/babyc", { encoding: false })
        .pipe(BabyCPipeline())
        .pipe(Gulp.dest("src/images/babyc"))
        .on("end", async () => await deleteAsync("tmp/_babycresized"));
}
