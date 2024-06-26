module.exports = {
  root: true,
  extends: [
    "@react-native-community",
    "plugin:react-native-a11y/all",
    "plugin:import/recommended",
    "plugin:import/typescript"
  ],
  plugins: ["functional"],
  rules: {
    quotes: [1, "double"],
    "no-underscore-dangle": "error",
    "comma-dangle": "off",
    "import/order": "error",
    "import/no-named-as-default": "off",
    "import/no-named-as-default-member": "off",
    "import/namespace": "off",
    "react-native/no-inline-styles": "off",
    "@typescript-eslint/no-unused-vars": "warn",
    "@typescript-eslint/ban-ts-comment": "error",
    "no-console": "error",
    "functional/no-let": "error",
    "functional/immutable-data": "error",
    "eslint-comments/no-unlimited-disable": "off",
    "react-native-a11y/has-accessibility-hint": "off",
    "react/no-unstable-nested-components": "off"
  },
  ignorePatterns: [
    "*rc.js",
    "*.config.js",
  ],
  settings: {
    "import/resolver": {
      typescript: true,
      node: true
    }
  }
};
