export default {
    transform: {
      "^.+\\.js$": "babel-jest",
    },
    testEnvironment: "node",
    testMatch: ["**/__tests__/**/*.test.js", "**/__tests__/**/*.e2e.js"],
    testPathIgnorePatterns: ["/node_modules/"],
};