import mockFs from 'mock-fs';
import { vi, suite, test, afterEach, describe } from 'vitest';
import { getPackageManagerForTesting } from './utils';

vi.mock('shellac', () => ({
	default: () => ({ stdout: '', stderr: '' }),
}));

suite('Scripts', () => {
	describe('getRunScriptStruct', () => {
		afterEach(() => mockFs.restore());

		test('empty script generates null', async ({ expect }) => {
			const packageManager = await getPackageManagerForTesting('npm');
			expect(packageManager.getRunScriptStruct('')).toBe(null);
		});

		(['npm', 'yarn', 'pnpm', 'bun'] as const).forEach((pm) => {
			describe(`${pm} (short/default format)`, () => {
				test('simple script run', async ({ expect }) => {
					const packageManager = await getPackageManagerForTesting(pm);
					const struct = packageManager.getRunScriptStruct('my-script');
					if (pm === 'npm') {
						expect(struct?.pmKeywords).toEqual([pm, 'run']);
					} else {
						expect(struct?.pmKeywords).toEqual([pm]);
					}
					expect(struct?.script).toEqual('my-script');
					expect('command' in (struct ?? {})).toBe(false);
					expect(struct?.args).toEqual([]);

					if (pm === 'npm') {
						expect(`${struct}`).toEqual(`${pm} run my-script`);
					} else {
						expect(`${struct}`).toEqual(`${pm} my-script`);
					}
				});

				test('simple script run conflicting with package manager cli command', async ({
					expect,
				}) => {
					const packageManager = await getPackageManagerForTesting(pm);
					// all the package managers have an 'install' command
					const struct = packageManager.getRunScriptStruct('install');
					expect(struct?.pmKeywords).toEqual([pm, 'run']);
					expect(struct?.script).toEqual('install');
					expect('command' in (struct ?? {})).toBe(false);
					expect(struct?.args).toEqual([]);
					expect(`${struct}`).toEqual(`${pm} run install`);
				});

				test('script run with simple arguments', async ({ expect }) => {
					const packageManager = await getPackageManagerForTesting(pm);
					const struct = packageManager.getRunScriptStruct('my-script', {
						args: ['--help', '-v'],
					});
					if (pm === 'npm') {
						expect(struct?.pmKeywords).toEqual([pm, 'run']);
					} else {
						expect(struct?.pmKeywords).toEqual([pm]);
					}
					expect(struct?.script).toEqual('my-script');
					expect('command' in (struct ?? {})).toBe(false);
					expect(struct?.args).toEqual(['--help', '-v']);

					if (pm === 'npm') {
						expect(`${struct}`).toEqual(`${pm} run my-script -- --help -v`);
					} else if (pm === 'bun') {
						expect(`${struct}`).toEqual(`${pm} my-script -- --help -v`);
					} else {
						expect(`${struct}`).toEqual(`${pm} my-script --help -v`);
					}
				});

				test('script run with parametrized arguments', async ({ expect }) => {
					const packageManager = await getPackageManagerForTesting(pm);
					const struct = packageManager.getRunScriptStruct('my-script', {
						args: ['--env', 'test', '--message "this is a message"'],
					});
					if (pm === 'npm') {
						expect(struct?.pmKeywords).toEqual([pm, 'run']);
					} else {
						expect(struct?.pmKeywords).toEqual([pm]);
					}
					expect(struct?.script).toEqual('my-script');
					expect('command' in (struct ?? {})).toBe(false);
					expect(struct?.args).toEqual(['--env', 'test', '--message "this is a message"']);

					if (pm === 'npm') {
						expect(`${struct}`).toEqual(
							`${pm} run my-script -- --env test --message "this is a message"`,
						);
					} else if (pm === 'bun') {
						expect(`${struct}`).toEqual(
							`${pm} my-script -- --env test --message "this is a message"`,
						);
					} else {
						expect(`${struct}`).toEqual(`${pm} my-script --env test --message "this is a message"`);
					}
				});

				test('simple script run with positional and flag arguments', async ({ expect }) => {
					const packageManager = await getPackageManagerForTesting(pm);
					const struct = packageManager.getRunScriptStruct('compute', {
						args: ['5', '10', '--operation', 'multiply'],
					});
					if (pm === 'npm') {
						expect(struct?.pmKeywords).toEqual([pm, 'run']);
					} else {
						expect(struct?.pmKeywords).toEqual([pm]);
					}
					expect(struct?.script).toEqual('compute');
					expect('command' in (struct ?? {})).toBe(false);
					expect(struct?.args).toEqual(['5', '10', '--operation', 'multiply']);

					if (pm === 'npm') {
						expect(`${struct}`).toEqual(`${pm} run compute -- 5 10 --operation multiply`);
					} else if (pm === 'bun') {
						expect(`${struct}`).toEqual(`${pm} compute -- 5 10 --operation multiply`);
					} else {
						expect(`${struct}`).toEqual(`${pm} compute 5 10 --operation multiply`);
					}
				});
			});

			describe(`${pm} (full format)`, () => {
				test('simple script run', async ({ expect }) => {
					const packageManager = await getPackageManagerForTesting(pm);
					const struct = packageManager.getRunScriptStruct('my-script', { format: 'full' });
					expect(struct?.pmKeywords).toEqual([pm, 'run']);
					expect(struct?.script).toEqual('my-script');
					expect('command' in (struct ?? {})).toBe(false);
					expect(struct?.args).toEqual([]);

					expect(`${struct}`).toEqual(`${pm} run my-script`);
				});

				test('script run with simple arguments', async ({ expect }) => {
					const packageManager = await getPackageManagerForTesting(pm);
					const struct = packageManager.getRunScriptStruct('my-script', {
						args: ['--help', '-v'],
						format: 'full',
					});
					expect(struct?.pmKeywords).toEqual([pm, 'run']);
					expect(struct?.script).toEqual('my-script');
					expect('command' in (struct ?? {})).toBe(false);
					expect(struct?.args).toEqual(['--help', '-v']);

					if (['npm', 'bun'].includes(pm)) {
						expect(`${struct}`).toEqual(`${pm} run my-script -- --help -v`);
					} else {
						expect(`${struct}`).toEqual(`${pm} run my-script --help -v`);
					}
				});

				test('script run with parametrized arguments', async ({ expect }) => {
					const packageManager = await getPackageManagerForTesting(pm);
					const struct = packageManager.getRunScriptStruct('my-script', {
						args: ['--env', 'test', '--message "this is a message"'],
						format: 'full',
					});
					expect(struct?.pmKeywords).toEqual([pm, 'run']);
					expect(struct?.script).toEqual('my-script');
					expect('command' in (struct ?? {})).toBe(false);
					expect(struct?.args).toEqual(['--env', 'test', '--message "this is a message"']);

					if (['npm', 'bun'].includes(pm)) {
						expect(`${struct}`).toEqual(
							`${pm} run my-script -- --env test --message "this is a message"`,
						);
					} else {
						expect(`${struct}`).toEqual(
							`${pm} run my-script --env test --message "this is a message"`,
						);
					}
				});

				test('simple script run with positional and flag arguments', async ({ expect }) => {
					const packageManager = await getPackageManagerForTesting(pm);
					const struct = packageManager.getRunScriptStruct('compute', {
						args: ['5', '10', '--operation', 'multiply'],
						format: 'full',
					});
					expect(struct?.pmKeywords).toEqual([pm, 'run']);
					expect(struct?.script).toEqual('compute');
					expect('command' in (struct ?? {})).toBe(false);
					expect(struct?.args).toEqual(['5', '10', '--operation', 'multiply']);

					if (['npm', 'bun'].includes(pm)) {
						expect(`${struct}`).toEqual(`${pm} run compute -- 5 10 --operation multiply`);
					} else {
						expect(`${struct}`).toEqual(`${pm} run compute 5 10 --operation multiply`);
					}
				});
			});
		});
	});

	describe('getRunScript', () => {
		afterEach(() => mockFs.restore());

		test('empty script generates null', async ({ expect }) => {
			const packageManager = await getPackageManagerForTesting('npm');
			expect(packageManager.getRunScript('')).toBe(null);
		});

		test('delegates to getRunScriptStruct', ({ expect }) => {
			(['npm', 'yarn', 'pnpm', 'bun'] as const).forEach(async (pm) => {
				['start', 'my-script'].forEach((script) => {
					[[], ['--a'], ['.'], ['--env', 'test', '--message "this is a message"']].forEach(
						(args) => {
							(['short', 'full'] as const).forEach(async (format) => {
								const packageManager = await getPackageManagerForTesting(pm);
								const options = { format, args };
								const str = packageManager.getRunScript(script, options);
								const struct = packageManager.getRunScriptStruct(script, options);
								expect(str).toEqual(struct?.toString());
							});
						},
					);
				});
			});
		});
	});
});
