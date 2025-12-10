const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

// Function to execute a shell command
function runCommand(command, cwd) {
  return new Promise((resolve, reject) => {
    exec(command, { cwd }, (error, stdout, stderr) => {
      if (error) {
        console.error(`Error: ${stderr}`);
        reject(error);
      } else {
        console.log(stdout);
        resolve(stdout);
      }
    });
  });
}

// Function to fix selector-class-pattern errors
function fixSelectorClassPattern(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const fixedContent = content.replace(/\.([a-zA-Z0-9]+)\/g, (match, p1) => {
    return `.${p1.replace(/[^a-z0-9-]/g, '-').toLowerCase()}`;
  });
  fs.writeFileSync(filePath, fixedContent, 'utf8');
}

// Function to remove duplicate selectors
function removeDuplicateSelectors(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');
  const seenSelectors = new Set();
  const fixedLines = lines.filter((line) => {
    const selectorMatch = line.trim().match(/^\.(\S+)/);
    if (selectorMatch) {
      const selector = selectorMatch[1];
      if (seenSelectors.has(selector)) {
        return false; // Remove duplicate
      }
      seenSelectors.add(selector);
    }
    return true;
  });
  fs.writeFileSync(filePath, fixedLines.join('\n'), 'utf8');
}

// Function to split blocks with too many declarations
function splitLargeBlocks(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const fixedContent = content.replace(/\{([^}]+)\}/g, (match, declarations) => {
    const declArray = declarations.split(';').filter(Boolean);
    if (declArray.length > 1) {
      return declArray.map((decl) => `{ ${decl.trim()} }`).join('\n');
    }
    return match;
  });
  fs.writeFileSync(filePath, fixedContent, 'utf8');
}

// Function to fix keyframes-name-pattern errors
function fixKeyframesNamePattern(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const fixedContent = content.replace(/@keyframes\s+([a-zA-Z0-9]+)/g, (match, p1) => {
    return `@keyframes ${p1.replace(/[^a-z0-9-]/g, '-').toLowerCase()}`;
  });
  fs.writeFileSync(filePath, fixedContent, 'utf8');
}

(async () => {
  try {
    const projectRoot = path.resolve(__dirname, '../');
    const cssFiles = [
      path.join(projectRoot, 'app/osiagniecia/achievements-glow.css'),
      path.join(projectRoot, 'components/auth/AuthFlipCard.css'),
      // Add other CSS files here
    ];

    console.log('Fixing selector-class-pattern errors...');
    cssFiles.forEach((file) => fixSelectorClassPattern(file));

    console.log('Removing duplicate selectors...');
    cssFiles.forEach((file) => removeDuplicateSelectors(file));

    console.log('Splitting large declaration blocks...');
    cssFiles.forEach((file) => splitLargeBlocks(file));

    console.log('Fixing keyframes-name-pattern errors...');
    cssFiles.forEach((file) => fixKeyframesNamePattern(file));

    console.log('Running Stylelint to fix remaining errors...');
    await runCommand('npx stylelint "**/*.css" --fix', projectRoot);

    console.log('Stylelint errors fixed successfully!');
  } catch (error) {
    console.error('Failed to fix Stylelint errors:', error);
    process.exit(1);
  }
})();