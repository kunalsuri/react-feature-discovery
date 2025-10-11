# React Feature Discovery - Complete Guide

> A comprehensive guide covering installation, usage, and safety information.

## Table of Contents

- [Quick Start](#quick-start)
- [Installation](#installation)
- [Usage](#usage)
- [Safety & Security](#safety--security)
- [Troubleshooting](#troubleshooting)
- [Support](#support)

---

## Quick Start

Get started in 3 steps:

### 1. Install

```bash
# Clone and install
git clone https://github.com/kunalsuri/react-feature-discovery.git
cd react-feature-discovery
./scripts/install.sh  # macOS/Linux
# or
scripts\install.bat   # Windows
```

### 2. Run Analysis

```bash
# Navigate to your React project
cd /path/to/your/react/project

# Analyze
rfd
```

### 3. View Results

Open `feature-catalog.md` to see your complete codebase analysis!

---

## Installation

### Prerequisites

- **Node.js** 18.0.0 or higher
- **npm** (comes with Node.js)
- **Git**

### Method 1: Automated (Recommended)

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

### Method 2: Manual

```bash
git clone https://github.com/kunalsuri/react-feature-discovery.git
cd react-feature-discovery
npm install
npm run build
npm link  # Optional: for global 'rfd' command
```

### Method 3: One-Line

```bash
git clone https://github.com/kunalsuri/react-feature-discovery.git && cd react-feature-discovery && npm install && npm run build && npm link
```

### Verify Installation

```bash
rfd --version
rfd --help
```

---

## Usage

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

### Configuration File

Create `.rfdrc.json` in your project:

```json
{
  "rootDir": "./src",
  "outputPath": "docs/features.md",
  "outputFormats": ["markdown", "json"],
  "excludeDirs": ["node_modules", "dist", "build"]
}
```

Then run:
```bash
rfd --config .rfdrc.json
```

### Add to package.json

```json
{
  "scripts": {
    "analyze": "rfd",
    "analyze:full": "rfd --format markdown,json,html"
  }
}
```

### What Gets Analyzed

✅ **Pages** - Route components  
✅ **Components** - React components (function, class, arrow)  
✅ **Hooks** - Custom and built-in React hooks  
✅ **Contexts** - React Context providers  
✅ **Services** - API and service layers  
✅ **Utilities** - Helper functions  
✅ **Types** - TypeScript definitions  
✅ **Server Code** - Backend routes and middleware

### Output Formats

**Markdown** (`.md`) - Human-readable documentation  
**JSON** (`.json`) - Machine-readable for CI/CD  
**HTML** (`.html`) - Interactive visualization

---

## Safety & Security

### 🛡️ 100% Safe - Read-Only Analysis

This tool **ONLY READS** your code and **NEVER MODIFIES** any source files.

### What It Does

✅ Reads and analyzes your codebase  
✅ Generates separate documentation files  
✅ Operates within specified directory only  
✅ Excludes sensitive files automatically

### What It NEVER Does

❌ Modifies source code  
❌ Deletes files  
❌ Executes your code  
❌ Makes network requests  
❌ Collects or transmits data

### Built-in Protection

- **Path Validation**: Prevents path traversal attacks
- **System Protection**: Cannot access system directories
- **Safe Defaults**: Automatically excludes:
  - `node_modules/`
  - `.git/`
  - `.env*` files
  - `package.json`, lock files
  - Binary and media files

### Cross-Platform Support

✅ **Windows** 10, 11, Server 2019+  
✅ **macOS** 10.15 Catalina and later  
✅ **Linux** Ubuntu, Debian, RHEL, Fedora, Arch

### Verification

Run the safety verification script:

```bash
./scripts/verify-safety.sh
```

This checks:
- No dangerous operations
- No code execution
- No network calls
- Read-only file operations
- Safety validator present

### Security Best Practices

1. Review configuration before running
2. Verify output paths
3. Check exclusions for sensitive directories
4. Don't run with elevated privileges
5. Test in isolated environment first

---

## Troubleshooting

### Command Not Found

```bash
# If 'rfd' not found, run directly
node /path/to/react-feature-discovery/dist/cli.js

# Or add to PATH
export PATH="$PATH:$(npm config get prefix)/bin"
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
chmod +x scripts/install.sh
sudo npm link  # If needed
```

**Windows:**
```cmd
# Run Command Prompt as Administrator
npm link
```

### Node Version Issues

```bash
# Check version
node -v  # Should be 18.0.0+

# Update Node.js if needed
# Visit: https://nodejs.org/
```

### No Output Generated

```bash
# Ensure you're in a React project
# Check if source directory exists
rfd --root ./src

# Verify files are TypeScript/JavaScript
ls src/**/*.{ts,tsx,js,jsx}
```

### TypeScript Errors

```bash
# Reinstall TypeScript
npm install -D typescript
npm run build
```

---

## Support

### Documentation

- **Main README**: [README.md](../README.md)
- **Changelog**: [CHANGELOG.md](../CHANGELOG.md)
- **Contributing**: [CONTRIBUTING.md](../CONTRIBUTING.md)

### Get Help

- 🐛 **Report Issues**: [GitHub Issues](https://github.com/kunalsuri/react-feature-discovery/issues)
- 💡 **Feature Requests**: [GitHub Discussions](https://github.com/kunalsuri/react-feature-discovery/discussions)
- 📖 **Documentation**: [GitHub Wiki](https://github.com/kunalsuri/react-feature-discovery/wiki)

### Security Issues

For security vulnerabilities, please email directly (do not open public issues):
- Include: Description, steps to reproduce, potential impact
- We'll respond promptly with a fix

---

## Advanced Usage

### Custom Categories

```json
{
  "customCategories": {
    "custom-component": {
      "pattern": "/my-components/",
      "category": "component",
      "priority": 10
    }
  }
}
```

### Environment Detection

```json
{
  "clientDirs": ["client", "src", "app"],
  "serverDirs": ["server", "api", "backend"]
}
```

### Migration Rules

```json
{
  "customMigrationRules": [
    {
      "pattern": "class.*extends.*Component",
      "message": "Consider migrating to function components",
      "severity": "info"
    }
  ]
}
```

### CI/CD Integration

```yaml
# .github/workflows/analyze.yml
name: Analyze Codebase
on: [push]
jobs:
  analyze:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Setup Node
        uses: actions/setup-node@v2
        with:
          node-version: '20'
      - name: Install RFD
        run: |
          git clone https://github.com/kunalsuri/react-feature-discovery.git
          cd react-feature-discovery
          npm install && npm run build
      - name: Analyze
        run: node react-feature-discovery/dist/cli.js --format json
      - name: Upload Results
        uses: actions/upload-artifact@v2
        with:
          name: feature-catalog
          path: feature-catalog.json
```

---

## Tips & Best Practices

### 1. Regular Analysis

Run analysis regularly to track codebase evolution:
```bash
# Weekly or before major releases
npm run analyze
git add feature-catalog.md
git commit -m "docs: update feature catalog"
```

### 2. Code Reviews

Generate catalogs before and after refactoring to compare changes.

### 3. Onboarding

Share the generated catalog with new team members to help them understand the codebase structure.

### 4. Migration Planning

Use dependency graphs and complexity metrics to plan migrations strategically.

### 5. Documentation

Keep the catalog in version control as living documentation.

---

## FAQ

**Q: Does this modify my code?**  
A: No. It's 100% read-only. Never modifies, deletes, or executes your code.

**Q: Is it safe to run on production code?**  
A: Yes. It only reads files and generates documentation.

**Q: Does it work with JavaScript projects?**  
A: Yes. Supports both TypeScript (.ts, .tsx) and JavaScript (.js, .jsx).

**Q: Can I use it with Next.js/Remix/Vite?**  
A: Yes. Works with any React project structure.

**Q: Does it require internet connection?**  
A: No. Fully offline operation.

**Q: What about private/sensitive code?**  
A: The tool runs locally. No data is collected or transmitted.

**Q: Can I customize the output?**  
A: Yes. Use configuration files to customize analysis and output.

---

**Version**: 0.1.0  
**License**: MIT  
**Last Updated**: October 2025

For the latest updates, visit: [GitHub Repository](https://github.com/kunalsuri/react-feature-discovery)
