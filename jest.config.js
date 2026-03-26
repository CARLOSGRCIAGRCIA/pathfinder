export default {
  transform: {
    '^.+\\.js$': 'babel-jest',
  },
  testEnvironment: 'node',
  testMatch: ['**/__tests__/**/*.test.js', '**/__tests__/**/*.e2e.js'],
  testPathIgnorePatterns: ['/node_modules/'],
  transformIgnorePatterns: ['/node_modules/(?!(chalk-animation|chalk)/)'],
  moduleNameMapper: {
    '^chalk-animation$': '<rootDir>/__mocks__/chalk-animation.js',
  },
};
