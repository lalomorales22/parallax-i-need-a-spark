# Contributing to Parallax Spark

Thank you for your interest in contributing to Parallax Spark! This document provides guidelines and information for contributors.

## Table of Contents
- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Making Changes](#making-changes)
- [Testing](#testing)
- [Submitting Changes](#submitting-changes)
- [Style Guidelines](#style-guidelines)

## Code of Conduct

Be respectful, constructive, and collaborative. We're all here to build something amazing together.

## Getting Started

1. **Fork the Repository**: Click the "Fork" button on GitHub
2. **Clone Your Fork**:
   ```bash
   git clone https://github.com/YOUR_USERNAME/parallax-i-need-a-spark.git
   cd parallax-i-need-a-spark
   ```
3. **Add Upstream Remote**:
   ```bash
   git remote add upstream https://github.com/ORIGINAL_OWNER/parallax-i-need-a-spark.git
   ```

## Development Setup

### Prerequisites
- Node.js v18+
- Python 3.10+
- Git
- PortAudio (for voice features)

### Installation
```bash
# Install Node dependencies
npm install

# Set up Python environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r python_bridge/requirements-voice.txt
pip install -r python_bridge/requirements-phase2.txt

# Run in development mode
npm run dev
```

### Project Structure
```
parallax-i-need-a-spark/
├── electron/           # Electron main process
│   ├── main.ts        # Main entry point
│   ├── preload.ts     # Preload script
│   └── db.ts          # SQLite database operations
├── src/               # React frontend
│   ├── components/    # React components
│   ├── types/         # TypeScript type definitions
│   └── App.tsx        # Main app component
├── python_bridge/     # Python backend scripts
│   ├── host.py        # Parallax host
│   ├── client.py      # Parallax client
│   ├── voice.py       # Voice processing
│   └── network_discovery.py  # mDNS discovery
└── tests/             # Test files
```

## Making Changes

### Branching Strategy
- `main`: Stable, production-ready code
- `develop`: Integration branch for features
- `feature/xxx`: Feature branches
- `fix/xxx`: Bug fix branches

### Creating a Feature Branch
```bash
git checkout develop
git pull upstream develop
git checkout -b feature/your-feature-name
```

### Areas for Contribution

#### 🐛 Bug Fixes
Found a bug? We appreciate bug fixes! Please include:
- Clear description of the bug
- Steps to reproduce
- Expected vs actual behavior
- Your fix with explanation

#### ✨ New Features
Before implementing a major feature:
1. Open an issue to discuss the feature
2. Get feedback from maintainers
3. Ensure it aligns with project goals

#### 📚 Documentation
Documentation improvements are always welcome:
- Fixing typos
- Clarifying instructions
- Adding examples
- Translating to other languages

#### 🎨 UI/UX Improvements
Visual and interaction improvements:
- Better animations
- Improved layouts
- Accessibility enhancements
- New visualization effects

#### ⚡ Performance Optimizations
Make Spark faster and more efficient:
- Reduce CPU/memory usage
- Improve rendering performance
- Optimize database queries
- Better lazy loading

## Testing

### Running Tests
```bash
# Run all tests
npm test

# Run tests in watch mode
npm test -- --watch

# Run tests with coverage
npm test:coverage

# Run tests with UI
npm run test:ui
```

### Writing Tests
- Place tests next to the code they test (e.g., `Component.test.tsx`)
- Follow the existing test patterns
- Aim for >70% code coverage
- Test both happy paths and error cases

### Example Test
```typescript
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import MyComponent from './MyComponent';

describe('MyComponent', () => {
  it('renders correctly', () => {
    render(<MyComponent />);
    expect(screen.getByText('Hello')).toBeDefined();
  });
});
```

## Submitting Changes

### Before Submitting
1. **Test Your Changes**: Run all tests
2. **Lint Your Code**: Ensure code follows style guidelines
3. **Update Documentation**: If you changed functionality
4. **Commit Messages**: Write clear, descriptive commit messages

### Commit Message Format
```
type(scope): Short description

Longer description if needed

Fixes #123
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

**Examples:**
```
feat(visualization): Add new kaleidoscope symmetry mode

Added 8-fold kaleidoscope symmetry option to the settings panel.
Includes new shader calculations and UI controls.

Fixes #45
```

### Pull Request Process

1. **Update Your Branch**:
   ```bash
   git fetch upstream
   git rebase upstream/develop
   ```

2. **Push to Your Fork**:
   ```bash
   git push origin feature/your-feature-name
   ```

3. **Create Pull Request**:
   - Go to GitHub and create a PR from your fork
   - Target the `develop` branch
   - Fill out the PR template completely
   - Link related issues

4. **Code Review**:
   - Respond to feedback promptly
   - Make requested changes
   - Push updates to the same branch

5. **Merge**:
   - Maintainers will merge once approved
   - Your PR will be squash-merged to keep history clean

## Style Guidelines

### TypeScript/JavaScript
- Use TypeScript for all new code
- Follow ESLint configuration
- Use functional components and hooks (React)
- Prefer `const` over `let`
- Use meaningful variable names
- Add comments for complex logic

### Python
- Follow PEP 8 style guide
- Use type hints
- Write docstrings for functions
- Keep functions focused and small

### React Components
- One component per file
- Use functional components with hooks
- PropTypes or TypeScript interfaces for props
- Keep components focused and reusable

### CSS/Styling
- Use inline styles for component-specific styling
- Keep styling consistent with existing design
- Prefer CSS-in-JS for dynamic styles
- Maintain glassmorphism aesthetic

### Example Code Style
```typescript
// Good
interface ButtonProps {
  label: string;
  onClick: () => void;
  disabled?: boolean;
}

const Button: React.FC<ButtonProps> = ({ label, onClick, disabled = false }) => {
  const handleClick = useCallback(() => {
    if (!disabled) {
      onClick();
    }
  }, [disabled, onClick]);

  return (
    <button onClick={handleClick} disabled={disabled}>
      {label}
    </button>
  );
};

export default Button;
```

## Questions?

- Open a Discussion on GitHub
- Comment on relevant issues
- Reach out to maintainers

Thank you for contributing to Parallax Spark! 🚀⚡
