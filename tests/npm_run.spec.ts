import { npm_run } from 'src/shortFunctions/npm_run';
import { suite, test, describe } from 'vitest';

suite('npm_run', () => {
	describe('simple script run', () => {
		(['npm', 'yarn', 'pnpm', 'bun'] as const).forEach((pm) => {
			test(`using ${pm}`, async ({ expect }) => {
				process.env['npm_config_user_agent'] = `${pm}/v node/v linux`;
				const myScriptRun = await npm_run` my-script`;
				const expectedScriptRun = {
					npm: 'npm run my-script',
					yarn: 'yarn my-script',
					pnpm: 'pnpm my-script',
					bun: 'bun my-script',
				}[pm];
				expect(myScriptRun).toEqual(expectedScriptRun);
			});
		});
	});

	describe('script run with arguments', () => {
		(['npm', 'yarn', 'pnpm', 'bun'] as const).forEach((pm) => {
			test(`using ${pm}`, async ({ expect }) => {
				process.env['npm_config_user_agent'] = `${pm}/v node/v linux`;
				const myScriptRun = await npm_run` my-script -- ./out --output esm`;
				const expectedScriptRun = {
					npm: 'npm run my-script -- ./out --output esm',
					yarn: 'yarn my-script ./out --output esm',
					pnpm: 'pnpm my-script ./out --output esm',
					bun: 'bun my-script -- ./out --output esm',
				}[pm];
				expect(myScriptRun).toEqual(expectedScriptRun);
			});
		});
	});

	describe('script run with options and arguments', () => {
		(['npm', 'yarn', 'pnpm', 'bun'] as const).forEach((pm) => {
			test(`using ${pm}`, async ({ expect }) => {
				process.env['npm_config_user_agent'] = `${pm}/v node/v linux`;
				const myScriptRun = await npm_run.with({
					format: 'full',
				})` my-script -- ./out --output esm`;
				const expectedScriptRun = {
					npm: 'npm run my-script -- ./out --output esm',
					yarn: 'yarn run my-script ./out --output esm',
					pnpm: 'pnpm run my-script ./out --output esm',
					bun: 'bun run my-script -- ./out --output esm',
				}[pm];
				expect(myScriptRun).toEqual(expectedScriptRun);
			});
		});
	});

  describe('malformed scripts', () => {
    test('empty', async ({ expect }) => {
      process.env['npm_config_user_agent'] = `npm/v node/v linux`;
      await expect(() => npm_run``).rejects.toThrowError();
    });

    test('only whitespaces', async ({ expect }) => {
      process.env['npm_config_user_agent'] = `npm/v node/v linux`;
      await expect(() => npm_run`  `).rejects.toThrowError();
    });

    test('with an positional option provided', async ({ expect }) => {
      process.env['npm_config_user_agent'] = `npm/v node/v linux`;
      await expect(() => npm_run` my-script ./out`).rejects.toThrowError();
    });

    test('with a flag provided', async ({ expect }) => {
      process.env['npm_config_user_agent'] = `npm/v node/v linux`;
      await expect(() => npm_run` my-script --verbose`).rejects.toThrowError();
    });

    test('with a multiple options provided', async ({ expect }) => {
      process.env['npm_config_user_agent'] = `npm/v node/v linux`;
      await expect(() => npm_run` my-script --out ./output --verbose`).rejects.toThrowError();
    });
  });
});
