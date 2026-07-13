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
   * Find the earliest path-segment index at which one of the configured
   * directories (which may themselves be multi-segment, e.g. 'pages/api')
   * matches a contiguous run of directory segments in the file path.
   * Returns null if none of the directories match.
   */
  private matchDirIndex(dirs: string[], dirParts: string[]): number | null {
    let best: number | null = null;

    for (const dir of dirs) {
      const dirSegments = dir.split('/').filter(p => p.length > 0);
      if (dirSegments.length === 0 || dirSegments.length > dirParts.length) {
        continue;
      }

      for (let i = 0; i <= dirParts.length - dirSegments.length; i++) {
        let matched = true;
        for (let j = 0; j < dirSegments.length; j++) {
          if (dirParts[i + j] !== dirSegments[j]) {
            matched = false;
            break;
          }
        }
        if (matched) {
          if (best === null || i < best) {
            best = i;
          }
          break;
        }
      }
    }

    return best;
  }

  /**
   * Detect the location of code based on file path
   * @param filePath Relative file path
   * @returns Code location (client, server, or shared)
   */
  detectLocation(filePath: string): CodeLocation {
    const lowerPath = filePath.toLowerCase();
    const trimmedPath = lowerPath.replace(/^\/+/, '').replace(/\/+$/, '');
    const allParts = trimmedPath.length > 0 ? trimmedPath.split('/').filter(p => p.length > 0) : [];
    // The last segment is the filename itself, not a directory.
    const dirParts = allParts.slice(0, -1);

    const serverIndex = this.matchDirIndex(this.serverDirs, dirParts);
    const clientIndex = this.matchDirIndex(this.clientDirs, dirParts);

    // Whichever configured directory matches at the shallowest path segment
    // wins; ties (e.g. a client dir 'src' and a server dir 'src/server' both
    // starting at the same segment) are resolved in favor of the more
    // specific/server match.
    if (serverIndex !== null && (clientIndex === null || serverIndex <= clientIndex)) {
      return 'server';
    }
    if (clientIndex !== null) {
      return 'client';
    }

    // Check for shared/common directories
    if (lowerPath.includes('shared') || lowerPath.includes('common')) {
      return 'shared';
    }

    // Default: assume client-side for React components. If no client
    // directories are configured at all, only apply this fallback when the
    // file has no directory component (an unmatched directory otherwise
    // signals the file lives outside any recognized client context).
    if (filePath.endsWith('.tsx') || filePath.endsWith('.jsx')) {
      if (this.clientDirs.length > 0 || dirParts.length === 0) {
        return 'client';
      }
    }

    // Default: shared for other files
    return 'shared';
  }
}
