module.exports = {
	env: {
		browser: true,
		commonjs: true,
		node: true
	},
	extends: ['standard', 'plugin:react/recommended', 'plugin:prettier/recommended'],
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
