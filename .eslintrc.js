module.exports = {
  extends: ['next/core-web-vitals', 'plugin:@typescript-eslint/recommended', 'prettier'],
  plugins: ['@typescript-eslint', 'unused-imports', 'simple-import-sort'],
  env: {
    browser: true,
    es2021: true,
    node: true,
  },
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
  rules: {
    // React/Next.js optimizations
    'react/react-in-jsx-scope': 'off',
    'react/prop-types': 'off',
    'jsx-a11y/anchor-is-valid': 'off',

    // TypeScript optimizations
    '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    '@typescript-eslint/no-explicit-any': 'warn',
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/no-non-null-assertion': 'warn',

    // Modern JavaScript
    'prefer-const': 'error',
    'no-var': 'error',
    'object-shorthand': 'error',
    'prefer-arrow-callback': 'error',

    // Import management
    'unused-imports/no-unused-imports': 'error',
    'simple-import-sort/imports': 'error',
    'simple-import-sort/exports': 'error',

    // Development quality
    'no-console': 'warn',
    'no-debugger': 'error',

    // Next.js specific overrides
    'no-param-reassign': ['error', { props: false }],
    'consistent-return': 'off',

    // Allow patterns needed for this codebase
    'no-await-in-loop': 'off', // Needed for sequential scraping
    '@typescript-eslint/no-require-imports': 'off', // Allow require() in config files
  },
  overrides: [
    {
      // API routes and lib files - more relaxed
      files: ['pages/api/**/*.{js,ts}', 'lib/**/*.{js,ts}', 'prisma/**/*.{js,ts}'],
      rules: {
        'no-console': 'off',
        '@typescript-eslint/no-explicit-any': 'off',
      },
    },
    {
      // Config files
      files: ['**/*.config.{js,ts}', '.*rc.js'],
      rules: {
        '@typescript-eslint/no-require-imports': 'off',
        'no-console': 'off',
      },
    },
  ],
  globals: {
    NodeJS: 'readonly',
  },
}
