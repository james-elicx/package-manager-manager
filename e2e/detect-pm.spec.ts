import { expect, suite, test } from 'vitest';
import { getPackageManager } from '../src';
import { withFixtures } from './_utils';

suite('detect package manager from lockfile', () => {
	withFixtures({ only: ['01-npm-lockfile'] }, () => {
		test('npm', async () => {
			const pm = await getPackageManager();
			expect(pm?.name).toEqual('npm');
		});
	});

	withFixtures({ only: ['02-yarn-lockfile'] }, () => {
		test('yarn', async () => {
			const pm = await getPackageManager();
			expect(pm?.name).toEqual('yarn');
		});
	});

	withFixtures({ only: ['03-pnpm-lockfile'] }, () => {
		test('pnpm', async () => {
			const pm = await getPackageManager();
			expect(pm?.name).toEqual('pnpm');
		});
	});

	withFixtures({ only: ['04-bun-lockfile'] }, () => {
		test('bun', async () => {
			const pm = await getPackageManager();
			expect(pm?.name).toEqual('bun');
		});
	});
});
