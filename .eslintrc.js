module.exports = {
  env: {
    node: true,
    es2022: true
  },
  extends: 'eslint:recommended',
  overrides: [],
  parserOptions: {
    sourceType: 'module',
    ecmaVersion: 'latest'
  },
  rules: {
    quotes: ['error', 'single']
  }
}
