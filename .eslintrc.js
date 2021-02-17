module.exports = {
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: `${__dirname}/tsconfig.json`,
    sourceType: 'module',
    ecmaVersion: 2020,
    tsconfigRootDir: __dirname,
    createDefaultProgram: true,
    ecmaFeatures: {
      experimentalObjectRestSpread: true,
      jsx: true
    }
  },
  plugins: ['@typescript-eslint'],
  extends: [
    'erb',
    'plugin:react/recommended',
    'plugin:@typescript-eslint/recommended',
    'prettier/@typescript-eslint',
    'plugin:prettier/recommended'
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
    ],
    'react/prop-types': 'off',
    '@typescript-eslint/explicit-function-return-type': 'off',
    'import/no-extraneous-dependencies': 'off'
  },
  settings: {
    react: {
      version: 'detect'
    },
    'import/resolver': {
      // See https://github.com/benmosher/eslint-plugin-import/issues/1396#issuecomment-575727774 for line below
      node: {},
      webpack: {
        config: require.resolve('./.erb/configs/webpack.config.eslint.js')
      }
    }
  }
}
