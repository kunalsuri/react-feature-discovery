# Test Suite for React Feature Discovery Tool

This directory contains comprehensive tests for the React Feature Discovery tool to ensure code quality and reliability.

## Test Structure

### 📁 Test Organization

```
tests/
├── cli.test.ts                 # CLI argument parsing and help functionality
├── cli.integration.test.ts     # End-to-end CLI testing
├── server.test.ts              # Web server functionality
├── core/
│   └── AnalysisEngine.test.ts  # Main analysis orchestration
├── analyzers/
│   ├── DependencyAnalyzer.test.ts
│   └── ReactPatternDetector.test.ts
├── generators/
│   ├── MarkdownGenerator.test.ts
│   ├── JSONGenerator.test.ts
│   └── HTMLGenerator.test.ts
└── utils/
    ├── SafetyValidator.test.ts
    ├── ErrorHandler.test.ts
    └── locationDetector.test.ts
```

## 🧪 Test Categories

### 1. **CLI Tests**
- **Argument Parsing**: Validates all CLI flags and options (`--root`, `--output`, `--format`, etc.)
- **Help System**: Ensures help text is displayed correctly
- **Integration Tests**: Tests actual CLI execution with real processes

### 2. **Core Analysis Tests**
- **AnalysisEngine**: Tests the main orchestration logic
- **Configuration Handling**: Validates config loading and merging
- **Error Propagation**: Ensures proper error handling throughout the pipeline

### 3. **Analyzers Tests**
- **DependencyAnalyzer**: Tests import detection, dependency graph building
- **ReactPatternDetector**: Validates React component, hook, and pattern detection
- **Edge Cases**: Handles malformed code, circular dependencies, etc.

### 4. **Generators Tests**
- **MarkdownGenerator**: Tests markdown output formatting and structure
- **JSONGenerator**: Validates JSON serialization and data integrity
- **HTMLGenerator**: Tests HTML generation, styling, and security

### 5. **Utility Tests**
- **SafetyValidator**: Tests security validations and path sanitization
- **ErrorHandler**: Validates error logging and reporting
- **LocationDetector**: Tests client/server/shared code detection

### 6. **Server Tests**
- **HTTP Endpoints**: Tests API routes and responses
- **CORS Handling**: Validates cross-origin request handling
- **Security**: Tests path sanitization and request validation

## 🚀 Running Tests

### Basic Test Commands

```bash
# Run all tests
npm test

# Run tests in watch mode for development
npm run test:watch

# Run tests with coverage report
npm run test:coverage

# Run specific test file
npx jest tests/cli.test.ts

# Run tests matching a pattern
npx jest --testNamePattern="CLI"
```

### Coverage Reports

Coverage reports are generated in the `coverage/` directory:
- `coverage/lcov-report/index.html` - Interactive HTML report
- `coverage/lcov.info` - LCOV format for CI integration

## 📊 Test Coverage Areas

### ✅ What's Tested

1. **Input Validation**
   - CLI arguments and flags
   - Configuration files
   - File paths and permissions
   - Dangerous input patterns

2. **Core Functionality**
   - File scanning and filtering
   - Dependency analysis
   - React pattern detection
   - Metadata extraction

3. **Output Generation**
   - Markdown formatting
   - JSON serialization
   - HTML generation and styling
   - File writing operations

4. **Error Handling**
   - Malformed input files
   - Network and file system errors
   - Configuration errors
   - Edge cases and boundary conditions

5. **Security**
   - Path traversal prevention
   - System directory protection
   - Input sanitization
   - Safe file operations

6. **Performance**
   - Large file handling
   - Memory usage patterns
   - Concurrent operations
   - Timeout handling

### 🎯 Test Quality Features

- **Mocking**: All external dependencies are mocked for isolation
- **Edge Cases**: Comprehensive testing of boundary conditions
- **Error Scenarios**: Failure modes and error recovery
- **Security Testing**: Malicious input and path traversal tests
- **Integration Tests**: End-to-end workflow validation
- **Type Safety**: Full TypeScript coverage with strict typing

## 🔧 Configuration

### Jest Configuration (jest.config.js)

- **TypeScript Support**: Full TS compilation with `ts-jest`
- **ES Modules**: Configured for `"type": "module"`
- **Coverage**: Excludes type definitions and entry files
- **Timeout**: 30-second timeout for integration tests
- **Verbose**: Detailed output for debugging

### Test Environment

- **Node.js**: Tests run in Node environment
- **Mock File System**: All file operations are mocked
- **Process Mocking**: CLI tests mock process.exit and console output
- **HTTP Mocking**: Server tests mock HTTP requests/responses

## 📈 Coverage Goals

- **Statements**: > 90%
- **Branches**: > 85%
- **Functions**: > 90%
- **Lines**: > 90%

## 🐛 Debugging Tests

### Common Issues

1. **Module Resolution**: Ensure `.js` extensions in import statements
2. **Mock Configuration**: Check that all external dependencies are properly mocked
3. **Async Tests**: Use `async/await` and proper error handling
4. **File Path Mocking**: Verify `path.join` and `fs` mocks match expected behavior

### Debug Commands

```bash
# Run tests with debugger
node --inspect-brk node_modules/.bin/jest --runInBand

# Run specific test with detailed output
npx jest tests/cli.test.ts --verbose

# Run tests without cache
npx jest --no-cache
```

## 🤝 Contributing Tests

When adding new features:

1. **Unit Tests**: Add tests for new functions and classes
2. **Integration Tests**: Add end-to-end tests for new workflows
3. **Edge Cases**: Test error conditions and boundary cases
4. **Coverage**: Maintain >90% coverage for new code
5. **Documentation**: Update this README with new test categories

### Test Naming Conventions

- **Files**: `*.test.ts` for unit tests, `*.integration.test.ts` for integration tests
- **Describe Blocks**: Use clear, descriptive names for test suites
- **Test Cases**: Use "should" format for test descriptions
- **Mock Files**: Keep mocks close to the files they're testing

## 📝 Example Test Structure

```typescript
describe('ComponentName', () => {
  beforeEach(() => {
    // Setup before each test
  });

  describe('methodName', () => {
    it('should handle valid input', () => {
      // Test happy path
    });

    it('should handle edge cases', () => {
      // Test boundary conditions
    });

    it('should throw on invalid input', () => {
      // Test error handling
    });
  });
});
```

This comprehensive test suite ensures the React Feature Discovery tool is reliable, secure, and maintains high code quality standards.
