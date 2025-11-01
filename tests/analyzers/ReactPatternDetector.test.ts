/**
 * ReactPatternDetector Tests
 */

import { describe, it, expect, beforeEach } from '@jest/globals';
import { ReactPatternDetector, HookInfo, ComponentInfo, ContextInfo, HOCInfo } from '../../src/analyzers/ReactPatternDetector.js';

describe('ReactPatternDetector', () => {
  let detector: ReactPatternDetector;

  beforeEach(() => {
    detector = new ReactPatternDetector();
  });

  describe('detectHooks', () => {
    it('should detect built-in React hooks', () => {
      const content = `
import { useState, useEffect, useContext } from 'react';

const Component = () => {
  const [state, setState] = useState(null);
  useEffect(() => {}, []);
  const context = useContext(MyContext);
  return null;
};
      `.trim();

      const hooks = detector.detectHooks(content);
      
      expect(hooks).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ name: 'useState', type: 'built-in' }),
          expect.objectContaining({ name: 'useEffect', type: 'built-in' }),
          expect.objectContaining({ name: 'useContext', type: 'built-in' })
        ])
      );
    });

    it('should detect custom hooks', () => {
      const content = `
const useCustomHook = () => {
  const [state, setState] = useState(null);
  return state;
};

const Component = () => {
  const custom = useCustomHook();
  return null;
};
      `.trim();

      const hooks = detector.detectHooks(content);
      
      expect(hooks).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ name: 'useState', type: 'built-in' }),
          expect.objectContaining({ name: 'useCustomHook', type: 'custom' })
        ])
      );
    });

    it('should detect hooks with line numbers', () => {
      const content = `
const Component = () => {
  const [state, setState] = useState(null);
  return null;
};
      `.trim();

      const hooks = detector.detectHooks(content);
      
      const useStateHook = hooks.find(h => h.name === 'useState');
      expect(useStateHook?.line).toBe(3);
    });

    it('should not detect false positives', () => {
      const content = `
const useState = 'not a hook';
const useEffect = 123;
const hookName = 'useSomething';
      `.trim();

      const hooks = detector.detectHooks(content);
      
      expect(hooks).toHaveLength(0);
    });

    it('should detect hooks in complex patterns', () => {
      const content = `
import { useCallback, useMemo } from 'react';

const Component = ({ data }) => {
  const memoizedValue = useMemo(() => processData(data), [data]);
  const callback = useCallback(() => {
    console.log('callback');
  }, []);
  
  return null;
};
      `.trim();

      const hooks = detector.detectHooks(content);
      
      expect(hooks).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ name: 'useMemo', type: 'built-in' }),
          expect.objectContaining({ name: 'useCallback', type: 'built-in' })
        ])
      );
    });
  });

  describe('detectComponents', () => {
    it('should detect function components', () => {
      const content = `
function Button() {
  return <button>Click</button>;
}

const Input = function() {
  return <input />;
};
      `.trim();

      const components = detector.detectComponents(content);
      
      expect(components).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ name: 'Button', type: 'function' }),
          expect.objectContaining({ name: 'Input', type: 'function' })
        ])
      );
    });

    it('should detect arrow function components', () => {
      const content = `
const Button = () => {
  return <button>Click</button>;
};

const Input = () => <input />;
      `.trim();

      const components = detector.detectComponents(content);
      
      expect(components).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ name: 'Button', type: 'arrow' }),
          expect.objectContaining({ name: 'Input', type: 'arrow' })
        ])
      );
    });

    it('should detect class components', () => {
      const content = `
class Button extends React.Component {
  render() {
    return <button>Click</button>;
  }
}

class Input extends Component {
  render() {
    return <input />;
  }
}
      `.trim();

      const components = detector.detectComponents(content);
      
      expect(components).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ name: 'Button', type: 'class' }),
          expect.objectContaining({ name: 'Input', type: 'class' })
        ])
      );
    });

    it('should detect exported components', () => {
      const content = `
export const Button = () => <button>Click</button>;
export default function Input() {
  return <input />;
}
      `.trim();

      const components = detector.detectComponents(content);
      
      expect(components).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ name: 'Button', isExported: true }),
          expect.objectContaining({ name: 'Input', isExported: true })
        ])
      );
    });

    it('should detect components with TypeScript types', () => {
      const content = `
const Button: React.FC<Props> = ({ label }) => {
  return <button>{label}</button>;
};

const Input = ({ value }: InputProps): JSX.Element => {
  return <input value={value} />;
};
      `.trim();

      const components = detector.detectComponents(content);
      
      expect(components).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ name: 'Button' }),
          expect.objectContaining({ name: 'Input' })
        ])
      );
    });

    it('should not detect non-component functions', () => {
      const content = `
const helper = () => 'helper';
function utility() {
  return 'utility';
}
const notComponent = function() {
  return null;
};
      `.trim();

      const components = detector.detectComponents(content);
      
      expect(components).toHaveLength(0);
    });
  });

  describe('detectContexts', () => {
    it('should detect React Context creation and usage', () => {
      const content = `
const MyContext = React.createContext(null);
const ThemeContext = createContext('light');

const Provider = ({ children }) => {
  return (
    <MyContext.Provider value="test">
      {children}
    </MyContext.Provider>
  );
};

const Consumer = () => {
  const context = useContext(MyContext);
  const theme = useContext(ThemeContext);
  return <div>{context}</div>;
};
      `.trim();

      const contexts = detector.detectContexts(content);
      
      expect(contexts).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ 
            name: 'MyContext', 
            hasProvider: true, 
            hasConsumer: true 
          }),
          expect.objectContaining({ 
            name: 'ThemeContext', 
            hasProvider: false, 
            hasConsumer: true 
          })
        ])
      );
    });

    it('should detect Context.Consumer usage', () => {
      const content = `
const MyContext = React.createContext(null);

const ConsumerComponent = () => {
  return (
    <MyContext.Consumer>
      {value => <div>{value}</div>}
    </MyContext.Consumer>
  );
};
      `.trim();

      const contexts = detector.detectContexts(content);
      
      expect(contexts).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ 
            name: 'MyContext', 
            hasProvider: false, 
            hasConsumer: true 
          })
        ])
      );
    });
  });

  describe('detectHOCs', () => {
    it('should detect Higher-Order Components', () => {
      const content = `
const withAuth = (WrappedComponent) => {
  return (props) => {
    const isAuthenticated = true;
    return isAuthenticated ? <WrappedComponent {...props} /> : <div>Login</div>;
  };
};

const withLogging = (Component) => {
  return class extends React.Component {
    componentDidMount() {
      console.log('Component mounted');
    }
    render() {
      return <Component {...this.props} />;
    }
  };
};

const EnhancedButton = withAuth(Button);
const LoggedComponent = withLogging(MyComponent);
      `.trim();

      const hocs = detector.detectHOCs(content);
      
      expect(hocs).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ name: 'withAuth' }),
          expect.objectContaining({ name: 'withLogging' })
        ])
      );
    });

    it('should detect wrapped components in HOCs', () => {
      const content = `
const withAuth = (WrappedComponent) => {
  return (props) => <WrappedComponent {...props} />;
};

const EnhancedButton = withAuth(Button);
      `.trim();

      const hocs = detector.detectHOCs(content);
      
      const authHOC = hocs.find(h => h.name === 'withAuth');
      expect(authHOC?.wrappedComponent).toBe('Button');
    });
  });

  describe('Complex Patterns', () => {
    it('should handle mixed patterns in single file', () => {
      const content = `
import React, { useState, useContext, createContext } from 'react';

const AppContext = createContext(null);

const useCustomHook = () => {
  const [state, setState] = useState(null);
  return { state, setState };
};

const Button = () => {
  const { state } = useCustomHook();
  const context = useContext(AppContext);
  return <button>{state}</button>;
};

const withStyle = (Component) => (props) => (
  <div className="wrapper">
    <Component {...props} />
  </div>
);

export default withStyle(Button);
      `.trim();

      const hooks = detector.detectHooks(content);
      const components = detector.detectComponents(content);
      const contexts = detector.detectContexts(content);
      const hocs = detector.detectHOCs(content);

      expect(hooks.length).toBeGreaterThan(0);
      expect(components.length).toBeGreaterThan(0);
      expect(contexts.length).toBeGreaterThan(0);
      expect(hocs.length).toBeGreaterThan(0);
    });
  });
});
