#!/usr/bin/env node

/**
 * Web GUI server for React Feature Discovery tool
 */

import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { exec } from 'child_process';
import { ConfigLoader, ConfigValidator, ConfigMerger, defaultConfig } from './config/index.js';
import { AnalysisEngine } from './core/AnalysisEngine.js';
import { FeatureDiff } from './core/FeatureDiff.js';
import { SafetyValidator } from './utils/SafetyValidator.js';
import { DiffMarkdownGenerator } from './generators/DiffMarkdownGenerator.js';
import { DiffJSONGenerator } from './generators/DiffJSONGenerator.js';
import { DiffHTMLGenerator } from './generators/DiffHTMLGenerator.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = (() => {
  const port = Number.parseInt(process.env.PORT || '3000', 10);
  if (Number.isNaN(port) || port < 1 || port > 65535) {
    throw new Error(`Invalid PORT environment variable: ${process.env.PORT}. Must be a number between 1-65535`);
  }
  return port;
})();

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
        const parsed = JSON.parse(body);
        const { directory } = parsed;
        
        // Validate input
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
        
        // Validate input
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
        
        // Validate directory
        if (!fs.existsSync(config.rootDir)) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Directory does not exist' }));
          return;
        }

        // If outputPath is relative or not specified, make it relative to the analyzed directory
        if (!config.outputPath || !path.isAbsolute(config.outputPath)) {
          const fileName = config.outputPath || 'feature-catalog.md';
          // Get the parent directory of rootDir (project root)
          const projectRoot = path.resolve(config.rootDir, '..');
          config.outputPath = path.join(projectRoot, fileName);
        }

        // Generate job ID
        const jobId = Date.now().toString();
        
        // Store job
        analysisJobs.set(jobId, {
          status: 'running',
          progress: 0,
          message: 'Starting analysis...',
          result: null,
          error: null,
          rootDir: config.rootDir
        });

        // Send immediate response with job ID
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ jobId }));

        // Run analysis in background
        runAnalysis(jobId, config);
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: message }));
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

  // API: Compare two codebases
  if (req.url === '/api/compare' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => body += chunk.toString());
    req.on('end', async () => {
      try {
        const { configA, configB } = JSON.parse(body);
        
        if (!configA?.rootDir || !configB?.rootDir) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Both configA and configB must have rootDir' }));
          return;
        }

        const jobId = Date.now().toString();
        
        analysisJobs.set(jobId, {
          status: 'running',
          progress: 0,
          message: 'Starting comparison...',
          result: null,
          error: null,
          type: 'comparison'
        });

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ jobId }));

        runComparison(jobId, configA, configB);
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: message }));
      }
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

  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    job.status = 'failed';
    job.error = message;
    job.message = 'Analysis failed';
  }
}

async function runComparison(jobId: string, configA: any, configB: any) {
  const job = analysisJobs.get(jobId);
  
  try {
    // Run Analysis A
    job.message = 'Analyzing Source A...';
    job.progress = 10;
    
    // Merge config A
    const merger = new ConfigMerger();
    const mergedConfigA = merger.merge(defaultConfig, configA);
    // Ensure output path is set (even if not used for diff, engine needs it)
    if (!mergedConfigA.outputPath) mergedConfigA.outputPath = path.join(mergedConfigA.rootDir, 'feature-catalog-a.md');

    const engineA = new AnalysisEngine(mergedConfigA);
    const catalogA = await engineA.analyze();

    // Run Analysis B
    job.message = 'Analyzing Source B...';
    job.progress = 50;

    // Merge config B
    const mergedConfigB = merger.merge(defaultConfig, configB);
    if (!mergedConfigB.outputPath) mergedConfigB.outputPath = path.join(mergedConfigB.rootDir, 'feature-catalog-b.md');

    const engineB = new AnalysisEngine(mergedConfigB);
    const catalogB = await engineB.analyze();

    // Compare
    job.message = 'Comparing features...';
    job.progress = 80;
    const diff = FeatureDiff.compare(catalogA, catalogB);

    // Generate output files if formats are specified
    const outputFormats = configA.outputFormats || configB.outputFormats || ['markdown'];
    const outputPath = configA.outputPath || configB.outputPath || path.join(mergedConfigA.rootDir, 'diff-report.md');
    const generatedFiles: string[] = [];

    if (outputFormats.length > 0) {
      job.message = 'Generating diff reports...';
      job.progress = 90;

      for (const format of outputFormats) {
        const ext = format === 'markdown' ? 'md' : format;
        const filePath = outputPath.replace(/\.[^.]+$/, `.${ext}`);

        try {
          switch (format) {
            case 'markdown':
              const mdGenerator = new DiffMarkdownGenerator();
              const markdown = mdGenerator.generateMarkdown(diff);
              mdGenerator.writeToFile(markdown, filePath);
              generatedFiles.push(filePath);
              break;

            case 'json':
              const jsonGenerator = new DiffJSONGenerator();
              const json = jsonGenerator.generateJSON(diff);
              jsonGenerator.writeToFile(json, filePath);
              generatedFiles.push(filePath);
              break;

            case 'html':
              const htmlGenerator = new DiffHTMLGenerator();
              const html = htmlGenerator.generateHTML(diff);
              htmlGenerator.writeToFile(html, filePath);
              generatedFiles.push(filePath);
              break;
          }
        } catch (error) {
          console.error(`Failed to generate ${format} diff report:`, error);
        }
      }
    }

    job.status = 'completed';
    job.progress = 100;
    job.message = 'Comparison complete!';
    job.result = {
      ...diff,
      generatedFiles
    };

  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    job.status = 'failed';
    job.error = message;
    job.message = 'Comparison failed';
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
    exec(`${start} ${url}`);
  };

  setTimeout(() => {
    try {
      open(`http://localhost:${PORT}`);
    } catch (err) {
      // Browser opening is optional, log message only
      console.log('Please open http://localhost:' + PORT + ' in your browser');
    }
  }, 1000);
});
