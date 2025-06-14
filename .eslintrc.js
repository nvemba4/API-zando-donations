module.exports = {
  env: {
    es6: true,
    node: true,
  },
  parserOptions: {
    "ecmaVersion": 2018,
  },
  extends: [
    "eslint:recommended",
    "google",
  ],
  rules: {
    "no-restricted-globals": ["error", "name", "length"],
    "prefer-arrow-callback": "off",
    "quotes": ["error", "double", {"allowTemplateLiterals": true}],
    'linebreak-style': "off",
    'indent': "off",
    "object-curly-spacing": "off",
    "max-len": "off",
    "comma-dangle": "off",
    "eol-last": "off" 
  },
  overrides: [
    {
      files: ["**/*.spec.*"],
      env: {
        mocha: true,
      },
      rules: {},
    },
  ],
  globals: {},
};
