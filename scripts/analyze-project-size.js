#!/usr/bin/env node

import fs from 'fs';
import path from 'path';

/**
 * Analyseer projectgrootte en resterende ruimte
 */

// Configuratie
const MAX_PROJECT_SIZE_MB = 100; // Geschatte limiet voor Bolt projecten
const EXCLUDE_PATTERNS = [
  'node_modules',
  '.git',
  'dist',
  'build',
  '.next',
  'coverage',
  '.nyc_output',
  'playwright-report',
  'test-results',
  '__trash_review'
];

function shouldExclude(filePath) {
  return EXCLUDE_PATTERNS.some(pattern => filePath.includes(pattern));
}

function getFileSize(filePath) {
  try {
    const stats = fs.statSync(filePath);
    return stats.size;
  } catch (error) {
    return 0;
  }
}

function countLines(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    return content.split('\n').length;
  } catch (error) {
    return 0;
  }
}

function getFileExtension(filePath) {
  return path.extname(filePath).toLowerCase();
}

function analyzeDirectory(dirPath, stats = {
  totalSize: 0,
  totalFiles: 0,
  totalLines: 0,
  fileTypes: {},
  largestFiles: [],
  directories: {}
}) {
  
  try {
    const items = fs.readdirSync(dirPath);
    
    for (const item of items) {
      const fullPath = path.join(dirPath, item);
      
      if (shouldExclude(fullPath)) {
        continue;
      }
      
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        stats.directories[item] = { size: 0, files: 0, lines: 0 };
        const dirStats = analyzeDirectory(fullPath, {
          totalSize: 0,
          totalFiles: 0,
          totalLines: 0,
          fileTypes: {},
          largestFiles: [],
          directories: {}
        });
        
        stats.directories[item] = {
          size: dirStats.totalSize,
          files: dirStats.totalFiles,
          lines: dirStats.totalLines
        };
        
        stats.totalSize += dirStats.totalSize;
        stats.totalFiles += dirStats.totalFiles;
        stats.totalLines += dirStats.totalLines;
        
        // Merge file types
        for (const [ext, data] of Object.entries(dirStats.fileTypes)) {
          if (!stats.fileTypes[ext]) {
            stats.fileTypes[ext] = { count: 0, size: 0, lines: 0 };
          }
          stats.fileTypes[ext].count += data.count;
          stats.fileTypes[ext].size += data.size;
          stats.fileTypes[ext].lines += data.lines;
        }
        
        // Merge largest files
        stats.largestFiles.push(...dirStats.largestFiles);
        
      } else if (stat.isFile()) {
        const fileSize = stat.size;
        const ext = getFileExtension(fullPath);
        const lines = ['.js', '.jsx', '.ts', '.tsx', '.css', '.html', '.md', '.json'].includes(ext) 
          ? countLines(fullPath) : 0;
        
        stats.totalSize += fileSize;
        stats.totalFiles += 1;
        stats.totalLines += lines;
        
        // Track by file type
        if (!stats.fileTypes[ext]) {
          stats.fileTypes[ext] = { count: 0, size: 0, lines: 0 };
        }
        stats.fileTypes[ext].count += 1;
        stats.fileTypes[ext].size += fileSize;
        stats.fileTypes[ext].lines += lines;
        
        // Track largest files
        stats.largestFiles.push({
          path: fullPath.replace(process.cwd(), '.'),
          size: fileSize,
          lines: lines
        });
      }
    }
  } catch (error) {
    console.warn(`Kon directory niet lezen: ${dirPath}`, error.message);
  }
  
  return stats;
}

function formatBytes(bytes) {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function formatNumber(num) {
  return num.toLocaleString();
}

function generateReport() {
  console.log('🔍 Analyseren projectgrootte...\n');
  
  const stats = analyzeDirectory(process.cwd());
  
  // Sort largest files
  stats.largestFiles.sort((a, b) => b.size - a.size);
  stats.largestFiles = stats.largestFiles.slice(0, 10);
  
  // Sort file types by size
  const sortedFileTypes = Object.entries(stats.fileTypes)
    .sort(([,a], [,b]) => b.size - a.size)
    .slice(0, 10);
  
  // Sort directories by size
  const sortedDirectories = Object.entries(stats.directories)
    .sort(([,a], [,b]) => b.size - a.size)
    .slice(0, 10);
  
  // Calculate remaining space
  const totalSizeMB = stats.totalSize / (1024 * 1024);
  const remainingMB = MAX_PROJECT_SIZE_MB - totalSizeMB;
  const usagePercentage = (totalSizeMB / MAX_PROJECT_SIZE_MB) * 100;
  
  // Generate report
  console.log('📊 PROJECT SIZE ANALYSIS');
  console.log('========================\n');
  
  console.log('📈 TOTAAL OVERZICHT:');
  console.log(`   Totale grootte: ${formatBytes(stats.totalSize)} (${totalSizeMB.toFixed(2)} MB)`);
  console.log(`   Aantal bestanden: ${formatNumber(stats.totalFiles)}`);
  console.log(`   Regels code: ${formatNumber(stats.totalLines)}`);
  console.log(`   Ruimtegebruik: ${usagePercentage.toFixed(1)}% van geschatte limiet\n`);
  
  console.log('💾 RESTERENDE RUIMTE:');
  if (remainingMB > 0) {
    console.log(`   Beschikbaar: ~${remainingMB.toFixed(2)} MB`);
    console.log(`   Status: ✅ Ruimte beschikbaar voor nieuwe bestanden`);
    
    if (remainingMB > 50) {
      console.log(`   Advies: 🟢 Veel ruimte - geen zorgen`);
    } else if (remainingMB > 20) {
      console.log(`   Advies: 🟡 Gemiddeld - let op grote bestanden`);
    } else {
      console.log(`   Advies: 🟠 Beperkt - wees selectief met nieuwe bestanden`);
    }
  } else {
    console.log(`   Status: ❌ Project mogelijk te groot`);
    console.log(`   Advies: 🔴 Cleanup aanbevolen`);
  }
  console.log('');
  
  console.log('📁 GROOTSTE DIRECTORIES:');
  for (const [dir, data] of sortedDirectories) {
    console.log(`   ${dir.padEnd(20)} ${formatBytes(data.size).padStart(10)} (${formatNumber(data.files)} bestanden)`);
  }
  console.log('');
  
  console.log('📄 BESTANDSTYPES:');
  for (const [ext, data] of sortedFileTypes) {
    const extName = ext || '(geen extensie)';
    console.log(`   ${extName.padEnd(15)} ${formatBytes(data.size).padStart(10)} (${formatNumber(data.count)} bestanden, ${formatNumber(data.lines)} regels)`);
  }
  console.log('');
  
  console.log('🔍 GROOTSTE BESTANDEN:');
  for (const file of stats.largestFiles) {
    const sizeMB = (file.size / (1024 * 1024)).toFixed(2);
    console.log(`   ${file.path.padEnd(50)} ${formatBytes(file.size).padStart(10)} (${sizeMB} MB)`);
  }
  console.log('');
  
  console.log('🎯 AANBEVELINGEN:');
  
  // Cleanup suggestions
  const suggestions = [];
  
  if (stats.fileTypes['.md'] && stats.fileTypes['.md'].size > 1024 * 1024) {
    suggestions.push('📚 Overweeg grote .md bestanden te verplaatsen naar externe docs');
  }
  
  if (stats.fileTypes['.json'] && stats.fileTypes['.json'].size > 512 * 1024) {
    suggestions.push('📋 Check grote .json bestanden - mogelijk data die extern kan');
  }
  
  if (stats.directories['tests'] && stats.directories['tests'].size > 5 * 1024 * 1024) {
    suggestions.push('🧪 Test directory is groot - overweeg test optimalisatie');
  }
  
  if (stats.directories['docs'] && stats.directories['docs'].size > 2 * 1024 * 1024) {
    suggestions.push('📖 Docs directory is groot - overweeg externe documentatie');
  }
  
  if (usagePercentage > 80) {
    suggestions.push('🧹 Project >80% vol - cleanup aanbevolen');
    suggestions.push('🗑️ Check __trash_review/ directory voor verwijderbare bestanden');
  }
  
  if (suggestions.length === 0) {
    suggestions.push('✅ Project ziet er goed uit - geen directe cleanup nodig');
  }
  
  suggestions.forEach(suggestion => console.log(`   ${suggestion}`));
  
  console.log('\n📋 SAMENVATTING:');
  console.log(`   Project: ${totalSizeMB.toFixed(2)} MB / ~${MAX_PROJECT_SIZE_MB} MB limiet`);
  console.log(`   Status: ${usagePercentage > 90 ? '🔴 Kritiek' : usagePercentage > 70 ? '🟡 Let op' : '🟢 Gezond'}`);
  console.log(`   Nieuwe bestanden: ${remainingMB > 0 ? '✅ Mogelijk' : '❌ Beperkt'}`);
}

// Run analysis
try {
  generateReport();
} catch (error) {
  console.error('❌ Error tijdens analyse:', error.message);
  process.exit(1);
}