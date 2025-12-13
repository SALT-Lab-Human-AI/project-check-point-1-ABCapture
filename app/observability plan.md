# ABCapture Observability Plan

## Overview

This document outlines the observability strategy for ABCapture, a behavioral incident recording system for special education teachers. The plan covers logging, monitoring, error tracking, performance metrics, and alerting across all system components.

---

## Goals

1. **Proactive Issue Detection** - Identify problems before users report them
2. **Performance Optimization** - Track and improve system response times
3. **Security Monitoring** - Detect unauthorized access and data breaches
4. **Usage Analytics** - Understand how teachers use the system
5. **Compliance** - Maintain audit logs for special education requirements

---

## Architecture Components to Monitor

```
┌─────────────────┐
│  React Frontend │ → Browser logs, performance, errors
└────────┬────────┘
         │
┌────────┴────────┐
│  Express API    │ → Request logs, error tracking, API metrics
└────────┬────────┘
         │
    ┌────┴────┬──────────┬─────────────┐
    ▼         ▼          ▼             ▼
┌────────┐ ┌──────┐ ┌─────────┐ ┌──────────┐
│ Neon   │ │ Groq │ │ Gmail   │ │ Google   │
│ DB     │ │ AI   │ │ SMTP    │ │ OAuth    │
└────────┘ └──────┘ └─────────┘ └──────────┘
```

---

## 1. Logging Strategy

### Backend Logging (Express Server)

**Current Implementation:**
- Console.log statements scattered in `server/routes.ts`, `server/groq.ts`, `server/storage.ts`
- Session tracking logs
- Groq API request/response logs

**Recommended Improvements:**

#### A. Structured Logging
Replace console.log with structured logger (Winston or Pino):

```typescript
// server/logger.ts
import winston from 'winston';

export const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.json(),
  defaultMeta: { 
    service: 'abcapture-api',
    environment: process.env.NODE_ENV 
  },
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' })
  ]
});
```

**Log Levels:**
- `error` - System failures, API errors, database connection issues
- `warn` - Rate limit warnings, deprecated features, slow queries
- `info` - User actions, API requests, incident creation
- `debug` - Detailed execution flow (development only)
- `trace` - Very verbose (testing only)

#### B. Request/Response Logging

```typescript
// server/middleware/logging.ts
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    logger.info({
      method: req.method,
      path: req.path,
      statusCode: res.statusCode,
      duration: Date.now() - start,
      userId: req.user?.id,
      ip: req.ip
    });
  });
  next();
});
```

#### C. Log Redaction for PII
Automatically redact sensitive data:

```typescript
const redactPII = (data: any) => {
  const redacted = { ...data };
  const sensitiveFields = ['password', 'email', 'studentName', 'guardianEmail'];
  
  sensitiveFields.forEach(field => {
    if (redacted[field]) {
      redacted[field] = '[REDACTED]';
    }
  });
  
  return redacted;
};
```

### Frontend Logging

**Browser Console:**
- User interactions (incident creation, student selection)
- Client-side errors (React errors, API failures)
- Performance metrics (page load, API response times)

**Recommended Tool:** Sentry Browser SDK or LogRocket

```typescript
// client/src/lib/errorTracking.ts
import * as Sentry from '@sentry/react';

Sentry.init({
  dsn: process.env.VITE_SENTRY_DSN,
  environment: process.env.NODE_ENV,
  beforeSend(event) {
    // Scrub PII from error reports
    if (event.user) {
      delete event.user.email;
      delete event.user.username;
    }
    return event;
  }
});
```

---

## 2. Error Tracking

### Backend Error Tracking

**Current State:**
- Try/catch blocks in `groq.ts`, `routes.ts`
- Generic error messages returned to client

**Improvements:**

#### A. Error Classification

```typescript
// server/errors.ts
export class APIError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public code: string,
    public metadata?: any
  ) {
    super(message);
  }
}

export class DatabaseError extends APIError {
  constructor(message: string, metadata?: any) {
    super(500, message, 'DATABASE_ERROR', metadata);
  }
}

export class GroqAPIError extends APIError {
  constructor(message: string, statusCode: number, metadata?: any) {
    super(statusCode, message, 'GROQ_API_ERROR', metadata);
  }
}
```

#### B. Error Handling Middleware

```typescript
// server/middleware/errorHandler.ts
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  if (err instanceof APIError) {
    logger.error({
      error: err.code,
      message: err.message,
      statusCode: err.statusCode,
      metadata: err.metadata,
      path: req.path,
      method: req.method,
      userId: req.user?.id
    });
    
    return res.status(err.statusCode).json({
      error: err.code,
      message: err.message
    });
  }
  
  // Unexpected errors
  logger.error({
    error: 'UNHANDLED_ERROR',
    message: err.message,
    stack: err.stack,
    path: req.path
  });
  
  res.status(500).json({
    error: 'INTERNAL_SERVER_ERROR',
    message: 'An unexpected error occurred'
  });
});
```

### Frontend Error Tracking

**React Error Boundaries:**

```typescript
// client/src/components/ErrorBoundary.tsx
import { Component, ErrorInfo, ReactNode } from 'react';
import * as Sentry from '@sentry/react';

class ErrorBoundary extends Component<
  { children: ReactNode },
  { hasError: boolean }
> {
  state = { hasError: false };
  
  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    Sentry.captureException(error, { extra: errorInfo });
    this.setState({ hasError: true });
  }
  
  render() {
    if (this.state.hasError) {
      return <ErrorFallback />;
    }
    return this.props.children;
  }
}
```

---

## 3. Performance Monitoring

### Metrics to Track

#### API Performance
- **Request duration** (p50, p95, p99)
- **Throughput** (requests per minute)
- **Error rate** (percentage of 4xx/5xx responses)
- **Database query time**
- **External API latency** (Groq, Gmail)

#### Frontend Performance
- **Page load time** (FCP, LCP, TTI)
- **API response time** (from client perspective)
- **Voice recording duration**
- **ABC form generation time**
- **Bundle size and load time**

### Implementation

#### A. API Response Time Tracking

```typescript
// server/middleware/metrics.ts
import promClient from 'prom-client';

const httpRequestDuration = new promClient.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code']
});

app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = (Date.now() - start) / 1000;
    httpRequestDuration.labels(req.method, req.route?.path || req.path, res.statusCode).observe(duration);
  });
  next();
});
```

#### B. Database Query Monitoring

```typescript
// server/db.ts - Add query logging
import { drizzle } from 'drizzle-orm/neon-serverless';

const db = drizzle(pool, {
  logger: {
    logQuery: (query, params) => {
      const start = Date.now();
      // Execute query
      const duration = Date.now() - start;
      
      if (duration > 1000) {
        logger.warn({
          message: 'Slow query detected',
          query,
          duration,
          threshold: 1000
        });
      }
    }
  }
});
```

#### C. Groq AI Performance Tracking

```typescript
// server/groq.ts - Already has timing logs
export async function sendChatMessage(messages: ChatMessage[]): Promise<string> {
  const start = Date.now();
  
  try {
    const completion = await groq.chat.completions.create({ /* ... */ });
    const duration = Date.now() - start;
    
    logger.info({
      event: 'groq_chat_completion',
      duration,
      model: 'llama-3.3-70b-versatile',
      messageCount: messages.length,
      responseLength: completion.choices[0]?.message?.content?.length
    });
    
    return completion.choices[0]?.message?.content;
  } catch (error) {
    logger.error({
      event: 'groq_chat_error',
      duration: Date.now() - start,
      error: error.message
    });
    throw error;
  }
}
```

---

## 4. Health Checks

### Endpoint Implementation

```typescript
// server/routes.ts
app.get('/health', async (req, res) => {
  const health = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    checks: {
      database: await checkDatabaseHealth(),
      groq: await checkGroqHealth(),
      email: await checkEmailHealth()
    }
  };
  
  const allHealthy = Object.values(health.checks).every(check => check.status === 'ok');
  res.status(allHealthy ? 200 : 503).json(health);
});

async function checkDatabaseHealth() {
  try {
    await db.execute(sql`SELECT 1`);
    return { status: 'ok' };
  } catch (error) {
    return { status: 'error', message: error.message };
  }
}

async function checkGroqHealth() {
  try {
    // Simple API key validation check
    if (!process.env.GROQ_API_KEY) {
      return { status: 'error', message: 'API key not configured' };
    }
    return { status: 'ok' };
  } catch (error) {
    return { status: 'error', message: error.message };
  }
}
```

---

## 5. User Activity Tracking

### Events to Track

**Authentication Events:**
- Login success/failure
- Logout
- Session expiration
- OAuth callback success/failure

**Incident Management:**
- Incident created (voice vs chat)
- Incident edited
- Incident deleted
- ABC form generated
- Email sent to guardian

**Student Management:**
- Student added
- Student edited
- Student deleted
- Student detail viewed

**AI Usage:**
- Voice transcription request
- Chat message sent
- ABC extraction triggered
- Groq API errors

### Implementation

```typescript
// server/analytics.ts
export const trackEvent = (event: {
  userId?: string;
  event: string;
  properties?: Record<string, any>;
  timestamp?: Date;
}) => {
  logger.info({
    type: 'analytics_event',
    ...event,
    timestamp: event.timestamp || new Date()
  });
  
  // Optional: Send to analytics service (Mixpanel, Segment, etc.)
};

// Usage in routes
app.post('/api/incidents', async (req, res) => {
  const incident = await createIncident(req.body);
  
  trackEvent({
    userId: req.user.id,
    event: 'incident_created',
    properties: {
      incidentId: incident.id,
      studentId: incident.studentId,
      incidentType: incident.incidentType,
      method: req.body.source || 'manual' // 'voice' | 'chat' | 'manual'
    }
  });
  
  res.json(incident);
});
```

---

### Database Storage for Observability Events

Storing a trimmed, privacy-safe subset of telemetry in Postgres makes it queryable for audits and longitudinal analytics while still streaming full logs to aggregators.

**Recommended Table:**

```sql
CREATE TABLE observability_events (
  id                serial PRIMARY KEY,
  event_type        text NOT NULL,
  severity          text CHECK (severity IN ('debug','info','warn','error')),
  user_id           uuid,
  resource_type     text,
  resource_id       text,
  request_id        uuid,
  metadata          jsonb DEFAULT '{}'::jsonb,
  occurred_at       timestamptz DEFAULT now()
);
```

**Insertion Helper:**

```typescript
// server/observability/store.ts
export async function recordObservabilityEvent(event: ObservabilityEvent) {
  const sanitized = sanitizeMetadata(event.metadata);
  await db.insert(observabilityEvents).values({
    ...event,
    metadata: sanitized,
    occurredAt: new Date()
  });
}
```

Use this helper alongside `trackEvent`, `logAuditEvent`, and security alerts for high-value actions (e.g., signed report edits, repeated login failures). Keep metadata lean—store identifiers or hashes instead of full payloads to avoid PII leakage.

## 6. Security Monitoring

### Events to Monitor

**Authentication Security:**
- Failed login attempts (track IP, count)
- Suspicious login patterns (unusual time, location)
- Account lockouts
- Password reset requests

**Data Access:**
- Unauthorized access attempts
- Bulk data exports
- Cross-user data access attempts
- API rate limit violations

**System Security:**
- SQL injection attempts
- XSS attempts
- CSRF token failures
- Session hijacking attempts

### Implementation

```typescript
// server/security/monitoring.ts
export const securityLogger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'logs/security.log' })
  ]
});

// Failed login tracking
const failedLogins = new Map<string, number>();

app.post('/api/auth/login', async (req, res) => {
  const { username, password } = req.body;
  const ip = req.ip;
  
  const user = await authenticateUser(username, password);
  
  if (!user) {
    const attempts = failedLogins.get(ip) || 0;
    failedLogins.set(ip, attempts + 1);
    
    securityLogger.warn({
      event: 'failed_login',
      username,
      ip,
      attempts: attempts + 1,
      timestamp: new Date()
    });
    
    if (attempts >= 5) {
      securityLogger.error({
        event: 'brute_force_attempt',
        ip,
        attempts: attempts + 1
      });
      // Implement rate limiting or IP blocking
    }
    
    return res.status(401).json({ error: 'Invalid credentials' });
  }
  
  failedLogins.delete(ip);
  res.json({ user });
});
```

---

## 7. Alerting Strategy

### Critical Alerts (Immediate Action)

**Trigger: System Down**
- Health check fails 3 times in a row
- Database connection lost
- Server crash/restart

**Trigger: Security Breach**
- 10+ failed login attempts from same IP
- Unauthorized data access detected
- API key compromised

**Trigger: Data Loss**
- Database write failures
- Incident creation failures
- Email delivery failures

### Warning Alerts (Monitor)

**Trigger: Performance Degradation**
- API response time > 3 seconds (p95)
- Database query time > 2 seconds
- Groq API rate limit approaching (>80% usage)

**Trigger: High Error Rate**
- Error rate > 5% over 5 minutes
- Groq API errors > 10 in 5 minutes
- Email delivery failures > 3 in 10 minutes

### Informational Alerts

**Daily Summary:**
- Total incidents created
- Active users
- API usage stats
- Groq API quota usage
- Email sent count

### Implementation Tools

**Recommended:**
- **Sentry** - Error tracking and alerting
- **Better Stack (Logtail)** - Log aggregation
- **Uptime Robot** - Uptime monitoring (free tier)
- **Prometheus + Grafana** - Metrics dashboards

**Simple Implementation (Email Alerts):**

```typescript
// server/alerts.ts
import nodemailer from 'nodemailer';

const alertMailer = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.ALERT_EMAIL_USER,
    pass: process.env.ALERT_EMAIL_PASSWORD
  }
});

export const sendAlert = async (alert: {
  severity: 'critical' | 'warning' | 'info';
  title: string;
  message: string;
  metadata?: any;
}) => {
  if (alert.severity === 'critical') {
    await alertMailer.sendMail({
      from: process.env.ALERT_EMAIL_USER,
      to: process.env.ADMIN_EMAIL,
      subject: `[CRITICAL] ${alert.title}`,
      html: `
        <h2>${alert.title}</h2>
        <p>${alert.message}</p>
        <pre>${JSON.stringify(alert.metadata, null, 2)}</pre>
      `
    });
  }
  
  logger.error({
    type: 'alert',
    ...alert
  });
};
```

---

## 8. Compliance & Audit Logs

### FERPA Compliance Requirements

For special education data, maintain audit logs of:
- Who accessed student records (userId, timestamp)
- What data was viewed/modified
- When the access occurred
- Why (purpose of access - if applicable)

### Implementation

```typescript
// server/audit.ts
export const auditLogger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ 
      filename: 'logs/audit.log',
      maxsize: 10485760, // 10MB
      maxFiles: 10,
      tailable: true
    })
  ]
});

export const logAuditEvent = (event: {
  userId: string;
  action: string;
  resource: string;
  resourceId: string;
  details?: any;
}) => {
  auditLogger.info({
    ...event,
    timestamp: new Date().toISOString(),
    ip: event.ip
  });
};

// Usage
app.get('/api/students/:id', async (req, res) => {
  const student = await getStudent(req.params.id);
  
  logAuditEvent({
    userId: req.user.id,
    action: 'VIEW_STUDENT',
    resource: 'student',
    resourceId: req.params.id,
    ip: req.ip
  });
  
  res.json(student);
});
```

---

## 9. Dashboard & Visualization

### Key Metrics Dashboard

**Real-Time Metrics:**
- Current active users
- Requests per minute
- Error rate
- API response time (p50, p95, p99)
- Groq API quota usage

**Daily Metrics:**
- Total incidents created
- Voice vs chat vs manual incidents
- Active teachers
- Students with incidents
- Emails sent

**Weekly/Monthly Trends:**
- Incident trends by type
- Most common behavior functions
- Peak usage times
- Teacher engagement

### Implementation Options

**Option 1: Grafana Dashboard** (Recommended for production)
- Connects to Prometheus metrics
- Pre-built dashboards
- Alerting integration

**Option 2: Custom Admin Dashboard** (Built into app)
- React page at `/admin/analytics`
- Queries database for metrics
- Charts using Recharts library

---

## 10. Implementation Roadmap

### Phase 1: Foundation (Week 1-2)
- [ ] Implement structured logging (Winston)
- [ ] Add request/response logging middleware
- [ ] Set up error tracking (Sentry)
- [ ] Create health check endpoint
- [ ] Implement basic metrics collection

### Phase 2: Monitoring (Week 3-4)
- [ ] Set up performance monitoring
- [ ] Add database query logging
- [ ] Implement user activity tracking
- [ ] Create audit logging system
- [ ] Set up log rotation

### Phase 3: Alerting (Week 5-6)
- [ ] Configure critical alerts
- [ ] Set up uptime monitoring
- [ ] Implement rate limit tracking
- [ ] Create daily summary reports
- [ ] Test alert delivery

### Phase 4: Visualization (Week 7-8)
- [ ] Build metrics dashboard
- [ ] Create usage analytics page
- [ ] Set up Grafana (optional)
- [ ] Document observability procedures
- [ ] Train team on monitoring

---

## 11. Test Case Debugging & Telemetry

### Goals
- Reproduce production-grade telemetry locally when tests fail.
- Validate that logging, metrics, and alerts fire as expected during automated runs.

### Test Logging Conventions
- Enable verbose logging with `LOG_LEVEL=debug` (or `TRACE_LOGGING=true`) when running `pnpm test` to surface structured logs inside Jest/Vitest output.
- Inject a dedicated Winston/Pino transport in test setup that writes to `tmp/test-logs/<testRunId>.json` and tags each entry with `{ testRunId, suite, testName }` for quick triage.
- Generate a UUID `TEST_RUN_ID` at the start of each suite (e.g., via `beforeAll`) and forward it via request headers/context so server logs and client mocks share the same correlation id.

### Capturing Telemetry in Tests
- For integration/API tests, wrap the Express app with supertest and assert that `recordObservabilityEvent` is invoked using spies/mocks so critical events (incident creation, edit history writes) persist to the database.
- Use dependency injection or environment toggles (`ENABLE_METRICS=false`) to swap Prometheus collectors with in-memory mocks, allowing assertions against histogram increments without hitting the real registry.
- When testing Groq fallbacks, seed mock responses that trigger error paths and verify alert helpers (`sendAlert`, security logger) capture expected metadata.

### Debug Workflow
1. Re-run the failing test with `LOG_LEVEL=debug TEST_RUN_ID=$(uuidgen)`.
2. Inspect `tmp/test-logs/<TEST_RUN_ID>.json` plus the observability database table for correlated rows.
3. Use captured `request_id` / `testRunId` to replay or filter metrics in dashboards.
4. After triage, prune test log directories as part of CI cleanup to keep artifacts small.

Document this workflow in the project README so contributors know how to gather telemetry evidence when tests fail on CI.

## Environment Variables

Add these to `.env`:

```bash
# Logging
LOG_LEVEL=info                    # debug | info | warn | error
LOG_FILE_PATH=/var/log/abcapture  # Log directory

# Error Tracking
SENTRY_DSN=https://...            # Sentry project DSN
VITE_SENTRY_DSN=https://...       # Frontend Sentry DSN

# Alerting
ALERT_EMAIL_USER=alerts@abcapture.com
ALERT_EMAIL_PASSWORD=app_password
ADMIN_EMAIL=admin@example.com

# Monitoring
ENABLE_METRICS=true               # Enable Prometheus metrics
METRICS_PORT=9090                 # Metrics endpoint port
```

---

## Best Practices

1. **Never Log Sensitive Data** - Redact PII, passwords, API keys
2. **Use Structured Logging** - JSON format for easy parsing
3. **Log Context** - Include userId, requestId, timestamps
4. **Monitor Third-Party APIs** - Track Groq, Gmail, OAuth performance
5. **Set Up Alerts Early** - Don't wait for incidents to happen
6. **Review Logs Regularly** - Weekly log reviews catch patterns
7. **Retain Logs Appropriately** - Balance storage vs compliance needs
8. **Test Alerts** - Verify alerting works before production
9. **Document Runbooks** - What to do when alerts fire
10. **Privacy First** - Minimize data collection, maximize security

---

## Related Documentation

- **Implementation:** `app/server/routes.ts`, `app/server/groq.ts`
- **Error Handling:** `app/server/index.ts`
- **Security:** `docs/safety-privacy.md`
- **Setup:** `setup-instructions/INSTALL.md`
