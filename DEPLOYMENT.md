# Deployment Checklist

## Pre-Deployment Validation

### Code Quality Checks
- [ ] Run `npm run validate` to ensure all checks pass
- [ ] Verify TypeScript compilation with `npm run type-check`
- [ ] Check ESLint rules with `npm run lint`
- [ ] Format code with `npm run prettier`
- [ ] Run tests with `npm run test`

### Build Verification
- [ ] Clean previous builds with `npm run clean`
- [ ] Build client bundle with `npm run build:client`
- [ ] Build server bundle with `npm run build:server`
- [ ] Verify `dist/client/index.html` exists
- [ ] Verify `dist/server/index.cjs` exists

### Configuration Validation
- [ ] Confirm `devvit.json` has required capabilities:
  - [ ] `redis: true` for data persistence
  - [ ] `realtime: true` for live features
  - [ ] `scheduler` configured for daily reset
  - [ ] `menu` items for post creation
  - [ ] `triggers` for app installation
- [ ] Verify splash screen configuration is complete
- [ ] Check that app name matches across `devvit.json` and `package.json`

### Functional Testing
- [ ] Test development environment with `npm run dev`
- [ ] Verify playtest URL works: `https://www.reddit.com/r/spot_the_bot_dev?playtest=spot-the-bot`
- [ ] Test complete game flow (6 rounds)
- [ ] Verify leaderboard functionality
- [ ] Test real-time participant counting
- [ ] Confirm daily reset scheduler works
- [ ] Test share functionality

### Asset Verification
- [ ] Confirm all required images are in `assets/` directory
- [ ] Verify splash screen image (`default-splash.png`) exists
- [ ] Check that all game images are properly categorized
- [ ] Validate image metadata and AI/human classifications

## Deployment Steps

### Local Deployment (Development)
```bash
# 1. Validate everything
npm run validate

# 2. Start development environment
npm run dev

# 3. Test in browser at playtest URL
```

### Production Deployment
```bash
# 1. Final validation
npm run validate

# 2. Clean build
npm run clean && npm run build

# 3. Deploy to Reddit
npm run deploy

# 4. Publish for review (if targeting subreddits >200 members)
npm run launch
```

## Post-Deployment Verification

### Immediate Checks
- [ ] Verify app appears in target subreddit
- [ ] Test "Launch App" button functionality
- [ ] Confirm game loads without errors
- [ ] Test one complete game session

### Monitoring
- [ ] Monitor error logs via Devvit dashboard
- [ ] Check Redis data persistence
- [ ] Verify scheduler job execution
- [ ] Monitor real-time feature performance

## Troubleshooting

### Common Issues
- **Build failures**: Check TypeScript errors and dependencies
- **Redis connection issues**: Verify `redis: true` in devvit.json
- **Scheduler not running**: Check cron syntax and endpoint configuration
- **Real-time features not working**: Confirm `realtime: true` and proper API usage
- **Images not loading**: Verify assets directory and file paths

### Debug Commands
```bash
# Check build output
ls -la dist/client dist/server

# Validate configuration
cat devvit.json | jq .

# Test TypeScript compilation
npx tsc --noEmit

# Check for linting issues
npm run lint
```

## Environment-Specific Notes

### Development Environment
- Uses `r/spot_the_bot_dev` subreddit
- Hot reloading enabled for rapid iteration
- Debug logging available

### Production Environment
- Requires app review for subreddits >200 members
- No hot reloading - full deployment required for changes
- Production logging and monitoring

## Security Considerations

- [ ] Verify no sensitive data in client bundle
- [ ] Confirm server-side validation for all user inputs
- [ ] Check rate limiting implementation
- [ ] Validate anti-cheat measures
- [ ] Ensure proper session management

## Performance Checklist

- [ ] Client bundle size under 4MB
- [ ] Server response times under 30 seconds
- [ ] Redis operations optimized for concurrent users
- [ ] Image loading performance acceptable
- [ ] Real-time features responsive under load
