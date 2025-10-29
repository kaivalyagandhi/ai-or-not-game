# Development Workflow Guide

## Getting Started

### Prerequisites
- Node.js 22.2.0 or higher
- npm (comes with Node.js)
- Devvit CLI installed globally: `npm install -g devvit`

### Initial Setup
```bash
# Install dependencies
npm install

# Login to Devvit (first time only)
npm run login

# Build the project
npm run build
```

## Development Commands

### Primary Development Workflow
```bash
# Start development environment (recommended)
npm run dev
```
This command runs three processes concurrently:
- Client build watcher (`npm run dev:client`)
- Server build watcher (`npm run dev:server`) 
- Devvit playtest server (`npm run dev:devvit`)

### Individual Development Commands
```bash
# Build client only (with watch mode)
npm run dev:client

# Build server only (with watch mode)
npm run dev:server

# Run Devvit playtest only
npm run dev:devvit

# Run Vite dev server (for client-only development)
npm run dev:vite
```

### Build Commands
```bash
# Build everything
npm run build

# Build client bundle only
npm run build:client

# Build server bundle only
npm run build:server

# Clean build artifacts
npm run clean
```

### Code Quality Commands
```bash
# Run all quality checks
npm run check

# Type checking
npm run type-check

# Linting
npm run lint
npm run lint:fix

# Code formatting
npm run prettier

# Validation (type-check + lint + build)
npm run validate
```

### Testing Commands
```bash
# Run tests once
npm run test

# Run tests in watch mode
npm run test:watch
```

## Development Environment

### Testing Your App
1. Run `npm run dev`
2. Open the playtest URL: `https://www.reddit.com/r/ai_or_not_dev?playtest=ai-or-not`
3. Click "Launch App" to test your game

### File Structure
```
src/
├── client/          # React frontend code
│   ├── components/  # React components
│   ├── hooks/       # Custom React hooks
│   ├── utils/       # Client utilities
│   └── main.tsx     # Client entry point
├── server/          # Express backend code
│   ├── core/        # Business logic
│   ├── middleware/  # Express middleware
│   ├── utils/       # Server utilities
│   └── index.ts     # Server entry point
└── shared/          # Shared types and utilities
    └── types/       # TypeScript type definitions
```

### Hot Reloading
- Client changes automatically rebuild and refresh
- Server changes automatically rebuild and restart
- Devvit playtest automatically picks up new builds

## Debugging

### Client Debugging
- Use browser developer tools
- Console logs appear in browser console
- React DevTools extension recommended

### Server Debugging
- Server logs appear in terminal running `npm run dev`
- Add `console.log()` statements for debugging
- Check Devvit dashboard for production logs

### Common Issues

#### Build Failures
```bash
# Check TypeScript errors
npm run type-check

# Check linting issues
npm run lint

# Clean and rebuild
npm run clean && npm run build
```

#### Devvit Connection Issues
```bash
# Re-login to Devvit
npm run login

# Check Devvit status
devvit --version
```

#### Redis Issues
- Ensure `redis: true` in devvit.json
- Check Redis operations in server code
- Verify data persistence in playtest environment

## Code Style Guidelines

### TypeScript
- Use strict TypeScript configuration
- Define interfaces in `src/shared/types/`
- Prefer type safety over `any`

### React Components
- Use functional components with hooks
- Keep components focused and reusable
- Use TypeScript for prop definitions

### Server Code
- All API endpoints must start with `/api/`
- Use Express middleware for common functionality
- Implement proper error handling

### Naming Conventions
- Files: kebab-case (`game-logic.ts`)
- Components: PascalCase (`GameRound.tsx`)
- Functions/variables: camelCase (`calculateScore`)
- Constants: UPPER_SNAKE_CASE (`MAX_ROUNDS`)

## Git Workflow

### Branch Strategy
- `main`: Production-ready code
- `develop`: Integration branch for features
- `feature/*`: Individual feature branches

### Commit Guidelines
- Use conventional commits format
- Include relevant tests with features
- Keep commits focused and atomic

### Pre-commit Checklist
- [ ] Run `npm run validate`
- [ ] Test in development environment
- [ ] Update documentation if needed
- [ ] Verify no sensitive data committed

## Deployment Workflow

### Development Deployment
```bash
# Test locally first
npm run dev

# Deploy to development environment
npm run deploy
```

### Production Deployment
```bash
# Final validation
npm run validate

# Deploy and publish
npm run launch
```

See `DEPLOYMENT.md` for detailed deployment checklist.

## Performance Considerations

### Client Performance
- Keep bundle size minimal
- Optimize image loading
- Use React best practices (memo, useMemo, useCallback)

### Server Performance
- Optimize Redis operations
- Implement proper caching
- Handle concurrent users efficiently

### Real-time Features
- Use Devvit Realtime API efficiently
- Minimize message frequency
- Handle connection failures gracefully

## Security Best Practices

### Client Security
- Never expose sensitive data in client code
- Validate all user inputs
- Use HTTPS for all requests

### Server Security
- Implement rate limiting
- Validate all API inputs server-side
- Use proper authentication middleware

### Data Security
- Encrypt sensitive data in Redis
- Implement proper session management
- Follow Reddit's data handling guidelines
