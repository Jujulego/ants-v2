import nextJest from 'next/jest.js';

const createJestConfig = nextJest({
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
  transformIgnorePatterns: [
    '/node_modules/(?!dexie)/',
  ],
};

export default async function jestConfig() {
  const config = await createJestConfig(customJestConfig)();
  config.transformIgnorePatterns = config.transformIgnorePatterns.filter((pat) => pat !== '/node_modules/');

  return config;
}
