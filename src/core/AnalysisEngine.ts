/**
 * AnalysisEngine - Main orchestrator for feature discovery analysis
 */

import * as fs from 'fs';
import { ToolConfig, FeatureCatalog } from '../types/index.js';
import { FileScanner } from '../scanners/FileScanner.js';
import { DependencyAnalyzer } from '../analyzers/DependencyAnalyzer.js';
import { MetadataExtractor } from '../analyzers/MetadataExtractor.js';
import { CatalogBuilder } from '../analyzers/CatalogBuilder.js';
import { MarkdownWriter } from '../generators/MarkdownGenerator.js';
import { JSONGenerator } from '../generators/JSONGenerator.js';
import { HTMLGenerator } from '../generators/HTMLGenerator.js';
import { ErrorHandler } from '../utils/ErrorHandler.js';
import { SafetyValidator } from '../utils/SafetyValidator.js';

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

      // Step 2: Analyze dependencies
      console.log('🔗 Step 2: Analyzing dependencies...');
      const dependencyAnalyzer = new DependencyAnalyzer(this.config.rootDir, files);
      const allDependencies = new Map();

      for (const file of files) {
        try {
          // Validate file is safe to read
          if (!SafetyValidator.validateReadPath(file.path, this.config.rootDir)) {
            this.errorHandler.logError(
              'SECURITY_ERROR',
              'File path failed safety validation',
              'warning',
              file.relativePath
            );
            continue;
          }
          
          const content = fs.readFileSync(file.path, 'utf-8');
          const deps = dependencyAnalyzer.analyzeDependencies(content, file.relativePath);
          allDependencies.set(file.relativePath, deps);
        } catch (error) {
          const message = error instanceof Error ? error.message : String(error);
          this.errorHandler.logError(
            'PARSE_ERROR',
            `Failed to analyze dependencies: ${message}`,
            'warning',
            file.relativePath
          );
        }
      }
      console.log(`✅ Analyzed dependencies for ${allDependencies.size} files\n`);

      // Step 3: Build dependency graph
      console.log('📊 Step 3: Building dependency graph...');
      const dependencyGraph = dependencyAnalyzer.buildDependencyGraph(files, allDependencies);
      console.log(`✅ Created graph with ${dependencyGraph.nodes.size} nodes and ${dependencyGraph.edges.length} edges\n`);

      // Step 4: Extract metadata
      console.log('📝 Step 4: Extracting metadata...');
      const metadataExtractor = new MetadataExtractor(
        this.config.environmentPatterns,
        this.config.customMigrationRules
      );
      const allMetadata = [];

      for (const file of files) {
        try {
          // Validate file is safe to read
          if (!SafetyValidator.validateReadPath(file.path, this.config.rootDir)) {
            continue;
          }
          
          const content = fs.readFileSync(file.path, 'utf-8');
          const deps = allDependencies.get(file.relativePath) || {
            internal: [],
            external: [],
            routes: [],
            apis: []
          };
          const metadata = metadataExtractor.extractMetadata(
            content,
            file.relativePath,
            file.category,
            deps
          );
          allMetadata.push(metadata);
        } catch (error) {
          const message = error instanceof Error ? error.message : String(error);
          this.errorHandler.logError(
            'PARSE_ERROR',
            `Failed to extract metadata: ${message}`,
            'warning',
            file.relativePath
          );
        }
      }
      console.log(`✅ Extracted metadata for ${allMetadata.length} features\n`);

      // Step 5: Build catalog
      console.log('📚 Step 5: Building feature catalog...');
      const catalogBuilder = new CatalogBuilder(this.config.rootDir, this.config.moduleTypes);
      const catalog = catalogBuilder.buildCatalog(allMetadata, allDependencies, dependencyGraph);
      console.log(`✅ Built catalog with ${catalog.features.pages.length} pages, ` +
                  `${catalog.features.components.length} components, ` +
                  `${catalog.features.services.length} services\n`);

      // Step 6: Generate outputs
      console.log('📄 Step 6: Generating output files...');
      
      for (const format of this.config.outputFormats) {
        const outputPath = this.getOutputPath(format);
        
        // Validate output path is safe
        const outputValidation = SafetyValidator.validateOutputPath(outputPath, this.config.rootDir);
        if (!outputValidation.valid) {
          console.error(`❌ Cannot write ${format} output: ${outputValidation.error}`);
          continue;
        }
        
        // Ensure output directory exists
        SafetyValidator.ensureSafeOutputDirectory(outputPath);
        
        switch (format) {
          case 'markdown':
            const markdownWriter = new MarkdownWriter();
            const markdown = markdownWriter.generateMarkdown(catalog);
            markdownWriter.writeToFile(markdown, outputPath);
            console.log(`✅ Markdown written to ${outputPath}`);
            break;
            
          case 'json':
            const jsonGenerator = new JSONGenerator();
            const json = jsonGenerator.generateJSON(catalog);
            jsonGenerator.writeToFile(json, outputPath);
            console.log(`✅ JSON written to ${outputPath}`);
            break;
            
          case 'html':
            const htmlGenerator = new HTMLGenerator();
            const html = htmlGenerator.generateHTML(catalog);
            htmlGenerator.writeToFile(html, outputPath);
            console.log(`✅ HTML written to ${outputPath}`);
            break;
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
      this.errorHandler.logError(
        'PARSE_ERROR',
        `Fatal error: ${message}`,
        'error'
      );
      throw error;
    }
  }

  private getOutputPath(format: string): string {
    const base = this.config.outputPath.replace(/\.[^.]+$/, '');
    const ext = format === 'markdown' ? 'md' : format;
    return `${base}.${ext}`;
  }
}
