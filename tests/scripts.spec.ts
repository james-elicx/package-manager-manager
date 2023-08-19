import mockFs from 'mock-fs';
import { vi, suite, test, afterEach, describe } from 'vitest';
import { getPackageManagerForTesting } from './utils';

vi.mock('shellac', () => ({
	default: () => ({ stdout: '', stderr: '' }),
}));

suite('Scripts', () => {
	describe('getRunScriptObject', () => {
		afterEach(() => mockFs.restore());

		test('empty script generates null', async ({ expect }) => {
			const packageManager = await getPackageManagerForTesting('npm');
			expect(packageManager.getRunScriptObject('')).toBe(null);
		});

		(['npm', 'yarn', 'pnpm', 'bun'] as const).forEach((pm) => {
			describe(`${pm} (short/default format)`, () => {
				test('simple script run', async ({ expect }) => {
					const packageManager = await getPackageManagerForTesting(pm);
					const obj = packageManager.getRunScriptObject('my-script');
					if (pm === 'npm') {
						expect(obj?.pmKeywords).toEqual([pm, 'run']);
					} else {
						expect(obj?.pmKeywords).toEqual([pm]);
					}
					expect(obj?.script).toEqual('my-script');
					expect('command' in (obj ?? {})).toBe(false);
					expect(obj?.args).toEqual([]);

					if (pm === 'npm') {
						expect(`${obj}`).toEqual(`${pm} run my-script`);
					} else {
						expect(`${obj}`).toEqual(`${pm} my-script`);
					}
				});

				test('script run with simple arguments', async ({ expect }) => {
					const packageManager = await getPackageManagerForTesting(pm);
					const obj = packageManager.getRunScriptObject('my-script', {
						args: ['--help', '-v'],
					});
					if (pm === 'npm') {
						expect(obj?.pmKeywords).toEqual([pm, 'run']);
					} else {
						expect(obj?.pmKeywords).toEqual([pm]);
					}
					expect(obj?.script).toEqual('my-script');
					expect('command' in (obj ?? {})).toBe(false);
					expect(obj?.args).toEqual(['--help', '-v']);

					if (pm === 'npm') {
						expect(`${obj}`).toEqual(`${pm} run my-script -- --help -v`);
					} else if (pm === 'bun') {
						expect(`${obj}`).toEqual(`${pm} my-script -- --help -v`);
					} else {
						expect(`${obj}`).toEqual(`${pm} my-script --help -v`);
					}
				});

				test('script run with parametrized arguments', async ({ expect }) => {
					const packageManager = await getPackageManagerForTesting(pm);
					const obj = packageManager.getRunScriptObject('my-script', {
						args: ['--env', 'test', '--message "this is a message"'],
					});
					if (pm === 'npm') {
						expect(obj?.pmKeywords).toEqual([pm, 'run']);
					} else {
						expect(obj?.pmKeywords).toEqual([pm]);
					}
					expect(obj?.script).toEqual('my-script');
					expect('command' in (obj ?? {})).toBe(false);
					expect(obj?.args).toEqual(['--env', 'test', '--message "this is a message"']);

					if (pm === 'npm') {
						expect(`${obj}`).toEqual(
							`${pm} run my-script -- --env test --message "this is a message"`,
						);
					} else if (pm === 'bun') {
						expect(`${obj}`).toEqual(`${pm} my-script -- --env test --message "this is a message"`);
					} else {
						expect(`${obj}`).toEqual(`${pm} my-script --env test --message "this is a message"`);
					}
				});

				test('simple script run with positional and flag arguments', async ({ expect }) => {
					const packageManager = await getPackageManagerForTesting(pm);
					const obj = packageManager.getRunScriptObject('compute', {
						args: ['5', '10', '--operation', 'multiply'],
					});
					if (pm === 'npm') {
						expect(obj?.pmKeywords).toEqual([pm, 'run']);
					} else {
						expect(obj?.pmKeywords).toEqual([pm]);
					}
					expect(obj?.script).toEqual('compute');
					expect('command' in (obj ?? {})).toBe(false);
					expect(obj?.args).toEqual(['5', '10', '--operation', 'multiply']);

					if (pm === 'npm') {
						expect(`${obj}`).toEqual(`${pm} run compute -- 5 10 --operation multiply`);
					} else if (pm === 'bun') {
						expect(`${obj}`).toEqual(`${pm} compute -- 5 10 --operation multiply`);
					} else {
						expect(`${obj}`).toEqual(`${pm} compute 5 10 --operation multiply`);
					}
				});
			});

			describe(`${pm} (full format)`, () => {
				test('simple script run', async ({ expect }) => {
					const packageManager = await getPackageManagerForTesting(pm);
					const obj = packageManager.getRunScriptObject('my-script', { format: 'full' });
					expect(obj?.pmKeywords).toEqual([pm, 'run']);
					expect(obj?.script).toEqual('my-script');
					expect('command' in (obj ?? {})).toBe(false);
					expect(obj?.args).toEqual([]);

					expect(`${obj}`).toEqual(`${pm} run my-script`);
				});

				test('script run with simple arguments', async ({ expect }) => {
					const packageManager = await getPackageManagerForTesting(pm);
					const obj = packageManager.getRunScriptObject('my-script', {
						args: ['--help', '-v'],
						format: 'full',
					});
					expect(obj?.pmKeywords).toEqual([pm, 'run']);
					expect(obj?.script).toEqual('my-script');
					expect('command' in (obj ?? {})).toBe(false);
					expect(obj?.args).toEqual(['--help', '-v']);

					if (['npm', 'bun'].includes(pm)) {
						expect(`${obj}`).toEqual(`${pm} run my-script -- --help -v`);
					} else {
						expect(`${obj}`).toEqual(`${pm} run my-script --help -v`);
					}
				});

				test('script run with parametrized arguments', async ({ expect }) => {
					const packageManager = await getPackageManagerForTesting(pm);
					const obj = packageManager.getRunScriptObject('my-script', {
						args: ['--env', 'test', '--message "this is a message"'],
						format: 'full',
					});
					expect(obj?.pmKeywords).toEqual([pm, 'run']);
					expect(obj?.script).toEqual('my-script');
					expect('command' in (obj ?? {})).toBe(false);
					expect(obj?.args).toEqual(['--env', 'test', '--message "this is a message"']);

					if (['npm', 'bun'].includes(pm)) {
						expect(`${obj}`).toEqual(
							`${pm} run my-script -- --env test --message "this is a message"`,
						);
					} else {
						expect(`${obj}`).toEqual(
							`${pm} run my-script --env test --message "this is a message"`,
						);
					}
				});

				test('simple script run with positional and flag arguments', async ({ expect }) => {
					const packageManager = await getPackageManagerForTesting(pm);
					const obj = packageManager.getRunScriptObject('compute', {
						args: ['5', '10', '--operation', 'multiply'],
						format: 'full',
					});
					expect(obj?.pmKeywords).toEqual([pm, 'run']);
					expect(obj?.script).toEqual('compute');
					expect('command' in (obj ?? {})).toBe(false);
					expect(obj?.args).toEqual(['5', '10', '--operation', 'multiply']);

					if (['npm', 'bun'].includes(pm)) {
						expect(`${obj}`).toEqual(`${pm} run compute -- 5 10 --operation multiply`);
					} else {
						expect(`${obj}`).toEqual(`${pm} run compute 5 10 --operation multiply`);
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

		test('delegates to getRunScriptObject', ({ expect }) => {
			(['npm', 'yarn', 'pnpm', 'bun'] as const).forEach(async (pm) => {
				['start', 'my-script'].forEach((script) => {
					[[], ['--a'], ['.'], ['--env', 'test', '--message "this is a message"']].forEach(
						(args) => {
							(['short', 'full'] as const).forEach(async (format) => {
								const packageManager = await getPackageManagerForTesting(pm);
								const options = { format, args };
								const str = packageManager.getRunScript(script, options);
								const obj = packageManager.getRunScriptObject(script, options);
								expect(str).toEqual(obj?.toString());
							});
						},
					);
				});
			});
		});
	});
});
