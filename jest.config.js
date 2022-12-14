const createJestConfig = require('next/jest')({
  dir: './',
});

/** @type {import('jest').Config} */
const customJestConfig = {
  testEnvironment: 'jest-environment-jsdom',
  setupFilesAfterEnv: [
    '<rootDir>/jest.setup.js'
  ],
  roots: [
    '<rootDir>/tests'
  ],
  moduleDirectories: ['node_modules', '<rootDir>/'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1'
  },
};

module.exports = createJestConfig(customJestConfig);
