# React Feature Discovery - Complete Project Information

> Comprehensive documentation covering installation, usage, features, and technical details for both Web GUI and CLI interfaces.

**Version**: 0.1.0 | **License**: MIT | **Last Updated**: October 2025

---

## Table of Contents

- [Overview](#overview)
- [Quick Start](#quick-start)
- [Installation](#installation)
- [Using the Web GUI](#using-the-web-gui)
- [Using the CLI](#using-the-cli)
- [Configuration](#configuration)
- [What Gets Analyzed](#what-gets-analyzed)
- [Safety & Security](#safety--security)
- [Technical Architecture](#technical-architecture)
- [Advanced Usage](#advanced-usage)
- [Troubleshooting](#troubleshooting)
- [Best Practices](#best-practices)
- [FAQ](#faq)
- [Support](#support)

---

## Overview

React Feature Discovery is a powerful tool for analyzing React codebases to generate comprehensive feature catalogs with dependency graphs, complexity metrics, and migration guidance. It offers both a modern web GUI and a powerful CLI interface.

### Dual Interface Solution

**🌐 Web GUI** - Beautiful browser interface
- Modern dark theme optimized for developers
- Real-time progress tracking with animations
- Visual configuration and folder selection
- One-click access to generated reports
- Ultra-lightweight (~300KB, pure HTML/CSS/JS)

**💻 CLI** - Command-line tool
- Perfect for automation and CI/CD
- Scriptable and batch processing
- Fast and efficient
- Same analysis engine as GUI

### Key Features

✨ **Comprehensive Analysis**
- Automatically discovers React components, hooks, contexts, pages, and services
- Analyzes dependencies (internal and external)
- Detects React-specific patterns (hooks, HOCs, contexts)
- Generates dependency graphs
- Complexity metrics and migration guidance

📊 **Multiple Output Formats**
- **Markdown** - Human-readable documentation
- **JSON** - Machine-readable for CI/CD integration
- **HTML** - Interactive visualization

🎯 **Full-Stack Support**
- Analyzes both client and server code
- Supports TypeScript (.ts, .tsx) and JavaScript (.js, .jsx)
- Works with any React project structure (CRA, Vite, Next.js, Remix, custom)

⚙️ **Highly Configurable**
- Custom categorization rules
- Configurable environment detection
- Custom module types and migration rules

---

## Quick Start

Get started in 3 simple steps:

### 1. Install

```bash
# Clone and install
git clone https://github.com/kunalsuri/react-feature-discovery.git
cd react-feature-discovery
npm install
```

### 2. Choose Your Interface

**Option A: Web GUI (Easiest)**
```bash
npm run gui
# Opens browser at http://localhost:3000
```

**Option B: Command Line**
```bash
node dist/cli.js --root /path/to/your/react/project
```

### 3. View Results

Open the generated files (default: `feature-catalog.md`) to see your complete codebase analysis!

---

## Installation

### Prerequisites

- **Node.js** 18.0.0 or higher
- **npm** (comes with Node.js)
- **Git**

### Method 1: Automated Installation (Recommended)

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

### Method 2: Manual Installation

```bash
git clone https://github.com/kunalsuri/react-feature-discovery.git
cd react-feature-discovery
npm install
npm run build
npm link  # Optional: for global 'rfd' command
```

### Method 3: One-Line Installation

```bash
git clone https://github.com/kunalsuri/react-feature-discovery.git && cd react-feature-discovery && npm install && npm run build && npm link
```

### Verify Installation

```bash
# If you linked globally
rfd --version
rfd --help

# Or run directly
node dist/cli.js --version
```

---

## Using the Web GUI

### Starting the GUI Server

```bash
npm run gui
```

**Or use the launcher scripts:**

**Windows:**
```bash
start-gui.bat
# Double-click the file in Windows Explorer
```

**Mac/Linux:**
```bash
./start-gui.sh
```

The server will start at `http://localhost:3000` and automatically open your browser.

You'll see:
```
╔════════════════════════════════════════════════════════════╗
║                                                            ║
║   🚀 React Feature Discovery - Web GUI                    ║
║                                                            ║
║   Server running at: http://localhost:3000              ║
║                                                            ║
║   Open your browser and start analyzing!                  ║
║                                                            ║
╚════════════════════════════════════════════════════════════╝
```

### Using the Web Interface

#### Step 1: Enter Project Path
- Type the full path to your React project
- **Windows**: `C:\Users\YourName\Projects\my-react-app`
- **Mac/Linux**: `/Users/yourname/projects/my-react-app`

#### Step 2: Configure Output
- Set output file name (default: `feature-catalog.md`)
- **Files are saved to your project's root directory** (parent of the analyzed folder)
- Choose output formats:
  - ✅ **Markdown** - Human-readable documentation
  - ✅ **JSON** - Machine-readable for CI/CD
  - ✅ **HTML** - Interactive visualization

#### Step 3: Set Options
- ✅ **Enable Caching** - Faster repeated analyses
- ✅ **Parallel Processing** - Maximum speed

#### Step 4: Start Analysis
- Click the "🚀 Start Analysis" button
- Watch real-time progress bar
- View status messages

#### Step 5: View Results
- Click file links to open reports
- Download in multiple formats
- Share with your team

### GUI Features

- 🌙 **Modern dark theme** optimized for developers
- ⚡ **Ultra-lightweight** (~300KB, no React/Vue/Angular)
- 📊 **Real-time progress** with animated progress bars
- ✅ **Input validation** prevents errors before analysis
- 🔗 **One-click access** to generated files
- 🛡️ **Same safety** as CLI (read-only, local)
- 📱 **Responsive design** works on all screen sizes
- 🎨 **Smooth animations** and professional design
- 📁 **Smart output** - Files saved directly to your project directory

### Changing the GUI Port

```bash
# Use a different port
PORT=8080 npm run gui
```

### GUI Technical Details

**Stack:**
- **Backend**: Pure Node.js HTTP server (no Express - ultra lightweight!)
- **Frontend**: Vanilla HTML/CSS/JavaScript (no frameworks)
- **Size**: ~300KB total (10MB+ smaller than typical web apps)

**Architecture:**
- RESTful API with job-based processing
- Polling for real-time progress updates
- Async analysis execution
- In-memory job tracking

**API Endpoints:**
- `GET /` - Serve HTML interface
- `POST /api/validate-directory` - Validate project path
- `POST /api/analyze` - Start analysis job
- `GET /api/job/:id` - Check job status
- `GET /api/result/:path` - Retrieve generated files

---

## Using the CLI

### Basic Commands

```bash
# Analyze current directory
rfd

# Analyze specific directory
rfd --root ./src

# Custom output path
rfd --output docs/features.md

# Multiple formats
rfd --format markdown,json,html
```

### All CLI Options

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

### CLI Examples

```bash
# Basic analysis
rfd

# Specify directory
rfd --root ./src

# Multiple output formats
rfd --format markdown,json,html

# Custom output location
rfd --output docs/features.md

# Disable caching for fresh analysis
rfd --no-cache

# Use configuration file
rfd --config .rfdrc.json

# Run from repository without npm link
node dist/cli.js --root ./src

# Analyze Next.js project
rfd --root ./app --output analysis/features.md

# Generate all formats with custom config
rfd --config .rfdrc.json --format markdown,json,html
```

### Add to package.json Scripts

```json
{
  "scripts": {
    "analyze": "rfd",
    "analyze:json": "rfd --format json",
    "analyze:full": "rfd --format markdown,json,html",
    "analyze:docs": "rfd --output docs/features.md"
  }
}
```

Then run:
```bash
npm run analyze
```

---

## Configuration

### Configuration Files

Create a configuration file in your project root. The tool auto-detects:
- `.rfdrc.json`
- `.rfdrc.js`
- `rfd.config.json`
- `rfd.config.js`
- `"rfd"` field in `package.json`

### Example: `.rfdrc.json` (Recommended)

```json
{
  "rootDir": "./src",
  "outputPath": "docs/features.md",
  "outputFormats": ["markdown", "json"],
  "excludeDirs": ["node_modules", "dist", "build", ".git"],
  "detectReactPatterns": true,
  "detectHooks": true,
  "detectContexts": true,
  "clientDirs": ["client", "src", "app"],
  "serverDirs": ["server", "api", "backend"],
  "cacheEnabled": true,
  "parallel": true
}
```

### Example: `package.json`

```json
{
  "name": "my-react-app",
  "rfd": {
    "rootDir": "./src",
    "outputPath": "docs/features.md",
    "outputFormats": ["markdown", "json"]
  }
}
```

### Example: `.rfdrc.js` (For Advanced Configuration)

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
  },
  customMigrationRules: [
    {
      pattern: 'class.*extends.*Component',
      message: 'Consider migrating to function components',
      severity: 'info'
    }
  ]
};
```

### Configuration Options Reference

#### File Scanning
- `rootDir` - Root directory to analyze
- `excludeDirs` - Directories to exclude (default: `node_modules`, `.git`, etc.)
- `filePatterns` - File patterns to include
- `clientDirs` - Client-side code directories
- `serverDirs` - Server-side code directories

#### Analysis
- `detectReactPatterns` - Detect React-specific patterns (default: `true`)
- `detectHooks` - Detect React hooks (default: `true`)
- `detectContexts` - Detect React contexts (default: `true`)
- `detectHOCs` - Detect Higher-Order Components (default: `true`)

#### Output
- `outputPath` - Output file path (default: `feature-catalog.md`)
- `outputFormats` - Array of formats: `markdown`, `json`, `html`

#### Performance
- `parallel` - Enable parallel processing (default: `true`)
- `cacheEnabled` - Enable caching (default: `true`)
- `cacheDir` - Cache directory (default: `.rfd-cache`)

#### Customization
- `customCategories` - Custom categorization rules
- `moduleTypes` - Custom module types
- `environmentPatterns` - Custom environment detection patterns
- `customMigrationRules` - Custom migration guidance rules

### Using Configuration Files

```bash
# Auto-detect configuration file
rfd

# Specify configuration file
rfd --config .rfdrc.json

# Override config with CLI options
rfd --config .rfdrc.json --output custom-output.md
```

---

## What Gets Analyzed

The tool automatically discovers and categorizes:

### ✅ Pages
- Route components
- Page-level components
- Layout components

### ✅ Components
- Function components
- Class components
- Arrow function components
- HOCs (Higher-Order Components)

### ✅ Hooks
- Custom React hooks
- Built-in React hooks usage
- Hook dependencies and patterns

### ✅ Contexts
- React Context providers
- Context consumers
- Context usage patterns

### ✅ Services
- API service layers
- Data fetching services
- Backend integration modules

### ✅ Utilities
- Helper functions
- Utility modules
- Common functions

### ✅ Types
- TypeScript type definitions
- Interface declarations
- Type exports

### ✅ Server Code
- Backend routes
- Middleware
- Server utilities
- API endpoints

### Output Information

Generated catalogs include:
- **Feature inventory** - Complete list of all discovered features
- **Dependency graphs** - Visual relationships between modules
- **Technology detection** - Frameworks and libraries identified
- **Complexity metrics** - File sizes, line counts, dependency counts
- **Migration guidance** - Suggestions for improvements
- **Environment analysis** - Client vs server code separation

---

## Safety & Security

### 🛡️ 100% Safe - Read-Only Analysis

This tool **ONLY READS** your code and **NEVER MODIFIES** any source files.

### What It Does

✅ Reads and analyzes your codebase  
✅ Generates separate documentation files  
✅ Operates within specified directory only  
✅ Excludes sensitive files automatically  
✅ Validates paths to prevent traversal attacks

### What It NEVER Does

❌ Modifies source code  
❌ Deletes files  
❌ Executes your code  
❌ Makes network requests  
❌ Collects or transmits data  
❌ Accesses system directories

### Built-in Protection

**Path Validation**
- Prevents path traversal attacks
- Validates all input paths
- Restricts access to specified directories

**System Protection**
- Cannot access system directories
- Cannot modify system files
- Safe on all platforms

**Safe Defaults - Automatically Excludes:**
- `node_modules/`
- `.git/` and `.github/`
- `.env*` files and secrets
- `package.json`, `package-lock.json`
- Binary files and media
- Build outputs (`dist/`, `build/`, `.next/`)

### Cross-Platform Support

✅ **Windows** 10, 11, Server 2019+  
✅ **macOS** 10.15 Catalina and later  
✅ **Linux** Ubuntu, Debian, RHEL, Fedora, Arch

### Safety Verification

Run the safety verification script:

```bash
./scripts/verify-safety.sh
```

This verifies:
- No dangerous operations
- No code execution
- No network calls
- Read-only file operations
- Safety validator present and functional

### Security Best Practices

1. **Review configuration** before running on sensitive codebases
2. **Verify output paths** to ensure they're in safe locations
3. **Check exclusions** for any sensitive directories
4. **Don't run with elevated privileges** (sudo/admin)
5. **Test in isolated environment** first if concerned

---

## Technical Architecture

### Project Structure

```
react-feature-discovery/
├── gui/
│   ├── index.html          ← Beautiful web interface
│   └── README.md           ← GUI technical documentation
├── src/
│   ├── cli.ts              ← Command-line interface entry point
│   ├── server.ts           ← Web GUI server
│   ├── analyzers/          ← Analysis engines
│   │   ├── CatalogBuilder.ts
│   │   ├── DependencyAnalyzer.ts
│   │   ├── MetadataExtractor.ts
│   │   └── ReactPatternDetector.ts
│   ├── config/             ← Configuration management
│   │   ├── ConfigLoader.ts
│   │   ├── ConfigMerger.ts
│   │   ├── ConfigValidator.ts
│   │   └── defaults.ts
│   ├── core/               ← Core analysis engine
│   │   └── AnalysisEngine.ts
│   ├── generators/         ← Output generators
│   │   ├── HTMLGenerator.ts
│   │   ├── JSONGenerator.ts
│   │   └── MarkdownGenerator.ts
│   ├── scanners/           ← File scanning
│   │   └── FileScanner.ts
│   ├── types/              ← TypeScript definitions
│   │   ├── config.ts
│   │   └── index.ts
│   └── utils/              ← Utilities
│       ├── ErrorHandler.ts
│       ├── locationDetector.ts
│       └── SafetyValidator.ts
├── scripts/
│   ├── install.bat         ← Windows installer
│   ├── install.sh          ← Unix installer
│   └── verify-safety.sh    ← Safety verification
├── start-gui.bat           ← Windows GUI launcher
└── start-gui.sh            ← Unix GUI launcher
```

### Technology Stack

**Backend:**
- Pure Node.js HTTP server (no Express dependencies)
- TypeScript for type safety
- ES Modules for modern JavaScript

**Frontend (GUI):**
- Pure HTML5/CSS3/JavaScript
- No frameworks or build tools required
- ~300KB total size

**Analysis Engine:**
- Static code analysis
- AST parsing
- Pattern matching
- Dependency graph generation

### How It Works

1. **File Scanning** - Recursively scans project directories
2. **Dependency Analysis** - Analyzes import/require statements
3. **Pattern Detection** - Identifies React patterns and structures
4. **Metadata Extraction** - Extracts component information
5. **Catalog Building** - Organizes features into categories
6. **Output Generation** - Creates Markdown/JSON/HTML reports

### Performance Features

- **Parallel Processing** - Analyzes multiple files simultaneously
- **Caching** - Remembers previous analyses for speed
- **Incremental Analysis** - Only reanalyzes changed files
- **Memory Efficient** - Streams large files

---

## Advanced Usage

### Custom Categories

Define custom categorization rules:

```json
{
  "customCategories": {
    "custom-component": {
      "pattern": "/my-components/",
      "category": "component",
      "priority": 10
    },
    "feature-module": {
      "pattern": "/features/.*\\.feature\\.tsx?$/",
      "category": "page",
      "priority": 15
    }
  }
}
```

### Environment Detection

Customize client/server code detection:

```json
{
  "clientDirs": ["client", "src", "app", "frontend"],
  "serverDirs": ["server", "api", "backend", "services"]
}
```

### Migration Rules

Add custom migration guidance:

```json
{
  "customMigrationRules": [
    {
      "pattern": "class.*extends.*Component",
      "message": "Consider migrating to function components with hooks",
      "severity": "info"
    },
    {
      "pattern": "componentWillMount|componentWillReceiveProps",
      "message": "These lifecycle methods are deprecated. Use useEffect instead",
      "severity": "warning"
    }
  ]
}
```

### CI/CD Integration

#### GitHub Actions Example

```yaml
# .github/workflows/analyze.yml
name: Analyze Codebase
on: [push, pull_request]

jobs:
  analyze:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      
      - name: Setup Node.js
        uses: actions/setup-node@v2
        with:
          node-version: '20'
      
      - name: Install React Feature Discovery
        run: |
          git clone https://github.com/kunalsuri/react-feature-discovery.git
          cd react-feature-discovery
          npm install && npm run build
      
      - name: Run Analysis
        run: |
          node react-feature-discovery/dist/cli.js --format json --output analysis.json
      
      - name: Upload Results
        uses: actions/upload-artifact@v2
        with:
          name: feature-catalog
          path: analysis.json
      
      - name: Comment on PR
        if: github.event_name == 'pull_request'
        uses: actions/github-script@v5
        with:
          script: |
            const fs = require('fs');
            const analysis = JSON.parse(fs.readFileSync('analysis.json', 'utf8'));
            const comment = `## Analysis Results
            - Components: ${analysis.summary.components}
            - Hooks: ${analysis.summary.hooks}
            - Pages: ${analysis.summary.pages}`;
            github.rest.issues.createComment({
              issue_number: context.issue.number,
              owner: context.repo.owner,
              repo: context.repo.repo,
              body: comment
            });
```

#### GitLab CI Example

```yaml
# .gitlab-ci.yml
analyze:
  stage: test
  image: node:20
  script:
    - git clone https://github.com/kunalsuri/react-feature-discovery.git
    - cd react-feature-discovery && npm install && npm run build && cd ..
    - node react-feature-discovery/dist/cli.js --format json
  artifacts:
    paths:
      - feature-catalog.json
    expire_in: 1 week
```

---

## Troubleshooting

### Command Not Found

```bash
# If 'rfd' not found, run directly
node /path/to/react-feature-discovery/dist/cli.js

# Or add to PATH (Linux/macOS)
export PATH="$PATH:$(npm config get prefix)/bin"

# Or reinstall globally
npm link
```

### Build Errors

```bash
# Clean and rebuild
rm -rf node_modules dist
npm install
npm run build
```

### Permission Errors

**Linux/macOS:**
```bash
# Make scripts executable
chmod +x scripts/install.sh
chmod +x start-gui.sh

# If npm link fails, use sudo
sudo npm link
```

**Windows:**
```cmd
# Run Command Prompt as Administrator
npm link
```

### Node Version Issues

```bash
# Check Node.js version (must be 18.0.0+)
node -v

# Update Node.js if needed
# Visit: https://nodejs.org/
```

### No Output Generated

**Check if you're in a React project:**
```bash
# Verify React files exist
ls src/**/*.{ts,tsx,js,jsx}

# Explicitly set root directory
rfd --root ./src

# Check if files are excluded
rfd --root ./src --no-cache
```

### TypeScript Compilation Errors

```bash
# Reinstall TypeScript
npm install -D typescript@latest

# Rebuild project
npm run build

# Check tsconfig.json is present
cat tsconfig.json
```

### GUI Not Loading

**Check if server started:**
- Look for "Server running at" message
- Verify no error messages in terminal

**Check browser:**
- Navigate to http://localhost:3000
- Check browser console for errors
- Try a different browser

**Check firewall:**
- Allow Node.js through firewall
- Try different port: `PORT=8080 npm run gui`

**Check if port is in use:**
```bash
# Linux/macOS
lsof -i :3000

# Windows
netstat -ano | findstr :3000
```

### Analysis Takes Too Long

```bash
# Enable parallel processing (default)
rfd --root ./src

# Disable parallel if causing issues
rfd --root ./src --no-parallel

# Clear cache
rm -rf .rfd-cache
rfd --root ./src
```

### Out of Memory Errors

```bash
# Increase Node.js memory limit
NODE_OPTIONS="--max-old-space-size=4096" rfd --root ./src

# Analyze smaller directories
rfd --root ./src/components
```

---

## Best Practices

### 1. Regular Analysis

Run analysis regularly to track codebase evolution:

```bash
# Weekly or before major releases
npm run analyze
git add feature-catalog.md
git commit -m "docs: update feature catalog"
```

### 2. Code Reviews

Generate catalogs before and after refactoring:

```bash
# Before refactoring
rfd --output before-refactor.md

# After refactoring
rfd --output after-refactor.md

# Compare the differences
```

### 3. Onboarding New Team Members

Share the generated catalog with new developers:

```bash
# Generate comprehensive documentation
rfd --format markdown,html --output docs/codebase-overview.md

# Share the HTML version for interactive exploration
open docs/codebase-overview.html
```

### 4. Migration Planning

Use dependency graphs to plan migrations:

```bash
# Generate JSON for programmatic analysis
rfd --format json --output migration-plan.json

# Analyze dependencies to identify tightly coupled code
```

### 5. Documentation as Code

Keep catalogs in version control:

```json
{
  "scripts": {
    "predeploy": "npm run analyze",
    "analyze": "rfd --output docs/features.md"
  }
}
```

### 6. CI/CD Integration

Automate analysis in your pipeline:

```yaml
# Run on every PR to track changes
- run: rfd --format json --output pr-analysis.json
- run: compare-with-main pr-analysis.json main-analysis.json
```

---

## FAQ

**Q: Does this modify my code?**  
A: No. It's 100% read-only. Never modifies, deletes, or executes your code.

**Q: Is it safe to run on production code?**  
A: Yes. It only reads files and generates documentation. No modifications are made.

**Q: Does it work with JavaScript projects?**  
A: Yes. Supports both TypeScript (.ts, .tsx) and JavaScript (.js, .jsx) files.

**Q: Can I use it with Next.js/Remix/Vite/CRA?**  
A: Yes. Works with any React project structure and build system.

**Q: Does it require an internet connection?**  
A: No. Fully offline operation. No data is transmitted anywhere.

**Q: What about private/sensitive code?**  
A: The tool runs entirely locally on your machine. No data is collected or transmitted.

**Q: Can I customize the output?**  
A: Yes. Use configuration files to customize categories, output formats, and analysis rules.

**Q: How fast is the analysis?**  
A: Depends on project size. Small projects (~100 files) analyze in seconds. Large projects (~1000+ files) may take minutes.

**Q: Does it support monorepos?**  
A: Yes. Point it to any directory within a monorepo, or run multiple analyses for different packages.

**Q: Can I integrate it into VS Code?**  
A: Currently, it runs as a separate tool. VS Code extension is planned for future releases.

**Q: Does it support other frameworks (Vue, Angular, Svelte)?**  
A: Currently React-focused. Support for other frameworks may be added in future versions.

**Q: How often should I run analysis?**  
A: Weekly or before major releases is recommended. Add to CI/CD for automatic tracking.

**Q: Can I contribute to the project?**  
A: Yes! See [CONTRIBUTING.md](../CONTRIBUTING.md) for guidelines.

---

## Support

### Documentation

- 📖 **Main README**: [README.md](../README.md)
- 📝 **Changelog**: [CHANGELOG.md](../CHANGELOG.md)
- 🤝 **Contributing**: [CONTRIBUTING.md](../CONTRIBUTING.md)
- 📋 **Code of Conduct**: [CODE_OF_CONDUCT.md](../CODE_OF_CONDUCT.md)

### Get Help

- 🐛 **Bug Reports**: [GitHub Issues](https://github.com/kunalsuri/react-feature-discovery/issues)
- 💡 **Feature Requests**: [GitHub Discussions](https://github.com/kunalsuri/react-feature-discovery/discussions)
- 📖 **Documentation**: [GitHub Wiki](https://github.com/kunalsuri/react-feature-discovery/wiki)
- 💬 **Community**: [GitHub Discussions](https://github.com/kunalsuri/react-feature-discovery/discussions)

### Security Issues

For security vulnerabilities, please email directly (do not open public issues):
- Include: Description, steps to reproduce, potential impact
- Expected response time: Within 48 hours
- We'll work with you to resolve the issue promptly

### Resources

- 🌐 **Repository**: https://github.com/kunalsuri/react-feature-discovery
- 📦 **NPM Package**: Coming soon
- 📚 **Examples**: [examples/](../examples/)
- 🎥 **Video Tutorials**: Coming soon

---

## GUI vs CLI Comparison

| Feature | Web GUI | CLI |
|---------|---------|-----|
| **Ease of Use** | ⭐⭐⭐⭐⭐ Click and go | ⭐⭐⭐ Command line knowledge |
| **Visual Feedback** | ⭐⭐⭐⭐⭐ Real-time progress | ⭐⭐⭐ Console output |
| **Setup Time** | ⭐⭐⭐⭐⭐ `npm run gui` | ⭐⭐⭐⭐ `rfd --root ./src` |
| **Automation** | ⭐⭐ Manual only | ⭐⭐⭐⭐⭐ Perfect for CI/CD |
| **Scripting** | ❌ Not applicable | ⭐⭐⭐⭐⭐ Full scripting support |
| **Speed** | ⭐⭐⭐⭐⭐ Same engine | ⭐⭐⭐⭐⭐ Same engine |
| **Best For** | Demos, testing, beginners | Automation, power users, CI/CD |

**Both use the same analysis engine = identical results!**

### When to Use GUI

✅ First-time users learning the tool  
✅ Quick one-off analyses  
✅ Demos and presentations  
✅ Visual learners  
✅ Users uncomfortable with command line

### When to Use CLI

✅ Automation and scripting  
✅ CI/CD pipelines  
✅ Batch processing  
✅ Power users and developers  
✅ Integration with other tools

---

## Supported Project Types

- ✅ Create React App (CRA)
- ✅ Vite
- ✅ Next.js (Pages Router and App Router)
- ✅ Remix
- ✅ Gatsby
- ✅ Custom React setups
- ✅ Full-stack applications (Express, Fastify, Koa, etc.)
- ✅ Monorepos (Nx, Turborepo, Lerna)

## Supported Technologies

### React Ecosystem
- React, React Router, Wouter, TanStack Router
- Redux, Zustand, Jotai, Recoil, MobX
- TanStack Query, SWR, Apollo Client
- Next.js, Remix, Gatsby

### Styling
- Tailwind CSS, Styled Components, Emotion
- Material-UI, Chakra UI, Radix UI, shadcn/ui
- Sass, Less, CSS Modules

### Backend
- Express.js, Fastify, Koa, Hapi
- Drizzle ORM, Prisma, TypeORM, Sequelize
- tRPC, GraphQL (Apollo, Relay)

---

**For the latest updates, visit: [GitHub Repository](https://github.com/kunalsuri/react-feature-discovery)**

**Happy analyzing! 🚀**
