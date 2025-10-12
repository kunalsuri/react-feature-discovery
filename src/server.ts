#!/usr/bin/env node

/**
 * Web GUI server for React Feature Discovery tool
 */

import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { ConfigLoader, ConfigValidator, ConfigMerger, defaultConfig } from './config/index.js';
import { AnalysisEngine } from './core/AnalysisEngine.js';
import { SafetyValidator } from './utils/SafetyValidator.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = process.env.PORT || 3000;

// Store analysis jobs
const analysisJobs = new Map();

const server = http.createServer(async (req, res) => {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  // Serve the main HTML page
  if (req.url === '/' || req.url === '/index.html') {
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
    return;
  }

  // API: Get default config
  if (req.url === '/api/config' && req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ config: defaultConfig }));
    return;
  }

  // API: Validate directory
  if (req.url === '/api/validate-directory' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => body += chunk.toString());
    req.on('end', () => {
      try {
        const { directory } = JSON.parse(body);
        
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
      } catch (error: any) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ valid: false, error: error.message }));
      }
    });
    return;
  }

  // API: Start analysis
  if (req.url === '/api/analyze' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => body += chunk.toString());
    req.on('end', async () => {
      try {
        const config = JSON.parse(body);
        
        // Validate directory
        if (!fs.existsSync(config.rootDir)) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Directory does not exist' }));
          return;
        }

        // Generate job ID
        const jobId = Date.now().toString();
        
        // Store job
        analysisJobs.set(jobId, {
          status: 'running',
          progress: 0,
          message: 'Starting analysis...',
          result: null,
          error: null
        });

        // Send immediate response with job ID
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ jobId }));

        // Run analysis in background
        runAnalysis(jobId, config);
      } catch (error: any) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: error.message }));
      }
    });
    return;
  }

  // API: Check job status
  if (req.url?.startsWith('/api/job/') && req.method === 'GET') {
    const jobId = req.url.split('/')[3];
    const job = analysisJobs.get(jobId);
    
    if (!job) {
      res.writeHead(404, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Job not found' }));
      return;
    }

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(job));
    return;
  }

  // API: Get analysis result file
  if (req.url?.startsWith('/api/result/') && req.method === 'GET') {
    const filePath = decodeURIComponent(req.url.split('/api/result/')[1]);
    
    if (!fs.existsSync(filePath)) {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('File not found');
      return;
    }

    const ext = path.extname(filePath);
    const contentType = ext === '.json' ? 'application/json' :
                       ext === '.html' ? 'text/html' : 'text/markdown';

    fs.readFile(filePath, 'utf8', (err, data) => {
      if (err) {
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end('Error reading file');
        return;
      }
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(data);
    });
    return;
  }

  // 404
  res.writeHead(404, { 'Content-Type': 'text/plain' });
  res.end('Not found');
});

async function runAnalysis(jobId: string, config: any) {
  const job = analysisJobs.get(jobId);
  
  try {
    // Update progress
    job.status = 'running';
    job.progress = 10;
    job.message = 'Validating configuration...';

    // Validate environment
    const envValidation = SafetyValidator.validateEnvironment();
    if (envValidation.warnings.length > 0) {
      job.warnings = envValidation.warnings;
    }

    // Merge with defaults
    const configMerger = new ConfigMerger();
    const mergedConfig = configMerger.merge(defaultConfig, config);

    job.progress = 20;
    job.message = 'Validating safety...';

    // Validate configuration
    const validator = new ConfigValidator();
    if (!validator.validate(mergedConfig)) {
      throw new Error(validator.getErrorMessage());
    }

    // Validate safety
    const safetyValidation = SafetyValidator.validateConfig(mergedConfig);
    if (!safetyValidation.valid) {
      throw new Error('Safety validation failed: ' + safetyValidation.errors.join(', '));
    }

    job.progress = 30;
    job.message = 'Starting analysis engine...';

    // Run analysis
    const engine = new AnalysisEngine(mergedConfig);
    
    // Hook into engine progress (you might need to add progress callbacks to AnalysisEngine)
    await engine.analyze();

    job.status = 'completed';
    job.progress = 100;
    job.message = 'Analysis completed successfully!';
    job.result = {
      outputPath: mergedConfig.outputPath,
      formats: mergedConfig.outputFormats
    };

  } catch (error: any) {
    job.status = 'failed';
    job.error = error.message;
    job.message = 'Analysis failed';
  }
}

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

  // Try to open browser automatically
  const open = (url: string) => {
    const start = process.platform === 'darwin' ? 'open' :
                  process.platform === 'win32' ? 'start' : 'xdg-open';
    require('child_process').exec(`${start} ${url}`);
  };

  setTimeout(() => {
    try {
      open(`http://localhost:${PORT}`);
    } catch (err) {
      console.log('Please open http://localhost:' + PORT + ' in your browser');
    }
  }, 1000);
});
