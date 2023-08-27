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
			expect(await packageManager.getRunExecStruct('')).toBe(null);
		});

		(['npm', 'yarn', 'pnpm', 'bun'] as const).forEach((pm) => {
			describe(`${pm}`, () => {
				test('simple exec run with default options', async ({ expect }) => {
					const packageManager = await getPackageManagerForTesting(pm);
					const struct = await packageManager.getRunExecStruct('eslint');
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
						bun: 'bunx eslint',
					}[pm];
					expect(`${struct}`).toEqual(expectedStr);
				});

				test('simple exec run with full format', async ({ expect }) => {
					const packageManager = await getPackageManagerForTesting(pm);
					const struct = await packageManager.getRunExecStruct('eslint', { format: 'full' });
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
						bun: 'bun x eslint',
					}[pm];
					expect(`${struct}`).toEqual(expectedStr);
				});

				test('simple exec run with prefer-never download', async ({ expect }) => {
					const packageManager = await getPackageManagerForTesting(pm);
					const struct = await packageManager.getRunExecStruct('eslint', {
						download: 'prefer-never',
					});
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
						bun: 'bunx eslint',
					}[pm];
					expect(`${struct}`).toEqual(expectedStr);
				});

				describe('simple exec run with prefer-if-needed download', async () => {
					test('target not installed', async ({ expect }) => {
						const packageManager = await getPackageManagerForTesting(pm);
						packageManager.getPackageInfo = async () => null;
						const struct = await packageManager.getRunExecStruct('eslint', {
							download: 'prefer-if-needed',
						});
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
							bun: 'bunx eslint',
						}[pm];
						expect(`${struct}`).toEqual(expectedStr);
					});

					test('target installed', async ({ expect }) => {
						const packageManager = await getPackageManagerForTesting(pm);
						packageManager.getPackageInfo = async () => ({ name: 'eslint', version: '123' });
						const struct = await packageManager.getRunExecStruct('eslint', {
							download: 'prefer-if-needed',
						});
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
							bun: 'bunx eslint',
						}[pm];
						expect(`${struct}`).toEqual(expectedStr);
					});
				});

				test('unscopes scoped commands if needed', async ({ expect }) => {
					// TODO: investigate what yarn and pnpm do when multiple scoped commands
					//       result in the save unscoped command
					const packageManager = await getPackageManagerForTesting(pm);
					const struct = await packageManager.getRunExecStruct('@org/cmd', {
						download: 'prefer-never',
					});

					const expectedPmKeys = {
						npm: ['npx'],
						yarn: ['yarn', 'exec'],
						pnpm: ['pnpm', 'exec'],
						bun: ['bunx'],
					}[pm];
					expect(struct?.pmKeywords).toEqual(expectedPmKeys);
					const expectedCmd = {
						npm: '@org/cmd',
						yarn: 'cmd',
						pnpm: 'cmd',
						bun: '@org/cmd',
					}[pm];
					expect(struct?.command).toEqual(expectedCmd);
					expect('script' in (struct ?? {})).toBe(false);
					expect(struct?.args).toEqual([]);

					const expectedStr = {
						npm: 'npx @org/cmd',
						yarn: 'yarn exec cmd',
						pnpm: 'pnpm exec cmd',
						bun: 'bunx @org/cmd',
					}[pm];
					expect(`${struct}`).toEqual(expectedStr);
				});

				test("doesn't unscopes scoped commands when it shouldn't", async ({ expect }) => {
					const packageManager = await getPackageManagerForTesting(pm);
					const struct = await packageManager.getRunExecStruct('@org/cmd', {
						download: 'prefer-always',
					});

					const expectedPmKeys = {
						npm: ['npx'],
						yarn: ['yarn', 'dlx'],
						pnpm: ['pnpm', 'dlx'],
						bun: ['bunx'],
					}[pm];
					expect(struct?.pmKeywords).toEqual(expectedPmKeys);
					expect(struct?.command).toEqual('@org/cmd');
					expect('script' in (struct ?? {})).toBe(false);
					expect(struct?.args).toEqual([]);

					const expectedStr = {
						npm: 'npx @org/cmd',
						yarn: 'yarn dlx @org/cmd',
						pnpm: 'pnpm dlx @org/cmd',
						bun: 'bunx @org/cmd',
					}[pm];
					expect(`${struct}`).toEqual(expectedStr);
				});
			});
		});
	});

	// left TODO:
	//   - [] short vs long form, make sure both handle args correctly: https://docs.npmjs.com/cli/v8/commands/npm-exec#npx-vs-npm-exec
	//   - [] make sure to support yarn v1 (which doesn't have the dlx command)

	describe('getRunExec', () => {
		afterEach(() => mockFs.restore());

		test('empty command generates null', async ({ expect }) => {
			const packageManager = await getPackageManagerForTesting('npm');
			expect(await packageManager.getRunExec('')).toBe(null);
		});

		test.skip('delegates to getRunExecStruct', () => {});
	});
});
