/**
 * Scheduler Management and Error Handling
 *
 * Provides utilities for managing scheduled jobs, error handling, and logging
 */

export interface SchedulerJobResult {
  success: boolean;
  message: string;
  data?: unknown;
  error?: string | undefined;
  timestamp: string;
}

export interface SchedulerJobContext {
  jobName: string;
  scheduledTime: string;
  executionTime: string;
}

/**
 * Creates a standardized scheduler job result
 */
export function createJobResult(
  success: boolean,
  message: string,
  data?: unknown,
  error?: string
): SchedulerJobResult {
  return {
    success,
    message,
    data,
    error,
    timestamp: new Date().toISOString(),
  };
}

/**
 * Logs scheduler job execution details
 */
export function logJobExecution(
  jobName: string,
  result: SchedulerJobResult,
  context?: Partial<SchedulerJobContext>
): void {
  const logLevel = result.success ? 'info' : 'error';
  const logMessage = `[SCHEDULER] ${jobName}: ${result.message}`;

  const logData: Record<string, unknown> = {
    jobName,
    success: result.success,
    message: result.message,
    timestamp: result.timestamp,
    ...context,
  };

  if (result.data) {
    logData.data = result.data;
  }

  if (result.error) {
    logData.error = result.error;
  }

  if (logLevel === 'error') {
    console.error(logMessage, logData);
  } else {
    console.log(logMessage, logData);
  }
}

/**
 * Wraps scheduler job execution with error handling and logging
 */
export async function executeSchedulerJob<T>(
  jobName: string,
  jobFunction: () => Promise<T>,
  context?: Partial<SchedulerJobContext>
): Promise<SchedulerJobResult> {
  const startTime = Date.now();

  try {
    console.log(`[SCHEDULER] Starting job: ${jobName}`);

    const result = await jobFunction();
    const executionTime = Date.now() - startTime;

    const jobResult = createJobResult(
      true,
      `Job completed successfully in ${executionTime}ms`,
      result
    );

    logJobExecution(jobName, jobResult, {
      ...context,
      executionTime: `${executionTime}ms`,
    });

    return jobResult;
  } catch (error) {
    const executionTime = Date.now() - startTime;
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const errorStack = error instanceof Error ? error.stack : undefined;

    const jobResult = createJobResult(
      false,
      `Job failed after ${executionTime}ms`,
      undefined,
      errorMessage
    );

    logJobExecution(jobName, jobResult, {
      ...context,
      executionTime: `${executionTime}ms`,
    });

    // Log additional error details for debugging
    if (errorStack) {
      console.error(`[SCHEDULER] ${jobName} stack trace:`, errorStack);
    }

    return jobResult;
  }
}

/**
 * Validates scheduler job configuration
 */
export function validateJobConfiguration(jobConfig: {
  name: string;
  cron: string;
  endpoint: string;
}): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  // Validate job name
  if (!jobConfig.name || typeof jobConfig.name !== 'string') {
    errors.push('Job name is required and must be a string');
  }

  // Validate cron expression (basic validation)
  if (!jobConfig.cron || typeof jobConfig.cron !== 'string') {
    errors.push('Cron expression is required and must be a string');
  } else {
    const cronParts = jobConfig.cron.split(' ');
    if (cronParts.length !== 5) {
      errors.push('Cron expression must have exactly 5 parts (minute hour day month weekday)');
    }
  }

  // Validate endpoint
  if (!jobConfig.endpoint || typeof jobConfig.endpoint !== 'string') {
    errors.push('Endpoint is required and must be a string');
  } else if (!jobConfig.endpoint.startsWith('/')) {
    errors.push('Endpoint must start with "/"');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Parses cron expression for human-readable description
 */
export function describeCronExpression(cron: string): string {
  const parts = cron.split(' ');

  if (parts.length !== 5) {
    return 'Invalid cron expression';
  }

  const [minute, hour, day, , weekday] = parts;

  // Handle common patterns
  if (cron === '0 0 * * *') {
    return 'Daily at midnight (00:00 UTC)';
  }

  if (cron === '0 12 * * *') {
    return 'Daily at noon (12:00 UTC)';
  }

  if (cron === '0 0 * * 0') {
    return 'Weekly on Sunday at midnight (00:00 UTC)';
  }

  if (cron === '0 0 1 * *') {
    return 'Monthly on the 1st at midnight (00:00 UTC)';
  }

  // Generic description
  let description = 'Runs ';

  if (minute === '0' && hour !== '*') {
    description += `at ${hour}:00`;
  } else if (minute !== '*' && hour !== '*') {
    description += `at ${hour}:${minute}`;
  } else {
    description += 'at specified times';
  }

  if (day !== '*') {
    description += ` on day ${day} of the month`;
  } else if (weekday !== '*') {
    const weekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const weekdayName = weekdays[parseInt(weekday ?? '0')] ?? `weekday ${weekday}`;
    description += ` on ${weekdayName}`;
  } else {
    description += ' daily';
  }

  return description + ' (UTC)';
}

/**
 * Creates a health check for scheduler jobs
 */
export interface SchedulerHealthCheck {
  jobName: string;
  lastExecution?: string | undefined;
  nextExecution?: string | undefined;
  status: 'healthy' | 'warning' | 'error';
  message: string;
}

export function createSchedulerHealthCheck(
  jobName: string,
  lastExecution?: Date,
  nextExecution?: Date,
  lastResult?: SchedulerJobResult
): SchedulerHealthCheck {
  let status: 'healthy' | 'warning' | 'error' = 'healthy';
  let message = 'Job is running normally';

  // Check if job has never run
  if (!lastExecution) {
    status = 'warning';
    message = 'Job has never executed';
  }
  // Check if last execution was more than 25 hours ago (for daily jobs)
  else if (Date.now() - lastExecution.getTime() > 25 * 60 * 60 * 1000) {
    status = 'error';
    message = 'Job has not executed in over 25 hours';
  }
  // Check if last execution failed
  else if (lastResult && !lastResult.success) {
    status = 'error';
    message = `Last execution failed: ${lastResult.error}`;
  }

  return {
    jobName,
    lastExecution: lastExecution?.toISOString(),
    nextExecution: nextExecution?.toISOString(),
    status,
    message,
  };
}

/**
 * Utility for testing scheduler jobs manually
 */
export async function testSchedulerJob(
  jobName: string,
  jobFunction: () => Promise<unknown>
): Promise<SchedulerJobResult> {
  console.log(`[SCHEDULER TEST] Testing job: ${jobName}`);

  return await executeSchedulerJob(`${jobName} (TEST)`, jobFunction, {
    jobName: `${jobName} (TEST)`,
    scheduledTime: 'manual',
    executionTime: new Date().toISOString(),
  });
}
