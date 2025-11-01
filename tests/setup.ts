/**
 * Test Setup and Global Configuration
 */

import { jest, afterEach } from '@jest/globals';

// Set test environment variables
process.env.NODE_ENV = 'test';

// Global test timeout
jest.setTimeout(30000);

// Mock console methods to reduce noise in tests
global.console = {
  ...console,
  // Uncomment to silence console.log during tests
  // log: jest.fn(),
  // warn: jest.fn(),
  // error: jest.fn(),
};

// Global test utilities
export const createMockFileEntry = (path: string, content: string = '') => ({
  relativePath: path,
  fullPath: `/mock/${path}`,
  content
});

export const createMockConfig = (overrides = {}) => ({
  rootDir: '/mock',
  outputPath: '/mock/output.md',
  outputFormats: ['markdown'],
  includePatterns: ['**/*.{ts,tsx,js,jsx}'],
  excludePatterns: ['node_modules/**', 'dist/**'],
  cacheEnabled: true,
  parallel: true,
  maxDepth: 10,
  followSymlinks: false,
  respectGitignore: true,
  customRules: {},
  technologies: {
    frontend: ['react', 'typescript'],
    backend: [],
    database: [],
    testing: [],
    deployment: []
  },
  ...overrides
});

export const mockReactComponent = (name: string, props: string[] = [], imports: string[] = []) => `
import React${imports.length > 0 ? ', { ' + imports.join(', ') + ' }' : ''} from 'react';

interface ${name}Props {
  ${props.map(prop => `${prop}: string;`).join('\n  ')}
}

export const ${name}: React.FC<${name}Props> = ({ ${props.join(', ')} }) => {
  return <div>${name} Component</div>;
};

export default ${name};
`.trim();

export const mockReactHook = (name: string, hooks: string[] = []) => `
import { ${hooks.join(', ')} } from 'react';

export const ${name} = () => {
  ${hooks.map(hook => `const [value, setValue] = ${hook}(null);`).join('\n  ')}
  
  return { value, setValue };
};
`.trim();

// Clean up after each test
afterEach(() => {
  jest.clearAllMocks();
});
