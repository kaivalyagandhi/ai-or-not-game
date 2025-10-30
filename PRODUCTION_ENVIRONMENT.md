# Production Environment Configuration Guide

## Overview

This guide provides comprehensive instructions for configuring the AI or Not? game for production deployment on Reddit's Devvit platform. The application automatically detects production mode through environment variables and adjusts its behavior accordingly.

## Required Environment Variables

### Core Production Variables

#### `NODE_ENV` (Required)
- **Value**: `production`
- **Purpose**: Enables production mode with enforced play limits and optimized settings
- **Impact**: 
  - Limits daily play attempts to 2 per user
  - Disables development-specific features
  - Optimizes logging and performance

```bash
NODE_ENV=production
```

#### `DEVVIT_SUBREDDIT` (Optional)
- **Value**: `r/your_subreddit_name`
- **Purpose**: Specifies the target subreddit for deployment
- **Default**: Uses Devvit's automatic subreddit assignment
- **Example**: `DEVVIT_SUBREDDIT=r/AIorNot`

```bash
DEVVIT_SUBREDDIT=r/your_production_subreddit
```

## Production Configuration Examples

### Basic Production Configuration

Create a `.env.production` file for production deployment:

```bash
# Production Environment Configuration
NODE_ENV=production
DEVVIT_SUBREDDIT=r/your_subreddit
```

### Development vs Production Comparison

| Feature | Development | Production |
|---------|-------------|------------|
| Daily Play Limit | 999 (unlimited) | 2 attempts |
| Environment Detection | `NODE_ENV !== 'production'` | `NODE_ENV === 'production'` |
| Logging Level | Verbose | Optimized |
| Error Handling | Development-friendly | User-friendly |

## Security Best Practices

### Environment Variable Security

1. **Never commit production environment files**
   ```bash
   # Add to .gitignore
   .env.production
   .env.local
   ```

2. **Use secure deployment methods**
   - Set environment variables through Devvit CLI or platform interface
   - Avoid hardcoding sensitive values in source code

3. **Validate environment configuration**
   - The application automatically validates `NODE_ENV` values
   - Invalid configurations default to development mode with warnings

### Production Deployment Security

1. **Subreddit Configuration**
   - Ensure target subreddit has appropriate moderation
   - Configure proper user permissions and access controls
   - Review subreddit rules and community guidelines

2. **Rate Limiting**
   - Production mode automatically enforces 2 daily attempts per user
   - Redis-based session management prevents abuse
   - Automatic daily reset at midnight UTC

3. **Data Protection**
   - User data stored in Redis with automatic expiration
   - No persistent storage of sensitive user information
   - GDPR-compliant data handling practices

## Deployment Process

### Step 1: Environment Setup

1. **Set production environment variable**:
   ```bash
   export NODE_ENV=production
   ```

2. **Configure target subreddit** (optional):
   ```bash
   export DEVVIT_SUBREDDIT=r/your_subreddit
   ```

### Step 2: Build and Deploy

1. **Build production assets**:
   ```bash
   npm run build
   ```

2. **Deploy to Reddit**:
   ```bash
   npm run deploy
   ```

3. **Publish for review** (if required):
   ```bash
   npm run launch
   ```

### Step 3: Verification

1. **Verify production mode activation**:
   - Check application logs for production mode confirmation
   - Test play limit enforcement (should be 2 attempts per day)
   - Verify optimized performance and logging

2. **Test core functionality**:
   - Game loading and initialization
   - User authentication and session management
   - Play limit enforcement and reset behavior
   - Leaderboard and scoring systems

## Configuration Validation

### Automatic Environment Detection

The application includes built-in environment detection:

```typescript
function isDevelopmentMode(): boolean {
  return process.env.NODE_ENV !== 'production';
}

function getMaxAttempts(): number {
  return isDevelopmentMode() ? 999 : 2;
}
```

### Configuration Health Checks

The application performs automatic validation:

1. **Environment Variable Validation**
   - Checks for valid `NODE_ENV` values
   - Validates subreddit format if provided
   - Logs configuration status on startup

2. **Runtime Configuration Checks**
   - Verifies Redis connectivity
   - Validates user session management
   - Confirms play limit enforcement

## Troubleshooting Production Issues

### Common Configuration Problems

1. **Play limits not enforcing**
   - **Cause**: `NODE_ENV` not set to `production`
   - **Solution**: Verify environment variable configuration
   - **Check**: Application logs should show "Production mode activated"

2. **Deployment failures**
   - **Cause**: Missing build artifacts or invalid configuration
   - **Solution**: Run `npm run build` before deployment
   - **Check**: Verify `dist/` directory contains built assets

3. **Subreddit access issues**
   - **Cause**: Incorrect subreddit name or permissions
   - **Solution**: Verify subreddit exists and app has proper permissions
   - **Check**: Test with Devvit playtest environment first

### Performance Monitoring

1. **Key Metrics to Monitor**
   - Daily active users and play attempts
   - Play limit enforcement effectiveness
   - Redis performance and memory usage
   - Application response times

2. **Logging and Diagnostics**
   - Production mode logs optimized for performance
   - Error tracking for user-facing issues
   - Redis operation monitoring
   - User session analytics

## Environment-Specific Features

### Production Mode Features

1. **Play Limit Enforcement**
   - Strict 2-attempt daily limit per user
   - Automatic reset at midnight UTC
   - Redis-based session tracking

2. **Performance Optimizations**
   - Optimized logging levels
   - Efficient error handling
   - Streamlined user experience

3. **Security Enhancements**
   - Production-grade error messages
   - Secure session management
   - Rate limiting and abuse prevention

### Development Mode Features

1. **Testing Capabilities**
   - Unlimited play attempts (999 per day)
   - Verbose logging and debugging
   - Development-friendly error messages

2. **Development Tools**
   - Hot reloading support
   - Detailed error stack traces
   - Debug mode indicators

## Support and Maintenance

### Regular Maintenance Tasks

1. **Environment Configuration Review**
   - Quarterly review of production settings
   - Validation of security configurations
   - Performance optimization updates

2. **Monitoring and Alerts**
   - Set up monitoring for production metrics
   - Configure alerts for configuration issues
   - Regular health checks and validation

### Getting Help

1. **Configuration Issues**
   - Check application logs for detailed error messages
   - Verify environment variable settings
   - Test in development mode first

2. **Deployment Problems**
   - Review Devvit platform documentation
   - Check Reddit developer community resources
   - Validate build and deployment processes

---

**Note**: This configuration guide is specific to the AI or Not? game's production deployment requirements. Always test configuration changes in a development environment before applying to production.

## Environment Validation and Fallback Mechanisms

### Automatic Environment Detection

The AI or Not? application includes robust environment detection and fallback mechanisms to ensure reliable operation across different deployment scenarios.

#### Environment Detection Logic

```typescript
// Primary environment detection
function isDevelopmentMode(): boolean {
  return process.env.NODE_ENV !== 'production';
}

// Configuration resolution with fallbacks
function getEnvironmentConfig() {
  return {
    nodeEnv: process.env.NODE_ENV || 'development',
    maxAttempts: isDevelopmentMode() ? 999 : 2,
    subreddit: process.env.DEVVIT_SUBREDDIT || null
  };
}
```

#### Detection Behavior Matrix

| NODE_ENV Value | Detected Mode | Max Attempts | Logging Level | Fallback Applied |
|----------------|---------------|--------------|---------------|------------------|
| `production` | Production | 2 | Optimized | No |
| `development` | Development | 999 | Verbose | No |
| `test` | Development | 999 | Minimal | Yes |
| `undefined` | Development | 999 | Verbose | Yes |
| `staging` | Development | 999 | Verbose | Yes |
| Invalid value | Development | 999 | Verbose | Yes |

### Fallback Mechanisms

#### 1. Environment Variable Fallbacks

**NODE_ENV Fallback**
- **Default**: `development` mode when `NODE_ENV` is undefined or invalid
- **Behavior**: Application logs warning and continues with development settings
- **Impact**: Unlimited play attempts, verbose logging enabled

```typescript
// Fallback implementation
const nodeEnv = process.env.NODE_ENV || 'development';
if (nodeEnv !== 'production' && nodeEnv !== 'development') {
  console.warn(`Unknown NODE_ENV: ${nodeEnv}, defaulting to development mode`);
}
```

**DEVVIT_SUBREDDIT Fallback**
- **Default**: Uses Devvit platform's automatic subreddit assignment
- **Behavior**: Application continues without explicit subreddit configuration
- **Impact**: Deployment uses default Devvit subreddit naming

#### 2. Configuration Error Handling

**Redis Connection Fallbacks**
```typescript
// Play limit fallback when Redis is unavailable
export async function canUserPlay(userId: string): Promise<PlayResult> {
  try {
    // Normal Redis-based play limit check
    const playLimit = await initializeUserPlayLimit(userId);
    return checkPlayLimit(playLimit);
  } catch (error) {
    console.error('Redis error, using fallback:', error);
    
    // Fallback behavior based on environment
    const fallbackMaxAttempts = getMaxAttempts();
    return {
      canPlay: isDevelopmentMode(), // Allow in dev, deny in prod
      remainingAttempts: isDevelopmentMode() ? fallbackMaxAttempts : 0,
      maxAttempts: fallbackMaxAttempts,
      reason: isDevelopmentMode() ? undefined : 'Service temporarily unavailable'
    };
  }
}
```

**Data Validation Fallbacks**
```typescript
// Corrupted data recovery
export async function getUserPlayLimit(userId: string): Promise<UserPlayLimit | null> {
  try {
    const data = await redis.get(playLimitKey);
    const parsed = JSON.parse(data);
    
    // Validate data structure
    if (!validatePlayLimitData(parsed)) {
      console.warn(`Invalid play limit data for ${userId}, reinitializing`);
      return await initializeUserPlayLimit(userId); // Fallback to fresh data
    }
    
    return parsed;
  } catch (error) {
    console.error('Data retrieval error:', error);
    return null; // Triggers reinitialization
  }
}
```

### Configuration Validation

#### Startup Validation Checks

The application performs comprehensive validation during startup:

1. **Environment Variable Validation**
   ```typescript
   function validateEnvironment(): ValidationResult {
     const issues: string[] = [];
     
     // Check NODE_ENV
     const nodeEnv = process.env.NODE_ENV;
     if (nodeEnv && !['production', 'development', 'test'].includes(nodeEnv)) {
       issues.push(`Unknown NODE_ENV: ${nodeEnv}`);
     }
     
     // Check subreddit format
     const subreddit = process.env.DEVVIT_SUBREDDIT;
     if (subreddit && !subreddit.match(/^r\/[a-zA-Z0-9_]+$/)) {
       issues.push(`Invalid subreddit format: ${subreddit}`);
     }
     
     return {
       isValid: issues.length === 0,
       issues,
       warnings: issues.length > 0 ? ['Using fallback configurations'] : []
     };
   }
   ```

2. **Runtime Configuration Health Checks**
   ```typescript
   async function performHealthCheck(): Promise<HealthStatus> {
     const checks = {
       redis: await testRedisConnection(),
       environment: validateEnvironment(),
       playLimits: await testPlayLimitSystem()
     };
     
     return {
       healthy: Object.values(checks).every(check => check.status === 'ok'),
       checks,
       timestamp: new Date().toISOString()
     };
   }
   ```

#### Validation Error Handling

**Configuration Warnings**
- Non-critical issues logged as warnings
- Application continues with fallback values
- User experience remains unaffected

**Critical Configuration Errors**
- Redis connectivity failures
- Invalid user authentication
- Corrupted session data

### Debugging Environment Issues

#### Common Environment Problems

1. **Play Limits Not Working**
   ```bash
   # Check current environment
   echo $NODE_ENV
   
   # Expected output for production:
   # production
   
   # If undefined or incorrect:
   export NODE_ENV=production
   ```

2. **Development Mode in Production**
   ```bash
   # Symptoms: Unlimited play attempts in production
   # Check: Application logs should show
   # "Production mode activated" or "Development mode detected"
   
   # Fix: Ensure NODE_ENV is set correctly
   export NODE_ENV=production
   npm run deploy
   ```

3. **Subreddit Configuration Issues**
   ```bash
   # Check subreddit configuration
   echo $DEVVIT_SUBREDDIT
   
   # Valid format: r/subreddit_name
   # Invalid: subreddit_name, /r/subreddit_name, r/subreddit-name
   
   # Fix invalid format:
   export DEVVIT_SUBREDDIT=r/valid_subreddit_name
   ```

#### Debugging Commands

**Environment Inspection**
```bash
# Check all environment variables
env | grep -E "(NODE_ENV|DEVVIT_)"

# Test environment detection
node -e "console.log('Environment:', process.env.NODE_ENV || 'undefined')"
```

**Application Diagnostics**
```bash
# Build with environment check
NODE_ENV=production npm run build

# Deploy with verbose logging
DEBUG=* npm run deploy

# Test production configuration
NODE_ENV=production npm run dev
```

#### Log Analysis

**Production Mode Confirmation**
```
[INFO] Environment: production
[INFO] Play limits: 2 attempts per day
[INFO] Redis connection: established
[INFO] Production mode activated
```

**Development Mode Indicators**
```
[INFO] Environment: development
[INFO] Play limits: 999 attempts per day (unlimited)
[INFO] Development mode detected
[WARN] Using development configuration
```

**Fallback Activation Logs**
```
[WARN] NODE_ENV undefined, defaulting to development mode
[WARN] Redis connection failed, using fallback behavior
[ERROR] Invalid play limit data, reinitializing user session
```

### Environment-Specific Troubleshooting

#### Production Environment Issues

1. **Play Limit Enforcement Problems**
   - **Symptom**: Users can play more than 2 times per day
   - **Diagnosis**: Check if `NODE_ENV=production` is set
   - **Solution**: Verify environment variable and redeploy

2. **Performance Issues**
   - **Symptom**: Slow response times or high resource usage
   - **Diagnosis**: Check logging levels and Redis performance
   - **Solution**: Ensure production optimizations are active

3. **User Session Problems**
   - **Symptom**: Users losing progress or session data
   - **Diagnosis**: Redis connectivity or data corruption
   - **Solution**: Check Redis health and data validation

#### Development Environment Issues

1. **Unlimited Play Not Working**
   - **Symptom**: Play limits enforced in development
   - **Diagnosis**: `NODE_ENV` incorrectly set to `production`
   - **Solution**: Unset or change `NODE_ENV` to `development`

2. **Missing Debug Information**
   - **Symptom**: Limited logging in development
   - **Diagnosis**: Production logging mode active
   - **Solution**: Verify development environment configuration

### Monitoring and Alerting

#### Key Metrics to Monitor

1. **Environment Configuration**
   - Current environment mode (production/development)
   - Play limit enforcement rate
   - Fallback activation frequency

2. **System Health**
   - Redis connection status
   - Configuration validation results
   - Error rate and types

3. **User Experience**
   - Play attempt success rate
   - Session persistence
   - Error message frequency

#### Automated Health Checks

```typescript
// Periodic environment validation
setInterval(async () => {
  const health = await performHealthCheck();
  if (!health.healthy) {
    console.error('Environment health check failed:', health.checks);
    // Trigger alerts or corrective actions
  }
}, 300000); // Check every 5 minutes
```

### Best Practices for Environment Management

#### Development Best Practices

1. **Local Development Setup**
   ```bash
   # Create local environment file
   cp .env.template .env.local
   
   # Set development-specific variables
   echo "NODE_ENV=development" >> .env.local
   echo "DEVVIT_SUBREDDIT=r/test_subreddit" >> .env.local
   ```

2. **Testing Environment Transitions**
   ```bash
   # Test production mode locally
   NODE_ENV=production npm run dev
   
   # Verify play limits work correctly
   # Check logs for production mode activation
   ```

#### Production Best Practices

1. **Deployment Validation**
   ```bash
   # Pre-deployment checks
   npm run validate
   
   # Deploy with environment verification
   NODE_ENV=production npm run deploy
   
   # Post-deployment verification
   # Check application logs for production mode confirmation
   ```

2. **Configuration Management**
   - Use infrastructure-as-code for environment variables
   - Implement configuration validation in CI/CD pipeline
   - Monitor environment drift and configuration changes

---

**Important**: Always test environment configuration changes in a development environment before applying to production. The fallback mechanisms are designed to maintain application stability, but proper configuration is essential for optimal performance and security.
