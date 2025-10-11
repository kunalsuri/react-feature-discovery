# React Feature Discovery

> A CLI tool for analyzing React codebases (TypeScript/JavaScript) to generate comprehensive feature catalogs with dependency graphs, complexity metrics, and migration guidance.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

<br>

## License

This project is distributed under the terms of the MIT License.

<br>

## ⚠️ Disclaimer

This project has been developed using a combination of AI-assisted software development and whiteboarding tools, including (but not limited to) Visual Studio Code, GitHub Copilot Pro, Windsurf, Cursor, and Krio, with Human-in-the-Loop supervision and review.

While every reasonable precaution has been taken, including AI-generated code validation, malware scanning, and static analysis using tools such as CodeQL — the authors and contributors do not accept any responsibility for potential errors, security vulnerabilities, or unintended behavior within the generated code.

This software is provided “as is”, without warranty of any kind, express or implied, including but not limited to the warranties of merchantability, fitness for a particular purpose, and noninfringement.

Use this project at your own discretion and risk.

<br>

## Note for Contributors

Please review and validate any AI-generated code before committing or merging changes.

Contributions are welcome! Please read our [Contributing Guide](CONTRIBUTING.md) for details.


<br>

## 🛡️ Safety & Security

**100% Safe - Read-Only Analysis**

- ✅ **Never modifies your code** - Only reads and analyzes
- ✅ **No external network calls** - Everything runs locally
- ✅ **No code execution** - Static analysis only
- ✅ **Protected files excluded** - Automatically skips `.git`, `node_modules`, `.env`, etc.
- ✅ **Cross-platform tested** - Works on Windows, macOS, and Linux

See [Complete Guide](docs/GUIDE.md) for installation, usage, and safety information.

<br>

## Features

✨ **Comprehensive Analysis**
- Automatically discovers and categorizes React components, hooks, contexts, pages, and services
- Analyzes dependencies (internal and external)
- Detects React-specific patterns (hooks, HOCs, contexts)
- Generates dependency graphs

📊 **Multiple Output Formats**
- Markdown (default) - Human-readable documentation
- JSON - Machine-readable for CI/CD integration
- HTML - Interactive visualization

🎯 **Full-Stack Support**
- Analyzes both client and server code
- Supports TypeScript (.ts, .tsx) and JavaScript (.js, .jsx)
- Works with any React project structure (CRA, Vite, Next.js, Remix, custom)

⚙️ **Highly Configurable**
- Custom categorization rules
- Configurable environment detection
- Custom module types
- Flexible output options

<br>

## Installation

### Install from GitHub

#### Option 1: Using Installation Script (Recommended)

**Linux/macOS:**
```bash
git clone https://github.com/kunalsuri/react-feature-discovery.git
cd react-feature-discovery
./scripts/install.sh
```

**Windows:**
```cmd
git clone https://github.com/kunalsuri/react-feature-discovery.git
cd react-feature-discovery
scripts\install.bat
```

#### Option 2: Manual Installation

```bash
# Clone the repository
git clone https://github.com/kunalsuri/react-feature-discovery.git
cd react-feature-discovery

# Install dependencies
npm install

# Build the project
npm run build

# Link globally (optional)
npm link

# Or run directly
node dist/cli.js
```

#### Option 3: Quick One-Line Install

```bash
# Clone, install, build, and link in one command
git clone https://github.com/kunalsuri/react-feature-discovery.git && cd react-feature-discovery && npm install && npm run build && npm link
```

### Verify Installation

```bash
# If you linked globally
rfd --version

# Or run directly
node /path/to/react-feature-discovery/dist/cli.js --version
```
<br>

## Quick Start

After installation, you can use the tool in several ways:

```bash
# If you ran npm link
rfd

# Or run directly from the repository
node /path/to/react-feature-discovery/dist/cli.js

# Or add to your project's package.json scripts
# "scripts": {
#   "analyze": "node ../react-feature-discovery/dist/cli.js"
# }
npm run analyze
```

### Basic Usage Examples

```bash
# Analyze current directory
rfd

# Analyze specific directory
rfd --root ./src

# Generate multiple formats
rfd --format markdown,json,html

# Custom output path
rfd --output docs/features.md
```

<br>


## Usage

### Basic Usage

```bash
rfd [options]
```

### Options

| Option | Alias | Description | Default |
|--------|-------|-------------|---------|
| `--root <path>` | `-r` | Root directory to analyze | Current directory |
| `--output <path>` | `-o` | Output file path | `feature-catalog.md` |
| `--format <formats>` | `-f` | Output formats (comma-separated) | `markdown` |
| `--config <path>` | `-c` | Path to config file | Auto-detect |
| `--no-cache` | | Disable caching | Enabled |
| `--no-parallel` | | Disable parallel processing | Enabled |
| `--version` | `-v` | Show version | |
| `--help` | `-h` | Show help | |


<br>

### Examples

```bash
# Analyze a Vite project
rfd --root ./src --output docs/features.md

# Generate all formats
rfd --format markdown,json,html

# Use custom config
rfd --config .rfdrc.json

# Analyze Next.js project
rfd --root ./app --output analysis/features.md

# Run from repository without npm link
node /path/to/react-feature-discovery/dist/cli.js --root ./src
```

### Using in Your Project

Add to your `package.json`:

```json
{
  "scripts": {
    "analyze": "node ../react-feature-discovery/dist/cli.js",
    "analyze:json": "node ../react-feature-discovery/dist/cli.js --format json",
    "analyze:all": "node ../react-feature-discovery/dist/cli.js --format markdown,json,html"
  }
}
```

Then run:

```bash
npm run analyze
```

<br>

## Configuration

Create a configuration file in your project root:

### `.rfdrc.json`

```json
{
  "rootDir": "./src",
  "outputPath": "docs/features.md",
  "outputFormats": ["markdown", "json"],
  "excludeDirs": ["node_modules", "dist", ".git"],
  "detectReactPatterns": true,
  "detectHooks": true,
  "detectContexts": true,
  "clientDirs": ["client", "src", "app"],
  "serverDirs": ["server", "api", "backend"]
}
```

### `.rfdrc.js`

```javascript
export default {
  rootDir: './src',
  outputPath: 'docs/features.md',
  customCategories: {
    'custom-component': {
      pattern: /my-components\//,
      category: 'component',
      priority: 10
    }
  }
};
```

### `package.json`

```json
{
  "rfd": {
    "rootDir": "./src",
    "outputPath": "docs/features.md"
  }
}
```

<br>

## Configuration Options

### File Scanning

- `rootDir` - Root directory to analyze
- `excludeDirs` - Directories to exclude
- `filePatterns` - File patterns to include
- `clientDirs` - Client-side code directories
- `serverDirs` - Server-side code directories

### Analysis

- `detectReactPatterns` - Detect React-specific patterns
- `detectHooks` - Detect React hooks
- `detectContexts` - Detect React contexts
- `detectHOCs` - Detect Higher-Order Components

### Output

- `outputPath` - Output file path
- `outputFormats` - Output formats (markdown, json, html)

### Performance

- `parallel` - Enable parallel processing
- `cacheEnabled` - Enable caching
- `cacheDir` - Cache directory

### Customization

- `customCategories` - Custom categorization rules
- `moduleTypes` - Custom module types
- `environmentPatterns` - Custom environment detection patterns
- `customMigrationRules` - Custom migration rules

<br>

## Output Examples

### Markdown Output

```markdown
# Feature Catalog - My React App

## Summary

### Feature Breakdown

| Category | Count |
|----------|-------|
| Pages | 10 |
| Components | 45 |
| Hooks | 12 |
| Services | 8 |

### Key Technologies

- React 18
- TypeScript
- TanStack Query
- Tailwind CSS
```

### JSON Output

```json
{
  "metadata": {
    "projectName": "my-react-app",
    "totalFiles": 75,
    "version": "1.0.0"
  },
  "summary": {
    "pages": 10,
    "components": 45,
    "hooks": 12
  }
}
```

<br>

## Supported Project Types

- ✅ Create React App (CRA)
- ✅ Vite
- ✅ Next.js
- ✅ Remix
- ✅ Gatsby
- ✅ Custom React setups
- ✅ Full-stack applications (Express, Fastify, etc.)

<br>

## Supported Technologies

### React Ecosystem
- React, React Router, Wouter
- Redux, Zustand, Jotai, Recoil
- TanStack Query, SWR
- Next.js, Remix, Gatsby

### Styling
- Tailwind CSS, Styled Components, Emotion
- Material-UI, Chakra UI, Radix UI
- Sass, Less

### Backend
- Express.js, Fastify, Koa
- Drizzle ORM, Prisma, TypeORM

<br>

## Use Cases

### 📚 Documentation
Generate comprehensive documentation for your React codebase automatically.

### 🔄 Migration Planning
Understand dependencies and complexity before migrating to a new framework or architecture.

### 🔍 Code Review
Get insights into code structure, dependencies, and potential issues.

### 📊 Project Analysis
Analyze project health, identify tightly coupled code, and find refactoring opportunities.

### 🎯 Onboarding
Help new team members understand the codebase structure quickly.

<br>

## Installation for Development

If you want to contribute or modify the tool:

```bash
# Clone the repository
git clone https://github.com/kunalsuri/react-feature-discovery.git
cd react-feature-discovery

# Install dependencies
npm install

# Build in watch mode
npm run dev

# Run tests (when available)
npm test
```

<br>

## Links

- [Complete Guide](docs/GUIDE.md) - Installation, usage, and safety
- [GitHub Repository](https://github.com/kunalsuri/react-feature-discovery)
- [Issue Tracker](https://github.com/kunalsuri/react-feature-discovery/issues)
- [Changelog](CHANGELOG.md)
- [Contributing Guide](CONTRIBUTING.md)

<br>

## Support

- 🐛 Issues: [GitHub Issues](https://github.com/kunalsuri/react-feature-discovery/issues)
- 💡 Feature Requests: [GitHub Discussions](https://github.com/kunalsuri/react-feature-discovery/discussions)
- 📖 Documentation: [GitHub Wiki](https://github.com/kunalsuri/react-feature-discovery/wiki)
