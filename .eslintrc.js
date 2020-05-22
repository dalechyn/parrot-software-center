module.exports = {
  parser: '@typescript-eslint/parser',
  parserOptions: {
    sourceType: 'module',
    ecmaVersion: 2020,
    ecmaFeatures: {
      experimentalObjectRestSpread: true,
      jsx: true
    }
  },
  plugins: ['@typescript-eslint'],
  extends: [
    'plugin:react/recommended',
    'plugin:@typescript-eslint/recommended',
    "prettier/@typescript-eslint",
    "plugin:prettier/recommended"
  ],

  rules: {
    'react/no-unescaped-entities': [
      'error',
      {
        forbid: [
          {
            char: "'",
            alternatives: ['&apos;']
          }
        ]
      }
    ]
  }
}
