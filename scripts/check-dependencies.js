#!/usr/bin/env node

/**
 * Dependency chain analyzer for circular import detection
 * 
 * This script analyzes the import structure of the application to detect
 * circular dependencies that could cause runtime errors or build failures.
 */

import { readFileSync, readdirSync, statSync } from 'fs';
import { join, resolve, extname, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = resolve(__dirname, '..');
const SRC_DIR = join(PROJECT_ROOT, 'src');

/**
 * Parse imports from a JavaScript/Vue file
 * @param {string} filePath 
 * @returns {string[]} Array of imported file paths
 */
function parseImports(filePath) {
  const imports = [];
  
  try {
    const content = readFileSync(filePath, 'utf-8');
    
    // Match ES6 imports and dynamic imports
    const importRegex = /(?:import\s+.*?\s+from\s+['"`](.+?)['"`]|import\s*\(\s*['"`](.+?)['"`]\s*\))/g;
    
    let match;
    while ((match = importRegex.exec(content)) !== null) {
      const importPath = match[1] || match[2];
      
      // Skip external dependencies (node_modules)
      if (!importPath.startsWith('.') && !importPath.startsWith('/')) {
        continue;
      }
      
      // Resolve relative paths
      const resolvedPath = resolveImportPath(filePath, importPath);
      if (resolvedPath) {
        imports.push(resolvedPath);
      }
    }
  } catch (error) {
    console.warn(`⚠️  Could not parse ${filePath}: ${error.message}`);
  }
  
  return imports;
}

/**
 * Resolve import path to absolute file path
 * @param {string} fromFile 
 * @param {string} importPath 
 * @returns {string|null}
 */
function resolveImportPath(fromFile, importPath) {
  const fromDir = dirname(fromFile);
  let resolvedPath;
  
  if (importPath.startsWith('./') || importPath.startsWith('../')) {
    resolvedPath = resolve(fromDir, importPath);
  } else if (importPath.startsWith('/')) {
    resolvedPath = resolve(PROJECT_ROOT, importPath.slice(1));
  } else {
    return null; // External dependency
  }
  
  // Try different extensions
  const extensions = ['.js', '.vue', '.ts'];
  
  // Check if path exists as-is
  if (existsWithExtensions(resolvedPath)) {
    return resolvedPath;
  }
  
  // Try with index file
  const indexPath = join(resolvedPath, 'index');
  if (existsWithExtensions(indexPath)) {
    return indexPath;
  }
  
  return null;
}

/**
 * Check if file exists with common extensions
 * @param {string} basePath 
 * @returns {boolean}
 */
function existsWithExtensions(basePath) {
  const extensions = ['', '.js', '.vue', '.ts'];
  
  for (const ext of extensions) {
    const fullPath = basePath + ext;
    try {
      const stat = statSync(fullPath);
      if (stat.isFile()) {
        return true;
      }
    } catch {
      continue;
    }
  }
  
  return false;
}

/**
 * Get all source files recursively
 * @param {string} dir 
 * @returns {string[]}
 */
function getSourceFiles(dir) {
  const files = [];
  const entries = readdirSync(dir);
  
  for (const entry of entries) {
    const fullPath = join(dir, entry);
    const stat = statSync(fullPath);
    
    if (stat.isDirectory()) {
      // Skip node_modules and build directories
      if (['node_modules', 'dist', '.git'].includes(entry)) {
        continue;
      }
      files.push(...getSourceFiles(fullPath));
    } else if (stat.isFile()) {
      const ext = extname(fullPath);
      if (['.js', '.vue', '.ts'].includes(ext)) {
        files.push(fullPath);
      }
    }
  }
  
  return files;
}

/**
 * Build dependency graph
 * @param {string[]} files 
 * @returns {Map<string, string[]>}
 */
function buildDependencyGraph(files) {
  const graph = new Map();
  
  for (const file of files) {
    const imports = parseImports(file);
    graph.set(file, imports.filter(imp => files.includes(imp)));
  }
  
  return graph;
}

/**
 * Detect circular dependencies using DFS
 * @param {Map<string, string[]>} graph 
 * @returns {string[][]} Array of circular dependency chains
 */
function detectCircularDependencies(graph) {
  const visited = new Set();
  const visiting = new Set();
  const cycles = [];
  
  function dfs(node, path = []) {
    if (visiting.has(node)) {
      // Found a cycle
      const cycleStart = path.indexOf(node);
      const cycle = path.slice(cycleStart).concat([node]);
      cycles.push(cycle);
      return;
    }
    
    if (visited.has(node)) {
      return;
    }
    
    visiting.add(node);
    const newPath = path.concat([node]);
    
    const dependencies = graph.get(node) || [];
    for (const dep of dependencies) {
      dfs(dep, newPath);
    }
    
    visiting.delete(node);
    visited.add(node);
  }
  
  for (const node of graph.keys()) {
    if (!visited.has(node)) {
      dfs(node);
    }
  }
  
  return cycles;
}

/**
 * Format file path for display
 * @param {string} filePath 
 * @returns {string}
 */
function formatPath(filePath) {
  return filePath.replace(PROJECT_ROOT + '/', '');
}

/**
 * Main analysis function
 */
function analyzeDependencies() {
  console.log('🔍 Analyzing import dependencies...\n');
  
  const files = getSourceFiles(SRC_DIR);
  console.log(`📁 Found ${files.length} source files`);
  
  const graph = buildDependencyGraph(files);
  console.log(`🔗 Built dependency graph with ${graph.size} nodes`);
  
  const cycles = detectCircularDependencies(graph);
  
  if (cycles.length === 0) {
    console.log('\n✅ No circular dependencies detected!');
    
    // Show dependency statistics
    console.log('\n📊 Dependency Statistics:');
    const stats = Array.from(graph.entries()).map(([file, deps]) => ({
      file: formatPath(file),
      dependencies: deps.length
    })).sort((a, b) => b.dependencies - a.dependencies);
    
    console.log('Top files by dependency count:');
    stats.slice(0, 5).forEach(({ file, dependencies }) => {
      console.log(`  ${dependencies} deps: ${file}`);
    });
    
    // Check for potential issues
    const highDependencyFiles = stats.filter(s => s.dependencies > 5);
    if (highDependencyFiles.length > 0) {
      console.log('\n⚠️  Files with high dependency count (>5):');
      highDependencyFiles.forEach(({ file, dependencies }) => {
        console.log(`  ${dependencies} deps: ${file}`);
      });
      console.log('Consider refactoring to reduce coupling.');
    }
    
    return true;
  } else {
    console.log(`\n🚨 Found ${cycles.length} circular dependencies!\n`);
    
    cycles.forEach((cycle, index) => {
      console.log(`Cycle ${index + 1}:`);
      cycle.forEach((file, i) => {
        const arrow = i === cycle.length - 1 ? ' → [CYCLE]' : ' →';
        console.log(`  ${formatPath(file)}${arrow}`);
      });
      console.log('');
    });
    
    console.log('💡 To fix circular dependencies:');
    console.log('1. Extract shared code to a separate module');
    console.log('2. Use dependency injection');
    console.log('3. Move shared types to a common types file');
    console.log('4. Use dynamic imports where appropriate');
    
    return false;
  }
}

/**
 * Specific analysis for our architecture
 */
function analyzeArchitectureCompliance() {
  console.log('\n🏗️  Architecture Compliance Check:\n');
  
  const composablesDir = join(SRC_DIR, 'composables');
  const servicesDir = join(SRC_DIR, 'services');
  const componentsDir = join(SRC_DIR, 'components');
  
  const composables = getSourceFiles(composablesDir);
  const services = getSourceFiles(servicesDir);
  const components = getSourceFiles(componentsDir);
  
  console.log(`Composables: ${composables.length} files`);
  console.log(`Services: ${services.length} files`);
  console.log(`Components: ${components.length} files`);
  
  // Check composable dependencies
  const graph = buildDependencyGraph([...composables, ...services, ...components]);
  
  let violations = 0;
  
  // Rule: Services shouldn't depend on composables
  for (const service of services) {
    const deps = graph.get(service) || [];
    const composableDeps = deps.filter(dep => composables.includes(dep));
    
    if (composableDeps.length > 0) {
      console.log(`❌ Service depends on composables: ${formatPath(service)}`);
      composableDeps.forEach(dep => console.log(`   → ${formatPath(dep)}`));
      violations++;
    }
  }
  
  // Rule: Service modules should be focused (low coupling)
  const dataFetchersDir = join(servicesDir, 'dataFetchers');
  const parsersDir = join(servicesDir, 'parsers');
  
  if (getSourceFiles(dataFetchersDir).length > 0 && getSourceFiles(parsersDir).length > 0) {
    const fetchers = getSourceFiles(dataFetchersDir);
    const parsers = getSourceFiles(parsersDir);
    
    // Check fetchers don't depend on parsers
    for (const fetcher of fetchers) {
      const deps = graph.get(fetcher) || [];
      const parserDeps = deps.filter(dep => parsers.includes(dep));
      
      if (parserDeps.length > 0) {
        console.log(`❌ Fetcher depends on parser: ${formatPath(fetcher)}`);
        parserDeps.forEach(dep => console.log(`   → ${formatPath(dep)}`));
        violations++;
      }
    }
  }
  
  if (violations === 0) {
    console.log('✅ Architecture compliance: PASSED');
  } else {
    console.log(`❌ Architecture compliance: ${violations} violations found`);
  }
  
  return violations === 0;
}

// Run analysis
const noCycles = analyzeDependencies();
const architectureCompliant = analyzeArchitectureCompliance();

if (noCycles && architectureCompliant) {
  console.log('\n🎉 All dependency checks passed!');
  process.exit(0);
} else {
  console.log('\n💥 Dependency check failed!');
  process.exit(1);
}