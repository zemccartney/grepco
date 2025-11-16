import type { CollectionEntry } from "astro:content";

export const getPostDisplayId = (post: CollectionEntry<"posts">) => {
    return post.id.replace("drafts/", "");
};

const easternShortFormatter = new Intl.DateTimeFormat("en-US", {
    day: "2-digit",
    month: "2-digit",
    timeZone: "America/New_York",
    year: "numeric"
});

const easternLongFormatter = new Intl.DateTimeFormat("en-US", {
    day: "numeric",
    month: "long",
    timeZone: "America/New_York",
    year: "numeric"
});

export const displayDatetimeEastern = (
    date: Date,
    style: "long" | "short" = "short"
) => {
    if (!["long", "short"].includes(style)) {
        throw new Error("displayDatetimeEastern: invalid date display");
    }

    return style === "short" ?
            easternShortFormatter.format(date)
        :   easternLongFormatter.format(date);
};
