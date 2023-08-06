import { writeFile } from 'node:fs/promises';
import mockFs from 'mock-fs';
import { getPackageManager } from 'src/packageManager';
import { vi, suite, test, expect, describe, afterEach } from 'vitest';

vi.mock('shellac', () => ({
	default: () => ({ stdout: '', stderr: '' }),
}));

suite('PackageManager name', () => {
	afterEach(() => mockFs.restore());

	describe('in a standard setup (without workspaces / no monorepos)', () => {
		afterEach(() => mockFs.restore());

		test('npm detection', async () => {
			mockFs({
				'package.json': '',
				'package-lock.json': '',
			});
			const packageManager = await getPackageManager();
			expect(packageManager?.name).toEqual('npm');
		});

		test('yarn detection', async () => {
			mockFs({
				'package.json': '',
				'yarn.lock': '',
			});
			const packageManager = await getPackageManager();
			expect(packageManager?.name).toEqual('yarn');
		});

		test('pnpm detection', async () => {
			mockFs({
				'package.json': '',
				'pnpm-lock.yaml': '',
			});
			const packageManager = await getPackageManager();
			expect(packageManager?.name).toEqual('pnpm');
		});

		test('bun detection', async () => {
			mockFs({
				'package.json': '',
				'bun.lockb': '',
			});
			const packageManager = await getPackageManager();
			expect(packageManager?.name).toEqual('bun');
		});
	});

	describe('in a workspace/monorepo setup', () => {
		afterEach(() => mockFs.restore());

		test('npm detection', async () => {
			mockFs({
				'package.json': '',
			});
			await writeFile('../../package.json', '');
			await writeFile('../../package-lock.json', '');
			const packageManager = await getPackageManager();
			expect(packageManager?.name).toEqual('npm');
		});

		test('yarn detection', async () => {
			mockFs({
				'package.json': '',
			});
			await writeFile('../../package.json', '');
			await writeFile('../../yarn.lock', '');
			const packageManager = await getPackageManager();
			expect(packageManager?.name).toEqual('yarn');
		});

		test('pnpm detection', async () => {
			mockFs({
				'package.json': '',
			});
			await writeFile('../../package.json', '');
			await writeFile('../../pnpm-lock.yaml', '');
			const packageManager = await getPackageManager();
			expect(packageManager?.name).toEqual('pnpm');
		});

		test('bun detection', async () => {
			mockFs({
				'package.json': '',
			});
			await writeFile('../../package.json', '');
			await writeFile('../../bun.lockb', '');
			const packageManager = await getPackageManager();
			expect(packageManager?.name).toEqual('bun');
		});
	});
});
