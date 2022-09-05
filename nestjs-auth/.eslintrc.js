module.exports = {
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: 'tsconfig.json',
    tsconfigRootDir : __dirname, 
    sourceType: 'module',
  },
  plugins: ['@typescript-eslint/eslint-plugin', 'unused-imports', 'simple-import-sort'],
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
    'semi': ['error', 'never'],
    "unused-imports/no-unused-imports": "error",
    "simple-import-sort/imports": "error",
    "simple-import-sort/exports": "error"
  },
  overrides: [
    {
      files: ["*.ts"],
      rules: {
        "simple-import-sort/imports": [
          "error",
          {
            groups: [
              [
                "^@.*$", // @ modules
                "^[^.].*$" // libs
              ],
              [
                "^.*\.\.\/.*$", // `../` parents folder
                "^\.\/.*\/.*$", // `./xyz/abc` imports
                "^\.\/[^/]*$", // `./main` same-folder imports
              ],
            ]
          }
        ]
      }
    }
  ]
};
