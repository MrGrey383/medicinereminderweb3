module.exports = {
  root: true,
  env: { browser: true, es2020: true },
  parserOptions: { 
    ecmaVersion: 'latest', 
    sourceType: 'module'
  },
  rules: {
    'quotes': 'off',
    'no-unused-vars': 'warn'
  }
}
