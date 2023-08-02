import { readFileSync, writeFileSync, copyFileSync } from 'fs';
import { resolve } from 'path';

// Strip dist from package.json exports
const packageJson = readFileSync(resolve('package.json'), 'utf-8');
const withoutDist = packageJson.replace(/dist\//g, '');
writeFileSync(resolve('dist', 'package.json'), withoutDist);

// Copy README and LICENSE
copyFileSync(resolve('README.md'), resolve('dist', 'README.md'));
copyFileSync(resolve('LICENSE.md'), resolve('dist', 'LICENSE.md'));
