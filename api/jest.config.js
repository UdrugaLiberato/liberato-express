/** @type {import('ts-jest').JestConfigWithTsJest} */
// eslint-disable-next-line unicorn/prefer-module
module.exports = {
  testEnvironment: 'node',
  transform: {
    '^.+\\.tsx?$': ['ts-jest', {}],
  },
};
