import 'dotenv/config';
import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";

const app = express();
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: false, limit: '10mb' }));

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  const server = await registerRoutes(app);

  // Global error handler - MUST be after all routes
  app.use((err: any, req: Request, res: Response, _next: NextFunction) => {
    console.error('[Global Error Handler] Error caught:', err);
    console.error('[Global Error Handler] Request path:', req.path);
    console.error('[Global Error Handler] Request method:', req.method);
    
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    // Check if response has already been sent to prevent ERR_CONTENT_LENGTH_MISMATCH
    if (res.headersSent) {
      console.error('[Global Error Handler] Headers already sent, cannot send error response');
      return;
    }

    // Send error response
    res.status(status).json({ 
      message,
      error: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
    
    // Log but don't re-throw to prevent server crash
    console.error('[Global Error Handler] Error handled, response sent');
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // ALWAYS serve the app on the port specified in the environment variable PORT
  // Other ports are firewalled. Default to 5000 if not specified.
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = parseInt(process.env.PORT || '5000', 10);
  // Avoid using reusePort which can cause ENOTSUP on some systems
  server.listen(port, "0.0.0.0", () => {
    log(`serving on port ${port}`);
  });
})();
