module.exports = {
    clearMocks: true,
    moduleFileExtensions: ['js', 'ts'],
    testMatch: ['**/*.test.ts'],
    transform: {
        '^.+\\.ts$': 'ts-jest',
    },
    verbose: true,
    collectCoverageFrom: [
        // To ignore an individual file add this on line one `/* istanbul ignore file */`
        './src/**/*.ts',
    ],
    coverageDirectory: './coverage',
    coverageThreshold: {
        global: {
            statements: 100,
            branches: 100,
            functions: 100,
            lines: 100,
        },
    },
};
