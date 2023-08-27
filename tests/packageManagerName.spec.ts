import mockFs from 'mock-fs';
import { getPackageManager } from '../src/packageManager';
import { vi, suite, test, expect, describe, afterEach } from 'vitest';
import { setupFsForTesting } from './utils';

vi.mock('shellac', () => ({
	default: () => ({ stdout: '', stderr: '' }),
}));

suite('PackageManager name', () => {
	afterEach(() => mockFs.restore());

	describe('in a standard setup (without workspaces / no monorepos)', () => {
		afterEach(() => mockFs.restore());

		test('npm detection', async () => {
			await setupFsForTesting('npm');
			const packageManager = await getPackageManager();
			expect(packageManager?.name).toEqual('npm');
		});

		test('yarn detection', async () => {
			await setupFsForTesting('yarn');
			const packageManager = await getPackageManager();
			expect(packageManager?.name).toEqual('yarn');
		});

		test('pnpm detection', async () => {
			await setupFsForTesting('pnpm');
			const packageManager = await getPackageManager();
			expect(packageManager?.name).toEqual('pnpm');
		});

		test('bun detection', async () => {
			await setupFsForTesting('bun');
			const packageManager = await getPackageManager();
			expect(packageManager?.name).toEqual('bun');
		});
	});

	describe('in a workspace/monorepo setup', () => {
		afterEach(() => mockFs.restore());

		test('npm detection', async () => {
			await setupFsForTesting('npm', { forWorkspace: true });
			const packageManager = await getPackageManager();
			expect(packageManager?.name).toEqual('npm');
		});

		test('yarn detection', async () => {
			await setupFsForTesting('yarn', { forWorkspace: true });
			const packageManager = await getPackageManager();
			expect(packageManager?.name).toEqual('yarn');
		});

		test('pnpm detection', async () => {
			await setupFsForTesting('pnpm', { forWorkspace: true });
			const packageManager = await getPackageManager();
			expect(packageManager?.name).toEqual('pnpm');
		});

		test('bun detection', async () => {
			await setupFsForTesting('bun', { forWorkspace: true });
			const packageManager = await getPackageManager();
			expect(packageManager?.name).toEqual('bun');
		});
	});
});
