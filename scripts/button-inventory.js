const fs = require('fs');
const path = require('path');

// Node.js replacement for Unix find/grep/xargs commands
function findButtonFiles() {
  const buttonFiles = [];
  
  function scanDirectory(dir) {
    const files = fs.readdirSync(dir);
    
    for (const file of files) {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);
      
      if (stat.isDirectory()) {
        scanDirectory(filePath);
      } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
        try {
          const content = fs.readFileSync(filePath, 'utf8');
          if (content.includes('button') || content.includes('Button') || content.includes('role="button"')) {
            buttonFiles.push(filePath);
          }
        } catch (error) {
          console.warn(`Could not read file ${filePath}:`, error.message);
        }
      }
    }
  }
  
  scanDirectory('src');
  return buttonFiles;
}

// Create button inventory
const buttonFiles = findButtonFiles();

// Create CSV content
const csvContent = 'file,component,route\n' + 
  buttonFiles.map(file => {
    const relativePath = file.replace('src/', '');
    const component = path.basename(file, path.extname(file));
    const route = relativePath.includes('pages/') ? 
      '/' + component.replace('Page', '').toLowerCase() : 
      'component';
    return `${relativePath},${component},${route}`;
  }).join('\n');

// Write to tmp directory
fs.mkdirSync('/tmp', { recursive: true });
fs.writeFileSync('/tmp/button-files.txt', buttonFiles.join('\n'));
fs.writeFileSync('/tmp/button-map.csv', csvContent);

console.log(`Button inventory complete: ${buttonFiles.length} files contain button references`);
console.log('Files written to /tmp/button-files.txt and /tmp/button-map.csv');