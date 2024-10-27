export default {
  extends: ["stylelint-config-standard"],
  rules: {
    "value-keyword-case": [
      "lower",
      {
        ignoreProperties: ["text-rendering"],
      },
    ],
    // allow writing media queries as implicit ranges (standard)
    "media-feature-range-notation": ["prefix"],
    // allow writing out grid-template-[columns, rows, areas] separately; found shorthand of grid-template to be unwieldy
    // not totally sure this is the best way to configure; didn't totally understand the rule's options (ignoreLonghands vs. ignoreShorthands)
    "declaration-block-no-redundant-longhand-properties": [
      true,
      {
        ignoreShorthands: ["/grid/"],
      },
    ],
    // allow for capitalization in kebab case segments
    "selector-class-pattern": ["([W]-?)*"],
  },
};
