/// <reference types="vitest" />
import { readFileSync, writeFileSync, copyFileSync, readdirSync, statSync } from 'node:fs';
import { resolve } from 'node:path';
import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';
import { externalizeDeps } from 'vite-plugin-externalize-deps';

const normalizeResolve = (...path: string[]) => resolve(__dirname, ...path).replace(/\\/g, '/');

const getPathsRecursively = (baseDir: string): string[] =>
	readdirSync(normalizeResolve(baseDir))
		.map((p) => normalizeResolve(baseDir, p))
		.map((p) => (statSync(p).isDirectory() ? getPathsRecursively(p) : p))
		.flat()
		.filter((p) => !/(\.spec|test)\.tsx?$/gi.test(p))
		.filter((p) => /\.tsx?$/gi.test(p));

const resolveEntryPath = (path: string, baseDir: string) =>
	path
		.replace(normalizeResolve(baseDir), '')
		.replace(/^\//, '')
		.replace(/\.tsx?$/g, '');

const getEntryPoints = (baseDir: string) =>
	Object.fromEntries(getPathsRecursively(baseDir).map((p) => [resolveEntryPath(p, baseDir), p]));

export default defineConfig({
	build: {
		outDir: 'dist',
		emptyOutDir: true,
		lib: {
			entry: getEntryPoints('src'),
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
