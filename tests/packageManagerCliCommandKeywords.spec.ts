import { suite, test, describe, vi, afterEach } from 'vitest';
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

// Note: the tests here are not exhaustive as that would require us to include all the possible CLI command keywords
//       here, this would be rather brittle, unnecessary and verbose (plus it would practically introduce code duplication),
//       so the tests here just check that the sets are populated and contain some of the most common/important keywords
suite('PackageManager CLI command keywords', () => {
	afterEach(() => resetShellacMocks());

	(
		[
			{
				pm: 'npm',
				expectedKeywords: ['run', 'install', 'uninstall', 'link', 'exec', 'start', 'help'],
				notExpectedKeywords: ['dlx', 'patch', 'x'],
			},
			{
				pm: 'yarn',
				yarnVersion: '1.22.18',
				expectedKeywords: ['run', 'install', 'remove', 'add', 'link'],
				notExpectedKeywords: ['dlx', 'x', 'patch', 'uninstall'],
			},
			{
				pm: 'yarn',
				yarnVersion: '2.0.0',
				expectedKeywords: ['run', 'install', 'remove', 'add', 'link', 'dlx', 'exec'],
				notExpectedKeywords: ['x', 'uninstall'],
			},
			{
				pm: 'pnpm',
				expectedKeywords: ['run', 'install', 'create', 'test', 'dlx', 'exec', 'patch'],
				notExpectedKeywords: ['x', 'uninstall'],
			},
			{
				pm: 'bun',
				expectedKeywords: ['run', 'install', 'remove', 'test', 'x'],
				notExpectedKeywords: ['dlx', 'patch', 'uninstall'],
			},
		] as const
	).forEach((args) => {
		const { pm, expectedKeywords, notExpectedKeywords } = args;
		describe(pm !== 'yarn' ? pm : `yarn (v.${args.yarnVersion})`, async () => {
			const packageManager =
				pm !== 'yarn'
					? await getPackageManagerForTesting(pm)
					: await getPackageManagerForTesting(pm, args.yarnVersion, (str) => {
							shellacMocks.stdout = str;
					  });
			test('expected keywords', async ({ expect }) => {
				expectedKeywords.forEach((keyword) =>
					expect(packageManager.cliCommandKeywords).toContain(keyword),
				);
			});

			test('not expected keywords', async ({ expect }) => {
				notExpectedKeywords.forEach((keyword) =>
					expect(packageManager.cliCommandKeywords).not.toContain(keyword),
				);
			});
		});
	});
});
