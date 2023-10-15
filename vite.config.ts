/// <reference types="vitest" />
import { readFileSync, writeFileSync, copyFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';
import { externalizeDeps } from 'vite-plugin-externalize-deps';

const normalizeResolve = (...path: string[]) => resolve(__dirname, ...path).replace(/\\/g, '/');

export default defineConfig({
	build: {
		outDir: 'dist',
		emptyOutDir: true,
		lib: {
			name: 'package-manager-manager',
			fileName: 'index',
			entry: 'src/index.ts',
		},
		sourcemap: true,
		minify: 'esbuild',
	},
	plugins: [
		externalizeDeps(),
		dts({
			tsConfigFilePath: normalizeResolve('tsconfig.json'),
			include: ['src/**/*.{ts,tsx}', 'env.d.ts'],
			entryRoot: 'src',
			outputDir: 'dist',
			rollupTypes: true,
		}),
		{
			name: 'post-build-script',
			closeBundle: async () => {
				// Strip dist from package.json exports
				const packageJson = readFileSync(resolve('package.json'), 'utf-8');
				const withoutDist = packageJson.replace(/dist\//g, '');
				writeFileSync(resolve('dist', 'package.json'), withoutDist);

				// Copy README and LICENSE
				copyFileSync(resolve('README.md'), resolve('dist', 'README.md'));
				copyFileSync(resolve('LICENSE.md'), resolve('dist', 'LICENSE.md'));
			},
		},
	],
});
