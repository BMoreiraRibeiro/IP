const fs = require('fs');
const path = require('path');

const assetsDir = path.join(__dirname, '..', 'assets');
const schemasDir = path.join(assetsDir, 'schemas');
const outFile = path.join(assetsDir, 'imageManifest.js');

if (!fs.existsSync(schemasDir)) {
  console.error('Schemas directory does not exist:', schemasDir);
  process.exit(1);
}

const themes = fs.readdirSync(schemasDir).filter(f => fs.statSync(path.join(schemasDir, f)).isDirectory());

let lines = [];
lines.push('// Auto-generated image manifest. Do not edit by hand.');
lines.push('export default {');

themes.forEach(theme => {
  const themePath = path.join(schemasDir, theme);
  const files = fs.readdirSync(themePath).filter(f => /\.(png|jpe?g|gif)$/i.test(f));
  lines.push(`  "${theme}": [`);
  files.forEach(file => {
    const rel = `./schemas/${theme}/${file}`;
    lines.push(`    require('${rel}'),`);
  });
  lines.push('  ],');
});

lines.push('};');

fs.writeFileSync(outFile, lines.join('\n'));
console.log('Wrote image manifest to', outFile);
