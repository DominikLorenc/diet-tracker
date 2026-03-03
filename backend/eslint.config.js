const tseslint = require('typescript-eslint');
const prettier = require('eslint-config-prettier');

module.exports = [
    {
        ignores: ['node_modules/**', 'dist/**', 'src/generated/**'],
    },
    ...tseslint.configs.recommended,
    {
        files: ['**/*.ts'],
        rules: {
            '@typescript-eslint/no-explicit-any': 'error',
            '@typescript-eslint/no-unused-vars': ['error', {
                argsIgnorePattern: '^_',
                caughtErrorsIgnorePattern: '^_',
            }],
        },
    },
    {
        files: ['eslint.config.js'],
        rules: {
            '@typescript-eslint/no-require-imports': 'off',
        },
    },
    prettier,
];
