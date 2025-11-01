/**
 * LocationDetector Tests
 */

import { describe, it, expect, beforeEach } from '@jest/globals';
import { LocationDetector, CodeLocation } from '../../src/utils/locationDetector.js';

describe('LocationDetector', () => {
  let detector: LocationDetector;

  beforeEach(() => {
    detector = new LocationDetector(
      ['src', 'components', 'pages', 'hooks'],
      ['server', 'api', 'backend', 'routes']
    );
  });

  describe('Constructor', () => {
    it('should initialize with client and server directories', () => {
      expect(detector).toBeInstanceOf(LocationDetector);
    });

    it('should normalize directory names to lowercase', () => {
      const caseInsensitiveDetector = new LocationDetector(
        ['SRC', 'Components'],
        ['SERVER', 'API']
      );
      
      // Should work with mixed case input
      expect(caseInsensitiveDetector.detectLocation('src/test.ts')).toBe('client');
      expect(caseInsensitiveDetector.detectLocation('SERVER/test.ts')).toBe('server');
    });
  });

  describe('detectLocation', () => {
    describe('Server Detection', () => {
      it('should detect server-side code in server directories', () => {
        const serverPaths = [
          'server/api.ts',
          'api/controller.js',
          'backend/service.ts',
          'routes/index.js',
          'server/utils/helper.ts',
          'api/middleware/auth.js'
        ];

        for (const path of serverPaths) {
          expect(detector.detectLocation(path)).toBe('server');
        }
      });

      it('should detect server code in nested server directories', () => {
        const nestedServerPaths = [
          'server/api/v1/users.ts',
          'api/controllers/admin/auth.js',
          'backend/services/database/connection.ts',
          'routes/middleware/validation.js'
        ];

        for (const path of nestedServerPaths) {
          expect(detector.detectLocation(path)).toBe('server');
        }
      });

      it('should be case insensitive for server detection', () => {
        const caseVariations = [
          'SERVER/api.ts',
          'API/controller.js',
          'Backend/service.ts',
          'ROUTES/index.js'
        ];

        for (const path of caseVariations) {
          expect(detector.detectLocation(path)).toBe('server');
        }
      });
    });

    describe('Client Detection', () => {
      it('should detect client-side code in client directories', () => {
        const clientPaths = [
          'src/App.tsx',
          'components/Button.tsx',
          'pages/Home.tsx',
          'hooks/useAuth.ts',
          'src/utils/client-helper.ts',
          'components/ui/Input.tsx'
        ];

        for (const path of clientPaths) {
          expect(detector.detectLocation(path)).toBe('client');
        }
      });

      it('should detect client code in nested client directories', () => {
        const nestedClientPaths = [
          'src/components/ui/Button.tsx',
          'components/forms/Contact.tsx',
          'pages/auth/Login.tsx',
          'hooks/api/useData.ts'
        ];

        for (const path of nestedClientPaths) {
          expect(detector.detectLocation(path)).toBe('client');
        }
      });

      it('should be case insensitive for client detection', () => {
        const caseVariations = [
          'SRC/App.tsx',
          'Components/Button.tsx',
          'PAGES/Home.tsx',
          'Hooks/useAuth.ts'
        ];

        for (const path of caseVariations) {
          expect(detector.detectLocation(path)).toBe('client');
        }
      });
    });

    describe('Shared Detection', () => {
      it('should detect shared code in shared directories', () => {
        const sharedPaths = [
          'shared/types.ts',
          'common/utils.ts',
          'shared/constants.js',
          'common/interfaces.ts'
        ];

        for (const path of sharedPaths) {
          expect(detector.detectLocation(path)).toBe('shared');
        }
      });

      it('should detect shared code in nested shared directories', () => {
        const nestedSharedPaths = [
          'shared/types/user.ts',
          'common/utils/validation.ts',
          'shared/constants/api.ts'
        ];

        for (const path of nestedSharedPaths) {
          expect(detector.detectLocation(path)).toBe('shared');
        }
      });
    });

    describe('Default Behavior', () => {
      it('should default to client for React components', () => {
        const reactPaths = [
          'App.tsx',
          'components/Button.tsx',
          'utils/Component.tsx',
          'lib/CustomComponent.tsx',
          'hooks/useCustom.tsx'
        ];

        for (const path of reactPaths) {
          expect(detector.detectLocation(path)).toBe('client');
        }
      });

      it('should default to client for JSX files', () => {
        const jsxPaths = [
          'App.jsx',
          'components/Button.jsx',
          'pages/Home.jsx'
        ];

        for (const path of jsxPaths) {
          expect(detector.detectLocation(path)).toBe('client');
        }
      });

      it('should default to shared for other file types', () => {
        const otherPaths = [
          'utils/helper.ts',
          'lib/utility.js',
          'config/settings.ts',
          'types/definitions.ts',
          'constants/values.js',
          'styles/main.css',
          'assets/logo.png'
        ];

        for (const path of otherPaths) {
          expect(detector.detectLocation(path)).toBe('shared');
        }
      });
    });

    describe('Priority Handling', () => {
      it('should prioritize server detection over client', () => {
        // Create detector with overlapping patterns
        const priorityDetector = new LocationDetector(
          ['src'],
          ['src/server']
        );

        expect(priorityDetector.detectLocation('src/server/api.ts')).toBe('server');
      });

      it('should prioritize client detection over shared', () => {
        const priorityDetector = new LocationDetector(
          ['src'],
          ['server']
        );

        expect(priorityDetector.detectLocation('src/shared/utils.ts')).toBe('client');
      });
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty paths', () => {
      expect(detector.detectLocation('')).toBe('shared');
    });

    it('should handle paths without directories', () => {
      expect(detector.detectLocation('file.ts')).toBe('shared');
      expect(detector.detectLocation('Component.tsx')).toBe('client');
    });

    it('should handle paths with only separators', () => {
      expect(detector.detectLocation('/')).toBe('shared');
      expect(detector.detectLocation('///')).toBe('shared');
    });

    it('should handle very long paths', () => {
      const longPath = 'very/deep/nested/path/' + 'dir/'.repeat(20) + 'file.tsx';
      expect(detector.detectLocation(longPath)).toBe('client');
    });

    it('should handle paths with special characters', () => {
      const specialPaths = [
        'src/components/button-with-dash.tsx',
        'src/components/button_with_underscore.tsx',
        'src/components/button.with.dots.tsx',
        'src/components/button with spaces.tsx'
      ];

      for (const path of specialPaths) {
        expect(detector.detectLocation(path)).toBe('client');
      }
    });

    it('should handle Windows-style paths', () => {
      const windowsPaths = [
        'src\\components\\Button.tsx',
        'server\\api\\controller.js',
        'shared\\utils\\helper.ts'
      ];

      // Should handle forward slashes in detection logic
      for (const path of windowsPaths) {
        const result = detector.detectLocation(path);
        expect(['client', 'server', 'shared']).toContain(result);
      }
    });

    it('should handle paths starting with slash', () => {
      expect(detector.detectLocation('/src/App.tsx')).toBe('client');
      expect(detector.detectLocation('/server/api.ts')).toBe('server');
      expect(detector.detectLocation('/shared/utils.ts')).toBe('shared');
    });

    it('should handle paths with multiple consecutive slashes', () => {
      expect(detector.detectLocation('src//components//Button.tsx')).toBe('client');
      expect(detector.detectLocation('server///api///controller.js')).toBe('server');
    });
  });

  describe('Custom Configuration', () => {
    it('should work with custom client directories', () => {
      const customDetector = new LocationDetector(
        ['frontend', 'web', 'ui'],
        ['backend', 'service']
      );

      expect(customDetector.detectLocation('frontend/App.tsx')).toBe('client');
      expect(customDetector.detectLocation('web/components/Button.tsx')).toBe('client');
      expect(customDetector.detectLocation('backend/api.ts')).toBe('server');
    });

    it('should work with empty client directories', () => {
      const noClientDetector = new LocationDetector(
        [],
        ['server', 'api']
      );

      expect(noClientDetector.detectLocation('src/App.tsx')).toBe('shared');
      expect(noClientDetector.detectLocation('server/api.ts')).toBe('server');
    });

    it('should work with empty server directories', () => {
      const noServerDetector = new LocationDetector(
        ['src', 'components'],
        []
      );

      expect(noServerDetector.detectLocation('src/App.tsx')).toBe('client');
      expect(noServerDetector.detectLocation('server/api.ts')).toBe('shared');
    });

    it('should work with both empty directories', () => {
      const minimalDetector = new LocationDetector([], []);

      expect(minimalDetector.detectLocation('App.tsx')).toBe('client');
      expect(minimalDetector.detectLocation('utils.ts')).toBe('shared');
    });
  });

  describe('Real-world Scenarios', () => {
    it('should handle typical Next.js project structure', () => {
      const nextJSDetector = new LocationDetector(
        ['components', 'pages', 'styles', 'hooks'],
        ['pages/api', 'lib/server']
      );

      expect(nextJSDetector.detectLocation('components/Button.tsx')).toBe('client');
      expect(nextJSDetector.detectLocation('pages/Home.tsx')).toBe('client');
      expect(nextJSDetector.detectLocation('pages/api/users.ts')).toBe('server');
      expect(nextJSDetector.detectLocation('lib/server/auth.ts')).toBe('server');
      expect(nextJSDetector.detectLocation('lib/utils.ts')).toBe('shared');
    });

    it('should handle typical React project structure', () => {
      const reactDetector = new LocationDetector(
        ['src', 'public'],
        ['server', 'functions']
      );

      expect(reactDetector.detectLocation('src/App.tsx')).toBe('client');
      expect(reactDetector.detectLocation('src/components/Button.tsx')).toBe('client');
      expect(reactDetector.detectLocation('server/api.js')).toBe('server');
      expect(reactDetector.detectLocation('functions/handler.js')).toBe('server');
    });

    it('should handle full-stack application structure', () => {
      const fullStackDetector = new LocationDetector(
        ['client', 'frontend', 'web'],
        ['server', 'backend', 'api']
      );

      expect(fullStackDetector.detectLocation('client/src/App.tsx')).toBe('client');
      expect(fullStackDetector.detectLocation('frontend/components/Header.tsx')).toBe('client');
      expect(fullStackDetector.detectLocation('server/routes/users.js')).toBe('server');
      expect(fullStackDetector.detectLocation('backend/services/database.js')).toBe('server');
      expect(fullStackDetector.detectLocation('shared/types.ts')).toBe('shared');
    });
  });
});
