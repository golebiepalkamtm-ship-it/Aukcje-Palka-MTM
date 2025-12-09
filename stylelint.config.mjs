/** @type {import("stylelint").Config} */
export default {
  "extends": ["stylelint-config-standard"],
  "rules": {
    "selector-class-pattern": "^[a-z0-9\-]+$",
    "declaration-block-single-line-max-declarations": 1,
    "keyframes-name-pattern": "^[a-z0-9\-]+$",
    "no-duplicate-selectors": true,
    "property-no-unknown": true
  }
};
