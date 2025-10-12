# React Feature Discovery

> Analyze React codebases (TypeScript/JavaScript) to generate comprehensive feature catalogs with dependency graphs, complexity metrics, and migration guidance. Available as both a modern Web GUI and powerful CLI.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/Node.js-18%2B-green.svg)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue.svg)](https://www.typescriptlang.org/)

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

See [Complete Documentation](docs/project-info.md) for installation, usage, and safety information.

<br>

## Features

### 🎨 Dual Interface

**Web GUI** - Beautiful browser interface (no command line needed!)
- Modern dark theme optimized for developers
- Real-time progress tracking with animations
- Visual folder selection and configuration
- One-click access to generated reports
- Ultra-lightweight (~300KB, pure HTML/CSS/JS)

**CLI** - Powerful command-line tool
- Perfect for automation and CI/CD
- Scriptable and batch processing
- Fast and efficient
- Same analysis engine as GUI

### ✨ Comprehensive Analysis

- Automatically discovers and categorizes React components, hooks, contexts, pages, and services
- Analyzes dependencies (internal and external)
- Detects React-specific patterns (hooks, HOCs, contexts)
- Generates dependency graphs
- Complexity metrics and migration guidance

### 📊 Multiple Output Formats

- **Markdown** - Human-readable documentation
- **JSON** - Machine-readable for CI/CD integration
- **HTML** - Interactive visualization

### 🎯 Full-Stack Support

- Analyzes both client and server code
- Supports TypeScript (.ts, .tsx) and JavaScript (.js, .jsx)
- Works with any React project structure (CRA, Vite, Next.js, Remix, custom)

### ⚙️ Highly Configurable

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

### 🚀 Choose Your Interface

#### 🎨 Web GUI (Recommended for Most Users)

**Start the server:**
```bash
npm run gui
```

**Or use launcher scripts:**
```bash
# Windows
start-gui.bat

# Mac/Linux
./start-gui.sh
```

Then your browser opens automatically at `http://localhost:3000` with a beautiful interface where you can:
- 📁 Enter your project path
- 📊 Select output formats
- ⚙️ Configure options with checkboxes
- 🚀 Click "Start Analysis"
- 📈 Watch real-time progress
- � Download results with one click

**Perfect for:**
- Visual learners
- Quick one-off analyses
- Demos and presentations
- Users new to command line

#### 💻 Command Line (For Power Users & Automation)

**After installation:**
```bash
# If you ran npm link
rfd --root ./src

# Or run directly
node dist/cli.js --root ./src

# Or use npx
npx . --root ./src
```

**Basic examples:**
```bash
# Analyze current directory
rfd

# Multiple output formats
rfd --format markdown,json,html

# Custom output path
rfd --output docs/features.md

# Disable caching for fresh analysis
rfd --no-cache
```

**Perfect for:**
- Automation and CI/CD
- Scripting and batch processing
- Power users who prefer terminals
- Integration with other tools

### 📚 Full Documentation

See [Complete Documentation](docs/project-info.md) for detailed instructions, configuration options, and advanced usage.

<br>

## CLI Options

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

## Configuration

Customize analysis using configuration files. Create one of these in your project root:

**`.rfdrc.json`** (recommended):
```json
{
  "rootDir": "./src",
  "outputPath": "docs/features.md",
  "outputFormats": ["markdown", "json"],
  "excludeDirs": ["node_modules", "dist", ".git"]
}
```

**Or `package.json`:**
```json
{
  "rfd": {
    "rootDir": "./src",
    "outputPath": "docs/features.md"
  }
}
```

Then run: `rfd --config .rfdrc.json` (or just `rfd` to auto-detect)

For complete configuration options, see the [Configuration Guide](docs/project-info.md#configuration).

<br>

## What You Get

The tool generates comprehensive documentation including:

- **Feature Catalog** - Complete inventory of components, hooks, pages, services
- **Dependency Graph** - Visual relationships between modules
- **Technology Detection** - Automatically identifies frameworks and libraries used
- **Complexity Metrics** - File sizes, line counts, dependency counts
- **Migration Guidance** - Suggestions for improvements and modernization
- **Environment Analysis** - Separates client and server code

**Output formats:**
- 📝 **Markdown** - Beautiful documentation (great for README files)
- 📋 **JSON** - Machine-readable data (perfect for CI/CD and tooling)
- 🌐 **HTML** - Interactive visualization (shareable reports)

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

## GUI vs CLI Comparison

| Feature | Web GUI | CLI |
|---------|---------|-----|
| **Ease of Use** | ⭐⭐⭐⭐⭐ Click and go | ⭐⭐⭐ Command line knowledge needed |
| **Visual Feedback** | ⭐⭐⭐⭐⭐ Real-time progress bar | ⭐⭐⭐ Console output |
| **Setup Time** | ⭐⭐⭐⭐⭐ `npm run gui` and done | ⭐⭐⭐⭐ `rfd --root ./src` |
| **Automation** | ⭐⭐ Manual only | ⭐⭐⭐⭐⭐ Perfect for CI/CD |
| **Scripting** | ❌ Not applicable | ⭐⭐⭐⭐⭐ Full scripting support |
| **Speed** | ⭐⭐⭐⭐⭐ Same engine | ⭐⭐⭐⭐⭐ Same engine |
| **Best For** | Demos, quick tests, beginners | Automation, power users, CI/CD |

**Both use the same analysis engine = identical results!**

<br>

## Links

- 📖 [Complete Documentation](docs/project-info.md) - Comprehensive guide covering installation, usage, configuration, and safety
- 🌐 [GitHub Repository](https://github.com/kunalsuri/react-feature-discovery)
- 🐛 [Issue Tracker](https://github.com/kunalsuri/react-feature-discovery/issues)
- 📝 [Changelog](CHANGELOG.md)
- 🤝 [Contributing Guide](CONTRIBUTING.md)

<br>

## Support

- 🐛 **Bug Reports**: [GitHub Issues](https://github.com/kunalsuri/react-feature-discovery/issues)
- 💡 **Feature Requests**: [GitHub Discussions](https://github.com/kunalsuri/react-feature-discovery/discussions)
- 📖 **Documentation**: [Complete Documentation](docs/project-info.md)
- 🔒 **Security**: For vulnerabilities, please email (don't open public issues)
