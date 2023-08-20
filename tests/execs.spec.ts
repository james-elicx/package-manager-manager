import mockFs from 'mock-fs';
import { vi, suite, test, afterEach, describe } from 'vitest';
import { getPackageManagerForTesting } from './utils';

vi.mock('shellac', () => ({
	default: () => ({ stdout: '', stderr: '' }),
}));

suite('Exec', () => {
	describe('getRunExecStruct', () => {
		afterEach(() => mockFs.restore());

		test('empty script generates null', async ({ expect }) => {
			const packageManager = await getPackageManagerForTesting('npm');
			expect(packageManager.getRunExecStruct('')).toBe(null);
		});

		(['npm', 'yarn', 'pnpm', 'bun'] as const).forEach((pm) => {
			describe(`${pm}`, () => {
				test('simple exec run with default options', async ({ expect }) => {
					const packageManager = await getPackageManagerForTesting(pm);
					const struct = packageManager.getRunExecStruct('eslint');
					const expectedPmKeys = {
						npm: ['npx'],
						yarn: ['yarn', 'dlx'],
						pnpm: ['pnpm', 'dlx'],
						bun: ['bunx'],
					}[pm];
					expect(struct?.pmKeywords).toEqual(expectedPmKeys);
					expect(struct?.command).toEqual('eslint');
					expect('script' in (struct ?? {})).toBe(false);
					expect(struct?.args).toEqual([]);

					const expectedStr = {
						npm: 'npx eslint',
						yarn: 'yarn dlx eslint',
						pnpm: 'pnpm dlx eslint',
						bun: 'bunx eslint'
					}[pm];
					expect(`${struct}`).toEqual(expectedStr);
				});

				test('simple exec run with full format', async ({ expect }) => {
					const packageManager = await getPackageManagerForTesting(pm);
					const struct = packageManager.getRunExecStruct('eslint', {format: 'full'});
					const expectedPmKeys = {
						npm: ['npm', 'exec'],
						yarn: ['yarn', 'dlx'],
						pnpm: ['pnpm', 'dlx'],
						bun: ['bun', 'x'],
					}[pm];
					expect(struct?.pmKeywords).toEqual(expectedPmKeys);
					expect(struct?.command).toEqual('eslint');
					expect('script' in (struct ?? {})).toBe(false);
					expect(struct?.args).toEqual([]);

					const expectedStr = {
						npm: 'npm exec eslint',
						yarn: 'yarn dlx eslint',
						pnpm: 'pnpm dlx eslint',
						bun: 'bun x eslint'
					}[pm];
					expect(`${struct}`).toEqual(expectedStr);
				});

				test('simple exec run with prefer-never download', async ({ expect }) => {
					const packageManager = await getPackageManagerForTesting(pm);
					const struct = packageManager.getRunExecStruct('eslint', { download: 'prefer-never' });
					const expectedPmKeys = {
						npm: ['npx'],
						yarn: ['yarn', 'exec'],
						pnpm: ['pnpm', 'exec'],
						bun: ['bunx'],
					}[pm];
					expect(struct?.pmKeywords).toEqual(expectedPmKeys);
					expect(struct?.command).toEqual('eslint');
					expect('script' in (struct ?? {})).toBe(false);
					expect(struct?.args).toEqual([]);

					const expectedStr = {
						npm: 'npx eslint',
						yarn: 'yarn exec eslint',
						pnpm: 'pnpm exec eslint',
						bun: 'bunx eslint'
					}[pm];
					expect(`${struct}`).toEqual(expectedStr);
				});
			});
		});

		// (['npm', 'yarn'] as const).forEach((pm) => {
		// 	describe(`${pm}`, () => {
		// 		test('simple exec run with default options', async ({ expect }) => {
		// 			const packageManager = await getPackageManagerForTesting(pm);
		// 			const struct = packageManager.getRunExecStruct('eslint');
		// 			if (pm === 'npm') {
		// 				expect(struct?.pmKeywords).toEqual([pm, 'exec']);
		// 			} else {
		// 				// TODO
		// 			}
		// 			expect(struct?.command).toEqual('eslint');
		// 			expect('script' in (struct ?? {})).toBe(false);
		// 			expect(struct?.args).toEqual([]);

		// 			if (pm === 'npm') {
		// 				expect(`${struct}`).toEqual(`${pm} exec eslint`);
		// 			} else {
		// 				// TODO
		// 				expect(`${struct}`).toEqual(`${pm} dlx eslint`);
		// 			}
		// 		});
		// 	});
		// });
	});

	describe('getRunExec', () => {
		afterEach(() => mockFs.restore());

		test('empty command generates null', async ({ expect }) => {
			const packageManager = await getPackageManagerForTesting('npm');
			expect(packageManager.getRunExec('')).toBe(null);
		});

		test.skip('delegates to getRunExecStruct', () => {
		});
	});
});
