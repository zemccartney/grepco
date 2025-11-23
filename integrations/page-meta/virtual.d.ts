declare module "@page-meta/add" {
    import type { Options } from "rehype-meta";

    export const localsKey: unique symbol;
    export const addPageMeta: (
        ctx: { locals: App.Locals },
        data: Options
    ) => void;
}
