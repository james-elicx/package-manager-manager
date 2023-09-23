import mockFs from 'mock-fs';
import { vi, suite, test, afterEach, describe, beforeEach } from 'vitest';
import type { PackageManager } from '../src/packageManager';
import { getPackageManagerForTesting } from './utils';

const shellacMocks = {
	stdout: '',
	stderr: '',
};

function resetShellacMocks() {
	shellacMocks.stdout = '';
	shellacMocks.stderr = '';
}

vi.mock('shellac', () => ({
	default: () => shellacMocks,
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
					const expectedCmd = {
						npm: 'npx',
						yarn: 'yarn',
						pnpm: 'pnpm',
						bun: 'bunx',
					}[pm];
					expect(struct?.cmd).toEqual(expectedCmd);
					const expectedPmCommand = {
						npm: undefined,
						yarn: 'dlx',
						pnpm: 'dlx',
						bun: undefined,
					}[pm];
					expect(struct?.pmCommand).toEqual(expectedPmCommand);
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
					const expectedCmd = {
						npm: 'npm',
						yarn: 'yarn',
						pnpm: 'pnpm',
						bun: 'bun',
					}[pm];
					expect(struct?.cmd).toEqual(expectedCmd);
					const expectedPmCommand = {
						npm: 'exec',
						yarn: 'dlx',
						pnpm: 'dlx',
						bun: 'x',
					}[pm];
					expect(struct?.pmCommand).toEqual(expectedPmCommand);
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
					const expectedCmd = {
						npm: 'npx',
						yarn: 'yarn',
						pnpm: 'pnpm',
						bun: 'bunx',
					}[pm];
					expect(struct?.cmd).toEqual(expectedCmd);
					const expectedPmCommand = {
						npm: undefined,
						yarn: 'exec',
						pnpm: 'exec',
						bun: undefined,
					}[pm];
					expect(struct?.pmCommand).toEqual(expectedPmCommand);
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
						const expectedCmd = {
							npm: 'npx',
							yarn: 'yarn',
							pnpm: 'pnpm',
							bun: 'bunx',
						}[pm];
						expect(struct?.cmd).toEqual(expectedCmd);
						const expectedPmCommand = {
							npm: undefined,
							yarn: 'dlx',
							pnpm: 'dlx',
							bun: undefined,
						}[pm];
						expect(struct?.pmCommand).toEqual(expectedPmCommand);
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
						const expectedCmd = {
							npm: 'npx',
							yarn: 'yarn',
							pnpm: 'pnpm',
							bun: 'bunx',
						}[pm];
						expect(struct?.cmd).toEqual(expectedCmd);
						const expectedPmCommand = {
							npm: undefined,
							yarn: 'exec',
							pnpm: 'exec',
							bun: undefined,
						}[pm];
						expect(struct?.pmCommand).toEqual(expectedPmCommand);
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
					//       result in the same unscoped command
					const packageManager = await getPackageManagerForTesting(pm);
					const struct = await packageManager.getRunExecStruct('@org/cmd', {
						download: 'prefer-never',
					});

					const expectedCmd = {
						npm: 'npx',
						yarn: 'yarn',
						pnpm: 'pnpm',
						bun: 'bunx',
					}[pm];
					expect(struct?.cmd).toEqual(expectedCmd);
					const expectedPmCommand = {
						npm: undefined,
						yarn: 'exec',
						pnpm: 'exec',
						bun: undefined,
					}[pm];
					expect(struct?.pmCommand).toEqual(expectedPmCommand);
					const expectedCommand = {
						npm: '@org/cmd',
						yarn: 'cmd',
						pnpm: 'cmd',
						bun: '@org/cmd',
					}[pm];
					expect(struct?.command).toEqual(expectedCommand);
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

				test("doesn't unscope scoped commands when it shouldn't", async ({ expect }) => {
					const packageManager = await getPackageManagerForTesting(pm);
					const struct = await packageManager.getRunExecStruct('@org/cmd', {
						download: 'prefer-always',
					});

					const expectedCmd = {
						npm: 'npx',
						yarn: 'yarn',
						pnpm: 'pnpm',
						bun: 'bunx',
					}[pm];
					expect(struct?.cmd).toEqual(expectedCmd);
					const expectedPmCommand = {
						npm: undefined,
						yarn: 'dlx',
						pnpm: 'dlx',
						bun: undefined,
					}[pm];
					expect(struct?.pmCommand).toEqual(expectedPmCommand);
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

			describe('arguments passing', () => {
				describe("correctly passes the command's arguments", () => {
					test('short (default) format', async ({ expect }) => {
						const packageManager = await getPackageManagerForTesting(pm);
						const struct = await packageManager.getRunExecStruct('eslint', {
							args: ['.', '--fix'],
						});

						const expectedCmd = {
							npm: 'npx',
							yarn: 'yarn',
							pnpm: 'pnpm',
							bun: 'bunx',
						}[pm];
						expect(struct?.cmd).toEqual(expectedCmd);
						const expectedPmCommand = {
							npm: undefined,
							yarn: 'dlx',
							pnpm: 'dlx',
							bun: undefined,
						}[pm];
						expect(struct?.pmCommand).toEqual(expectedPmCommand);
						expect(struct?.command).toEqual('eslint');
						expect('script' in (struct ?? {})).toBe(false);
						expect(struct?.args).toEqual(['.', '--fix']);

						const expectedStr = {
							npm: 'npx eslint . --fix',
							yarn: 'yarn dlx eslint . --fix',
							pnpm: 'pnpm dlx eslint . --fix',
							bun: 'bunx eslint . --fix',
						}[pm];
						expect(`${struct}`).toEqual(expectedStr);
					});
				});

				test('full format', async ({ expect }) => {
					const packageManager = await getPackageManagerForTesting(pm);
					const struct = await packageManager.getRunExecStruct('eslint', {
						format: 'full',
						args: ['.', '--fix'],
					});

					const expectedCmd = {
						npm: 'npm',
						yarn: 'yarn',
						pnpm: 'pnpm',
						bun: 'bun',
					}[pm];
					expect(struct?.cmd).toEqual(expectedCmd);
					const expectedPmCommand = {
						npm: 'exec',
						yarn: 'dlx',
						pnpm: 'dlx',
						bun: 'x',
					}[pm];
					expect(struct?.pmCommand).toEqual(expectedPmCommand);
					expect(struct?.command).toEqual('eslint');
					expect('script' in (struct ?? {})).toBe(false);
					expect(struct?.args).toEqual(['.', '--fix']);

					const expectedStr = {
						npm: 'npm exec eslint -- . --fix',
						yarn: 'yarn dlx eslint . --fix',
						pnpm: 'pnpm dlx eslint . --fix',
						bun: 'bun x eslint . --fix',
					}[pm];
					expect(`${struct}`).toEqual(expectedStr);
				});
			});
		});
	});

	// The tests above assume the use of yarn berry, the following target yarn class (v.1.x) instead
	describe('yarn classic', () => {
		let packageManager: PackageManager;

		beforeEach(async () => {
			packageManager = await getPackageManagerForTesting('yarn', '1.22.18', (str) => {
				shellacMocks.stdout = str;
			});
		});

		afterEach(() => resetShellacMocks());

		test("doesn't use dlx (since not available)", async ({ expect }) => {
			const struct = await packageManager.getRunExecStruct('eslint', {
				download: 'prefer-always',
			});

			expect(struct?.cmd).toEqual('yarn');
			expect(struct?.pmCommand).toEqual('exec');
			expect(struct?.command).toEqual('eslint');
			expect('script' in (struct ?? {})).toBe(false);
			expect(struct?.args).toEqual([]);

			expect(`${struct}`).toEqual('yarn exec eslint');
		});

		test('adds `--` for args passing', async ({ expect }) => {
			const struct = await packageManager.getRunExecStruct('eslint', {
				args: ['.', '--fix'],
			});

			expect(struct?.cmd).toEqual('yarn');
			expect(struct?.pmCommand).toEqual('exec');
			expect(struct?.command).toEqual('eslint');
			expect('script' in (struct ?? {})).toBe(false);
			expect(struct?.args).toEqual(['.', '--fix']);

			expect(`${struct}`).toEqual('yarn exec eslint -- . --fix');
		});
	});

	describe('getRunExec', () => {
		afterEach(() => mockFs.restore());

		test('empty command generates null', async ({ expect }) => {
			const packageManager = await getPackageManagerForTesting('npm');
			expect(await packageManager.getRunExec('')).toBe(null);
		});

		test('delegates to getRunExecStruct', ({ expect }) => {
			(['npm', 'yarn', 'pnpm', 'bun'] as const).forEach((pm) => {
				[
					{ pkg: 'eslint', installed: true },
					{ pkg: 'non-existent', installed: false },
				].forEach(({ pkg, installed }) => {
					[[], ['--fix'], ['.']].forEach((args) => {
						(['short', 'full'] as const).forEach((format) => {
							(['prefer-always', 'prefer-if-needed', 'prefer-never'] as const).forEach(
								async (download) => {
									const packageManager = await getPackageManagerForTesting(pm);
									packageManager.getPackageInfo = async () =>
										installed ? { name: pkg, version: '123' } : null;
									const options = { format, args, download };
									const str = await packageManager.getRunExec(pkg, options);
									const struct = await packageManager.getRunExecStruct(pkg, options);
									expect(str).toEqual(struct?.toString());
								},
							);
						});
					});
				});
			});
		});
	});
});
