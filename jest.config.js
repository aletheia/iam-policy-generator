module.exports = {
  roots: ['<rootDir>/src', '<rootDir>/examples'],
  transform: {
    '^.+\\.tsx?$': 'ts-jest',
  },
  coverageDirectory: 'coverage',
  testEnvironment: 'node',
  testRegex: '(/test/.*|/__tests__/.*|(\\.|/)(test|spec))\\.tsx?$',
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
};
