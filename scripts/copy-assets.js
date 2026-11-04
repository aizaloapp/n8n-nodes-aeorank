const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, '..', 'nodes', 'AeoRank');
const destNodeDir = path.join(__dirname, '..', 'dist', 'nodes', 'AeoRank');
const destCredDir = path.join(__dirname, '..', 'dist', 'credentials');
fs.mkdirSync(destNodeDir, { recursive: true });
fs.mkdirSync(destCredDir, { recursive: true });

for (const file of ['aeorank.svg', 'aeorank.dark.svg', 'AeoRank.node.json']) {
  fs.copyFileSync(path.join(srcDir, file), path.join(destNodeDir, file));
}
for (const file of ['aeorank.svg', 'aeorank.dark.svg']) {
  fs.copyFileSync(path.join(srcDir, file), path.join(destCredDir, file));
}
