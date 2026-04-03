#!/usr/bin/env node

/**
 * Web GUI server for React Feature Discovery tool
 *
 * Security & correctness fixes applied:
 *   H1: Path traversal fix in /api/result/
 *   H3: Request body size limit (5 MB)
 *   H5: CORS restricted to localhost only
 *   M3: Job IDs use crypto.randomUUID(); job eviction TTL = 30 min
 *   L2: Browser launch uses execFile() instead of exec()
 *   L5: Server-Sent Events endpoint for real-time job progress
 *   L7: Handlers extracted into named functions; route table replaces if/else chain
 */

import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execFile } from 'child_process';
import { randomUUID } from 'crypto';
import { ConfigLoader, ConfigValidator, ConfigMerger, defaultConfig } from './config/index.js';
import { AnalysisEngine } from './core/AnalysisEngine.js';
import { FeatureDiff } from './core/FeatureDiff.js';
import { SafetyValidator } from './utils/SafetyValidator.js';
import { DiffMarkdownGenerator } from './generators/DiffMarkdownGenerator.js';
import { DiffJSONGenerator } from './generators/DiffJSONGenerator.js';
import { DiffHTMLGenerator } from './generators/DiffHTMLGenerator.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ── Constants ─────────────────────────────────────────────────────────────────

const PORT = (() => {
  const port = Number.parseInt(process.env.PORT || '3000', 10);
  if (Number.isNaN(port) || port < 1 || port > 65535) {
    throw new Error(`Invalid PORT environment variable: ${process.env.PORT}. Must be a number between 1-65535`);
  }
  return port;
})();

/** H3: Maximum POST body size accepted by the server */
const MAX_BODY_SIZE = 5 * 1024 * 1024; // 5 MB

/** M3: Completed/failed jobs are evicted after 30 minutes */
const JOB_TTL_MS = 30 * 60 * 1000;

// H5: Only these origins may make cross-origin requests
const ALLOWED_ORIGINS = new Set([
  `http://localhost:${PORT}`,
  `http://127.0.0.1:${PORT}`,
]);

// ── Job Store ─────────────────────────────────────────────────────────────────

const analysisJobs = new Map<string, any>();

// M3: Evict stale jobs every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [id, job] of analysisJobs.entries()) {
    if (job.status !== 'running' && now - (job.createdAt as number) > JOB_TTL_MS) {
      analysisJobs.delete(id);
    }
  }
}, 5 * 60 * 1000);

// ── Utility helpers ───────────────────────────────────────────────────────────

/**
 * H3: Read the request body up to MAX_BODY_SIZE bytes.
 * Returns the body string, or null if the limit was exceeded (response already sent).
 */
function readBody(req: http.IncomingMessage, res: http.ServerResponse): Promise<string | null> {
  return new Promise(resolve => {
    let body = '';
    let bodySize = 0;

    req.on('data', (chunk: Buffer) => {
      bodySize += chunk.length;
      if (bodySize > MAX_BODY_SIZE) {
        res.writeHead(413, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Request entity too large. Maximum allowed size is 5 MB.' }));
        req.destroy();
        resolve(null);
      } else {
        body += chunk.toString();
      }
    });
    req.on('end', () => resolve(body));
    req.on('error', () => resolve(null));
  });
}

/**
 * H5: Set CORS headers, restricting cross-origin access to localhost only.
 */
function setCorsHeaders(req: http.IncomingMessage, res: http.ServerResponse): void {
  const origin = req.headers['origin'] as string | undefined;
  if (!origin || ALLOWED_ORIGINS.has(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin || `http://localhost:${PORT}`);
  }
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Vary', 'Origin');
}

// ── Route Handlers (L7: extracted into named functions) ───────────────────────

async function handleIndex(_req: http.IncomingMessage, res: http.ServerResponse): Promise<void> {
  const htmlPath = path.join(__dirname, '..', 'gui', 'index.html');
  fs.readFile(htmlPath, 'utf8', (err, data) => {
    if (err) {
      res.writeHead(500, { 'Content-Type': 'text/plain' });
      res.end('Error loading page');
      return;
    }
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(data);
  });
}

async function handleGetConfig(_req: http.IncomingMessage, res: http.ServerResponse): Promise<void> {
  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ config: defaultConfig }));
}

async function handleValidateDirectory(req: http.IncomingMessage, res: http.ServerResponse): Promise<void> {
  const body = await readBody(req, res);
  if (body === null) return;

  try {
    const parsed = JSON.parse(body);
    const { directory } = parsed;

    if (!directory || typeof directory !== 'string' || directory.trim() === '') {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ valid: false, error: 'Invalid directory parameter' }));
      return;
    }

    if (!fs.existsSync(directory)) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ valid: false, error: 'Directory does not exist' }));
      return;
    }

    const stats = fs.statSync(directory);
    if (!stats.isDirectory()) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ valid: false, error: 'Path is not a directory' }));
      return;
    }

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ valid: true, path: directory }));
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    res.writeHead(400, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ valid: false, error: message }));
  }
}

async function handleAnalyze(req: http.IncomingMessage, res: http.ServerResponse): Promise<void> {
  const body = await readBody(req, res);
  if (body === null) return;

  try {
    const config = JSON.parse(body);

    if (!config || typeof config !== 'object') {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Invalid request body' }));
      return;
    }

    if (!config.rootDir || typeof config.rootDir !== 'string' || config.rootDir.trim() === '') {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Invalid rootDir parameter' }));
      return;
    }

    if (!fs.existsSync(config.rootDir)) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Directory does not exist' }));
      return;
    }

    if (!config.outputPath || !path.isAbsolute(config.outputPath)) {
      const fileName = config.outputPath || 'feature-catalog.md';
      const projectRoot = path.resolve(config.rootDir, '..');
      config.outputPath = path.join(projectRoot, fileName);
    }

    // M3: collision-free UUID job ID
    const jobId = randomUUID();
    analysisJobs.set(jobId, {
      status: 'running',
      progress: 0,
      message: 'Starting analysis...',
      result: null,
      error: null,
      rootDir: config.rootDir,
      createdAt: Date.now()
    });

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ jobId }));

    runAnalysis(jobId, config);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    res.writeHead(400, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: message }));
  }
}

async function handleGetJob(req: http.IncomingMessage, res: http.ServerResponse): Promise<void> {
  const jobId = (req.url ?? '').split('/')[3];
  const job = analysisJobs.get(jobId);

  if (!job) {
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Job not found' }));
    return;
  }

  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(job));
}

/**
 * H1: /api/result/:filePath — Serve a result file safely.
 * The resolved path MUST reside within process.cwd() to prevent path traversal.
 */
async function handleGetResult(req: http.IncomingMessage, res: http.ServerResponse): Promise<void> {
  const rawPath = decodeURIComponent((req.url ?? '').split('/api/result/')[1] ?? '');

  // H1: Resolve and confine to process.cwd()
  const resolvedFilePath = path.resolve(rawPath);
  const allowedBase = path.resolve(process.cwd());

  const isWithinBase =
    resolvedFilePath === allowedBase ||
    resolvedFilePath.startsWith(allowedBase + path.sep);

  if (!isWithinBase) {
    res.writeHead(403, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Access denied: path resolves outside the allowed directory.' }));
    return;
  }

  if (!fs.existsSync(resolvedFilePath)) {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('File not found');
    return;
  }

  const ext = path.extname(resolvedFilePath);
  const contentType =
    ext === '.json' ? 'application/json' :
    ext === '.html' ? 'text/html' : 'text/markdown';

  fs.readFile(resolvedFilePath, 'utf8', (err, data) => {
    if (err) {
      res.writeHead(500, { 'Content-Type': 'text/plain' });
      res.end('Error reading file');
      return;
    }
    res.writeHead(200, { 'Content-Type': contentType });
    res.end(data);
  });
}

async function handleCompare(req: http.IncomingMessage, res: http.ServerResponse): Promise<void> {
  const body = await readBody(req, res);
  if (body === null) return;

  try {
    const { configA, configB } = JSON.parse(body);

    if (!configA?.rootDir || !configB?.rootDir) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Both configA and configB must have rootDir' }));
      return;
    }

    // M3: UUID job ID
    const jobId = randomUUID();
    analysisJobs.set(jobId, {
      status: 'running',
      progress: 0,
      message: 'Starting comparison...',
      result: null,
      error: null,
      type: 'comparison',
      createdAt: Date.now()
    });

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ jobId }));

    runComparison(jobId, configA, configB);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    res.writeHead(400, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: message }));
  }
}

/**
 * L5: Server-Sent Events endpoint — pushes job progress to the GUI
 * instead of requiring the client to poll every 500 ms.
 */
async function handleJobEvents(req: http.IncomingMessage, res: http.ServerResponse): Promise<void> {
  const jobId = (req.url ?? '').split('/api/events/')[1] ?? '';
  const job = analysisJobs.get(jobId);

  if (!job) {
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Job not found' }));
    return;
  }

  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
  });
  res.write('retry: 1000\n\n');

  const push = () => {
    const current = analysisJobs.get(jobId);
    if (!current) { clearInterval(interval); res.end(); return; }
    res.write(`data: ${JSON.stringify(current)}\n\n`);
    if (current.status === 'completed' || current.status === 'failed') {
      clearInterval(interval);
      res.end();
    }
  };

  const interval = setInterval(push, 200);
  req.on('close', () => clearInterval(interval));
  push(); // send initial state immediately
}

// ── Route Table (L7) ──────────────────────────────────────────────────────────

type Handler = (req: http.IncomingMessage, res: http.ServerResponse) => Promise<void>;

interface Route {
  method: string;
  test: (url: string) => boolean;
  handler: Handler;
}

const routes: Route[] = [
  { method: 'GET',  test: u => u === '/' || u === '/index.html',       handler: handleIndex },
  { method: 'GET',  test: u => u === '/api/config',                    handler: handleGetConfig },
  { method: 'POST', test: u => u === '/api/validate-directory',        handler: handleValidateDirectory },
  { method: 'POST', test: u => u === '/api/analyze',                   handler: handleAnalyze },
  { method: 'GET',  test: u => /^\/api\/job\/[^/]+$/.test(u),         handler: handleGetJob },
  { method: 'GET',  test: u => u.startsWith('/api/result/'),           handler: handleGetResult },
  { method: 'POST', test: u => u === '/api/compare',                   handler: handleCompare },
  { method: 'GET',  test: u => u.startsWith('/api/events/'),           handler: handleJobEvents },
];

// ── HTTP Server ───────────────────────────────────────────────────────────────

const server = http.createServer(async (req, res) => {
  const url = req.url ?? '/';
  const method = req.method ?? 'GET';

  // H5: CORS headers on every response
  setCorsHeaders(req, res);

  // Handle CORS pre-flight
  if (method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  // L7: Dispatch via route table
  const route = routes.find(r => r.method === method && r.test(url));
  if (route) {
    try {
      await route.handler(req, res);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      if (!res.headersSent) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: message }));
      }
    }
    return;
  }

  // 404
  res.writeHead(404, { 'Content-Type': 'text/plain' });
  res.end('Not found');
});

// ── Analysis runners ──────────────────────────────────────────────────────────

async function runAnalysis(jobId: string, config: any): Promise<void> {
  const job = analysisJobs.get(jobId);

  try {
    job.status = 'running';
    job.progress = 10;
    job.message = 'Validating configuration...';

    const envValidation = SafetyValidator.validateEnvironment();
    if (envValidation.warnings.length > 0) {
      job.warnings = envValidation.warnings;
    }

    const configMerger = new ConfigMerger();
    const mergedConfig = configMerger.merge(defaultConfig, config);

    job.progress = 20;
    job.message = 'Validating safety...';

    const validator = new ConfigValidator();
    if (!validator.validate(mergedConfig)) {
      throw new Error(validator.getErrorMessage());
    }

    const safetyValidation = SafetyValidator.validateConfig(mergedConfig);
    if (!safetyValidation.valid) {
      throw new Error('Safety validation failed: ' + safetyValidation.errors.join(', '));
    }

    job.progress = 30;
    job.message = 'Starting analysis engine...';

    const engine = new AnalysisEngine(mergedConfig);
    await engine.analyze();

    job.status = 'completed';
    job.progress = 100;
    job.message = 'Analysis completed successfully!';
    job.result = {
      outputPath: mergedConfig.outputPath,
      formats: mergedConfig.outputFormats
    };

  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    job.status = 'failed';
    job.error = message;
    job.message = 'Analysis failed';
  }
}

async function runComparison(jobId: string, configA: any, configB: any): Promise<void> {
  const job = analysisJobs.get(jobId);

  try {
    job.message = 'Analyzing Source A...';
    job.progress = 10;

    const merger = new ConfigMerger();
    const mergedConfigA = merger.merge(defaultConfig, configA);
    if (!mergedConfigA.outputPath) {
      mergedConfigA.outputPath = path.join(mergedConfigA.rootDir, 'feature-catalog-a.md');
    }

    const engineA = new AnalysisEngine(mergedConfigA);
    const catalogA = await engineA.analyze();

    job.message = 'Analyzing Source B...';
    job.progress = 50;

    const mergedConfigB = merger.merge(defaultConfig, configB);
    if (!mergedConfigB.outputPath) {
      mergedConfigB.outputPath = path.join(mergedConfigB.rootDir, 'feature-catalog-b.md');
    }

    const engineB = new AnalysisEngine(mergedConfigB);
    const catalogB = await engineB.analyze();

    job.message = 'Comparing features...';
    job.progress = 80;
    const diff = FeatureDiff.compare(catalogA, catalogB);

    const outputFormats = configA.outputFormats || configB.outputFormats || ['markdown'];
    const outputPath = configA.outputPath || configB.outputPath ||
      path.join(mergedConfigA.rootDir, 'diff-report.md');
    const generatedFiles: string[] = [];

    if (outputFormats.length > 0) {
      job.message = 'Generating diff reports...';
      job.progress = 90;

      for (const format of outputFormats) {
        const ext = format === 'markdown' ? 'md' : format;
        const filePath = outputPath.replace(/\.[^.]+$/, `.${ext}`);

        try {
          switch (format) {
            case 'markdown': {
              const mdGenerator = new DiffMarkdownGenerator();
              const markdown = mdGenerator.generateMarkdown(diff);
              mdGenerator.writeToFile(markdown, filePath);
              generatedFiles.push(filePath);
              break;
            }
            case 'json': {
              const jsonGenerator = new DiffJSONGenerator();
              const json = jsonGenerator.generateJSON(diff);
              jsonGenerator.writeToFile(json, filePath);
              generatedFiles.push(filePath);
              break;
            }
            case 'html': {
              const htmlGenerator = new DiffHTMLGenerator();
              const html = htmlGenerator.generateHTML(diff);
              htmlGenerator.writeToFile(html, filePath);
              generatedFiles.push(filePath);
              break;
            }
          }
        } catch (error) {
          console.error(`Failed to generate ${format} diff report:`, error);
        }
      }
    }

    job.status = 'completed';
    job.progress = 100;
    job.message = 'Comparison complete!';
    job.result = { ...diff, generatedFiles };

  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    job.status = 'failed';
    job.error = message;
    job.message = 'Comparison failed';
  }
}

// ── Start Server ──────────────────────────────────────────────────────────────

server.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════════════════════════╗
║                                                            ║
║   🚀 React Feature Discovery - Web GUI                    ║
║                                                            ║
║   Server running at: http://localhost:${PORT}              ║
║                                                            ║
║   Open your browser and start analyzing!                  ║
║                                                            ║
╚════════════════════════════════════════════════════════════╝
  `);

  // L2: Use execFile (not exec) — avoids shell interpolation
  const openBrowser = (url: string) => {
    const cmd = process.platform === 'darwin' ? 'open' :
                process.platform === 'win32'  ? 'start' : 'xdg-open';
    execFile(cmd, [url], err => {
      if (err) console.log('Please open http://localhost:' + PORT + ' in your browser');
    });
  };

  setTimeout(() => {
    try {
      openBrowser(`http://localhost:${PORT}`);
    } catch {
      console.log('Please open http://localhost:' + PORT + ' in your browser');
    }
  }, 1000);
});
