/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['**/*.test.ts'],
  collectCoverage: true,
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/server.ts', // On ne teste pas le démarrage du serveur
    '!src/utils/logger.ts' // On ne teste pas la console pure
  ],
  coverageDirectory: 'coverage',
};