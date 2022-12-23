module.exports = {
  env: {
    browser: true,
    es2021: true,
  },
  extends: 'airbnb-base',
  overrides: [
  ],
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
  rules: {
    semi: ['error', 'never'],
    'no-console': 0,
    'linebreak-style': 0,
    'no-tabs': 0,
    'no-alert': 0,
    'consistent-return': 0,
  },
}
