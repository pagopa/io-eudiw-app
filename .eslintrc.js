module.exports = {
  root: true,
  extends: [
    "@react-native-community",
    "plugin:react-native-a11y/all",
    "plugin:import/recommended",
    "plugin:import/typescript"
  ],
  rules: {
    quotes: [1, "double"],
    "comma-dangle": "off",
    "import/order": "error"
  },
  settings: {
    "import/resolver": {
      typescript: true,
      node: true
    }
  }
};
