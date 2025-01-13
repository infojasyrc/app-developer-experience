module.exports = {
  files: [
    'tests/**/*.spec.js',
    'tests/**/**/*.spec.js',
    '!tests/util/*.js',
    '!tests/fixtures/*.js',
  ],
  cache: true,
  failWithoutAssertions: false,
  verbose: true,
}
