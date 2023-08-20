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
			});
		});
	});

	// left TODO:
	//   - [] short vs long form, make sure both handle args correctly: https://docs.npmjs.com/cli/v8/commands/npm-exec#npx-vs-npm-exec
	//   - [] make sure the check for package installation is correct (me might need to strip some parts of the command)
	//   - [] make sure that versions can also be included in the commands
	//   - [] make sure to strip orgs when needed (as for example `npx @cloudflare/next-on-pages` vs `pnpm exec next-on-pages`)

	describe('getRunExec', () => {
		afterEach(() => mockFs.restore());

		test('empty command generates null', async ({ expect }) => {
			const packageManager = await getPackageManagerForTesting('npm');
			expect(await packageManager.getRunExec('')).toBe(null);
		});

		test.skip('delegates to getRunExecStruct', () => {});
	});
});
