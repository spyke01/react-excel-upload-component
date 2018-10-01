module.exports = {
  'extends': ['airbnb', 'eslint:recommended', 'plugin:react/recommended'],
  env: {
    'browser': true,
    'jquery': true,
    'node': true,
  },
  globals: {},
  rules: {
    'import/no-extraneous-dependencies': ['error', { 'devDependencies': true, 'optionalDependencies': false, 'peerDependencies': false }],
    'linebreak-style': 0,
    'no-console': 0,
    'max-len': 0,
    'react/jsx-one-expression-per-line': 0,
    'jsx-a11y/label-has-for': 0,
    'react/jsx-filename-extension': 0
  },
};