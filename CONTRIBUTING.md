# Contributing to React Feature Discovery

Thank you for your interest in contributing! This document provides guidelines for contributing to the project.

## Code of Conduct

This project adheres to a Code of Conduct. By participating, you are expected to uphold this code.

## How to Contribute

### Reporting Bugs

1. Check if the bug has already been reported in [Issues](https://github.com/kunalsuri/react-feature-discovery/issues)
2. If not, create a new issue with:
   - Clear title and description
   - Steps to reproduce
   - Expected vs actual behavior
   - Your environment (OS, Node version, etc.)
   - Sample code if applicable

### Suggesting Features

1. Check existing feature requests
2. Create a new issue with:
   - Clear description of the feature
   - Use cases and benefits
   - Possible implementation approach

### Pull Requests

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Run tests (`npm test`)
5. Build the project (`npm run build`)
6. Commit your changes (`git commit -m 'Add amazing feature'`)
7. Push to the branch (`git push origin feature/amazing-feature`)
8. Open a Pull Request

### Development Setup

```bash
# Clone the repository
git clone https://github.com/kunalsuri/react-feature-discovery.git
cd react-feature-discovery

# Or use the installation script
./scripts/install.sh  # macOS/Linux
# scripts\install.bat  # Windows

# Install dependencies
npm install

# Build the project
npm run build

# Run in development mode
npm run dev
```

### Code Style

- Use TypeScript
- Follow existing code style
- Add comments for complex logic
- Write descriptive commit messages

### Testing

- Add tests for new features
- Ensure all tests pass before submitting PR
- Aim for high test coverage

## Questions?

Feel free to open an issue for any questions or concerns.

Thank you for contributing!
