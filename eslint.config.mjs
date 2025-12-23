module.exports = {
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: 'tsconfig.json',
    tsconfigRootDir: __dirname,
    sourceType: 'module',
  },
  plugins: ['@typescript-eslint/eslint-plugin', 'simple-import-sort', 'import'],
  extends: [
    'plugin:@typescript-eslint/recommended',
    'plugin:prettier/recommended',
  ],
  root: true,
  env: {
    node: true,
    jest: true,
  },
  ignorePatterns: ['.eslintrc.js'],
  rules: {
    '@typescript-eslint/interface-name-prefix': 'off',
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/no-explicit-any': 'off',
    'simple-import-sort/imports': [
      'error',
      {
        groups: [
          // Node.js builtins. You could also include other standard Node.js libraries here
          [`^(${require('module').builtinModules.join('|')})(/|$)`],

          // Packages. `react` related packages come first
          ['^@?\\w'],

          // Internal packages
          ['^(src|@src|@app)(/.*|$)'],

          // Side effect imports
          ['^\\u0000'],

          // Parent imports. Put `..` last
          ['^\\.\\.(?!/?$)', '^\\.\\./?$'],

          // Other relative imports. Put same-folder imports and `.` last
          ['^\\./(?=.*/)(?!/?$)', '^\\.(?!/?$)', '^\\./?$'],

          // Style imports
          ['^.+\\.s?css$'],
        ],
      },
    ],

    // Sort export statements
    'simple-import-sort/exports': 'error',

    // Turn off import order
    'import/order': 'off',

    // Ensure imports are placed at the top of the file
    'import/first': 'error',

    // Ensure there's a newline after the last import
    'import/newline-after-import': 'error',

    // Disallow duplicate imports
    'import/no-duplicates': 'error',

    // Allow named exports to be the same as the default export
    'import/no-named-as-default': 'off',
  },
};
