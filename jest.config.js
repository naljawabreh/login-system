module.exports = {
    moduleFileExtensions: ['js', 'json', 'ts'],
    // moduleNameMapper: {'^@src/(.*)$': '<rootDir>/$1',},
    rootDir: 'src',
    testRegex: '.*\\.spec\\.ts$',
    transform: {
      '^.+\\.(t|j)s$': 'ts-jest',
    },
    collectCoverageFrom: [
      '**/*.(t|j)s',
      '!**/node_modules/**',
      '!**/src/main.ts', // Exclude entry point
      '!**/src/**/dto/**', // Exclude DTOs
      '!**/src/**/interfaces/**', // Exclude interfaces
    ],
    coverageDirectory: '../coverage',
    testEnvironment: 'node',
    coverageThreshold: {
      global: {
        branches: 60,
        functions: 60,
        lines: 60,
        statements: 60,
      },
    },
    verbose: true,
    silent: false,
  };
  