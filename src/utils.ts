import type { CollectionEntry } from "astro:content";

export const getPostDisplayId = (post: CollectionEntry<"posts">) => {
    return post.id.replace("drafts/", "");
};
