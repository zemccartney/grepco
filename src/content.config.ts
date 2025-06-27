import { glob } from "astro/loaders";
import { defineCollection, z } from "astro:content";

const projects = defineCollection({
    loader: glob({
        base: "./src/content/projects",
        pattern: "**/[^_]*.{md,mdx}"
    }),
    schema: z.object({
        description: z.string(),
        name: z.string(),
        repoUrl: z.string().url(),
        url: z.string().url()
    })
});

export const collections = {
    projects
};
