import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import importPlugin from 'eslint-plugin-import'
import { defineConfig, globalIgnores } from 'eslint/config'

const featureExcept = (name, extraExcept = []) => [
  {
    target: `./src/features/${name}`,
    from: './src/features',
    except: [`./${name}`, `./${name}/**`, ...extraExcept],
  },
]

/** Settings tab may import sibling tabs only via public folders (barrel index). */
const settingsTabExcept = (tab, siblingTabs = []) => {
  const sharedExcept = [
    './shared',
    './shared/**',
    './api',
    './api/**',
    './index.js',
  ]
  const shellExcept =
    tab === 'shell' ? [] : ['./shell', './shell/**']
  return [
    {
      target: `./src/features/settings/${tab}`,
      from: './src/features/settings',
      except: [
        `./${tab}`,
        `./${tab}/**`,
        ...sharedExcept,
        ...shellExcept,
        ...siblingTabs.flatMap((s) => [`./${s}`, `./${s}/**`]),
      ],
    },
  ]
}

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{js,jsx}'],
    extends: [
      js.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
      parserOptions: {
        ecmaVersion: 'latest',
        ecmaFeatures: { jsx: true },
        sourceType: 'module',
      },
    },
    settings: {
      'import/resolver': {
        alias: {
          map: [['@', './src']],
          extensions: ['.js', '.jsx'],
        },
      },
    },
    plugins: {
      import: importPlugin,
    },
    rules: {
      'no-unused-vars': [
        'error',
        { varsIgnorePattern: '^[A-Z_]', argsIgnorePattern: '^_' },
      ],
      'react-hooks/set-state-in-effect': 'warn',
      'import/no-restricted-paths': [
        'error',
        {
          zones: [
            { target: './src/shared', from: './src/features' },
            ...featureExcept('auth'),
            ...featureExcept('super-admin'),
            ...featureExcept('org-admin', [
              './employees',
              './employees/**',
              './settings',
              './settings/**',
            ]),
            ...featureExcept('employees', ['./settings/employees', './settings/employees/**']),
            ...featureExcept('employee-portal'),
            ...featureExcept('settings'),
            ...settingsTabExcept('organization'),
            ...settingsTabExcept('employees'),
            ...settingsTabExcept('org-structure', ['employees']),
            ...settingsTabExcept('locations'),
            ...settingsTabExcept('leave', ['locations']),
            ...settingsTabExcept('attendance', ['locations']),
            ...settingsTabExcept('shell', [
              'organization',
              'employees',
              'org-structure',
              'locations',
              'leave',
              'attendance',
            ]),
          ],
        },
      ],
    },
  },
])
