import { dirname } from 'path'
import { fileURLToPath } from 'url'
import { FlatCompat } from '@eslint/eslintrc'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const compat = new FlatCompat({
  baseDirectory: __dirname,
})

const eslintConfig = [
  // Archivos a ignorar globalmente
  {
    ignores: [
      'node_modules/**',
      '.next/**',
      '.vercel/**',
      'out/**',
      'build/**',
      'dist/**',
      '**/*.d.ts',
      'next-env.d.ts',
      '**/.next/**',
      '**/out/**',
      '**/build/**',
    ],
  },
  // Configuración para archivos del proyecto
  ...compat.extends('next/core-web-vitals', 'next/typescript'),
  ...compat.config({
    extends: ['prettier'],
    plugins: ['prettier'],
  }),
  {
    files: ['src/**/*.{js,jsx,ts,tsx}', '*.{js,jsx,ts,tsx}'],
    rules: {
      'prettier/prettier': 'error',
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
        },
      ],
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/ban-ts-comment': 'warn',
      '@typescript-eslint/no-this-alias': 'warn',
      '@typescript-eslint/no-unused-expressions': 'warn',
      '@typescript-eslint/no-unsafe-function-type': 'warn',
      '@typescript-eslint/no-empty-object-type': 'warn',
      '@typescript-eslint/triple-slash-reference': 'off',
    },
  },
]

export default eslintConfig
