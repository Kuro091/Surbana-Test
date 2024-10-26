module.exports = {
    "moduleFileExtensions": ["js", "json", "ts"],
    "rootDir": "./",
    "testEnvironment": "node",
    "testRegex": ".*\\.(spec|e2e-spec)\\.ts$",
    "transform": {
        "^.+\\.(t|j)s$": "ts-jest"
    },
    "collectCoverageFrom": [
        "**/*.(t|j)s"
    ],
    "coverageDirectory": "../coverage",
    setupFilesAfterEnv: ['<rootDir>/test/jest-setup.ts']
};