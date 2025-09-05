module.exports = {
  root: true,
  env: {
    browser: true,
    es2021: true,
    node: true,
  },
  extends: [
    "eslint:recommended",
    "plugin:vue/vue3-recommended",
    "plugin:prettier/recommended" // activa Prettier dentro de ESLint
  ],
  parserOptions: {
    ecmaVersion: "latest",
    sourceType: "module",
  },
  rules: {
    // tus ajustes extra
    "vue/multi-word-component-names": "off" // no obliga a que cada componente tenga dos palabras
  },
}
