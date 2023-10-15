import mockFs from 'mock-fs';
import { vi, suite, test, expect, describe, beforeEach, afterEach } from 'vitest';
import { getPackageManager } from '../src/packageManager';
import { setupFsForTesting } from './utils';

vi.mock('shellac', () => ({
	default: () => ({ stdout: '', stderr: '' }),
}));

suite('PackageManager name', () => {
	describe('based on the user agent', () => {
		test('npm detection', async () => {
			process.env['npm_config_user_agent'] = 'npm/8.5.0 node/v16.14.2 linux x64 workspaces/false';
			const packageManager = await getPackageManager();
			expect(packageManager?.name).toEqual('npm');
		});

		test('pnpm detection', async () => {
			process.env['npm_config_user_agent'] = 'pnpm/7.27.1 npm/? node/v14.19.2 linux x64';
			const packageManager = await getPackageManager();
			expect(packageManager?.name).toEqual('pnpm');
		});

		test('yarn detection', async () => {
			process.env['npm_config_user_agent'] = 'yarn/1.22.18 npm/? node/v16.14.2 linux x64';
			const packageManager = await getPackageManager();
			expect(packageManager?.name).toEqual('yarn');
		});

		test('bun detection', async () => {
			process.env['npm_config_user_agent'] = 'bun/0.7.3 npm/? node/v18.15.0 linux x64';
			const packageManager = await getPackageManager();
			expect(packageManager?.name).toEqual('bun');
		});
	});

	describe('based on the file system', () => {
		describe('in a standard setup (without workspaces / no monorepos)', () => {
			beforeEach(() => {
				process.env['npm_config_user_agent'] = undefined;
			});
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

	describe('alongside project package manager', () => {
		afterEach(() => mockFs.restore());

		test('npm detection in pnpm project', async () => {
			process.env['npm_config_user_agent'] = 'npm/8.5.0 node/v16.14.2 linux x64 workspaces/false';
			await setupFsForTesting('pnpm');
			const packageManager = await getPackageManager();
			expect(packageManager?.name).toEqual('npm');
			expect(packageManager?.projectPackageManager).toEqual('pnpm');
		});

		test('bun detection in npm project', async () => {
			process.env['npm_config_user_agent'] = 'bun/0.7.3 npm/? node/v18.15.0 linux x64';
			await setupFsForTesting('npm');
			const packageManager = await getPackageManager();
			expect(packageManager?.name).toEqual('bun');
			expect(packageManager?.projectPackageManager).toEqual('npm');
		});
	});
});
