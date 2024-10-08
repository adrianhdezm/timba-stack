import jsPlugin from '@eslint/js';
import tsPlugin from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';
import jsxA11yPlugin from 'eslint-plugin-jsx-a11y';
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';
import reactPlugin from 'eslint-plugin-react';
import reactHooksPlugin from 'eslint-plugin-react-hooks';
import globals from 'globals';

/** @type {import("eslint").Linter.Config[]} */
export default [
  {
    ignores: ['!**/.server', '!**/.client', '**/.cache/**', '**/node_modules/**', '**/build/**']
  },
  // Base config
  {
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module'
    },
    rules: {
      ...jsPlugin.configs.recommended.rules
    }
  },

  // React
  {
    files: ['src/app/**/*.{js,mjs,cjs,ts,jsx,tsx}'],
    languageOptions: {
      parserOptions: {
        ecmaFeatures: {
          jsx: true
        }
      },
      globals: {
        ...globals.browser,
        React: true
      }
    },
    plugins: {
      react: reactPlugin,
      'react-hooks': reactHooksPlugin,
      'jsx-a11y': jsxA11yPlugin
    },
    rules: {
      ...reactPlugin.configs.recommended.rules,
      ...reactPlugin.configs['jsx-runtime'].rules,
      ...reactHooksPlugin.configs.recommended.rules,
      ...jsxA11yPlugin.configs.recommended.rules
    },
    settings: {
      react: {
        version: 'detect'
      },
      formComponents: ['Form'],
      linkComponents: [
        { name: 'Link', linkAttribute: 'to' },
        { name: 'NavLink', linkAttribute: 'to' }
      ],
      'import/resolver': {
        typescript: {}
      }
    }
  },

  // Typescript
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      parser: tsParser
    },
    plugins: {
      '@typescript-eslint': tsPlugin
    },
    rules: {
      ...tsPlugin.configs.recommended.rules
    }
  },

  // Node
  {
    files: ['src/server/**/*.ts', 'vite.config.ts', 'eslint.config.mjs', 'postcss.config.js'],
    languageOptions: {
      globals: {
        ...globals.node
      }
    }
  },

  // Prettier
  eslintPluginPrettierRecommended
];
