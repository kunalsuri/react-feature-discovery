/**
 * Default category rules for React projects
 */

import { CategoryRule } from '../types/config.js';

export const defaultCategoryRules: CategoryRule[] = [
  // Pages (highest priority)
  {
    pattern: /pages?\/|routes?\/.*\.(tsx|jsx)$/,
    category: 'page',
    priority: 10,
    description: 'Page components and route handlers'
  },
  
  // Contexts
  {
    pattern: /contexts?\/|\.context\.(ts|tsx|js|jsx)$/,
    category: 'context',
    priority: 9,
    description: 'React Context providers and consumers'
  },
  
  // Hooks
  {
    pattern: /hooks?\/|^use[A-Z]/,
    category: 'hook',
    priority: 8,
    description: 'Custom React hooks'
  },
  
  // Components
  {
    pattern: /components?\/|\.component\.(tsx|jsx)$/,
    category: 'component',
    priority: 7,
    description: 'React components'
  },
  
  // Server/API
  {
    pattern: /server\/|api\/|routes\/.*\.(ts|js)$|middleware\//,
    category: 'server',
    priority: 7,
    description: 'Server-side code, API routes, and middleware'
  },
  
  // Services
  {
    pattern: /services?\/|\.service\.(ts|js)$/,
    category: 'service',
    priority: 6,
    description: 'Service layer for API interactions'
  },
  
  // Utilities
  {
    pattern: /utils?\/|lib\/|helpers?\/|\.util\.(ts|js)$/,
    category: 'utility',
    priority: 5,
    description: 'Utility functions and helpers'
  },
  
  // Types
  {
    pattern: /types?\/|\.types?\.(ts|tsx)$|\.d\.ts$|shared\/.*\.(ts|tsx)$/,
    category: 'type',
    priority: 4,
    description: 'Type definitions and interfaces'
  },
  
  // Config
  {
    pattern: /config\/|\.config\.(ts|js)$/,
    category: 'config',
    priority: 3,
    description: 'Configuration files'
  },
  
  // Default fallback for .tsx/.jsx files
  {
    pattern: /\.(tsx|jsx)$/,
    category: 'component',
    priority: 1,
    description: 'Default React component'
  },
  
  // Default fallback for other files
  {
    pattern: /\.(ts|js)$/,
    category: 'module',
    priority: 0,
    description: 'Generic module'
  }
];

/**
 * Apply category rules to a file path
 * @param filePath Relative file path
 * @param fileName File name
 * @param rules Category rules to apply
 * @returns Matched category
 */
export function applyCategoryRules(
  filePath: string,
  fileName: string,
  rules: CategoryRule[]
): string {
  const lowerPath = filePath.toLowerCase();
  const lowerName = fileName.toLowerCase();
  const fullPath = `${lowerPath}/${lowerName}`;
  
  // Sort rules by priority (descending)
  const sortedRules = [...rules].sort((a, b) => b.priority - a.priority);
  
  // Find first matching rule
  for (const rule of sortedRules) {
    const regex = typeof rule.pattern === 'string'
      ? new RegExp(rule.pattern)
      : rule.pattern;
    
    if (regex.test(fullPath) || regex.test(lowerPath) || regex.test(lowerName)) {
      return rule.category;
    }
  }
  
  // Default fallback
  return 'module';
}
