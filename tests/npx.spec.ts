import { npx } from 'src/shortFunctions/npx';
import { suite, test, describe, vi } from 'vitest';

vi.mock('shellac', () => ({
	default: {
		env: () => () => ({ stdout: '', stderr: '' }),
	},
}));

suite('npx', () => {
	describe('simple exec command run', () => {
		(['npm', 'yarn', 'pnpm', 'bun'] as const).forEach((pm) => {
			test(`using ${pm}`, async ({ expect }) => {
				process.env['npm_config_user_agent'] = `${pm}/v node/v linux`;
				const myScriptRun = await npx` pkg-command`;
				const expectedScriptRun = {
					npm: 'npx pkg-command',
					yarn: 'yarn exec pkg-command',
					pnpm: 'pnpm dlx pkg-command',
					bun: 'bunx pkg-command',
				}[pm];
				expect(myScriptRun).toEqual(expectedScriptRun);
			});
		});
	});

	describe('exec command run with arguments', () => {
		(['npm', 'yarn', 'pnpm', 'bun'] as const).forEach((pm) => {
			test(`using ${pm}`, async ({ expect }) => {
				process.env['npm_config_user_agent'] = `${pm}/v node/v linux`;
				const myScriptRun = await npx` pkg-command ./out --output esm --verbose`;
				const expectedScriptRun = {
					npm: 'npx pkg-command ./out --output esm --verbose',
					yarn: 'yarn exec pkg-command -- ./out --output esm --verbose',
					pnpm: 'pnpm dlx pkg-command ./out --output esm --verbose',
					bun: 'bunx pkg-command ./out --output esm --verbose',
				}[pm];
				expect(myScriptRun).toEqual(expectedScriptRun);
			});
		});
	});

	describe('exec command run with options and arguments', () => {
		(['npm', 'yarn', 'pnpm', 'bun'] as const).forEach((pm) => {
			test(`using ${pm}`, async ({ expect }) => {
				process.env['npm_config_user_agent'] = `${pm}/v node/v linux`;
				const myScriptRun = await npx.with({
					format: 'full',
					download: 'prefer-never',
				})` pkg-command ./out --output esm --verbose`;
				const expectedScriptRun = {
					npm: 'npm exec pkg-command -- ./out --output esm --verbose',
					yarn: 'yarn exec pkg-command -- ./out --output esm --verbose',
					pnpm: 'pnpm exec pkg-command ./out --output esm --verbose',
					bun: 'bun x pkg-command ./out --output esm --verbose',
				}[pm];
				expect(myScriptRun).toEqual(expectedScriptRun);
			});
		});
	});

	describe('malformed exec commands', () => {
		test('empty', async ({ expect }) => {
			process.env['npm_config_user_agent'] = `npm/v node/v linux`;
			await expect(() => npx``).rejects.toThrowError();
		});

		test('only white-spaces', async ({ expect }) => {
			process.env['npm_config_user_agent'] = `npm/v node/v linux`;
			await expect(() => npx`   `).rejects.toThrowError();
		});
	});
});
