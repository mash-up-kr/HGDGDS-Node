const { pathsToModuleNameMapper } = require('ts-jest');
const { compilerOptions } = require('./tsconfig.json');

module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',

  moduleNameMapper: pathsToModuleNameMapper(compilerOptions.paths, {
    prefix: '<rootDir>/',
  }),

  setupFilesAfterEnv: ['./jest.setup.ts'],

  testRegex: 'src/.*\\.spec\\.ts$',

  collectCoverageFrom: [
    'src/**/*.(t|j)s',
    '!src/**/*.module.ts',
    '!src/**/*.config.ts',
    '!src/**/main.ts',
  ],
  coverageDirectory: './coverage',
  coverageReporters: ['json-summary', 'text', 'lcov'],
};
