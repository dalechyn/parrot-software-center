module.exports = {
  env: {
    browser: true,
    commonjs: true,
    node: true
  },
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint'],
  extends: [
    'standard',
    'plugin:react/recommended',
    'plugin:prettier/recommended',
    '@typescript-eslint',
    'plugin:@typescript-eslint/recommended'
  ],
  parserOptions: {
    sourceType: 'module',
    ecmaVersion: 2020,
    ecmaFeatures: {
      experimentalObjectRestSpread: true
    }
  },
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
