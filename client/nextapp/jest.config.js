const nextJest = require('next/jest')

const createJestConfig = nextJest({ dir: './' })

module.exports = createJestConfig({
  testEnvironment: 'jsdom',
  watchPlugins: ['jest-watch-typeahead/filename', 'jest-watch-typeahead/testname'],
  moduleNameMapper: {
    '@next/image': '<rootDir>/elements/Image/Image',
  },
  moduleDirectories: ['node_modules', '<rootDir>'],
})
