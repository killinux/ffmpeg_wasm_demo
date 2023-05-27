module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  extends: [
    '@tencent/eslint-config-tencent',
  ],
  env: {
    jest: true,
  },
  globals: {
    JSX: true,
    React: true,
  },
  settings: {
    react: {
      version: 'detect',
    },
  },
  rules: {
    semi: 1,
    'react/no-unstable-nested-components': 'warn',
    'no-promise-executor-return': 0,
    'react/self-closing-comp': 'warn',
    // 避免出现从 global里引的类型出现类型未定义
    'no-undef': 0,
    'no-debugger': 0,
    '@typescript-eslint/explicit-member-accessibility': 0,
  },
};
