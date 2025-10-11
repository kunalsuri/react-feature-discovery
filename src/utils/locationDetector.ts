/**
 * LocationDetector - Determines if code is client-side, server-side, or shared
 */

export type CodeLocation = 'client' | 'server' | 'shared';

export class LocationDetector {
  private clientDirs: string[];
  private serverDirs: string[];

  constructor(clientDirs: string[], serverDirs: string[]) {
    this.clientDirs = clientDirs.map(d => d.toLowerCase());
    this.serverDirs = serverDirs.map(d => d.toLowerCase());
  }

  /**
   * Detect the location of code based on file path
   * @param filePath Relative file path
   * @returns Code location (client, server, or shared)
   */
  detectLocation(filePath: string): CodeLocation {
    const lowerPath = filePath.toLowerCase();
    const pathParts = lowerPath.split('/');

    // Check if path contains server directories
    for (const serverDir of this.serverDirs) {
      if (pathParts.includes(serverDir) || lowerPath.includes(`/${serverDir}/`)) {
        return 'server';
      }
    }

    // Check if path contains client directories
    for (const clientDir of this.clientDirs) {
      if (pathParts.includes(clientDir) || lowerPath.includes(`/${clientDir}/`)) {
        return 'client';
      }
    }

    // Check for shared/common directories
    if (lowerPath.includes('shared') || lowerPath.includes('common')) {
      return 'shared';
    }

    // Default: assume client-side for React components
    if (filePath.endsWith('.tsx') || filePath.endsWith('.jsx')) {
      return 'client';
    }

    // Default: shared for other files
    return 'shared';
  }
}
