/**
 * Comprehensive React ecosystem technology mapping
 */

export interface TechnologyMapping {
  pattern: string;
  name: string;
  category: 'react' | 'state' | 'routing' | 'styling' | 'server' | 'database' | 'testing' | 'build' | 'other';
}

export const reactEcosystemTechnologies: TechnologyMapping[] = [
  // Core React
  { pattern: 'react', name: 'React', category: 'react' },
  { pattern: 'react-dom', name: 'React DOM', category: 'react' },
  
  // Meta-frameworks
  { pattern: 'next', name: 'Next.js', category: 'react' },
  { pattern: 'remix', name: 'Remix', category: 'react' },
  { pattern: 'gatsby', name: 'Gatsby', category: 'react' },
  
  // State Management
  { pattern: '@tanstack/react-query', name: 'TanStack Query', category: 'state' },
  { pattern: 'react-query', name: 'React Query', category: 'state' },
  { pattern: 'redux', name: 'Redux', category: 'state' },
  { pattern: '@reduxjs/toolkit', name: 'Redux Toolkit', category: 'state' },
  { pattern: 'zustand', name: 'Zustand', category: 'state' },
  { pattern: 'jotai', name: 'Jotai', category: 'state' },
  { pattern: 'recoil', name: 'Recoil', category: 'state' },
  { pattern: 'mobx', name: 'MobX', category: 'state' },
  { pattern: 'xstate', name: 'XState', category: 'state' },
  
  // Routing
  { pattern: 'react-router', name: 'React Router', category: 'routing' },
  { pattern: 'react-router-dom', name: 'React Router DOM', category: 'routing' },
  { pattern: 'wouter', name: 'Wouter', category: 'routing' },
  { pattern: '@tanstack/react-router', name: 'TanStack Router', category: 'routing' },
  
  // Styling
  { pattern: 'tailwindcss', name: 'Tailwind CSS', category: 'styling' },
  { pattern: 'styled-components', name: 'Styled Components', category: 'styling' },
  { pattern: '@emotion/react', name: 'Emotion', category: 'styling' },
  { pattern: '@emotion/styled', name: 'Emotion', category: 'styling' },
  { pattern: 'sass', name: 'Sass', category: 'styling' },
  { pattern: 'less', name: 'Less', category: 'styling' },
  { pattern: '@mui/material', name: 'Material-UI', category: 'styling' },
  { pattern: '@chakra-ui/react', name: 'Chakra UI', category: 'styling' },
  { pattern: '@radix-ui', name: 'Radix UI', category: 'styling' },
  { pattern: '@headlessui/react', name: 'Headless UI', category: 'styling' },
  { pattern: 'antd', name: 'Ant Design', category: 'styling' },
  { pattern: 'next-themes', name: 'Next Themes', category: 'styling' },
  
  // Server/Backend
  { pattern: 'express', name: 'Express.js', category: 'server' },
  { pattern: 'fastify', name: 'Fastify', category: 'server' },
  { pattern: 'koa', name: 'Koa', category: 'server' },
  { pattern: 'hono', name: 'Hono', category: 'server' },
  
  // Database & ORM
  { pattern: 'drizzle-orm', name: 'Drizzle ORM', category: 'database' },
  { pattern: 'prisma', name: 'Prisma', category: 'database' },
  { pattern: 'typeorm', name: 'TypeORM', category: 'database' },
  { pattern: 'mongoose', name: 'Mongoose', category: 'database' },
  { pattern: 'sequelize', name: 'Sequelize', category: 'database' },
  { pattern: '@neondatabase/serverless', name: 'Neon Database', category: 'database' },
  { pattern: '@planetscale/database', name: 'PlanetScale', category: 'database' },
  { pattern: '@supabase/supabase-js', name: 'Supabase', category: 'database' },
  
  // Testing
  { pattern: 'vitest', name: 'Vitest', category: 'testing' },
  { pattern: 'jest', name: 'Jest', category: 'testing' },
  { pattern: '@testing-library/react', name: 'React Testing Library', category: 'testing' },
  { pattern: 'cypress', name: 'Cypress', category: 'testing' },
  { pattern: 'playwright', name: 'Playwright', category: 'testing' },
  
  // Build Tools
  { pattern: 'vite', name: 'Vite', category: 'build' },
  { pattern: 'webpack', name: 'Webpack', category: 'build' },
  { pattern: 'esbuild', name: 'esbuild', category: 'build' },
  { pattern: 'turbopack', name: 'Turbopack', category: 'build' },
  { pattern: 'parcel', name: 'Parcel', category: 'build' },
  
  // Form Libraries
  { pattern: 'react-hook-form', name: 'React Hook Form', category: 'other' },
  { pattern: 'formik', name: 'Formik', category: 'other' },
  { pattern: '@tanstack/react-form', name: 'TanStack Form', category: 'other' },
  
  // Validation
  { pattern: 'zod', name: 'Zod', category: 'other' },
  { pattern: 'yup', name: 'Yup', category: 'other' },
  { pattern: 'joi', name: 'Joi', category: 'other' },
  
  // Animation
  { pattern: 'framer-motion', name: 'Framer Motion', category: 'other' },
  { pattern: 'react-spring', name: 'React Spring', category: 'other' },
  
  // TypeScript
  { pattern: 'typescript', name: 'TypeScript', category: 'other' },
  
  // Other Popular Libraries
  { pattern: 'axios', name: 'Axios', category: 'other' },
  { pattern: 'date-fns', name: 'date-fns', category: 'other' },
  { pattern: 'dayjs', name: 'Day.js', category: 'other' },
  { pattern: 'lodash', name: 'Lodash', category: 'other' },
  { pattern: 'ramda', name: 'Ramda', category: 'other' },
];

/**
 * Detect technologies from package names
 * @param packages Array of package names
 * @param customMappings Optional custom technology mappings
 * @returns Array of detected technology names
 */
export function detectTechnologies(
  packages: string[],
  customMappings: TechnologyMapping[] = []
): string[] {
  const technologies = new Set<string>();
  const allMappings = [...reactEcosystemTechnologies, ...customMappings];
  
  for (const pkg of packages) {
    for (const mapping of allMappings) {
      if (pkg.includes(mapping.pattern)) {
        technologies.add(mapping.name);
        break; // Only match once per package
      }
    }
  }
  
  return Array.from(technologies).sort();
}

/**
 * Get technologies by category
 * @param packages Array of package names
 * @param category Technology category
 * @returns Array of detected technology names in that category
 */
export function getTechnologiesByCategory(
  packages: string[],
  category: TechnologyMapping['category']
): string[] {
  const technologies = new Set<string>();
  const categoryMappings = reactEcosystemTechnologies.filter(m => m.category === category);
  
  for (const pkg of packages) {
    for (const mapping of categoryMappings) {
      if (pkg.includes(mapping.pattern)) {
        technologies.add(mapping.name);
        break;
      }
    }
  }
  
  return Array.from(technologies).sort();
}
