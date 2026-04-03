/**
 * AnalysisEngine - Main orchestrator for feature discovery analysis
 * M1: Real parallel file processing via Promise.all batching (when parallel: true).
 * M2: File content cached in Map<relativePath, string> — each file read only once.
 * L4: All I/O uses fs.promises (non-blocking async).
 */

import * as fs from 'fs';
import { ToolConfig, FeatureCatalog, FileEntry } from '../types/index.js';
import { FileScanner } from '../scanners/FileScanner.js';
import { DependencyAnalyzer } from '../analyzers/DependencyAnalyzer.js';
import { MetadataExtractor } from '../analyzers/MetadataExtractor.js';
import { CatalogBuilder } from '../analyzers/CatalogBuilder.js';
import { MarkdownWriter } from '../generators/MarkdownGenerator.js';
import { JSONGenerator } from '../generators/JSONGenerator.js';
import { HTMLGenerator } from '../generators/HTMLGenerator.js';
import { ErrorHandler } from '../utils/ErrorHandler.js';
import { SafetyValidator } from '../utils/SafetyValidator.js';

const PARALLEL_BATCH_SIZE = 50;

export class AnalysisEngine {
  private config: ToolConfig;
  private errorHandler: ErrorHandler;

  constructor(config: ToolConfig) {
    this.config = config;
    this.errorHandler = new ErrorHandler();
  }

  async analyze(): Promise<FeatureCatalog> {
    console.log('🔍 Starting React Feature Discovery Analysis...\n');
    console.log('🛡️  Safety Mode: ENABLED (Read-only analysis, no code modifications)\n');
    console.log(`📁 Root Directory: ${this.config.rootDir}`);
    console.log(`📄 Output Path: ${this.config.outputPath}\n`);

    try {
      // Step 1: Scan files
      console.log('📂 Step 1: Scanning files...');
      const scanner = new FileScanner(this.config);
      const files = await scanner.scanDirectory();
      console.log(`✅ Found ${files.length} files\n`);

      if (scanner.getErrors().length > 0) {
        for (const error of scanner.getErrors()) {
          this.errorHandler.logError('FILE_NOT_FOUND', error, 'warning');
        }
      }

      // Step 2: Pre-load all file contents once (M2 + L4 + M1)
      // Each file is read exactly once and cached. Both dependency analysis
      // and metadata extraction re-use this cache — eliminating double reads.
      console.log('📖 Step 2: Pre-loading file contents...');
      const fileContents = new Map<string, string>();
      await this.loadFileContents(files, fileContents);
      console.log(`✅ Loaded content for ${fileContents.size} files\n`);

      // Step 3: Analyze dependencies (using cached content)
      console.log('🔗 Step 3: Analyzing dependencies...');
      const dependencyAnalyzer = new DependencyAnalyzer(this.config.rootDir, files);
      const allDependencies = new Map();

      for (const file of files) {
        const content = fileContents.get(file.relativePath);
        if (content === undefined) continue;
        try {
          const deps = dependencyAnalyzer.analyzeDependencies(content, file.relativePath);
          allDependencies.set(file.relativePath, deps);
        } catch (error) {
          const message = error instanceof Error ? error.message : String(error);
          this.errorHandler.logError('PARSE_ERROR', `Failed to analyze dependencies: ${message}`, 'warning', file.relativePath);
        }
      }
      console.log(`✅ Analyzed dependencies for ${allDependencies.size} files\n`);

      // Step 4: Build dependency graph
      console.log('📊 Step 4: Building dependency graph...');
      const dependencyGraph = dependencyAnalyzer.buildDependencyGraph(files, allDependencies);
      console.log(`✅ Created graph with ${dependencyGraph.nodes.size} nodes and ${dependencyGraph.edges.length} edges\n`);

      // Step 5: Extract metadata (using cached content — no second read)
      console.log('📝 Step 5: Extracting metadata...');
      const metadataExtractor = new MetadataExtractor(
        this.config.environmentPatterns,
        this.config.customMigrationRules
      );
      const allMetadata = [];

      for (const file of files) {
        const content = fileContents.get(file.relativePath);
        if (content === undefined) continue;
        try {
          const deps = allDependencies.get(file.relativePath) || {
            internal: [],
            external: [],
            routes: [],
            apis: []
          };
          const metadata = metadataExtractor.extractMetadata(content, file.relativePath, file.category, deps);
          allMetadata.push(metadata);
        } catch (error) {
          const message = error instanceof Error ? error.message : String(error);
          this.errorHandler.logError('PARSE_ERROR', `Failed to extract metadata: ${message}`, 'warning', file.relativePath);
        }
      }
      console.log(`✅ Extracted metadata for ${allMetadata.length} features\n`);

      // Step 6: Build catalog
      console.log('📚 Step 6: Building feature catalog...');
      const catalogBuilder = new CatalogBuilder(this.config.rootDir, this.config.moduleTypes);
      const catalog = catalogBuilder.buildCatalog(allMetadata, allDependencies, dependencyGraph);
      console.log(`✅ Built catalog with ${catalog.features.pages.length} pages, ` +
                  `${catalog.features.components.length} components, ` +
                  `${catalog.features.services.length} services\n`);

      // Step 7: Generate outputs
      console.log('📄 Step 7: Generating output files...');
      for (const format of this.config.outputFormats) {
        const outputPath = this.getOutputPath(format);
        const outputValidation = SafetyValidator.validateOutputPath(outputPath, this.config.rootDir);
        if (!outputValidation.valid) {
          console.error(`❌ Cannot write ${format} output: ${outputValidation.error}`);
          continue;
        }
        SafetyValidator.ensureSafeOutputDirectory(outputPath);

        switch (format) {
          case 'markdown': {
            const markdownWriter = new MarkdownWriter();
            const markdown = markdownWriter.generateMarkdown(catalog);
            markdownWriter.writeToFile(markdown, outputPath);
            console.log(`✅ Markdown written to ${outputPath}`);
            break;
          }
          case 'json': {
            const jsonGenerator = new JSONGenerator();
            const json = jsonGenerator.generateJSON(catalog);
            jsonGenerator.writeToFile(json, outputPath);
            console.log(`✅ JSON written to ${outputPath}`);
            break;
          }
          case 'html': {
            const htmlGenerator = new HTMLGenerator();
            const html = htmlGenerator.generateHTML(catalog);
            htmlGenerator.writeToFile(html, outputPath);
            console.log(`✅ HTML written to ${outputPath}`);
            break;
          }
        }
      }

      console.log('\n🎉 Feature Discovery Complete!\n');
      console.log('📊 Summary:');
      console.log(`   - Total Files: ${files.length}`);
      console.log(`   - Pages: ${catalog.features.pages.length}`);
      console.log(`   - Components: ${catalog.features.components.length}`);
      console.log(`   - Services: ${catalog.features.services.length}`);
      console.log(`   - Hooks: ${catalog.features.hooks.length}`);
      console.log(`   - Utilities: ${catalog.features.utilities.length}`);
      console.log(`   - Types: ${catalog.features.types.length}`);

      return catalog;

    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.error('❌ Fatal error during analysis:', message);
      this.errorHandler.logError('PARSE_ERROR', `Fatal error: ${message}`, 'error');
      throw error;
    }
  }

  /**
   * M1 + M2 + L4: Pre-load all file contents using async I/O.
   * When parallel: true, files are read in concurrent batches of PARALLEL_BATCH_SIZE.
   * Each file is read exactly once and stored in fileContents — eliminating double reads.
   */
  private async loadFileContents(
    files: FileEntry[],
    fileContents: Map<string, string>
  ): Promise<void> {
    const safeFiles = files.filter((file: any) =>
      SafetyValidator.validateReadPath(file.path, this.config.rootDir)
    );

    const readFile = async (file: any): Promise<void> => {
      try {
        const content = await fs.promises.readFile(file.path, 'utf-8');
        fileContents.set(file.relativePath, content);
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        this.errorHandler.logError('FILE_NOT_FOUND', `Could not read file: ${message}`, 'warning', file.relativePath);
      }
    };

    if (this.config.parallel) {
      // M1: process in parallel batches
      for (let i = 0; i < safeFiles.length; i += PARALLEL_BATCH_SIZE) {
        const batch = safeFiles.slice(i, i + PARALLEL_BATCH_SIZE);
        await Promise.all(batch.map(readFile));
      }
    } else {
      // Sequential fallback
      for (const file of safeFiles) {
        await readFile(file);
      }
    }
  }

  private getOutputPath(format: string): string {
    const base = this.config.outputPath.replace(/\.[^.]+$/, '');
    const ext = format === 'markdown' ? 'md' : format;
    return `${base}.${ext}`;
  }
}
