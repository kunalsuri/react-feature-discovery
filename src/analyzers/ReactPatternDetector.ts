/**
 * ReactPatternDetector - Detects React-specific patterns in code
 */

export interface HookInfo {
  name: string;
  type: 'built-in' | 'custom';
  line?: number;
}

export interface ComponentInfo {
  name: string;
  type: 'function' | 'class' | 'arrow';
  isExported: boolean;
  line?: number;
}

export interface ContextInfo {
  name: string;
  hasProvider: boolean;
  hasConsumer: boolean;
  line?: number;
}

export interface HOCInfo {
  name: string;
  wrappedComponent?: string;
  line?: number;
}

export class ReactPatternDetector {
  /**
   * Detect React hooks usage in code
   * @param content File content
   * @returns Array of detected hooks
   */
  detectHooks(content: string): HookInfo[] {
    const hooks: HookInfo[] = [];
    const lines = content.split('\n');

    // Built-in React hooks
    const builtInHooks = [
      'useState', 'useEffect', 'useContext', 'useReducer',
      'useCallback', 'useMemo', 'useRef', 'useImperativeHandle',
      'useLayoutEffect', 'useDebugValue', 'useDeferredValue',
      'useTransition', 'useId', 'useSyncExternalStore'
    ];

    // Detect built-in hooks
    for (const hook of builtInHooks) {
      const regex = new RegExp(`\\b${hook}\\s*\\(`, 'g');
      let match;
      let lineNum = 0;
      
      for (const line of lines) {
        lineNum++;
        if (regex.test(line)) {
          hooks.push({
            name: hook,
            type: 'built-in',
            line: lineNum
          });
          break; // Only record first occurrence
        }
      }
    }

    // Detect custom hooks (functions starting with 'use')
    const customHookRegex = /(?:function|const)\s+(use[A-Z]\w*)/g;
    let match;
    while ((match = customHookRegex.exec(content)) !== null) {
      hooks.push({
        name: match[1],
        type: 'custom'
      });
    }

    return hooks;
  }

  /**
   * Detect React components in code
   * @param content File content
   * @returns Array of detected components
   */
  detectComponents(content: string): ComponentInfo[] {
    const components: ComponentInfo[] = [];

    // Function components (function declaration)
    const funcComponentRegex = /(?:export\s+)?(?:default\s+)?function\s+([A-Z]\w*)\s*\(/g;
    let match;
    while ((match = funcComponentRegex.exec(content)) !== null) {
      components.push({
        name: match[1],
        type: 'function',
        isExported: match[0].includes('export')
      });
    }

    // Arrow function components
    const arrowComponentRegex = /(?:export\s+)?(?:default\s+)?const\s+([A-Z]\w*)\s*[:=]\s*(?:\([^)]*\)|[^=]+)\s*=>/g;
    while ((match = arrowComponentRegex.exec(content)) !== null) {
      components.push({
        name: match[1],
        type: 'arrow',
        isExported: match[0].includes('export')
      });
    }

    // Class components
    const classComponentRegex = /(?:export\s+)?(?:default\s+)?class\s+([A-Z]\w*)\s+extends\s+(?:React\.)?(?:Component|PureComponent)/g;
    while ((match = classComponentRegex.exec(content)) !== null) {
      components.push({
        name: match[1],
        type: 'class',
        isExported: match[0].includes('export')
      });
    }

    return components;
  }

  /**
   * Detect React Context usage in code
   * @param content File content
   * @returns Array of detected contexts
   */
  detectContexts(content: string): ContextInfo[] {
    const contexts: ContextInfo[] = [];

    // Detect createContext calls
    const createContextRegex = /(?:const|let|var)\s+(\w+Context)\s*=\s*(?:React\.)?createContext/g;
    let match;
    while ((match = createContextRegex.exec(content)) !== null) {
      const contextName = match[1];
      const hasProvider = content.includes(`${contextName}.Provider`);
      const hasConsumer = content.includes(`${contextName}.Consumer`) || 
                         content.includes(`useContext(${contextName})`);
      
      contexts.push({
        name: contextName,
        hasProvider,
        hasConsumer
      });
    }

    return contexts;
  }

  /**
   * Detect Higher-Order Components (HOCs) in code
   * @param content File content
   * @returns Array of detected HOCs
   */
  detectHOCs(content: string): HOCInfo[] {
    const hocs: HOCInfo[] = [];

    // Common HOC patterns
    const hocPatterns = [
      // withXxx pattern
      /(?:export\s+)?(?:const|function)\s+(with[A-Z]\w*)\s*[=\(]/g,
      // Higher-order function returning component
      /(?:export\s+)?(?:const|function)\s+(\w+)\s*=\s*\([^)]*\)\s*=>\s*\([^)]*\)\s*=>/g
    ];

    for (const pattern of hocPatterns) {
      let match;
      while ((match = pattern.exec(content)) !== null) {
        hocs.push({
          name: match[1]
        });
      }
    }

    // Detect wrapped components (e.g., export default withAuth(MyComponent))
    const wrappedRegex = /export\s+default\s+(\w+)\((\w+)\)/g;
    let wrappedMatch: RegExpExecArray | null;
    while ((wrappedMatch = wrappedRegex.exec(content)) !== null) {
      const existingHoc = hocs.find(h => h.name === wrappedMatch![1]);
      if (existingHoc) {
        existingHoc.wrappedComponent = wrappedMatch[2];
      }
    }

    return hocs;
  }

  /**
   * Detect if file contains JSX/TSX
   * @param content File content
   * @returns True if JSX/TSX is detected
   */
  hasJSX(content: string): boolean {
    // Look for JSX patterns
    const jsxPatterns = [
      /<[A-Z]\w*[\s>\/]/,  // Component tags
      /<[a-z]+[\s>\/]/,     // HTML tags
      /return\s*\(/,        // Common JSX return pattern
      /className=/,         // JSX className
      /onClick=/            // JSX event handlers
    ];

    return jsxPatterns.some(pattern => pattern.test(content));
  }
}
